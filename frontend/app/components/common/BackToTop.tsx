"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;
      const totalScroll = scrollHeight - clientHeight;

      if (totalScroll > 0) {
        setScrollProgress((scrollTop / totalScroll) * 100);
      }

      if (scrollTop > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // SVG circle calculations
  const radius = 20;
  const stroke = 3;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (scrollProgress / 100) * circumference;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          whileHover={{ scale: 1.1, translateY: -2 }}
          whileTap={{ scale: 0.9 }}
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-[999] hidden sm:flex h-12 w-12 items-center justify-center rounded-full bg-white text-orange-500 shadow-xl shadow-orange-500/10 border border-gray-100 hover:text-orange-600 transition-colors cursor-pointer group focus:outline-none"
          aria-label="Back to top"
        >
          {/* Progress Ring */}
          <svg className="absolute -rotate-90 h-full w-full pointer-events-none" viewBox="0 0 48 48">
            <circle
              stroke="rgba(249, 115, 22, 0.15)"
              fill="transparent"
              strokeWidth={stroke}
              r={radius}
              cx="24"
              cy="24"
            />
            <motion.circle
              stroke="currentColor"
              fill="transparent"
              strokeWidth={stroke}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              r={radius}
              cx="24"
              cy="24"
            />
          </svg>

          <ArrowUp
            size={18}
            className="transition-transform duration-300 group-hover:-translate-y-0.5"
            strokeWidth={2.5}
          />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
