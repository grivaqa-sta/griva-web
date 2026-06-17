"use client";

import { products } from "@/app/data/data";
import ProductCard from "@/app/components/product/ProductCard";
import SectionHeading from "@/app/components/common/SectionHeading";
import ScrollReveal from "@/app/components/common/ScrollReveal";

export default function ProductSection() {
  // Show first 4 best-selling products on home page
  const bestSellers = products.slice(0, 8);

  return (
    <section className="w-full py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="Best Selling Products"
          subtitle="Top rated gear loved by our customers"
          viewAllLink="/shop"
        />
        <ScrollReveal>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-6">
            {bestSellers.map((product) => (
              <ProductCard
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