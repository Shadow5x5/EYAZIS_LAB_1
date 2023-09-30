const mysql = require("mysql2");

const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "RgoG8uWM&",
    database: "lab1",
});

connection.connect((err) => {
    if (err) {
        console.error("Ошибка подключения к базе данных:", err);
        return;
    }
    console.log("Подключено к базе данных MySQL");
    // const query = 'DELETE FROM text';
    // connection.query(query, (err, results) => {
    // });
});

function addRecord(title, mainText) {
    console.log(mainText.length);
    console.log(title);
    console.log("ADDDRECORD")
    const query = "INSERT INTO text (title, main_text) VALUES (?, ?)";
    connection.query(query, [title, mainText], (err, results) => {
        if (err) {
            console.error("Ошибка при добавлении записи:", err);
            return;
        }
        console.log("Запись успешно добавлена");
    });
}

function checkForDuplicates(title, mainText) {
    console.log(mainText.length);
    console.log(title);
    console.log("CHECKFORDUBPLICATE")
    const query =
        "SELECT COUNT(*) as count FROM text GROUP BY title HAVING title = ?";
    connection.query(query, [title], (err, results) => {
        if (err) {
            console.error("Ошибка при проверке на дублирование:", err);
            return;
        }
        if (
            results.length == 0
        ) {
            addRecord(title, mainText);
        } else {
            console.log("Запись с таким title уже существует");
        }
    });
}

function getAllDataAsArray(callback) {
    const sql = "SELECT id, title, main_text FROM text";
    connection.query(sql, (err, results) => {
        if (err) {
            console.error("Ошибка при выполнении запроса:", err);
            return callback(err, null);
        }
        console.log("Данные успешно получены из базы данных");
        const data = results.map((row) => ({
            id: row.id,
            title: row.title,
            main_text: row.main_text,
        }));
        callback(null, data);
    });
}

function getTextFromDB(id, callback) {
    const query = "SELECT * FROM text WHERE id = ?";
    connection.query(query, [id], (err, results) => {
        const data = results.map((row) => ({
            id: row.id,
            title: row.title,
            main_text: row.main_text,
        }));
        callback(null, data);
    });
}

module.exports = { getAllDataAsArray, checkForDuplicates, getTextFromDB };
