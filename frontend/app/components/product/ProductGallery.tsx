"use client";

import { useState, useEffect, useCallback } from "react";
import Image, { StaticImageData } from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Maximize2, ZoomIn } from "lucide-react";

interface ProductGalleryProps {
  images: (string | StaticImageData)[];
  title: string;
}

export default function ProductGallery({ images, title }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [isMobile, setIsMobile] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxScale, setLightboxScale] = useState(1);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Lock body scroll when lightbox is open
  useEffect(() => {
    if (isLightboxOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setLightboxScale(1);
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isLightboxOpen]);

  const activeImage = images[activeIndex] || images[0];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = Math.min(100, Math.max(0, ((e.clientX - left) / width) * 100));
    const y = Math.min(100, Math.max(0, ((e.clientY - top) / height) * 100));
    setMousePos({ x, y });
  };

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  }, [images.length]);

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  }, [images.length]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isLightboxOpen) return;
      if (e.key === "Escape") setIsLightboxOpen(false);
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLightboxOpen, handleNext, handlePrev]);

  return (
    <div className="flex flex-col gap-3.5 w-full select-none">

      {/* Main Image Container */}
      <div
        className="group relative aspect-square w-full max-w-[420px] mx-auto overflow-hidden rounded-2xl bg-white p-4 border border-gray-100/80 shadow-xs cursor-pointer"
        onMouseEnter={() => !isMobile && setIsHovering(true)}
        onMouseLeave={() => { setIsHovering(false); setMousePos({ x: 50, y: 50 }); }}
        onMouseMove={handleMouseMove}
        onClick={() => setIsLightboxOpen(true)}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            drag={images.length > 1 ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.4}
            onDragEnd={(_, info) => {
              if (info.offset.x < -40) handleNext();
              else if (info.offset.x > 40) handlePrev();
            }}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            className="relative h-full w-full select-none"
            style={{ touchAction: "pan-y" }}
          >
            {/* Desktop Hover Zoom Wrapper */}
            <div
              className="relative h-full w-full"
              style={{
                transformOrigin: `${mousePos.x}% ${mousePos.y}%`,
                transform: isHovering && !isMobile ? "scale(1.8)" : "scale(1)",
                transition: isHovering && !isMobile ? "transform 0.1s ease-out" : "transform 0.3s ease-out",
              }}
            >
              <Image
                src={activeImage}
                alt={title}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-contain p-2 select-none pointer-events-none"
                priority
              />
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Floating Zoom / Expand Icon Hint */}
        <div className="absolute top-3 right-3 opacity-80 md:opacity-0 md:group-hover:opacity-100 transition-opacity bg-black/60 backdrop-blur-md text-white p-2 rounded-xl text-xs flex items-center gap-1 shadow-md pointer-events-none">
          <Maximize2 className="h-3.5 w-3.5" />
        </div>

        {/* Floating Image Counter Badge (Mobile & Desktop) */}
        {images.length > 1 && (
          <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-black px-2.5 py-1 rounded-full pointer-events-none tracking-wider">
            {activeIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Sub-Images Thumbnails Row — Visible on BOTH Mobile and Desktop */}
      {images.length > 1 && (
        <div className="flex items-center justify-center gap-2 overflow-x-auto py-1 px-1 max-w-full scrollbar-none">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`relative aspect-square w-16 sm:w-20 shrink-0 overflow-hidden rounded-xl border bg-white p-1 transition-all cursor-pointer ${
                activeIndex === idx
                  ? "border-orange-500 ring-2 ring-orange-200 shadow-xs scale-105"
                  : "border-gray-200 hover:border-orange-300 opacity-80 hover:opacity-100"
              }`}
            >
              <Image
                src={img}
                alt={`${title} thumbnail ${idx + 1}`}
                fill
                sizes="80px"
                className="object-contain p-1"
              />
            </button>
          ))}
        </div>
      )}

      {/* ───────────────────────────────────────────────────────── */}
      {/* Flipkart / Amazon Style Full-Screen Lightbox Modal        */}
      {/* ───────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[99999] bg-black/95 backdrop-blur-md flex flex-col justify-between select-none"
          >
            {/* Top Toolbar */}
            <div className="flex items-center justify-between p-4 sm:p-6 text-white border-b border-white/10 z-10">
              <div className="flex items-center gap-3">
                <span className="text-xs sm:text-sm font-black bg-white/15 px-3 py-1 rounded-full tracking-wider">
                  {activeIndex + 1} of {images.length}
                </span>
                <span className="text-xs sm:text-sm font-bold text-gray-300 truncate max-w-[200px] sm:max-w-xs">
                  {title}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setLightboxScale((s) => (s === 1 ? 2 : 1))}
                  className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                  title="Zoom"
                >
                  <ZoomIn className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setIsLightboxOpen(false)}
                  className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                  title="Close (Esc)"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Center Slider Area with Touch Drag */}
            <div className="relative flex-1 flex items-center justify-center p-4 overflow-hidden">

              {/* Prev Arrow */}
              {images.length > 1 && (
                <button
                  onClick={handlePrev}
                  className="absolute left-3 sm:left-6 z-20 p-3 rounded-full bg-black/50 hover:bg-white/20 text-white backdrop-blur-md transition-all cursor-pointer active:scale-95"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
              )}

              {/* Slide Image */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeIndex}
                  drag={images.length > 1 && lightboxScale === 1 ? "x" : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.4}
                  onDragEnd={(_, info) => {
                    if (info.offset.x < -50) handleNext();
                    else if (info.offset.x > 50) handlePrev();
                  }}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: lightboxScale }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="relative w-full h-full max-w-4xl max-h-[75vh] flex items-center justify-center cursor-grab active:cursor-grabbing"
                  style={{ touchAction: lightboxScale > 1 ? "none" : "pan-y" }}
                  onDoubleClick={() => setLightboxScale((s) => (s === 1 ? 2 : 1))}
                >
                  <Image
                    src={activeImage}
                    alt={`${title} - view ${activeIndex + 1}`}
                    fill
                    sizes="100vw"
                    className="object-contain p-2"
                    priority
                  />
                </motion.div>
              </AnimatePresence>

              {/* Next Arrow */}
              {images.length > 1 && (
                <button
                  onClick={handleNext}
                  className="absolute right-3 sm:right-6 z-20 p-3 rounded-full bg-black/50 hover:bg-white/20 text-white backdrop-blur-md transition-all cursor-pointer active:scale-95"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              )}
            </div>

            {/* Bottom Sub-Images Thumbnail Strip in Lightbox */}
            {images.length > 1 && (
              <div className="p-4 sm:p-6 border-t border-white/10 flex justify-center gap-3 overflow-x-auto scrollbar-none z-10">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => { setActiveIndex(idx); setLightboxScale(1); }}
                    className={`relative aspect-square w-14 sm:w-16 shrink-0 overflow-hidden rounded-xl border p-1 transition-all cursor-pointer ${
                      activeIndex === idx
                        ? "border-orange-500 ring-2 ring-orange-500 scale-105 bg-white/20"
                        : "border-white/20 hover:border-white/50 opacity-60 hover:opacity-100 bg-white/10"
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      fill
                      sizes="60px"
                      className="object-contain p-1"
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

