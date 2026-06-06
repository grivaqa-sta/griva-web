"use client";

import { slide } from "@/app/data/data";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, ShieldCheck, Truck, Star } from "lucide-react";
import { motion, AnimatePresence, Variants } from "framer-motion";

export default function HeroBanner() {
  const [current, setCurrent] = useState(0);
  const busyRef = useRef(false);

  useEffect(() => {
    const timer = setInterval(() => {
      if (busyRef.current) return;
      setCurrent((prev) => (prev + 1) % slide.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const currentSlide = slide[current];

  // --- Animation Variants with fixed Types ---
  const contentVariants: Variants = {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  const imageVariants: Variants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
  };

  const priceShake: Variants = {
    shake: {
      scale: [1, 1.15, 1.2, 1.15, 1.1, 1.05, 1],
      rotate: [0, -3, 3, -2, 2, -1, 0],
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <section className="w-full lg:py-1">
      <div className="lg:mx-auto lg:max-w-7xl lg:px-8 px-4">
        <motion.div
          animate={{ backgroundColor: currentSlide.bg }}
          transition={{ duration: 0.7 }}
          className="relative overflow-hidden lg:rounded-[10px] rounded-[10px]"
        >
          {/* Background Glows - Kept exactly as original */}
          <div className="absolute -left-20 top-0 h-72 w-72 rounded-full bg-orange-500/10 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:h-[400px]">
            <AnimatePresence mode="wait">
              <div key={current} className="contents">
                
                {/* 1. BADGE - Top Right Mobile, Original position Desktop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute right-6 top-8 lg:left-20 lg:top-10 lg:right-auto z-20"
                >
                  <div className="inline-flex rounded-md bg-orange-500 px-4 py-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-[2px] text-white">
                      {currentSlide.badge}
                    </span>
                  </div>
                </motion.div>

                {/* 2. IMAGE - Above title on Mobile (order-1), Right side on Desktop (order-2) */}
                <motion.div
                  variants={imageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.5 }}
                  className="order-1 lg:order-2 relative flex flex-1 items-center justify-center pt-20 pb-6 lg:py-0"
                >
                  <div className="absolute h-52 w-52 lg:h-72 lg:w-72 rounded-full bg-orange-500/20 blur-3xl" />
                  <div className="relative h-[220px] w-[220px] sm:h-[280px] sm:w-[280px] lg:h-[380px] lg:w-[380px] flex-shrink-0">
                    <Image
                      src={currentSlide.image}
                      alt={currentSlide.title}
                      fill
                      sizes="(max-width: 640px) 220px, (max-width: 1024px) 280px, 380px"
                      priority
                      className="object-contain drop-shadow-2xl"
                    />
                  </div>
                </motion.div>

                {/* 3. CONTENT - Below image on Mobile (order-2), Left side on Desktop (order-1) */}
                <motion.div
                  variants={contentVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.5 }}
                  className="order-2 lg:order-1 flex w-full flex-col items-center lg:items-start justify-center px-6 py-8 sm:px-10 lg:w-1/2 lg:px-20 lg:py-10 text-center lg:text-left"
                >
                  {/* Product Name (Bold & Centered on Mobile) */}
                  <h1 className="max-w-xl text-2xl font-black text-white sm:text-3xl lg:text-4xl">
                    {currentSlide.title}
                  </h1>

                  {/* Subtitle */}
                  <p className="max-w-lg text-xs text-gray-300 sm:text-sm lg:text-base mt-2 lg:mt-0">
                    {currentSlide.subtitle}
                  </p>

                  {/* Price */}
                  <div className="mt-4 flex items-end gap-2 lg:gap-3 justify-center lg:justify-start">
                    <span className="text-sm font-medium text-gray-300 lg:text-lg">From</span>
                    <motion.span
                      variants={priceShake}
                      animate="shake"
                      className="inline-block text-2xl font-black text-orange-400 lg:text-4xl"
                    >
                      {currentSlide.price}
                    </motion.span>
                    <span className="mb-0.5 text-sm text-gray-400 line-through lg:mb-1 lg:text-lg">$599</span>
                  </div>

                  {/* Button - Full width mobile */}
                  <div className="mt-8 w-full lg:w-fit">
                    <Link
                      href="/shop"
                      className="flex h-12 w-full lg:w-fit items-center justify-center gap-2 rounded-xl bg-orange-500 px-7 text-[12px] font-bold uppercase tracking-wide text-white transition-all duration-300 hover:bg-orange-600"
                    >
                      Shop Now
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </motion.div>

              </div>
            </AnimatePresence>
          </div>

          {/* Extra Info — Hidden on Mobile, Fixed on Desktop (Original Design) */}
          <div className="relative z-10 hidden lg:grid grid-cols-3 place-items-center gap-5 border-t border-white/10 px-6 pb-8 pt-6 sm:px-10 lg:px-20">
            <div className="flex items-center gap-3">
              <Truck className="text-orange-400" size={20} />
              <div>
                <h4 className="text-sm font-bold text-white">Free Shipping</h4>
                <p className="text-xs text-gray-400">On all orders</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ShieldCheck className="text-orange-400" size={20} />
              <div>
                <h4 className="text-sm font-bold text-white">Secure Payment</h4>
                <p className="text-xs text-gray-400">100% protected</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Star className="text-orange-400" size={20} />
              <div>
                <h4 className="text-sm font-bold text-white">Top Rating</h4>
                <p className="text-xs text-gray-400">Trusted quality</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}