"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { productService } from "@/app/services/product.service";
import { ApiProduct } from "@/app/types/types";

function MobileHeroBannerSkeleton() {
  return (
    <div className="block lg:hidden px-4 mt-3 pb-2 animate-pulse">
      <div className="relative w-full h-[200px] rounded-2xl bg-gray-50 border border-gray-100/50 overflow-hidden" />
    </div>
  );
}

// ─── Mobile Hero Banner Component ───────────────────────────────────────────────
export default function MobileHeroBanner() {
  const [bannerProducts, setBannerProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const touchStartX = useRef(0);
  const isDragging = useRef(false);

  useEffect(() => {
    setLoading(true);
    productService.getBannerProducts().then((res) => {
      const data: ApiProduct[] = res?.data || res;
      if (Array.isArray(data)) {
        // Only include products that have a mobile ad banner uploaded
        const withMobileBanner = data.filter(
          (p) => p.mobile_ad_banner && p.mobile_ad_banner !== "null" && p.mobile_ad_banner !== "undefined"
        );
        setBannerProducts(withMobileBanner);
      }
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, []);

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

  const product = bannerProducts[current];
  const rawSrc = product.mobile_ad_banner;
  
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
          <div className="relative w-full rounded-2xl overflow-hidden shadow-xs border border-gray-150/40 bg-gray-50/50">
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
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
                  i === current ? "w-5 bg-orange-500" : "w-1.5 bg-gray-300"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}