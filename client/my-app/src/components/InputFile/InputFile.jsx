import { useState } from "react";
import classes from "./InputFile.module.css";
import myServerAddress from "../../config/config";
import ContentInfo from "../ContentInfo/ContentInfo";
const InputFile = () => {
    const [selectedFiles, setSelectedFiles] = useState([]);

    const handleFileChange = (event) => {
        setSelectedFiles([...selectedFiles, ...event.target.files]);
    };

    const handleUpload = () => {
        const formData = new FormData();

        for (let i = 0; i < selectedFiles.length; i++) {
            formData.append(`files`, selectedFiles[i]);
        }
        setSelectedFiles([]);
        console.log(selectedFiles);
        console.log(formData);
        fetch(`${myServerAddress}/`, {
            method: "POST",
            body: formData,
        })
            .then((response) => response.json())
            .then((data) => {
                console.log("Files uploaded successfully:", data);
            })
            .catch((error) => {
                console.error("Error uploading files:", error);
            });
    };

    return (
        <div className={classes.blockContent}>
            <input type="file" multiple onChange={handleFileChange} />
            <button onClick={handleUpload}>Click</button>
            <ContentInfo/>
        </div>
    );
};

export default InputFile;
