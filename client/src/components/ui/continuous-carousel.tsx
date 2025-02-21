
import { useEffect, useRef } from "react";

export const platforms = [
  { name: "edX", logo: "/assets/logos/edx.svg" },
  { name: "Coursera", logo: "/assets/logos/coursera.svg" },
  { name: "Udemy", logo: "/assets/logos/udemy.svg" },
  { name: "Khan Academy", logo: "/assets/logos/khan.svg" },
  { name: "FutureLearn", logo: "/assets/logos/futurelearn.svg" },
  { name: "Skillshare", logo: "/assets/logos/skillshare.svg" },
  { name: "LinkedIn Learning", logo: "/assets/logos/linkedin.svg" },
  { name: "Pluralsight", logo: "/assets/logos/pluralsight.svg" },
];

export function ContinuousCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scroll = () => {
      if (scrollRef.current) {
        if (
          scrollRef.current.scrollLeft >=
          scrollRef.current.scrollWidth / 2
        ) {
          scrollRef.current.scrollLeft = 0;
        } else {
          scrollRef.current.scrollLeft += 1;
        }
      }
    };

    const intervalId = setInterval(scroll, 30);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="relative w-full overflow-hidden">
      <div className="absolute left-0 top-0 z-10 h-full w-32 bg-gradient-to-r from-white to-transparent dark:from-black" />
      <div className="absolute right-0 top-0 z-10 h-full w-32 bg-gradient-to-l from-white to-transparent dark:from-black" />
      <div
        ref={scrollRef}
        className="flex animate-scroll gap-16 py-8"
        style={{ width: 'max-content' }}
      >
        {[...platforms, ...platforms].map((platform, index) => (
          <div
            key={`${platform.name}-${index}`}
            className="inline-flex h-12 w-32 items-center justify-center opacity-70 transition-opacity duration-300 hover:opacity-100"
          >
            <img 
              src={platform.logo} 
              alt={platform.name}
              className="h-8 w-32 object-contain text-gray-900 dark:brightness-[1.3] dark:contrast-[1.2] dark:opacity-95 dark:drop-shadow-[0_0_2px_rgba(255,255,255,0.3)]" 
            />
          </div>
        ))}
      </div>
    </div>
  );
}
