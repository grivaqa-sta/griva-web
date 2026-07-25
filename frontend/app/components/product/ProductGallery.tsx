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
  const [isHovering, setIsHovering] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const activeImage = images[activeIndex] || images[0];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = Math.min(100, Math.max(0, ((e.clientX - left) / width) * 100));
    const y = Math.min(100, Math.max(0, ((e.clientY - top) / height) * 100));
    setMousePos({ x, y });
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Main Image */}
      <div
        className="relative aspect-square w-full max-w-[360px] mx-auto overflow-hidden rounded-2xl bg-white p-4 cursor-zoom-in"
        onMouseEnter={() => !isMobile && setIsHovering(true)}
        onMouseLeave={() => { setIsHovering(false); setMousePos({ x: 50, y: 50 }); }}
        onMouseMove={handleMouseMove}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            drag={images.length > 1 ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.5}
            onDragEnd={(_, info) => {
              if (info.offset.x < -50) setActiveIndex((p) => (p < images.length - 1 ? p + 1 : p));
              else if (info.offset.x > 50) setActiveIndex((p) => (p > 0 ? p - 1 : p));
            }}
            initial={{ opacity: 0, x: isMobile ? 20 : 0 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isMobile ? -20 : 0 }}
            transition={{ duration: 0.2 }}
            className="relative h-full w-full select-none"
            style={{ touchAction: "pan-y" }}
          >
            {/* Zoom wrapper — separate from motion.div so drag doesn't override transform */}
            <div
              className="relative h-full w-full"
              style={{
                transformOrigin: `${mousePos.x}% ${mousePos.y}%`,
                transform: isHovering ? "scale(2)" : "scale(1)",
                transition: isHovering ? "transform 0.1s ease-out" : "transform 0.3s ease-out",
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
            </div>
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
