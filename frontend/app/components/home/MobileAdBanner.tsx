"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAdminSettings } from "@/app/context/AdminContext";

// ─── Mobile Banner Component ───────────────────────────────────────────────
function MobileAdBanner() {
  const { cmsMobileBanners: mobilebanners } = useAdminSettings();
  const [current, setCurrent] = useState(0);
  const touchStartX = useRef(0);
  const isDragging = useRef(false);

  useEffect(() => {
    const t = setInterval(
      () => setCurrent((p) => (p + 1) % mobilebanners.length),
      4000
    );
    return () => clearInterval(t);
  }, []);

  const banner = mobilebanners[current];

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    isDragging.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (Math.abs(e.touches[0].clientX - touchStartX.current) > 10) {
      isDragging.current = true;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 40) {
      setCurrent(
        (p) =>
          (p + (dx < 0 ? 1 : -1) + mobilebanners.length) %
          mobilebanners.length
      );
    }
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Rectangle Image Banner */}
      <Link href={banner.href}>
        <div className="relative w-full h-[160px] rounded-2xl overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0"
            >
              <Image
                src={banner.src}
                alt={banner.alt}
                fill
                sizes="(max-width: 1024px) 100vw"
                priority
                className="object-cover"
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </Link>

      {/* Dot Slider */}
      <div className="flex justify-center items-center gap-1.5 mt-2.5">
        {mobilebanners.map((_: any, i: number) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === current ? "w-5 bg-orange-500" : "w-1.5 bg-gray-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Mobile Section Wrapper ────────────────────────────────────────────────
export default function MobileHeroBanner() {
  return (
    <div className="block lg:hidden px-4 py-2">
      <MobileAdBanner />
    </div>
  );
}