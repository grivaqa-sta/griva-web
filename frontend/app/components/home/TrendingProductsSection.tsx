"use client";

import { trndingProducts } from "@/app/data/data";
import TrendingProductCard from "@/app/components/product/TrendingProductCard";
import SectionHeading from "@/app/components/common/SectionHeading";
import ScrollReveal from "@/app/components/common/ScrollReveal";

export default function TrendingProductsSection() {
  return (
    <section className="w-full py-8 ">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="Trending Products"
          subtitle="Discover what's hot and popular right now"
          viewAllLink="/shop"
        />

        <ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {trndingProducts.map((product) => (
              <TrendingProductCard
                key={product.id}
                product={product}
              />
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}