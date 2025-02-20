
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
      <div className="absolute left-0 top-0 z-10 h-full w-32 bg-gradient-to-r from-[#F5F7FA] to-transparent dark:from-[#111C2A]" />
      <div className="absolute right-0 top-0 z-10 h-full w-32 bg-gradient-to-l from-[#F5F7FA] to-transparent dark:from-[#111C2A]" />
      <div
        ref={scrollRef}
        className="flex gap-16 overflow-x-hidden whitespace-nowrap py-8"
      >
        {[...platforms, ...platforms].map((platform, index) => (
          <div
            key={`${platform.name}-${index}`}
            className="inline-flex h-12 w-32 items-center justify-center opacity-70 transition-opacity duration-300 hover:opacity-100"
          >
            <div className="h-8 w-32 rounded-lg bg-gradient-to-r from-gray-300 to-gray-200 dark:from-gray-700 dark:to-gray-600" />
          </div>
        ))}
      </div>
    </div>
  );
}
