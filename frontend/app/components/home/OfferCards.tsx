"use client";

import { OfferCard } from "@/app/types/types";
import Image from "next/image";
import Link from "next/link";

function OfferCards({ offer }: { offer: OfferCard }) {
  return (
    <Link
      href={offer.href}
      className={`group relative h-[200px] md:h-[250px] overflow-hidden rounded-[10px] ${offer.bgColor}
      border border-black/5 transition-all duration-700
      lg:hover:-translate-y-3
      lg:hover:shadow-[0_40px_100px_rgba(0,0,0,0.15)]`}
    >
      {/* Background Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.4),transparent_45%)]" />

      {/* Decorative Shape */}
      <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-black/[0.03]" />

      {/* Corner Accent */}
      <div className="absolute right-5 top-5 h-14 w-14 rounded-full border border-white/30 opacity-70 transition-all duration-700 group-hover:scale-125" />

      {/* Content */}
      <div className="relative z-20 flex flex-col items-center text-center px-2 pt-4 lg:pt-8">
        {/* Badge */}
        <span className="rounded-full bg-white/60 px-3 py-1 text-[7px] font-semibold uppercase tracking-[0.25em] text-black/70">
          {offer.badge}
        </span>

        {/* Title */}
        <h2 className="mt-3 text-[19px] max-w-[240px] font-semibold leading-[0.95] tracking-tight text-black">
          {offer.title}
        </h2>

        {/* Subtitle */}
        <p className="mt-2 text-[9px] uppercase tracking-[0.35em] text-black/45">
          {offer.subtitle}
        </p>
      </div>

      {/* Product Image */}
      <div className="absolute bottom-[-20px] lg:bottom-[-20px] left-1/2 z-10 -translate-x-1/2">
        <Image
          src={offer.image}
          alt={offer.title}
          width={280}
          height={280}
          className="w-[160px] lg:w-full h-auto object-contain transition-all duration-700 ease-out lg:group-hover:scale-110 lg:group-hover:-translate-y-5 lg:group-hover:rotate-2"
        />
      </div>

      {/* Bottom Glow */}
      <div className="absolute bottom-0 left-1/2 h-28 w-40 -translate-x-1/2 rounded-full bg-white/20 blur-3xl opacity-60" />

      {/* Premium Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/[0.03]" />

      {/* Hover Shine */}
      <div
        className="
          absolute inset-0
          -translate-x-full
          skew-x-12
          bg-gradient-to-r
          from-transparent
          via-white/20
          to-transparent
          transition-transform
          duration-1000
          group-hover:translate-x-[250%]
        "
      />
    </Link>
  );
}

export default OfferCards;