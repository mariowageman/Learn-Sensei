import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";

export const useScroll = () => {
  const [scrollDirection, setScrollDirection] = useState<"up" | "down">("up");
  const [prevScrollY, setPrevScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [location] = useLocation();

  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY;

    if (currentScrollY < 50) {
      setIsVisible(true);
      return;
    }

    if (Math.abs(currentScrollY - prevScrollY) < 10) {
      return;
    }

    setIsVisible(currentScrollY < prevScrollY);
    setPrevScrollY(currentScrollY);
    setScrollDirection(currentScrollY > prevScrollY ? "down" : "up");
  }, [prevScrollY]);

  useEffect(() => {
    let timeoutId: number;

    const throttledScroll = () => {
      if (timeoutId) return;

      timeoutId = window.setTimeout(() => {
        handleScroll();
        timeoutId = 0;
      }, 100);
    };

    window.addEventListener("scroll", throttledScroll);
    return () => {
      window.removeEventListener("scroll", throttledScroll);
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [handleScroll]);

  useEffect(() => {
    window.scrollTo(0, 0);
    setIsVisible(true);
    setPrevScrollY(0);
  }, [location]);

  return { isVisible, scrollDirection };
};