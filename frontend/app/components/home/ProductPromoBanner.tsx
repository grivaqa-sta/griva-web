"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useActiveProductBanners } from "@/app/hooks/useHomeData";
import Rating from "../rating/Rating";
import { ShieldCheck, Truck, ArrowRight, CreditCard, Star } from "lucide-react";

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

  // Calculation for savings / discount
  const price = product?.price ? Number(product.price) : 0;
  const oldPrice = product?.old_price ? Number(product.old_price) : 0;
  const hasDiscount = oldPrice > price;
  const discountPercentage = product?.discount_percentage || (hasDiscount ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0);
  const savedAmount = hasDiscount ? (oldPrice - price).toFixed(2) : null;

  return (
    <section className="w-full py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-[20px] overflow-hidden border border-amber-200/40 shadow-[0_15px_35px_-10px_rgba(220,160,60,0.12)]">

          {/* ── MOBILE LAYOUT (< lg) ── */}
          <div className="lg:hidden rounded-[20px] bg-gradient-to-b from-[#FFFDF9] via-[#F8F1DA] to-[#ECD8AF] overflow-hidden p-6 text-left relative">
            
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF6A00]/5 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-36 h-36 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Image Area with Studio Glow */}
            {imageSrc && (
              <div ref={mobileImageRef} className="relative flex flex-col items-center justify-center pt-4 pb-6 z-15">
                {/* 3D Backdrop Glow */}
                <div className="absolute w-44 h-44 bg-gradient-to-tr from-orange-400/25 to-yellow-300/15 rounded-full blur-3xl pointer-events-none" />
                
                {/* Soft Pedestal */}
                <div className="absolute bottom-[2px] w-36 h-2 bg-black/[0.07] rounded-full blur-[2.5px]" />

                <Link href={productHref} className="relative z-10 transition-transform duration-500 hover:scale-105 active:scale-95 block">
                  <Image
                    src={imageSrc}
                    alt={banner.title}
                    width={220}
                    height={200}
                    priority
                    className={`
                      w-[180px] h-[160px] object-contain
                      rotate-[-4deg]
                      transition-all duration-1000 ease-out
                      ${showImage
                        ? "opacity-100 translate-y-0 scale-100"
                        : "opacity-0 translate-y-[20px] scale-[0.9]"
                      }
                    `}
                  />
                </Link>
              </div>
            )}

            {/* Badges & Trust Summary */}
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span className="inline-flex items-center text-[9px] font-black uppercase tracking-[2px] bg-orange-500/15 text-orange-600 px-2.5 py-0.5 rounded-full border border-orange-500/20">
                {banner.subtitle || "Deal Of The Week"}
              </span>

              {/* Real stars / arrival badge */}
              {(() => {
                const count = product?.review_count ?? 0;
                if (count === 0) {
                  return (
                    <span className="text-[9px] font-black uppercase tracking-[1.5px] bg-orange-50 text-orange-500 px-2.5 py-0.5 rounded-full border border-orange-200">
                      {product?.is_best_seller ? "Best Seller" : "New Arrival"}
                    </span>
                  );
                }
                return (
                  <div className="flex items-center gap-1 bg-white/70 backdrop-blur-sm px-2 py-0.5 rounded-full border border-amber-200/30 text-[9px] font-bold text-gray-700 shadow-sm">
                    <Star size={9} className="fill-amber-400 text-amber-400" />
                    <span>{Number(product!.rating).toFixed(1)}</span>
                    <span className="text-gray-400">({count} reviews)</span>
                  </div>
                );
              })()}
            </div>

            {/* Title */}
            <h2 className="text-2xl font-black text-gray-900 tracking-tight leading-snug">
              <Link href={productHref} className="hover:text-orange-500 transition-colors">
                {banner.title}
              </Link>
            </h2>

            {/* Pricing Details */}
            {product?.price && (
              <div className="mt-3 flex items-baseline gap-2.5 flex-wrap">
                <span className="text-xs font-semibold text-gray-500">Starting from</span>
                <span className="text-2xl font-extrabold text-gray-950">
                  <span className="text-xs font-black text-orange-500 mr-0.5">QAR</span>
                  {price.toFixed(2)}
                </span>
                {hasDiscount && (
                  <>
                    <span className="text-xs text-gray-400 line-through font-medium">QAR {oldPrice.toFixed(2)}</span>
                    <span className="text-[8px] font-extrabold text-white bg-red-500 px-2 py-0.5 rounded-md uppercase tracking-wider">
                      -{discountPercentage}% OFF
                    </span>
                  </>
                )}
              </div>
            )}

            {/* Features trust banner */}
            <div className="mt-4 py-2 px-3 bg-white/40 border border-white/60 rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 text-[9px] font-bold text-gray-700">
                <Truck size={11} className="text-orange-500 shrink-0" />
                <span>Express 1-2 Days Delivery in Qatar</span>
              </div>
              <div className="flex items-center gap-1.5 text-[9px] font-bold text-gray-700">
                <ShieldCheck size={11} className="text-orange-500 shrink-0" />
                <span>100% Genuine Certified Quality</span>
              </div>
            </div>

            {/* Button */}
            <div className="mt-5">
              <Link
                href={productHref}
                className="group flex w-full h-11 items-center justify-center gap-1.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-orange-500/10 transition-all duration-300"
                style={{ backgroundColor: "#FF6A00" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#e05a00";
                  e.currentTarget.style.boxShadow = "0 10px 20px -5px rgba(255,106,0,0.25)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#FF6A00";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                Shop Now
                <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

          {/* ── DESKTOP LAYOUT (≥ lg) ── */}
          <div className="hidden lg:block relative rounded-[20px] bg-gradient-to-r from-[#FFFDF9] via-[#FAF4DC] to-[#EEDAB0] px-16 py-9 min-h-[250px] overflow-hidden">
            
            {/* Dynamic Background Studio Glow */}
            <div className="absolute right-[80px] top-[10%] w-[360px] h-[360px] bg-gradient-to-tr from-orange-400/20 to-yellow-300/15 rounded-full blur-3xl pointer-events-none z-0" />
            <div className="absolute left-[30%] top-[-20%] w-[200px] h-[200px] bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

            {/* Left Content Area */}
            <div className="relative z-20 max-w-[580px] flex flex-col justify-center min-h-[180px]">
              
              {/* Trust Badge and Stars row */}
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center text-[9px] font-black uppercase tracking-[2.5px] bg-orange-500/15 text-orange-600 px-3 py-1 rounded-full border border-orange-500/20 shadow-sm">
                  {banner.subtitle || "Exclusive Deal"}
                </span>

                {/* Real review rating or arrival/seller badge */}
                {(() => {
                  const count = product?.review_count ?? 0;
                  if (count === 0) {
                    return (
                      <span className="text-[9px] font-black uppercase tracking-[1.5px] bg-orange-50 text-orange-500 px-2.5 py-1 rounded-full border border-orange-200 shadow-sm">
                        {product?.is_best_seller ? "Best Seller" : "New Arrival"}
                      </span>
                    );
                  }
                  return (
                    <div className="flex items-center gap-1.5 bg-white/60 backdrop-blur-sm px-2.5 py-0.5 rounded-full border border-amber-200/20 text-[10px] font-bold text-gray-700 shadow-sm">
                      <Star size={10} className="fill-amber-400 text-amber-400" />
                      <span>{Number(product!.rating).toFixed(1)} Rating</span>
                      <span className="text-gray-400 font-medium">({count} reviews)</span>
                    </div>
                  );
                })()}
              </div>

              {/* Main Headline */}
              <h2 className="mt-3 text-[42px] leading-[1.08] font-black text-gray-900 tracking-tight whitespace-pre-line">
                <Link href={productHref} className="hover:text-orange-500 transition-colors">
                  {banner.title}
                </Link>
              </h2>

              {/* Price & Savings Display */}
              {product?.price && (
                <div className="mt-4 flex items-center gap-3.5 flex-wrap">
                  <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Starting from</span>
                  <span className="text-3xl font-extrabold text-gray-950 tracking-tight leading-none">
                    <span className="text-sm font-black text-orange-500 mr-0.5">QAR</span>
                    {price.toFixed(2)}
                  </span>
                  
                  {hasDiscount && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-400 line-through font-semibold">QAR {oldPrice.toFixed(2)}</span>
                      <span className="text-[10px] font-extrabold text-white bg-red-500 px-2 py-0.5 rounded-md uppercase tracking-wider shadow-sm">
                        Save QAR {savedAmount} ({discountPercentage}% OFF)
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Trust Points */}
              <div className="mt-5 flex items-center gap-5 border-t border-amber-250/20 pt-3">
                <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-700">
                  <Truck size={13} className="text-orange-500 shrink-0" />
                  <span>Express Delivery in Qatar</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-700">
                  <ShieldCheck size={13} className="text-orange-500 shrink-0" />
                  <span>100% Genuine product</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-700">
                  <CreditCard size={13} className="text-orange-500 shrink-0" />
                  <span>Cash on Delivery available</span>
                </div>
              </div>

              {/* CTA Button */}
              <div className="mt-6">
                <Link
                  href={productHref}
                  className="group inline-flex h-11 items-center justify-center gap-2 rounded-xl px-7 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-orange-500/15 transition-all duration-300"
                  style={{ backgroundColor: "#FF6A00" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#e05a00";
                    e.currentTarget.style.boxShadow = "0 15px 25px -5px rgba(255,106,0,0.30)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#FF6A00";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  Shop Now
                  <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                </Link>
              </div>

            </div>

            {/* Right Product Image & Pedestal Stand */}
            {imageSrc && (
              <div
                ref={desktopImageRef}
                className="absolute z-10 right-14 top-0 bottom-0 flex items-center justify-end"
              >
                <div className="relative flex flex-col items-center">
                  
                  {/* Soft reflective pedestal under the product */}
                  <div className="absolute bottom-[25px] w-[260px] h-[10px] bg-black/[0.07] rounded-full blur-[2.5px]" />

                  <Link href={productHref} className="relative z-10 block transition-transform duration-500 hover:scale-105 hover:rotate-[-2deg]">
                    <Image
                      src={imageSrc}
                      alt={banner.title}
                      width={380}
                      height={300}
                      priority
                      className={`
                        relative z-10 w-[300px] max-h-[220px] object-contain object-bottom
                        rotate-[-4deg]
                        transition-all duration-1000 ease-out
                        ${showImage
                          ? "opacity-100 translate-y-0 scale-100"
                          : "opacity-0 translate-y-[35px] scale-[0.9]"
                        }
                      `}
                    />
                  </Link>
                </div>
              </div>
            )}

          </div>

        </div>
      </div>
    </section>
  );
};

export default ProductPromoBanner;