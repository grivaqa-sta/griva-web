"use client";

import { useBestSellerProducts } from "@/app/hooks/useProducts";
import ProductCard from "@/app/components/product/ProductCard";
import SectionHeading from "@/app/components/common/SectionHeading";
import ScrollReveal from "@/app/components/common/ScrollReveal";

function ProductCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden bg-white p-2 animate-pulse sm:rounded-[28px] sm:border sm:border-gray-100 sm:p-4">
      <div className="h-[140px] sm:h-[240px] bg-gray-100 sm:rounded-[24px]" />
      <div className="mt-3 space-y-2 sm:mt-4">
        <div className="h-3 rounded bg-gray-100 w-3/4" />
        <div className="h-3 rounded bg-gray-100 w-1/2" />
        <div className="h-2 rounded bg-gray-100 w-1/3" />
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
  const displayProducts = products.slice(0, 8);

  return (
    <section className="w-full py-8">
      <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">

        <div className="mb-6 sm:hidden">
          <h2 className="text-[22px] font-bold tracking-tight text-[#0D0D0D]">
            Best Selling Products
          </h2>
          <p className="mt-1 text-sm text-gray-400">
            Top rated gear loved by our customers
          </p>
        </div>

        <div className="hidden sm:block">
          <SectionHeading
            title="Best Selling Products"
            subtitle="Top rated gear loved by our customers"
            viewAllLink="/shop"
          />
        </div>

        <ScrollReveal>
          <div className="grid grid-cols-2 gap-0 divide-x divide-y divide-gray-200 border border-gray-200 sm:gap-4 sm:border-0 sm:divide-none lg:grid-cols-4 lg:gap-6">
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