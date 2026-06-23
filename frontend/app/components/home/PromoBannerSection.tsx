"use client";
import { useEffect, useState } from "react";
import BannerCard from "./BannerCard";
import { getActiveDiscoverMore } from "@/app/services/discoverMore.service";
import { BannerItem } from "@/app/types/types";

export default function PromoBannerSection() {
  const [banners, setBanners] = useState<BannerItem[]>([]);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await getActiveDiscoverMore();
        if (response?.success && response?.data) {
          const formattedBanners = response.data.map((banner: any) => {
            const imgSrc = banner.image_url;
            const formattedImgSrc = imgSrc?.startsWith('http') || imgSrc?.startsWith('/') ? imgSrc : `http://localhost:8080${imgSrc}`;
            return {
              id: banner.id,
              image: formattedImgSrc,
              category: banner.subtitle || "LATEST COLLECTION",
              title: banner.title || "",
              href: banner.href || "#",
              buttonText: "DISCOVER NOW",
            };
          });
          setBanners(formattedBanners);
        }
      } catch (error) {
        console.error("Failed to fetch discover more banners", error);
      }
    };

    fetchBanners();
  }, []);

  if (banners.length === 0) return null;

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

