"use client";

import { useEffect, useState } from "react";

// Dùng chung cho các component cần đổi style khi cuộn qua một mốc scrollY (Header, TopHero, ...).
export function useScrollThreshold(threshold = 50): boolean {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > threshold);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [threshold]);

  return isScrolled;
}
