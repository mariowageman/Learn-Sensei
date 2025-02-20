
import React, { useState, useEffect } from 'react';

interface AnimatedTextProps {
  words: string[];
  interval?: number;
}

export function AnimatedText({ words, interval = 2500 }: AnimatedTextProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const fadeTimeout = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % words.length);
        setIsVisible(true);
      }, 200);
    }, interval);

    return () => clearInterval(fadeTimeout);
  }, [words, interval]);

  return (
    <span
      className={`inline-block transition-opacity duration-200 bg-yellow-300/30 px-1 rounded ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {words[currentIndex]}
    </span>
  );
}
