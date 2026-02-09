import React, { useEffect, useState } from 'react';

interface DecoderTextProps {
    text: string;
    className?: string;
    reveal?: boolean;
}

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@#$%^&*()_+-=[]{}|;:,.<>?";

const DecoderText: React.FC<DecoderTextProps> = ({ text, className = "", reveal = true }) => {
    const [displayText, setDisplayText] = useState('');

    useEffect(() => {
        if (!reveal) {
            setDisplayText(text);
            return;
        }

        let iteration = 0;
        const interval = setInterval(() => {
            setDisplayText(prev =>
                text
                    .split("")
                    .map((char, index) => {
                        if (index < iteration) {
                            return text[index];
                        }
                        return CHARS[Math.floor(Math.random() * CHARS.length)];
                    })
                    .join("")
            );

            if (iteration >= text.length) {
                clearInterval(interval);
            }

            iteration += 1 / 2; // Speed of reveal
        }, 30);

        return () => clearInterval(interval);
    }, [text, reveal]);

    return (
        <span className={className}>
            {displayText}
        </span>
    );
};

export default DecoderText;
