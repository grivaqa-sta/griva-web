"use client";

import { OfferCard } from "@/app/types/types";
import Image from "next/image";
import Link from "next/link";

function OfferCards({offer}: {offer: OfferCard;}) {
  return (
    <Link
      href={offer.href}
      className={`group relative flex flex-col h-[250px] overflow-hidden rounded-2xl p-5 ${offer.bgColor}`}
    >
      {/* Glacing Animation */}
      <div className="absolute inset-0 -translate-x-full skew-x-12 bg-white/20 transition-transform duration-700 group-hover:translate-x-full" />

      {/* Badge */}
      <div className="inline-flex w-fit bg-red-700 px-3 py-1 mb-3">
        <span className="text-[10px] uppercase tracking-wide text-white">
          {offer.badge}
        </span>
      </div>

      {/* Title */}
      <h2 className="text-base leading-snug font-bold text-black">
        {offer.title}
      </h2>

      {/* Subtitle */}
      <p className="mt-1 text-xs uppercase tracking-wide text-black/70">
        {offer.subtitle}
      </p>

      {/* Product Image */}
      <div className="absolute bottom-[-5px] left-0 right-0 flex justify-center">
        <Image
          src={offer.image}
          alt={offer.title}
          width={150}
          height={150}
          className="object-contain"
        />
      </div>
    </Link>
  );
}

export default OfferCards;