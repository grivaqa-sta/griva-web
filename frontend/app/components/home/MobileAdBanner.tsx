"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { productService } from "@/app/services/product.service";
import { ApiProduct } from "@/app/types/types";

// ─── Mobile Banner Component ───────────────────────────────────────────────
function MobileAdBanner() {
  const [bannerProducts, setBannerProducts] = useState<ApiProduct[]>([]);
  const [current, setCurrent] = useState(0);
  const touchStartX = useRef(0);
  const isDragging = useRef(false);

  useEffect(() => {
    productService.getBannerProducts().then((res) => {
      const data: ApiProduct[] = res?.data || res;
      if (Array.isArray(data)) {
        // Only include products that have at least one image to show
        const withImages = data.filter(
          (p) => p.mobile_ad_banner || p.main_image_url
        );
        setBannerProducts(withImages);
      }
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

  if (bannerProducts.length === 0) return null;

  const product = bannerProducts[current];
  // Prefer the dedicated mobile image; fall back to the main product image
  const rawSrc = product.mobile_ad_banner || product.main_image_url;
  const imageSrc =
    rawSrc.startsWith("http") || rawSrc.startsWith("/")
      ? rawSrc
      : `http://localhost:8080${rawSrc}`;
  const href = product.href || `/product/${product.id}`;

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Rectangle Image Banner */}
      <Link href={href}>
        <div className="relative w-full h-[200px] rounded-2xl overflow-hidden">
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
                src={imageSrc}
                alt={product.title}
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