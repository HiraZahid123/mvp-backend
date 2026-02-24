import React, { useState, useEffect, memo } from 'react';

const TypewriterEffect = memo(({ strings, pauseTime = 2000, typingSpeed = 100, onUserInput, className = "" }) => {
    const [currentStringIndex, setCurrentStringIndex] = useState(0);
    const [currentText, setCurrentText] = useState('');
    const [isTyping, setIsTyping] = useState(true);
    const [isActive, setIsActive] = useState(true);

    useEffect(() => {
        if (!isActive) return;

        let timeout;

        if (isTyping) {
            if (currentText.length < strings[currentStringIndex].length) {
                timeout = setTimeout(() => {
                    setCurrentText(strings[currentStringIndex].slice(0, currentText.length + 1));
                }, typingSpeed);
            } else {
                timeout = setTimeout(() => {
                    setIsTyping(false);
                }, pauseTime);
            }
        } else {
            if (currentText.length > 0) {
                timeout = setTimeout(() => {
                    setCurrentText(currentText.slice(0, currentText.length - 1));
                }, typingSpeed / 2);
            } else {
                setCurrentStringIndex((prev) => (prev + 1) % strings.length);
                setIsTyping(true);
            }
        }

        return () => clearTimeout(timeout);
    }, [currentText, isTyping, isActive, currentStringIndex, strings, pauseTime, typingSpeed]);

    const handleInput = (e) => {
        setIsActive(false);
        onUserInput(e.target.value);
    };

    return (
        <input
            type="text"
            placeholder={isActive ? currentText : ""}
            onChange={handleInput}
            onFocus={() => setIsActive(false)}
            className={`w-full bg-white border-2 border-gray-border rounded-full px-8 py-4 text-lg font-medium focus:outline-none focus:border-oflem-terracotta transition-all placeholder:text-gray-muted/50 ${className}`}
        />
    );
});

export default TypewriterEffect;
