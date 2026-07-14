"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useBannerProducts } from "@/app/hooks/useHomeData";

function MobileHeroBannerSkeleton() {
  return (
    <div className="block lg:hidden px-4 mt-3 pb-2 animate-pulse">
      <div className="relative w-full h-[180px] rounded-2xl bg-gray-100 overflow-hidden" />
    </div>
  );
}

// ─── Mobile Hero Banner Component ───────────────────────────────────────────────
export default function MobileHeroBanner() {
  const { bannerProducts: rawProducts, loading } = useBannerProducts();
  const [current, setCurrent] = useState(0);
  const touchStartX = useRef(0);
  const isDragging = useRef(false);

  const bannerProducts = (rawProducts || []).filter(
    (p) => p.mobile_ad_banner && p.mobile_ad_banner !== "null" && p.mobile_ad_banner !== "undefined"
  );

  useEffect(() => {
    if (bannerProducts.length === 0) return;
    const t = setInterval(
      () => setCurrent((p) => (p + 1) % bannerProducts.length),
      4000
    );
    return () => clearInterval(t);
  }, [bannerProducts.length]);

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
    if (bannerProducts.length === 0) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 40) {
      setCurrent(
        (p) =>
          (p + (dx < 0 ? 1 : -1) + bannerProducts.length) %
          bannerProducts.length
      );
    }
  };

  if (loading) {
    return <MobileHeroBannerSkeleton />;
  }

  if (bannerProducts.length === 0) return null;

  // Protect array bounds
  const activeIndex = current % bannerProducts.length;
  const product = bannerProducts[activeIndex];
  const rawSrc = product?.mobile_ad_banner;
  
  if (!rawSrc) return null;

  const imageSrc =
    rawSrc.startsWith("http") || rawSrc.startsWith("/")
      ? rawSrc
      : `http://localhost:8080${rawSrc}`;
  const href = product.href || `/product/${product.slug}`;

  return (
    <div className="block lg:hidden px-4 mt-3 pb-2">
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Rectangle Image Banner */}
        <Link href={href}>
          <div className="relative w-full rounded-2xl overflow-hidden shadow-xs bg-white">
            <AnimatePresence mode="popLayout">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="w-full"
              >
                <img
                  src={imageSrc}
                  alt={product.title}
                  className="w-full h-auto object-contain block"
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </Link>

        {/* Dot Slider */}
        {bannerProducts.length > 1 && (
          <div className="flex justify-center items-center gap-1.5 mt-2.5">
            {bannerProducts.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === activeIndex ? "w-5 bg-orange-500" : "w-1.5 bg-gray-300"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}