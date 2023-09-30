const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");
const fs = require("fs");
const {
    checkForDuplicates,
    getAllDataAsArray,
    getTextFromDB,
} = require("./database");
const { vectorizedSearch } = require("./index.js");
const cors = require("cors");

const app = express();
app.use(bodyParser.json());
app.use(cors());
const upload = multer({ dest: "uploads/" });

function removeLetters(word) {
    return word.replace(/.txt/g, "");
}

app.post("/", upload.array("files", 10), (req, res) => {
    const uploadedFiles = req.files;
    req.files = null;
    req.file = null; // Добавьте эту строку
    console.log(uploadedFiles);
    uploadedFiles.forEach((file, index) => {
        fs.readFile(file.destination + file.filename, "utf-8", (err, data) => {
            if (err) {
                console.error(err);
                return;
            }
            checkForDuplicates(removeLetters(file.originalname), data);
        });
        fs.unlink(file.destination + file.filename, (err) => {
            if (err) {
                console.error("Ошибка удаления файла:", err);
                return;
            }
            console.log("Файл успешно удален");
        });
    });
});
// uploadedFiles.forEach((file, index) => {
//     const stream = fs.createReadStream(file.path, "utf8");
//     console.log("UploadedFiles before stream " + index)
//     stream.on("data", (data) => {
//         // console.log(`Content of File ${index + 1}:`, data);
//         console.log(`${index+1}`)
//         checkForDuplicates(removeLetters(file.originalname), data);
//     });
//     stream.on("end", () => {
//         fs.unlinkSync(file.path); // Удаление временного файла после чтения
//     });
// });
// getAllDataAsArray((err, data) => {
//     if (err) {
//         console.error("Ошибка при получении данных:", err);
//         return;
//     }
//     console.log("Результаты запроса:");
//     const mainArray = [];
//     data.map((item) => {
//         const subArray = [];
//         subArray.push(item.title);
//         subArray.push(item.main_text);
//         mainArray.push(subArray);
//     });
//     res.json(data);
// });

app.get("/text/:id", (req, res) => {
    const id = req.params.id;
    console.log(id);
    getTextFromDB(id, (err, data) => {
        if (err) {
            console.error(err);
        } else {
            res.json(data);
        }
    });
});

app.post("/search", (req, res) => {
    function objectsToArrays(objects) {
        return objects.map((obj) => Object.values(obj));
    }
    function arraysToObjects(arrays) {
        return arrays.map((arr) => {
            return {
                id: arr[0],
                title: arr[1],
                main_text: arr[2],
                keywords: arr[3],
            };
        });
    }
    const receivedWord = req.body.word;
    console.log("Received word:", receivedWord);
    getAllDataAsArray((err, data) => {
        const mainArray = [];
        data.map((item) => {
            const subArray = [];
            subArray.push(item.id);
            subArray.push(item.title);
            subArray.push(item.main_text);
            mainArray.push(subArray);
        });
        let result = arraysToObjects(vectorizedSearch(mainArray, receivedWord));
        //console.log(result);
        // console.log(result);
        result.map((item) => {
            console.log(item);
        })
        res.json(result);
    });
});

app.get("/", (req, res) => {
    getAllDataAsArray((err, data) => {
        if (err) {
            console.error("Ошибка при получении данных:", err);
            return;
        }
        console.log("Результаты запроса:");
        console.log(data);

        res.json(data);
    });
});
app.listen(5000, () => {
    console.log("Server is running on localhost:5000");
});
