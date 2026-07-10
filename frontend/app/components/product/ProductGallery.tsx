"use client";

import { useState, useEffect } from "react";
import Image, { StaticImageData } from "next/image";
import { motion, AnimatePresence } from "framer-motion";

interface ProductGalleryProps {
  images: (string | StaticImageData)[];
  title: string;
}

export default function ProductGallery({ images, title }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const activeImage = images[activeIndex] || images[0];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setMousePos({ x, y });
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Main Image View */}
      <div
        className="relative aspect-square w-full max-w-[360px] mx-auto overflow-hidden rounded-2xl border border-gray-100 bg-white p-4 cursor-zoom-in touch-pan-y"
        onMouseEnter={() => !isMobile && setZoom(true)}
        onMouseLeave={() => setZoom(false)}
        onMouseMove={(e) => !isMobile && handleMouseMove(e)}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            drag={images.length > 1 ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.5}
            onDragEnd={(e, info) => {
              const swipe = info.offset.x;
              const swipeThreshold = 50;
              if (swipe < -swipeThreshold) {
                // Swipe Left -> next image
                setActiveIndex((prev) => (prev < images.length - 1 ? prev + 1 : prev));
              } else if (swipe > swipeThreshold) {
                // Swipe Right -> previous image
                setActiveIndex((prev) => (prev > 0 ? prev - 1 : prev));
              }
            }}
            initial={{ opacity: 0, x: isMobile ? 20 : 0 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isMobile ? -20 : 0 }}
            transition={{ duration: 0.2 }}
            className="relative h-full w-full select-none"
            style={{
              transformOrigin: `${mousePos.x}% ${mousePos.y}%`,
              transform: zoom ? "scale(1.8)" : "scale(1)",
              transition: zoom ? "none" : "transform 0.2s ease-out",
              touchAction: "pan-y",
            }}
          >
            <Image
              src={activeImage}
              alt={title}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-contain p-4 select-none pointer-events-none"
              priority
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Mobile Dot Indicators */}
      {images.length > 1 && (
        <div className="flex justify-center gap-1.5 md:hidden">
          {images.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                activeIndex === idx ? "w-5 bg-orange-500" : "w-2 bg-gray-200"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}

      {/* Thumbnails Row (Desktop/Tablet) */}
      {images.length > 1 && (
        <div className="hidden md:flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`relative aspect-square w-20 shrink-0 overflow-hidden rounded-lg border bg-white p-1 transition-all cursor-pointer ${
                activeIndex === idx
                  ? "border-orange-500 ring-2 ring-orange-200"
                  : "border-gray-100 hover:border-orange-200"
              }`}
            >
              <Image
                src={img}
                alt={`${title} thumbnail ${idx + 1}`}
                fill
                sizes="100px"
                className="object-contain p-1"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
