"use client";

import Image from "next/image";
import Link from "next/link";

const ProductPromoBanner = () => {
  return (
    <section className="w-full  py-4 sm:py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Banner Card */}
        <div className="relative overflow-hidden rounded-[5px]">
          


          <div className="relative grid min-h-[210px] bg-[#f0e5bc] items-center gap-6 px-5 py-6 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:px-12 lg:py-8">
            
            {/* Left Content */}
            <div className="max-w-lg">
              <span className="inline-block text-[10px] font-bold uppercase tracking-[3px] text-orange-500">
                Exclusive Headphone
              </span>

              <h2 className="mt-2 text-2xl font-black leading-tight text-black sm:text-3xl lg:text-4xl">
                Discounts 50% On
                <span className="block">
                  All Headphone
                </span>
              </h2>

              <p className="mt-3 max-w-md text-xs leading-6 text-gray-600 sm:text-sm">
                Discover premium wireless headphones with immersive sound,
                active noise cancellation, and unbeatable comfort.
              </p>

              {/* CTA Button */}
              <div className="mt-5">
                <Link
                  href="/shop"
                  className="inline-flex h-10 items-center justify-center rounded-xl bg-orange-500 px-6 text-[11px] font-bold uppercase tracking-wide text-white transition-all duration-300 hover:bg-orange-600 hover:shadow-lg hover:shadow-orange-500/20"
                >
                  Shop Now
                </Link>
              </div>
            </div>

            {/* Right Image */}
            <div className="relative flex items-center justify-center">
              <div className="relative">
                <Image
                  src="/images/headphonenew.png"
                  alt="Premium Headphones"
                  width={520}
                  height={420}
                  priority
                  className="h-[250px] w-full max-w-[400px] object-contain drop-shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductPromoBanner;