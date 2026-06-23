"use client";

import OfferCards from "./OfferCards";
import { useAdminSettings } from "@/app/context/AdminContext";

export default function OfferSection() {
  const { cmsOffers: offers } = useAdminSettings();
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