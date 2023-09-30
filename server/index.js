let nj = require("numjs");

/*
 * texts - массив пар вида [название текста, текст]
 */
function getDictAndDocumentFrequency(texts, maxFreq) {
    const docCount = texts.length;
    const re = /[A-Za-z]+/g;
    let dfDict = {};

    for (let pair of texts) {
        let [_, tName, text] = pair;
        let words = new Set(text.matchAll(re));
        words.add(tName.toLowerCase());

        for (let word of words) {
            const lWord = word[0].toLowerCase();

            if (dfDict[lWord] != undefined) dfDict[lWord] += 1;
            else dfDict[lWord] = 1;
        }
    }

    let df = [];
    for (let [key, _] of Object.entries(dfDict))
        df.push([key, dfDict[key] / docCount]);

    df.sort((pair1, pair2) => pair2[1] - pair1[1]);

    let counter = 0;
    for (let pair of df) {
        if (pair[1] < maxFreq) break;

        counter += 1;
    }

    df = df.slice(counter);
    let dict = df.map((pair) => pair[0]);
    df = df.map((pair) => pair[1]);

    return [dict, df];
}

/*
 * dict - словарь - массив ключевых слов, по которым далее будет производиться поиск
 * df - документные частоты каждого слова из dict
 * texts - массив пар вида [название текста, текст]
 */
function vectorizeTexts(dict, df, texts) {
    // Матрица векторизированных текстов,
    // каждая строка матрицы - вектор текста
    // каждый столбец - ключевое слово для поиска
    // пересечение - частота слова в тексте

    let textsMatrix = nj.zeros([texts.length, dict.length]);

    const re = /[A-Za-z]+/g;

    let textNumber = 0;
    for (let pair of texts) {
        let [id, tName, text] = pair;
        let words = Array.from(text.matchAll(re));
        words.push(tName.toLowerCase());

        for (let word of words) {
            const lWord = word[0].toLowerCase();
            let position = dict.indexOf(lWord);

            if (position != -1) {
                textsMatrix.set(
                    textNumber,
                    position,
                    textsMatrix.get(textNumber, position) + 1
                );
            }
        }

        textNumber += 1;
    }

    let result = null;

    const words_per_documents = textsMatrix
        .dot(nj.ones([dict.length, 1]))
        .pow(-1);
    let to_multiply = [];
    for (let i = 0; i < dict.length; i++)
        to_multiply.push(words_per_documents.clone());

    to_multiply = nj
        .stack(to_multiply, -1)
        .reshape([texts.length, dict.length]);

    result = textsMatrix.multiply(to_multiply);

    const idf = nj.array(df).T.pow(-1);
    to_multiply = [];
    for (let i = 0; i < texts.length; i++) to_multiply.push(idf.clone());

    to_multiply = nj
        .stack(to_multiply, -1)
        .reshape([texts.length, dict.length]);
    result = result.multiply(to_multiply);

    return result;
}

/*
 * dict - словарь - массив ключевых слов, по которым далее будет производиться поиск
 * df - документные частоты каждого слова из dict
 * query_text - неформатированная строка, содержащая запрос пользователя в текстовом виде
 *
 * Возвращает векторизованную форму запроса пользователя,
 * где каждый элемент вектора показывает частоту встречи ключевого слова
 * из словаря dict
 */
function vectorizeQuery(dict, df, query_text) {
    const re = /[A-Za-z]+/g;
    let words = query_text.matchAll(re);
    let queryVector = nj.zeros([dict.length, 1]);

    for (let word of words) {
        const lWord = word[0].toLowerCase();

        let position = dict.indexOf(lWord);

        if (position != -1)
            queryVector.set(position, 0, queryVector.get(position, 0) + 1);
    }

    // console.log(queryVector.divide(queryVector.sum()))
    // console.log(queryVector)

    return queryVector
        .divide(queryVector.sum() + 1)
        .multiply(nj.array(df).reshape([df.length, 1]).pow(-1));
}

/*
 *  texts - массив пар вида [название текста, текст]
 *  dict - словарь - массив ключевых слов, по которым далее будет производиться поиск
 *  vectorizedTexts - матрица вида (текст x ключевое слово), где пересечение
 *  строки и столбца содержит TF-IDF частоту слова в тексте
 *  vectorizedQuery - вектор TF-IDF частот ключевых слов dict из запроса
 *
 *  Возвращает массив пар [название текста, текст, ключевые слова, встречающиеся в тексте]
 */
function relevantTexts(
    texts,
    dict,
    vectorizedTexts,
    vectorizedQuery,
    minRelevance
) {
    let relevance = vectorizedTexts.dot(vectorizedQuery).tolist();
    let result = [];

    // console.log(vectorizedQuery)

    for (let counter = 0; counter < relevance.length; counter++) {
        if (relevance[counter] > minRelevance) {
            let textVector = nj
                .array(vectorizedTexts.tolist()[counter])
                .reshape([dict.length, 1]);

            textVector = textVector.multiply(vectorizedQuery).tolist();

            let words = [];
            for (let i = 0; i < textVector.length; i++) {
                if (textVector[i] > 0) words.push(dict[i]);
            }

            result.push([
                texts[counter][0],
                texts[counter][1],
                texts[counter][2],
                words,
                relevance[counter][0],
            ]);
        }
    }

    result.sort((fst, snd) => snd[4] - fst[4]);
    return result;
}

/*
 *  texts - массив пар вида [название текста, текст]
 *  query - поисковый запрос пользователя, неформатированная строка
 *
 *  Возвращает массив пар [название текста, текст, ключевые слова, встречающиеся в тексте]
 */
function vectorizedSearch(texts, query) {
    const maxFreq = Infinity;
    const minRelevance = 0;

    let [dict, df] = getDictAndDocumentFrequency(texts, maxFreq);
    let vectorizedTexts = vectorizeTexts(dict, df, texts);
    // console.log(vectorizedTexts)

    let vectorizedQuery = vectorizeQuery(dict, df, query);
    // console.log(vectorizedQuery)

    return relevantTexts(
        texts,
        dict,
        vectorizedTexts,
        vectorizedQuery,
        minRelevance
    );
}

module.exports = { vectorizedSearch };
