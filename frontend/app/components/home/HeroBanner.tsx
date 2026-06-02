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
  }, []); // stable: functional updates don't need current in deps

  const currentSlide = slide[current];

  return (
    <section className="w-full lg:py-5">

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

      {/* ✅ Same wrapper as DealOfTheDaySection */}
      <div className="lg:mx-auto lg:max-w-7xl lg:px-8">

        <div
          className="relative overflow-hidden lg:rounded-[32px] transition-colors duration-700"
          style={{ backgroundColor: currentSlide.bg }}
        >
          {/* Background Glow */}
          <div className="absolute -left-20 top-0 h-72 w-72 rounded-full bg-orange-500/10 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />

          {/* Fixed height flex row */}
          <div className="relative z-10 flex flex-col lg:flex-row lg:h-[480px]">

            {/* Left Content — ANIMATED */}
            <div
              key={`content-${animKey}`}
              className={`flex w-full flex-col justify-center px-6 py-8 sm:px-10 lg:w-1/2 lg:px-20 lg:py-10
              transition-all duration-500 ease-out
              ${
                visible
                  ? "translate-y-0 opacity-100"
                  : "-translate-y-8 opacity-0"
              }`}
            >
              {/* Badge */}
              <div className="mb-5 inline-flex w-fit rounded-md bg-orange-500 px-4 py-1.5">
                <span className="text-[10px] font-bold uppercase tracking-[2px] text-white">
                  {currentSlide.badge}
                </span>
              </div>

              {/* Title */}
              <h1 className="max-w-xl whitespace-pre-line text-2xl font-black leading-tight text-white sm:text-3xl lg:text-5xl">
                {currentSlide.title}
              </h1>

              {/* Subtitle */}
              <p className="mt-3 max-w-lg text-xs leading-6 text-gray-300 sm:text-sm lg:text-base lg:mt-5">
                {currentSlide.subtitle}
              </p>

              {/* Feature Tags */}
              <div className="mt-6 flex flex-wrap gap-3">
                <div className="rounded-full border border-white/15 px-4 py-2 text-xs font-medium text-gray-200">
                  Premium Quality
                </div>
                <div className="rounded-full border border-white/15 px-4 py-2 text-xs font-medium text-gray-200">
                  Fast Delivery
                </div>
                <div className="rounded-full border border-white/15 px-4 py-2 text-xs font-medium text-gray-200">
                  Best Price
                </div>
              </div>

              {/* Price */}
              <div className="mt-5 flex items-end gap-2 lg:mt-8 lg:gap-3">
                <span className="text-sm font-medium text-gray-300 lg:text-lg">From</span>
                <span
                  key={`price-${animKey}`}
                  className="price-shake text-2xl font-black text-orange-400 lg:text-4xl"
                >
                  {currentSlide.price}
                </span>
                <span className="mb-0.5 text-sm text-gray-400 line-through lg:mb-1 lg:text-lg">$599</span>
              </div>

              {/* Buttons */}
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/shop"
                  className="flex h-12 items-center justify-center gap-2 rounded-xl bg-orange-500 px-7 text-[12px] font-bold uppercase tracking-wide text-white transition-all duration-300 hover:bg-orange-600"
                >
                  Shop Now
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>

            {/* Right Image — ANIMATED, visible on all screens */}
            <div
              key={`image-${animKey}`}
              className={`relative flex flex-1 items-center justify-center py-6 lg:py-0
              transition-all duration-500 ease-out
              ${
                visible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-8 opacity-0"
              }`}
            >
              {/* Glow */}
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
            </div>

          </div>

          {/* Extra Info — FIXED, never animates, centered */}
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

          {/* Bottom Dots */}
          <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2">
            {slide.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`rounded-full transition-all duration-300 ${
                  i === current
                    ? "h-2.5 w-7 bg-orange-500"
                    : "h-2.5 w-2.5 bg-white/50 hover:bg-white"
                }`}
              />
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}