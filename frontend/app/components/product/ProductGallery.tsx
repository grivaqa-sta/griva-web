"use client";

import { useState, useRef } from "react";
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

  const thumbsScrollRef = useRef<HTMLDivElement>(null);
  const [isThumbsMouseDown, setIsThumbsMouseDown] = useState(false);
  const [thumbsStartX, setThumbsStartX] = useState(0);
  const [thumbsScrollLeft, setThumbsScrollLeft] = useState(0);
  const [thumbsHasMoved, setThumbsHasMoved] = useState(false);

  const handleThumbsMouseDown = (e: React.MouseEvent) => {
    const el = thumbsScrollRef.current;
    if (!el) return;
    setIsThumbsMouseDown(true);
    setThumbsStartX(e.pageX - el.offsetLeft);
    setThumbsScrollLeft(el.scrollLeft);
    setThumbsHasMoved(false);
  };

  const handleThumbsMouseMove = (e: React.MouseEvent) => {
    if (!isThumbsMouseDown) return;
    const el = thumbsScrollRef.current;
    if (!el) return;
    e.preventDefault();
    const x = e.pageX - el.offsetLeft;
    const walk = (x - thumbsStartX) * 1.5;
    if (Math.abs(walk) > 5) {
      setThumbsHasMoved(true);
    }
    el.scrollLeft = thumbsScrollLeft - walk;
  };

  const handleThumbsMouseUpOrLeave = () => {
    setIsThumbsMouseDown(false);
  };

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
        className="relative aspect-square w-full max-w-[360px] mx-auto overflow-hidden rounded-2xl border border-gray-100 bg-white p-4 cursor-zoom-in"
        onMouseEnter={() => setZoom(true)}
        onMouseLeave={() => setZoom(false)}
        onMouseMove={handleMouseMove}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="relative h-full w-full"
            style={{
              transformOrigin: `${mousePos.x}% ${mousePos.y}%`,
              transform: zoom ? "scale(1.8)" : "scale(1)",
              transition: zoom ? "none" : "transform 0.2s ease-out",
            }}
          >
            <Image
              src={activeImage}
              alt={title}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-contain p-4 select-none"
              priority
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Thumbnails Row */}
      {images.length > 1 && (
        <div
          ref={thumbsScrollRef}
          onMouseDown={handleThumbsMouseDown}
          onMouseMove={handleThumbsMouseMove}
          onMouseUp={handleThumbsMouseUpOrLeave}
          onMouseLeave={handleThumbsMouseUpOrLeave}
          className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin no-scrollbar cursor-grab active:cursor-grabbing select-none"
        >
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => {
                if (!thumbsHasMoved) {
                  setActiveIndex(idx);
                }
              }}
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
