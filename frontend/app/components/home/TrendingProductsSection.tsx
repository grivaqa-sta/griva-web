"use client";

import { useTrendingProducts } from "@/app/hooks/useProducts";
import TrendingProductCard from "@/app/components/product/TrendingProductCard";
import SectionHeading from "@/app/components/common/SectionHeading";
import ScrollReveal from "@/app/components/common/ScrollReveal";

function TrendingProductCardSkeleton() {
  return (
    <div className="group relative overflow-hidden rounded-[24px] border border-[#ECECEC] bg-white p-5 shadow-[0_4px_24px_rgba(15,23,42,0.04)] animate-pulse">
      <div className="flex gap-5">
        <div className="h-[140px] w-[140px] shrink-0 rounded-2xl bg-[#F8F9FB]" />

        <div className="flex flex-1 flex-col justify-center space-y-3">
          <div className="h-3 w-16 rounded-full bg-[#F1F3F5]" />

          <div className="space-y-2">
            <div className="h-4 w-4/5 rounded-full bg-[#F1F3F5]" />
            <div className="h-4 w-3/5 rounded-full bg-[#F1F3F5]" />
          </div>

          <div className="h-3 w-28 rounded-full bg-[#F1F3F5]" />

          <div className="h-5 w-24 rounded-full bg-[#F1F3F5]" />
        </div>
      </div>
    </div>
  );
}

export default function TrendingProductsSection() {
  const { products: trendingProducts, loading } = useTrendingProducts();

  return (
    <section className="relative w-full bg-[#FCFCFD] py-14 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="Trending Products"
          subtitle="Discover what's hot and popular right now"
          viewAllLink="/shop"
        />

        <ScrollReveal>
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <TrendingProductCardSkeleton key={i} />
              ))
            ) : trendingProducts.length > 0 ? (
              trendingProducts.slice(0, 6).map((product) => (
                <div key={product.id}>
                  <TrendingProductCard product={product} />
                </div>
              ))
            ) : (
              <div className="col-span-full rounded-[24px] border border-[#ECECEC] bg-white py-12 text-center shadow-sm">
                <p className="text-sm font-medium text-[#6B7280]">
                  No trending products available.
                </p>
              </div>
            )}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}