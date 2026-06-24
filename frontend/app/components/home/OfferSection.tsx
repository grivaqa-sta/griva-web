"use client";

import { useEffect, useState } from "react";
import OfferCards from "./OfferCards";
import { productService } from "@/app/services/product.service";
import { OfferCard } from "@/app/types/types";

export default function OfferSection() {
  const [offers, setOffers] = useState<OfferCard[]>([]);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const response = await productService.getNewArrivalProducts();
        if (response?.success && response?.data) {
          const bgColors = ["bg-rose-50", "bg-emerald-50", "bg-sky-50", "bg-amber-50"];
          const formattedOffers = response.data.map((product: any, index: number) => {
            const imgSrc = product.main_image_url;
            const formattedImgSrc = imgSrc?.startsWith('http') || imgSrc?.startsWith('/') ? imgSrc : `http://localhost:8080${imgSrc}`;
            return {
              id: product.id,
              href: `/product/${product.slug}`,
              bgColor: bgColors[index % bgColors.length],
              badge: product.discount_percentage ? `${product.discount_percentage}% OFF` : "NEW",
              title: product.title,
              subtitle: product.short_description || "Special Offer",
              image: formattedImgSrc,
            };
          });
          setOffers(formattedOffers);
        }
      } catch (error) {
        console.error("Failed to fetch new arrival products", error);
      }
    };
    fetchOffers();
  }, []);

  if (offers.length === 0) return null;

  return (
    <section className="w-full py-10">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-7 px-4 sm:grid-cols-2 xl:grid-cols-4 sm:px-6 lg:px-8">
        
        {offers.map((offer) => (
          <OfferCards
            key={offer.id}
            offer={offer}
          />
        ))}
      </div>
    </section>
  );
}