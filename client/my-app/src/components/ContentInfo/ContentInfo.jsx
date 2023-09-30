import classes from "./ContentInfo.module.css";
import React, { useState } from 'react';
const ContentInfo = () => {

    const handleMouseEnter = () => {
        setIsHovered(true);
    };
    
    const handleMouseOut = () => {
        setIsHovered(false);
    };
    const [isHovered, setIsHovered] = useState(false);
    const blockStyle = {
        display: isHovered ? 'flex' : 'none',
    };
    return (
        <div className={classes.mainBlock}>
            <button className={classes.buttonInfo} onMouseEnter={handleMouseEnter} onMouseOut={handleMouseOut}>?</button>
            <div className={classes.contentBlock} style={blockStyle}>
                <ul>
                    <li>Ошибка: 0.4</li>
                    <li>F-мера: 0.46</li>
                    <li>Precision(5): 0.6</li>
                    <li>Precision(10): 0.3</li>
                    <li>R-precision: 0.67</li>
                    <li>Average Precision: 0.75</li>
                </ul>
                <img src="./photo_2023-09-28_11-01-05.jpg" alt="#" />
            </div>
        </div>
    );
};

export default ContentInfo;
