"use client";

import Link from "next/link";
import Image from "next/image";
import { BannerItem } from "@/app/types/types";

function BannerCard({ banner }: { banner: BannerItem }) {
  return (
    <div className="group relative h-[340px] overflow-hidden rounded-[10px]">

      {/* Background Image */}
      <Image
        src={banner.image}
        alt={banner.title}
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        priority
        className="object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
      />

      {/* Gradient Overlay — deep left to transparent right */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-transparent" />

      {/* Decorative vertical orange rule */}
      <span
        className="absolute left-8 top-1/2 z-10 -translate-y-1/2 w-[2px] h-16 bg-orange-500
                   opacity-0 translate-x-[-6px] transition-all duration-500
                   group-hover:opacity-100 group-hover:translate-x-0"
      />

      {/* Content */}
      <div className="absolute left-12 top-1/2 z-10 -translate-y-1/2 flex flex-col gap-2">

        {/* Category — spaced caps, orange tint */}
        <p
          className="text-[11px] font-semibold tracking-[0.25em] uppercase
                     text-orange-400 transition-colors duration-300"
        >
          {banner.category}
        </p>

        {/* Title — classic serif feel via font-light + tight leading */}
        <h2
          className="whitespace-pre-line text-[26px] leading-snug font-light
                     text-white tracking-wide max-w-[220px]"
          style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
        >
          {banner.title}
        </h2>

        {/* Divider line that grows on hover */}
        <div className="h-[1px] w-8 bg-orange-500 mt-1 transition-all duration-500 group-hover:w-16" />

        {/* CTA Button — outlined classic style */}
        <Link
          href={banner.href}
          className="mt-4 inline-flex h-10 w-32 items-center justify-center
                     border border-white text-[11px] font-semibold tracking-[0.2em] uppercase
                     text-white
                     transition-all duration-300
                     hover:border-orange-500 hover:bg-orange-500 hover:text-white
                     hover:tracking-[0.3em]"
        >
          {banner.buttonText}
        </Link>
      </div>

      {/* Bottom-right corner accent — small orange dot */}
      <span className="absolute bottom-5 right-5 z-10 w-1.5 h-1.5 rounded-full bg-orange-500 opacity-60" />
    </div>
  );
}

export default BannerCard;