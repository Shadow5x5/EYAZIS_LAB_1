import classes from "./Main.module.css";
import { Link } from "react-router-dom";
import { useState } from "react";
import InputFile from "../InputFile/InputFile.jsx";
import myServerAddress from "../../config/config";

const Main = () => {
    const [word, setWord] = useState("");
    const [data, setData] = useState([]);
    const handleSubmit = () => {
        fetch(`${myServerAddress}/search`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "ngrok-skip-browser-warning": "true",
            },
            body: JSON.stringify({ word: word }),
        })
            .then((response) => response.text())
            .then((data) => {
                setData(JSON.parse(data));
            })
            .catch((error) => {
                console.error("Ошибка:", error);
            });
    };
    function truncateText(text, maxLength) {
        let words = text.split(" ");
        if (words.length > maxLength) {
            words = words.slice(0, maxLength);
            return words.join(" ") + "...";
        }
        return text;
    }
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "en-EN"; // Установите язык распознавания
    recognition.continuous = true; // Разрешите непрерывное распознавание
    recognition.interimResults = true; //
    const startListening = () => {
        recognition.start();
    };

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setWord(transcript);
    };
    return (
        <div className={classes.bg}>
            <InputFile />
            <div className={classes.blockSearch}>
                <input
                    type="text"
                    value={word}
                    onChange={(e) => setWord(e.target.value)}
                />
                <button onClick={handleSubmit}>Поиск</button>
                <button onClick={startListening}>Слушать</button>
            </div>
            <div>
                {data &&
                    data.map((item) => (
                        <div>
                            <Link to={`/text/${item.id}`}>
                                <h2>{item.title}</h2>
                            </Link>
                            <p>{truncateText(item.main_text, 10)}</p>
                            <ul>
                                {item.keywords.map((item) => (
                                    <li>{item}</li>
                                ))}
                            </ul>
                        </div>
                    ))}
            </div>
        </div>
    );
};

export default Main;
