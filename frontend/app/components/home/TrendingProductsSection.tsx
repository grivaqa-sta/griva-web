"use client";

import { useTrendingProducts } from "@/app/hooks/useProducts";
import TrendingProductCard from "@/app/components/product/TrendingProductCard";
import SectionHeading from "@/app/components/common/SectionHeading";
import ScrollReveal from "@/app/components/common/ScrollReveal";

function TrendingProductCardSkeleton() {
  return (
    <div className="w-full rounded-xl p-4 border border-gray-100 flex gap-4 animate-pulse bg-white">
      <div className="h-[130px] w-[130px] rounded-lg bg-gray-100 shrink-0" />
      <div className="flex-1 flex flex-col justify-center space-y-2.5">
        <div className="h-3 rounded bg-gray-100 w-1/4" />
        <div className="h-4 rounded bg-gray-100 w-3/4" />
        <div className="h-3 rounded bg-gray-100 w-1/2" />
        <div className="h-4 rounded bg-gray-100 w-1/3" />
      </div>
    </div>
  );
}

export default function TrendingProductsSection() {
  const { products: trendingProducts, loading } = useTrendingProducts();

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
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TrendingProductCardSkeleton key={i} />
              ))
            ) : trendingProducts.length > 0 ? (
              trendingProducts.slice(0, 6).map((product) => (
                <TrendingProductCard
                  key={product.id}
                  product={product}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-sm text-gray-500 font-semibold bg-white border border-gray-100 rounded-xl">
                No trending products available.
              </div>
            )}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}