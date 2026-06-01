"use client";

import Link from "next/link";
import Image from "next/image";
import { BannerItem } from "@/app/types/types";

function BannerCard({banner}: {banner: BannerItem}) {
  return (
    <div className="group relative h-[320px] overflow-hidden">
      
      <Image
        src={banner.image}
        alt={banner.title}
        fill
        priority
        className="object-cover transition duration-500 group-hover:scale-105"
      />

      <div className="absolute inset-0 bg-black/40" />

      <div className="absolute left-12 top-1/2 z-10 -translate-y-1/2">
        
        <p className="text-xl font-light text-white">
          {banner.category}
        </p>

        <h2 className="mt-3 whitespace-pre-line text-3xl font-light leading-tight text-white">
          {banner.title}
        </h2>

        <Link
          href={banner.href}
          className="mt-6 flex h-10 w-28 items-center justify-center bg-white text-sm font-medium text-black transition hover:bg-orange-500 hover:text-white"
        >
          {banner.buttonText}
        </Link>
      </div>
    </div>
  );
}

export default BannerCard;