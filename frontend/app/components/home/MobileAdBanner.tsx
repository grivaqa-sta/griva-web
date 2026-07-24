"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useMemo } from "react";
import { useBannerProducts } from "@/app/hooks/useHomeData";

function MobileHeroBannerSkeleton() {
  return (
    <div className="block lg:hidden px-4 mt-3 pb-2 animate-pulse">
      <div className="relative w-full h-[180px] rounded-2xl bg-gray-100 overflow-hidden" />
    </div>
  );
}

interface MobileHeroBannerProps {
  bannerProducts?: any[];
  loading?: boolean;
}

// ─── Mobile Hero Banner Component ───────────────────────────────────────────────
export default function MobileHeroBanner({ bannerProducts: propProducts, loading: propLoading }: MobileHeroBannerProps = {}) {
  const hookResult = useBannerProducts();
  const loading = propLoading !== undefined ? propLoading : hookResult.loading;
  const rawProducts = propProducts !== undefined ? propProducts : hookResult.bannerProducts;
  const [current, setCurrent] = useState(0);
  const touchStartX = useRef(0);
  const isDragging = useRef(false);

  const bannerProducts = useMemo(() => {
    return (rawProducts || []).filter(
      (p) => p.mobile_ad_banner && p.mobile_ad_banner !== "null" && p.mobile_ad_banner !== "undefined"
    );
  }, [rawProducts]);

  useEffect(() => {
    if (bannerProducts.length === 0) return;
    const t = setInterval(
      () => setCurrent((p) => (p + 1) % bannerProducts.length),
      4000
    );
    return () => clearInterval(t);
  }, [bannerProducts.length]);

  // Preload all banner images in background to prevent flashing/refresh feel
  const bannerUrlsKey = useMemo(() => {
    return bannerProducts.map((p) => p.mobile_ad_banner).join(",");
  }, [bannerProducts]);

  useEffect(() => {
    if (bannerProducts.length === 0) return;
    bannerProducts.forEach((product) => {
      const src = product.mobile_ad_banner;
      if (src) {
        const fullSrc = src.startsWith("http") || src.startsWith("/")
          ? src
          : `http://localhost:8080${src}`;
        const img = new window.Image();
        img.src = fullSrc;
      }
    });
  }, [bannerUrlsKey]);

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

  const activeIndex = current % bannerProducts.length;

  // We use the first image as a hidden spacer in normal document flow
  // to dynamically establish the correct aspect ratio/height for the container.
  const firstProduct = bannerProducts[0];
  const firstRawSrc = firstProduct?.mobile_ad_banner;
  const firstImageSrc = firstRawSrc.startsWith("http") || firstRawSrc.startsWith("/")
    ? firstRawSrc
    : `http://localhost:8080${firstRawSrc}`;

  return (
    <div className="block lg:hidden px-4 mt-3 pb-2">
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="relative w-full rounded-2xl overflow-hidden shadow-xs bg-white"
      >
        {/* Invisible Spacer Image to establish natural aspect ratio/height */}
        <img
          src={firstImageSrc}
          alt=""
          className="w-full h-auto opacity-0 pointer-events-none block"
        />

        {/* Stacked Images - Toggled via CSS opacity for buttery smooth transition */}
        {bannerProducts.map((product, idx) => {
          const rawSrc = product.mobile_ad_banner;
          if (!rawSrc) return null;
          
          const imageSrc = rawSrc.startsWith("http") || rawSrc.startsWith("/")
            ? rawSrc
            : `http://localhost:8080${rawSrc}`;
            
          const href = product.href || `/product/${product.slug}`;
          const active = idx === activeIndex;

          return (
            <Link
              key={idx}
              href={href}
              className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out ${
                active ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
              }`}
            >
              <img
                src={imageSrc}
                alt={product.title}
                className="w-full h-full object-cover block"
              />
            </Link>
          );
        })}

      </div>

      {/* Dot Slider */}
      {bannerProducts.length > 1 && (
        <div className="flex justify-center items-center gap-1.5 mt-3">
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
  );
}