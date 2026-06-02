"use client";

import { slides, products } from "@/app/data/data";
import { ChevronLeft, ChevronRight, ShoppingCart } from "lucide-react";
import Image, { StaticImageData } from "next/image"; 
import Link from "next/link";
import { useEffect, useState } from "react";
import Rating from "../rating/Rating";
import { useCountdown } from "@/app/hooks/useCountdown";
import { useCart } from "@/app/context/CartContext";
import { motion, AnimatePresence } from "framer-motion";

export default function DealOfTheDaySection() {
  const { hours, mins, secs } = useCountdown(15);
  const { addToCart } = useCart();

  const [current, setCurrent] = useState<number>(0);
  const [activeImage, setActiveImage] = useState<string | StaticImageData | null>(null);
  const [isPaused, setIsPaused] = useState(false); // New state for pausing

  const prev = (): void => {
    setCurrent((c) => (c - 1 + slides.length) % slides.length);
  };

  const next = (): void => {
    setCurrent((c) => (c + 1) % slides.length);
  };

  useEffect(() => {
    setActiveImage(null);
  }, [current]);

  // Updated Auto-play timer with Pause logic
  useEffect(() => {
    if (isPaused) return; // Don't start timer if paused

    const timer = setInterval(() => {
      next();
    }, 5000);

    return () => clearInterval(timer);
  }, [isPaused, current]); // Re-run effect when pause state or current slide changes

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

  return (
    <section className="w-full py-8">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 sm:px-6 lg:grid-cols-[280px_1fr] lg:px-8">

        {/* Left Timer Card */}
        <div className="flex flex-col items-center justify-center rounded-2xl border border-orange-100 bg-white px-6 py-8 text-center shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-[3px] text-red-500">
            Only For Today
          </span>
          <h2 className="mt-2 text-xl font-bold text-gray-950">Deal Of The Day</h2>
          <p className="mt-3 max-w-sm text-xs leading-5 text-gray-500">
            Awesome lightning deals on premium consumer electronics. Act fast!
          </p>
          <div className="mt-6 flex items-center gap-3">
            {[{ value: hours, label: "Hours" }, { value: mins, label: "Mins" }, { value: secs, label: "Secs" }].map(({ value, label }) => (
              <div key={label} className="flex flex-col items-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500 shadow-md shadow-orange-500/10">
                  <span className="text-lg font-bold text-white">{String(value).padStart(2, "0")}</span>
                </div>
                <span className="mt-1.5 text-[10px] font-medium text-gray-400">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Product Card */}
        <div 
          className="relative min-h-[340px] overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm touch-pan-y"
          onMouseEnter={() => setIsPaused(true)}  // Pause on Desktop Hover
          onMouseLeave={() => setIsPaused(false)} // Resume on Desktop Leave
          onTouchStart={() => setIsPaused(true)}  // Pause on Mobile Touch
          onTouchEnd={() => setIsPaused(false)}    // Resume on Mobile Release
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              
              // SWIPE LOGIC START
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={(e, { offset, velocity }) => {
                const swipeThreshold = 50;
                if (offset.x < -swipeThreshold) {
                  next();
                } else if (offset.x > swipeThreshold) {
                  prev();
                }
              }}
              // SWIPE LOGIC END

              className="flex h-full flex-col gap-6 lg:flex-row cursor-grab active:cursor-grabbing"
            >
              {/* Image Section */}
              <div className="flex shrink-0 items-start gap-3">
                <div className="flex shrink-0 flex-col gap-2">
                  {slide.thumbs.slice(0, 3).map((image, index) => (
                    <div
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent drag trigger when clicking thumbs
                        setActiveImage(image);
                      }}
                      className={`flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center rounded-lg border transition-all ${displayImage === image
                          ? "border-orange-500 bg-orange-50"
                          : "border-gray-100 bg-gray-50 hover:border-orange-200"
                        }`}
                    >
                      <Image src={image} alt="thumb" width={36} height={36} className="object-contain" style={{ width: "auto", height: "auto" }} />
                    </div>
                  ))}
                </div>

                <div className="relative flex h-[240px] w-[240px] shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gray-50/50 p-4 pointer-events-none">
                  <Image
                    src={displayImage}
                    alt={slide.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 300px"
                    className="object-contain p-4 transition-all duration-300"
                  />
                </div>
              </div>

              {/* Product Content */}
              <div className="flex min-w-0 flex-1 flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-orange-500 px-2 py-0.5 text-[9px] font-extrabold uppercase text-white">{slide.badge}</span>
                    {slide.hot && <span className="animate-pulse rounded bg-red-600 px-2 py-0.5 text-[9px] font-extrabold uppercase text-white">HOT</span>}
                  </div>
                  <p className="mt-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400">{slide.category}</p>
                  <h3 className="mt-1 break-words text-base font-semibold leading-6 text-gray-900 transition-colors hover:text-orange-500">
                    <Link href={`/product/${slide.id}`}>{slide.title}</Link>
                  </h3>
                  <div className="mt-2"><Rating rating={slide.rating} /></div>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-2xl font-bold text-orange-500">{slide.price}</span>
                    <span className="text-xs text-gray-400 line-through">{slide.oldPrice}</span>
                  </div>
                  <p className="mt-3 break-words text-xs leading-relaxed text-gray-500">{slide.description}</p>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToCart();
                  }}
                  className="z-10 mt-6 flex h-10 w-full sm:w-44 cursor-pointer items-center justify-center gap-2 rounded-xl bg-orange-500 text-xs font-bold uppercase text-white shadow-md shadow-orange-500/10 transition hover:bg-orange-600"
                >
                  <ShoppingCart size={14} /> Add To Cart
                </button>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Desktop Controls */}
          <div className="absolute bottom-6 right-6 hidden lg:flex items-center gap-2">
            <button onClick={prev} className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white hover:border-orange-500 hover:text-orange-500"><ChevronLeft size={16} /></button>
            <button onClick={next} className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white hover:border-orange-500 hover:text-orange-500"><ChevronRight size={16} /></button>
          </div>
        </div>
      </div>

      {/* Pagination Dots */}
      <div className="mt-6 flex items-center justify-center gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`cursor-pointer rounded-full transition-all ${i === current ? "h-2.5 w-8 bg-orange-500" : "h-2.5 w-2.5 bg-gray-200"}`}
          />
        ))}
      </div>
    </section>
  );
}