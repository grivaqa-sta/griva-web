"use client";

import { slide } from "@/app/data/data";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, ShieldCheck, Truck, Star } from "lucide-react";

export default function HeroBanner() {
  const [current, setCurrent] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const [visible, setVisible] = useState(true);

  const busyRef = useRef(false);

  const goTo = (index: number) => {
    if (busyRef.current || index === current) return;
    busyRef.current = true;
    setVisible(false);

    setTimeout(() => {
      setCurrent(index);
      setAnimKey((k) => k + 1);
      setVisible(true);
      busyRef.current = false;
    }, 300);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      if (busyRef.current) return;
      busyRef.current = true;
      setVisible(false);
      setTimeout(() => {
        setCurrent((prev) => (prev + 1) % slide.length);
        setAnimKey((k) => k + 1);
        setVisible(true);
        busyRef.current = false;
      }, 300);
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  const currentSlide = slide[current];

  return (
    <section className="w-full lg:py-1">
      <style>{`
        @keyframes priceShake {
          0%   { transform: scale(1) rotate(0deg); }
          15%  { transform: scale(1.15) rotate(-3deg); }
          30%  { transform: scale(1.2) rotate(3deg); }
          45%  { transform: scale(1.15) rotate(-2deg); }
          60%  { transform: scale(1.1) rotate(2deg); }
          75%  { transform: scale(1.05) rotate(-1deg); }
          100% { transform: scale(1) rotate(0deg); }
        }
        .price-shake {
          display: inline-block;
          animation: priceShake 0.6s ease-out forwards;
        }
      `}</style>

      <div className="lg:mx-auto lg:max-w-7xl lg:px-8">
        <div
          className="relative overflow-hidden lg:rounded-[10px] transition-colors duration-700"
          style={{ backgroundColor: currentSlide.bg }}
        >
          {/* Background Glows */}
          <div className="absolute -left-20 top-0 h-72 w-72 rounded-full bg-orange-500/10 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />

          {/* Main Container: Stacked on mobile, side-by-side on desktop */}
          <div className="relative z-10 flex flex-col lg:flex-row lg:h-[480px]">
            
            {/* 1. BADGE - Always first on mobile, top of text on desktop */}
            <div 
               key={`badge-${animKey}`}
               className={`w-full flex justify-center lg:justify-start px-6 pt-8 lg:absolute lg:left-20 lg:top-10 lg:p-0 lg:w-auto z-20 transition-all duration-500 ${visible ? "opacity-100" : "opacity-0"}`}
            >
              <div className="inline-flex rounded-md bg-orange-500 px-4 py-1.5">
                <span className="text-[10px] font-bold uppercase tracking-[2px] text-white">
                  {currentSlide.badge}
                </span>
              </div>
            </div>

            {/* 2. IMAGE - Second on mobile, Right side on desktop */}
            <div
              key={`image-${animKey}`}
              className={`order-2 lg:order-2 relative flex flex-1 items-center justify-center py-4 lg:py-0 lg:w-1/2
              transition-all duration-500 ease-out
              ${visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
            >
              <div className="absolute h-40 w-40 lg:h-72 lg:w-72 rounded-full bg-orange-500/20 blur-3xl" />
              <div className="relative h-[200px] w-[200px] sm:h-[280px] sm:w-[280px] lg:h-[380px] lg:w-[380px] flex-shrink-0">
                <Image
                  src={currentSlide.image}
                  alt={currentSlide.title}
                  fill
                  sizes="(max-width: 640px) 200px, (max-width: 1024px) 280px, 380px"
                  priority
                  className="object-contain drop-shadow-2xl"
                />
              </div>
            </div>

            {/* 3. CONTENT - Third on mobile (Title, Sub, Price, Button), Left side on desktop */}
            <div
              key={`content-${animKey}`}
              className={`order-3 lg:order-1 flex w-full flex-col items-center lg:items-start justify-center px-6 pb-10 pt-2 sm:px-10 lg:w-1/2 lg:px-20 lg:py-10 text-center lg:text-left
              transition-all duration-500 ease-out
              ${visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
            >
              {/* Product Name (Title) */}
              <h1 className="max-w-xl text-2xl font-black text-white sm:text-3xl lg:text-5xl leading-tight">
                {currentSlide.title}
              </h1>

              {/* Subtitle */}
              <p className="mt-2 max-w-lg text-xs text-gray-300 sm:text-sm lg:text-base uppercase tracking-widest font-medium">
                {currentSlide.subtitle}
              </p>

              {/* Price */}
              <div className="mt-4 flex items-end gap-2 lg:gap-3 justify-center lg:justify-start">
                <span className="text-sm font-medium text-gray-300 lg:text-lg">From</span>
                <span
                  key={`price-${animKey}`}
                  className="price-shake text-3xl font-black text-orange-400 lg:text-5xl"
                >
                  {currentSlide.price}
                </span>
                <span className="mb-0.5 text-sm text-gray-400 line-through lg:mb-1 lg:text-xl">$599</span>
              </div>

              {/* Button - Full width on mobile */}
              <div className="mt-8 w-full lg:w-fit">
                <Link
                  href="/shop"
                  className="flex h-14 w-full lg:w-fit items-center justify-center gap-2 rounded-xl bg-orange-500 px-10 text-[14px] font-bold uppercase tracking-wide text-white transition-all duration-300 hover:bg-orange-600"
                >
                  Shop Now
                  <ArrowRight size={18} />
                </Link>
              </div>
            </div>

          </div>

          {/* Extra Info — Hidden on mobile, Grid on desktop */}
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
        </div>
      </div>
    </section>
  );
}   