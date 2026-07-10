"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import OfferCards from "./OfferCards";
import { useNewArrivalProducts } from "@/app/hooks/useProducts";
import { OfferCard } from "@/app/types/types";

export default function OfferSection() {
  const { products } = useNewArrivalProducts();

  const bgColors = ["bg-rose-50", "bg-emerald-50", "bg-sky-50", "bg-amber-50"];
  const offers: OfferCard[] = products.map((product, index) => ({
    id: product.id,
    href: `/product/${product.slug}`,
    bgColor: bgColors[index % bgColors.length],
    badge: (product as any).discount_percentage ? `${(product as any).discount_percentage}% OFF` : "NEW",
    title: (product as any).brand ? (product as any).brand.toUpperCase() : product.title?.toUpperCase(),
    subtitle: (product as any).subcategories?.name?.toUpperCase() || "Special Offer",
    image: product.main_image_url,
  }));

  if (offers.length === 0) return null;

  return (
    <section className="w-full py-12 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="flex items-start justify-between mb-8 gap-3">
          <div>
            <h2 className="text-[18px] xs:text-[20px] sm:text-2xl lg:text-3xl font-bold tracking-tight text-[#0D0D0D]">
              New <span className="text-orange-500">Arrivals</span>
            </h2>
            <p className="mt-1 text-[11px] sm:text-sm text-gray-400 sm:text-gray-500">
              Freshly cataloged premium gadgets, tech accessories, and special arrivals
            </p>
            <div className="mt-2 h-[3px] w-10 rounded-full bg-orange-500" />
          </div>
          <Link
            href="/shop"
            className="flex items-center gap-1.5 text-xs font-semibold text-orange-500 hover:text-orange-600 transition-colors mt-1 shrink-0 px-3 py-1.5 rounded-full hover:bg-orange-50/50"
          >
            <span>View All</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-7 xl:grid-cols-4">
          {offers.map((offer) => (
            <OfferCards
              key={offer.id}
              offer={offer}
            />
          ))}
        </div>

      </div>
    </section>
  );
}