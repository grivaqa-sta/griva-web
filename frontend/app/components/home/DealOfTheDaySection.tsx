"use client";

import { products } from "@/app/data/data";
import { ChevronLeft, ChevronRight, ShoppingCart } from "lucide-react";
import Image, { StaticImageData } from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import Rating from "../rating/Rating";
import { useCountdown } from "@/app/hooks/useCountdown";
import { useCart } from "@/app/context/CartContext";
import { motion, AnimatePresence } from "framer-motion";
import { useAdminSettings } from "@/app/context/AdminContext";

export default function DealOfTheDaySection() {
  const { cmsDealTargetDate, cmsDealSlides: slides } = useAdminSettings();
  const { hours, mins, secs } = useCountdown(cmsDealTargetDate);
  const { addToCart } = useCart();

  const [current, setCurrent] = useState<number>(0);
  const [activeImage, setActiveImage] = useState<string | StaticImageData | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [direction, setDirection] = useState<"next" | "prev">("next");

  const prev = (): void => {
    setDirection("prev");
    setCurrent((c) => (c - 1 + slides.length) % slides.length);
  };

  const next = (): void => {
    setDirection("next");
    setCurrent((c) => (c + 1) % slides.length);
  };

  useEffect(() => {
    setActiveImage(null);
  }, [current]);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => { next(); }, 5000);
    return () => clearInterval(timer);
  }, [isPaused, current]);

  const slide = slides[current];
  const displayImage = activeImage || slide.mainImage;

  const handleAddToCart = () => {
    const matchedProduct = products.find(
      (p) => p.title === slide.title || p.id === slide.id
    );
    if (matchedProduct) {
      addToCart({
        id: matchedProduct.id,
        title: matchedProduct.title,
        image: matchedProduct.image,
        price: matchedProduct.price,
        category: matchedProduct.category,
      });
    } else {
      addToCart({
        id: slide.id + 10000,
        title: slide.title,
        image: slide.mainImage,
        price: slide.price,
        category: slide.category,
      });
    }
  };

  const timerBlocks = [
    { value: hours, label: "Hrs" },
    { value: mins, label: "Min" },
    { value: secs, label: "Sec" },
  ];

  return (
    <section className="w-full py-5">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 sm:px-6 lg:grid-cols-[280px_1fr] lg:px-8">

        {/* ── LEFT TIMER CARD — desktop only ── */}
        <div className="hidden lg:flex flex-col items-center justify-center rounded-2xl border border-orange-100 bg-white px-6 py-8 text-center shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-[3px] text-red-500">
            Only For Today
          </span>
          <h2 className="mt-2 text-xl font-bold text-gray-950">Deal Of The Day</h2>
          <p className="mt-2 max-w-sm text-xs leading-5 text-gray-500">
            Awesome lightning deals on premium consumer electronics. Act fast!
          </p>
          <div className="mt-3 flex items-center gap-3">
            {timerBlocks.map(({ value, label }) => (
              <div key={label} className="flex flex-col items-center">
                <div className="flex h-11 w-12 items-center justify-center rounded-xl bg-orange-500 shadow-md shadow-orange-500/10">
                  <span className="text-lg font-bold text-white">{String(value).padStart(2, "0")}</span>
                </div>
                <span className="mt-1.5 text-[9px] font-medium text-gray-400">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── PRODUCT CARD ── */}
        <div
          className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm touch-pan-y"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >
          {/* ── MOBILE ONLY: orange timer banner ── */}
          <div className="lg:hidden bg-gradient-to-br from-orange-600 via-orange-500 to-amber-400 px-5 py-4 flex items-center justify-between gap-4">
            <div className="flex flex-col">
              <span className="text-[8px] font-black uppercase tracking-[2.5px] text-orange-100">
                Only For Today
              </span>
              <h2 className="text-[15px] font-black text-white leading-snug">
                Deal of the Day
              </h2>
              <p className="text-[8px] text-orange-200 mt-0.5 leading-tight">
                Lightning deals on electronics!
              </p>
            </div>
            <div className="flex items-center gap-1">
              {timerBlocks.map(({ value, label }, i) => (
                <div key={label} className="flex items-center gap-1">
                  <div className="flex flex-col items-center">
                    <div className="flex h-[38px] w-[38px] items-center justify-center rounded-[10px] bg-black/25">
                      <span className="text-[17px] font-black text-white leading-none">
                        {String(value).padStart(2, "0")}
                      </span>
                    </div>
                    <span className="mt-0.5 text-[7px] font-bold text-orange-200 uppercase">
                      {label}
                    </span>
                  </div>
                  {i < 2 && (
                    <span className="mb-4 text-[18px] font-black text-white/50 select-none">:</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ── SLIDE CONTENT ── */}
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, x: direction === "next" ? 40 : -40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction === "next" ? -40 : 40 }}
              transition={{ duration: 0.3 }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={(e, { offset }) => {
                if (offset.x < -50) next();
                else if (offset.x > 50) prev();
              }}
              // ✅ CHANGED: mobile flex-col with full width, desktop flex-row
              className="flex w-full flex-col gap-4 p-4 lg:flex-row lg:gap-6 lg:p-6 cursor-grab active:cursor-grabbing"
            >
              {/* ── IMAGE SECTION ── */}
              <div className="flex shrink-0 items-start gap-3">
                {/* Thumbnails */}
                <div className="flex shrink-0 flex-col gap-2">
                  {slide.thumbs.slice(0, 3).map((image, index) => (
                    <div
                      key={index}
                      onClick={(e) => { e.stopPropagation(); setActiveImage(image); }}
                      className={`flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center rounded-lg border transition-all ${
                        displayImage === image
                          ? "border-orange-500 bg-orange-50"
                          : "border-gray-100 bg-gray-50 hover:border-orange-200"
                      }`}
                    >
                      <Image src={image} alt="thumb" width={36} height={36} className="object-contain" style={{ width: "auto", height: "auto" }} />
                    </div>
                  ))}
                </div>

                {/* Main image */}
                <div className="relative mx-auto flex h-[220px] w-[220px] shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gray-50/50 p-4 pointer-events-none lg:mx-0 lg:h-[240px] lg:w-[240px]">
                  <Image
                    src={displayImage}
                    alt={slide.title}
                    fill
                    sizes="(max-width: 768px) 220px, 300px"
                    className="object-contain p-4 transition-all duration-300"
                  />
                </div>
              </div>

              {/* ── PRODUCT CONTENT ── */}
              {/* ✅ CHANGED: w-full on mobile so content + button fill the card */}
              <div className="flex w-full min-w-0 flex-col gap-3 lg:flex-1 lg:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-orange-500 px-2 py-0.5 text-[9px] font-extrabold uppercase text-white">
                      {slide.badge}
                    </span>
                    {slide.hot && (
                      <span className="animate-pulse rounded bg-red-600 px-2 py-0.5 text-[9px] font-extrabold uppercase text-white">
                        HOT
                      </span>
                    )}
                  </div>
                  <p className="mt-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                    {slide.category}
                  </p>
                  <h3 className="mt-1 break-words text-base font-semibold leading-6 text-gray-900 transition-colors hover:text-orange-500">
                    <Link href={`/product/${slide.id}`}>{slide.title}</Link>
                  </h3>
                  <div className="mt-2">
                    <Rating rating={slide.rating} />
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-2xl font-bold text-orange-500">{slide.price}</span>
                    <span className="text-xs text-gray-400 line-through">{slide.oldPrice}</span>
                  </div>
                  <p className="mt-3 break-words text-xs leading-relaxed text-gray-500">
                    {slide.description}
                  </p>
                </div>

                {/* ✅ CHANGED: w-full on all screens, lg:w-44 on desktop only */}
                <button
                  onClick={(e) => { e.stopPropagation(); handleAddToCart(); }}
                  className="z-10 mt-2 flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-orange-500 text-xs font-bold uppercase text-white shadow-md shadow-orange-500/20 transition hover:bg-orange-600 lg:w-44"
                >
                  <ShoppingCart size={14} /> Add To Cart
                </button>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Desktop nav arrows — unchanged */}
          <div className="absolute bottom-6 right-6 hidden lg:flex items-center gap-2">
            <button onClick={prev} className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white hover:border-orange-500 hover:text-orange-500">
              <ChevronLeft size={16} />
            </button>
            <button onClick={next} className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white hover:border-orange-500 hover:text-orange-500">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Pagination Dots — unchanged */}
      <div className="mt-6 flex items-center justify-center gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`cursor-pointer rounded-full transition-all ${
              i === current ? "h-2.5 w-8 bg-orange-500" : "h-2.5 w-2.5 bg-gray-200"
            }`}
          />
        ))}
      </div>
    </section>
  );
}