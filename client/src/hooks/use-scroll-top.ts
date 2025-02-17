
import { useEffect, useState } from "react";
import { useLocation } from "wouter";

export const useScrollTop = () => {
  const [location] = useLocation();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollDelta = currentScrollY - lastScrollY;
      
      if (currentScrollY < 10) {
        setIsVisible(true);
      } else if (Math.abs(scrollDelta) > 10) {
        if (scrollDelta < 0) {
          // Scrolling up
          setIsVisible(true);
        } else {
          // Scrolling down
          setIsVisible(false);
        }
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return isVisible;
};
