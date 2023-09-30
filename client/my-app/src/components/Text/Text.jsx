import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import myServerAddress from "../../config/config";
import classes from "./Text.module.css"
const Text = () => {
    const { id } = useParams();
    const [text, setText] = useState([]);
    useEffect(() => {
        fetch(`${myServerAddress}/text/${id}`, {
            method: "GET",
            headers: {
                "ngrok-skip-browser-warning": "true",
                "Content-Type": "application/json",
            },
        })
            .then((response) => response.json())
            .then((data) => {
                setText(data);
            })
            .catch((error) => {
                console.error("Ошибка:", error);
            });
    }, [id]);

    return (
        <div className={classes.container}>
            {text.map((item) => (
                <div>
                    <h2>{item.title}</h2>
                    <p>{item.main_text}</p>
                </div>
            ))}
        </div>
    );
};

export default Text;
