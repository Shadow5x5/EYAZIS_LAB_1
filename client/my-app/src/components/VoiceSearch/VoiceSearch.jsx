import React, { useState, useEffect } from "react";
import annyang from "annyang";
import Recorder from "react-mic-recorder";

const VoiceSearch = ({ onVoiceInput }) => {
    const [isListening, setIsListening] = useState(false);

    useEffect(() => {
        if (isListening) {
            annyang.start();
        } else {
            annyang.abort();
        }

        annyang.addCallback("result", (phrases) => {
            if (phrases.length > 0) {
                onVoiceInput(phrases[0]); // Передача распознанной фразы обратно в компонент
            }
        });

        return () => {
            annyang.abort();
            annyang.removeCallback("result");
        };
    }, [isListening, onVoiceInput]);

    const startListening = () => {
        setIsListening(true);
    };

    const stopListening = () => {
        setIsListening(false);
    };

    return (
        <div>
            <Recorder
                isRecording={isListening}
                onStop={() => stopListening()}
                backgroundColor="#FF4081"
            />
            <button onClick={startListening} disabled={isListening}>
                Начать голосовой ввод
            </button>
            <button onClick={stopListening} disabled={!isListening}>
                Закончить голосовой ввод
            </button>
        </div>
    );
};

export default VoiceSearch;
