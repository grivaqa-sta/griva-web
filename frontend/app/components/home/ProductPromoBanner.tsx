"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useActiveProductBanners } from "@/app/hooks/useHomeData";

const ProductPromoBanner = () => {
  const { banners } = useActiveProductBanners();
  const banner = banners[0] ?? null;
  const mobileImageRef = useRef<HTMLDivElement>(null);
  const desktopImageRef = useRef<HTMLDivElement>(null);
  const [showImage, setShowImage] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setShowImage(true);
      },
      { threshold: 0.1 }
    );

    if (mobileImageRef.current) observer.observe(mobileImageRef.current);
    if (desktopImageRef.current) observer.observe(desktopImageRef.current);

    return () => observer.disconnect();
  }, [banner]);

  if (!banner) return null;

  const product = banner.product;
  const productHref = product ? `/product/${product.id}` : "/shop";

  const imageSrc = product?.main_image_url
    ? product.main_image_url.startsWith("http") || product.main_image_url.startsWith("/")
      ? product.main_image_url
      : `http://localhost:8080${product.main_image_url}`
    : null;

  return (
    <section className="w-full py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-[8px] overflow-hidden">

          {/* ── MOBILE LAYOUT (< lg) ── */}
          <div className="lg:hidden rounded-[8px] bg-[#f0e5bc] overflow-hidden">

            {/* Image on top */}
            {imageSrc && (
              <div
                ref={mobileImageRef}
                className="flex items-center justify-center pt-8 pb-2"
              >
                <Image
                  src={imageSrc}
                  alt={banner.title}
                  width={260}
                  height={220}
                  priority
                  className={`
                    w-[200px] h-[180px] object-contain
                    rotate-[-8deg]
                    transition-all duration-1000 ease-out
                    ${showImage
                      ? "opacity-100 translate-y-0 scale-100"
                      : "opacity-0 translate-y-[40px] scale-[0.85]"
                    }
                  `}
                />
              </div>
            )}

            {/* Text + CTA */}
            <div className="px-6 pb-8 text-left">
              <span
                className="inline-block text-[10px] font-bold uppercase tracking-[4px]"
                style={{ color: "#FF6A00" }}
              >
                {banner.subtitle || "Special Offer"}
              </span>

              <h2 className="mt-2 text-[30px] leading-[1.1] font-black text-black whitespace-pre-line">
                {banner.title}
              </h2>

              {product?.price && (
                <p className="mt-3 text-[13px] leading-6 text-gray-600">
                  Starting from{" "}
                  <span className="font-bold text-orange-500">
                    QAR {Number(product.price).toFixed(2)}
                  </span>
                </p>
              )}

              <div className="mt-5 w-full">
                <Link
                  href={productHref}
                  className="flex w-full h-[52px] items-center justify-center rounded-[12px] text-[12px] font-bold uppercase tracking-wide text-white transition-all duration-300"
                  style={{ backgroundColor: "#FF6A00" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#e05a00";
                    e.currentTarget.style.boxShadow = "0 20px 25px -5px rgba(255,106,0,0.30)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#FF6A00";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  Shop Now
                </Link>
              </div>
            </div>
          </div>

          {/* ── DESKTOP LAYOUT (≥ lg) ── */}
          <div className="hidden lg:block relative rounded-[8px] bg-[#f0e5bc] px-14 py-8 min-h-[220px] overflow-hidden">

            {/* Left text */}
            <div className="relative z-20 max-w-[520px]">
              <span
                className="inline-block text-[11px] font-bold uppercase tracking-[4px]"
                style={{ color: "#FF6A00" }}
              >
                {banner.subtitle || "Special Offer"}
              </span>

              <h2 className="mt-3 text-5xl leading-[1.05] font-black text-black whitespace-pre-line">
                {banner.title}
              </h2>

              {product?.price && (
                <p className="mt-4 max-w-md text-base leading-7 text-gray-600">
                  Starting from{" "}
                  <span className="font-bold text-orange-500">
                    QAR {Number(product.price).toFixed(2)}
                  </span>
                </p>
              )}

              <div className="mt-8">
                <Link
                  href={productHref}
                  className="inline-flex h-12 items-center justify-center rounded-xl px-8 text-[12px] font-bold uppercase tracking-wide text-white transition-all duration-300"
                  style={{ backgroundColor: "#FF6A00" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#e05a00";
                    e.currentTarget.style.boxShadow = "0 20px 25px -5px rgba(255,106,0,0.30)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#FF6A00";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  Shop Now
                </Link>
              </div>
            </div>

            {/* Right image */}
            {imageSrc && (
              <div
                ref={desktopImageRef}
                className="absolute z-10 right-0 top-0 bottom-0 flex items-center justify-end"
              >
                <Image
                  src={imageSrc}
                  alt={banner.title}
                  width={450}
                  height={350}
                  priority
                  className={`
                    relative z-10 w-[420px] max-h-[260px] object-contain object-bottom
                    rotate-[-8deg]
                    transition-all duration-1000 ease-out
                    ${showImage
                      ? "opacity-100 translate-y-0 scale-100"
                      : "opacity-0 translate-y-[60px] scale-[0.8]"
                    }
                  `}
                />
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
};

export default ProductPromoBanner;