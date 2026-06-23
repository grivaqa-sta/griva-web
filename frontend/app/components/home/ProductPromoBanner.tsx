"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import productBannerService from "@/app/services/productBanner.service";
import { ProductBanner } from "@/app/types/types";

const ProductPromoBanner = () => {
  const [banner, setBanner] = useState<ProductBanner | null>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const [showImage, setShowImage] = useState(false);

  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const banners = await productBannerService.getActiveBanners();
        if (banners && banners.length > 0) {
          setBanner(banners[0]);
        }
      } catch (err) {
        console.error("Failed to fetch promo banner", err);
      }
    };
    fetchBanner();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setShowImage(true);
      },
      { threshold: 0.25 }
    );
    if (imageRef.current) observer.observe(imageRef.current);
    return () => observer.disconnect();
  }, [banner]);

  if (!banner) return null;

  const product = banner.product;
  const productHref = product ? `/product/${product.id}` : "/shop";

  return (
    <section className="w-full py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-[8px] overflow-hidden">
          <div
            className="relative overflow-hidden rounded-[8px] bg-[#f0e5bc] px-5 py-8 min-h-[500px] lg:min-h-[220px] sm:px-10 lg:px-14"
          >
            {/* DESKTOP CONTENT */}
            <div className="hidden lg:block relative z-20 max-w-[520px]">
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

            {/* MOBILE CONTENT */}
            <div className="lg:hidden relative z-20 mt-[190px] text-left">
              <span
                className="inline-block text-[10px] font-bold uppercase tracking-[4px]"
                style={{ color: "#FF6A00" }}
              >
                {banner.subtitle || "Special Offer"}
              </span>

              <h2 className="mt-3 text-[34px] leading-[1.05] font-black text-black whitespace-pre-line">
                {banner.title}
              </h2>

              {product?.price && (
                <p className="mt-4 text-[13px] leading-7 text-gray-600">
                  Starting from{" "}
                  <span className="font-bold text-orange-500">
                    QAR {Number(product.price).toFixed(2)}
                  </span>
                </p>
              )}

              <div className="mt-6 w-full">
                <Link
                  href={productHref}
                  className="flex w-full h-[54px] items-center justify-center rounded-[12px] text-[12px] font-bold uppercase tracking-wide text-white transition-all duration-300"
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

            {/* PRODUCT IMAGE — inside the box */}
            {product?.main_image_url && (
              <div
                ref={imageRef}
                className="
                  absolute z-10
                  left-1/2 -translate-x-[40%] top-4 bottom-0
                  lg:left-auto lg:translate-x-0 lg:right-0 lg:top-0 lg:bottom-0
                  flex items-center justify-end
                "
              >
                {/* Shadow */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[180px] h-[20px] lg:w-[260px] lg:h-[35px] rounded-full bg-black/20 blur-[18px]" />

                <Image
                  src={
                    product.main_image_url.startsWith('http') || product.main_image_url.startsWith('/')
                      ? product.main_image_url
                      : `http://localhost:8080${product.main_image_url}`
                  }
                  alt={banner.title}
                  width={450}
                  height={350}
                  priority
                  className={`
                    relative z-10
                    w-[220px] sm:w-[340px] lg:w-[420px]
                    h-full max-h-[200px] lg:max-h-[260px]
                    object-contain object-bottom
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