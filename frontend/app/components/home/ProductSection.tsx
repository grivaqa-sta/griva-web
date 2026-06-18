"use client";

import { useBestSellerProducts } from "@/app/hooks/useProducts";
import ProductCard from "@/app/components/product/ProductCard";
import SectionHeading from "@/app/components/common/SectionHeading";
import ScrollReveal from "@/app/components/common/ScrollReveal";

// Skeleton card for loading state
function ProductCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-[22px] border border-gray-100 bg-white p-3 sm:rounded-[28px] sm:p-4 animate-pulse">
      <div className="h-[170px] sm:h-[240px] rounded-[18px] sm:rounded-[24px] bg-gray-100" />
      <div className="mt-4 space-y-2">
        <div className="h-4 rounded bg-gray-100 w-3/4" />
        <div className="h-4 rounded bg-gray-100 w-1/2" />
        <div className="h-3 rounded bg-gray-100 w-1/3" />
      </div>
      <div className="mt-5 hidden sm:grid grid-cols-2 gap-3">
        <div className="h-12 rounded-[5px] bg-gray-100" />
        <div className="h-12 rounded-[10px] bg-gray-100" />
      </div>
    </div>
  );
}

export default function ProductSection() {
  const { products, loading } = useBestSellerProducts();

  // Show up to 8 best-seller products
  const displayProducts = products.slice(0, 8);

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
            {loading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))
              : displayProducts.length > 0
              ? displayProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))
              : (
                <div className="col-span-full py-12 text-center text-sm text-gray-400">
                  No products available at the moment.
                </div>
              )}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}