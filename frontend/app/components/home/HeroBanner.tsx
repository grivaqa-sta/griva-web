"use client";

import DesktopHeroBanner from "./DesktopHeroBanner";
import MobileHeroBanner from "./MobileAdBanner";

export default function HeroBanner() {
  return (
    <section className="w-full lg:py-1">
      <MobileHeroBanner />
      <DesktopHeroBanner />
    </section>
  );
}