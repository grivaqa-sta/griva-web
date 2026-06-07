"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useAdminSettings } from "@/app/context/AdminContext";

const ProductPromoBanner = () => {
  const { cmsProductPromo } = useAdminSettings();
  // ✅ ADDED: animation state + ref
  const imageRef = useRef<HTMLDivElement>(null);
  const [showImage, setShowImage] = useState(false);

  // ✅ ADDED: scroll reveal animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShowImage(true);
        }
      },
      {
        threshold: 0.25,
      }
    );

    if (imageRef.current) {
      observer.observe(imageRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section className="w-full py-10 overflow-visible">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-visible rounded-[8px]">
          <div
            className="relative overflow-visible rounded-[8px] bg-[#f0e5bc] px-5 py-8 min-h-[500px] lg:min-h-[220px] sm:px-10 lg:px-14">
            {/* DESKTOP CONTENT */}
            <div className="hidden lg:block relative z-20 max-w-[520px]">
              <span className="inline-block text-[11px] font-bold uppercase tracking-[4px] text-orange-500">
                {cmsProductPromo.tagline}
              </span>

              <h2 className="mt-3 text-5xl leading-[1.05] font-black text-black whitespace-pre-line">
                {cmsProductPromo.heading}
              </h2>

              <p className="mt-4 max-w-md text-base leading-7 text-gray-600">
                {cmsProductPromo.description}
              </p>

              <div className="mt-8">
                <Link
                  href="/shop"
             className="inline-flex h-12 items-center justify-center rounded-xl bg-orange-500 px-8 text-[12px] font-bold uppercase tracking-wide text-white transition-all duration-300 hover:bg-orange-600 hover:shadow-xl hover:shadow-orange-500/30"
                >
                  Shop Now
                </Link>
              </div>
            </div>

            {/* MOBILE CONTENT */}
            <div className="lg:hidden relative z-20 mt-[190px] text-left">
              <span className="inline-block text-[10px] font-bold uppercase tracking-[4px] text-orange-500">
                {cmsProductPromo.tagline}
              </span>

              <h2 className="mt-3 text-[34px] leading-[1.05] font-black text-black whitespace-pre-line">
                {cmsProductPromo.heading}
              </h2>

              <p className="mt-4 text-[13px] leading-7 text-gray-600">
                {cmsProductPromo.description}
              </p>

              <div className="mt-6 w-full">
                <Link
                  href="/shop"
                  className="flex w-full h-[54px] items-center justify-center rounded-[12px] bg-orange-500 text-[12px] font-bold uppercase tracking-wide text-white transition-all duration-300 hover:bg-orange-600 hover:shadow-xl hover:shadow-orange-500/30"
                >
                  Shop Now
                </Link>
              </div>
            </div>

            {/* FLOATING 3D HEADPHONE */}
            <div
              // ✅ ADDED REF HERE
              ref={imageRef}
              className="pointer-events-none absolute z-10 left-1/2 -translate-x-[40%] top-[-90px] lg:left-auto lg:translate-x-0 lg:right-[20px] lg:top-auto lg:bottom-[-225px]"
            >
              <div
         className="absolute left-1/2 -translate-x-1/2 bottom-[80px] w-[180px] h-[30px] rounded-full md:bg-black/90 md:blur-[25px] bg-black/100 blur-[23px] lg:w-[280px] lg:h-[55px] lg:bottom-[170px]"
              />

              <Image
                src={cmsProductPromo.image}
                alt={cmsProductPromo.tagline}
                width={450}
                height={350}
                priority
                 className={`relative z-10 w-[250px] max-w-none sm:w-[380px] lg:w-[500px] h-auto object-contain rotate-[-10deg] hover:scale-105 transition-all duration-1000 ease-out ${showImage ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-[90px] scale-[0.7]"}`}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductPromoBanner;