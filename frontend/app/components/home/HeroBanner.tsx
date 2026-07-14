"use client";

import { useBannerProducts } from "@/app/hooks/useHomeData";
import DesktopHeroBanner from "./DesktopHeroBanner";
import MobileHeroBanner from "./MobileAdBanner";

export default function HeroBanner() {
  const { bannerProducts, loading } = useBannerProducts();

  return (
    <section className="w-full lg:py-1">
      <MobileHeroBanner bannerProducts={bannerProducts} loading={loading} />
      <DesktopHeroBanner bannerProducts={bannerProducts} loading={loading} />
    </section>
  );
}