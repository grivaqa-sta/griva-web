"use client";
import { banners } from "@/app/data/data";
import BannerCard from "./BannerCard";

export default function PromoBannerSection() {
  return (
    <section className="w-full py-8">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-7 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        
        {banners.map((banner) => (
          <BannerCard
            key={banner.id}
            banner={banner}
          />
        ))}
      </div>
    </section>
  );
}

