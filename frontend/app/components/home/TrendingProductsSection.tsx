"use client";

import { useTrendingProducts } from "@/app/hooks/useProducts";
import TrendingProductCard from "@/app/components/product/TrendingProductCard";
import ScrollReveal from "@/app/components/common/ScrollReveal";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

function TrendingProductCardSkeleton() {
  return (
    <>
      {/* Mobile skeleton */}
      <div className="sm:hidden flex flex-col bg-white animate-pulse">
        <div className="w-full bg-gray-100" style={{ paddingBottom: "100%" }} />
        <div className="flex flex-col px-2.5 pt-2 pb-2.5 gap-1.5">
          <div className="h-2 w-8 rounded-full bg-gray-100" />
          <div className="h-3 w-4/5 rounded-full bg-gray-100" />
          <div className="h-3 w-3/5 rounded-full bg-gray-100" />
          <div className="flex items-center justify-between mt-1">
            <div className="space-y-1">
              <div className="h-3.5 w-14 rounded-full bg-gray-100" />
              <div className="h-2.5 w-10 rounded-full bg-gray-100" />
            </div>
            <div className="h-7 w-7 rounded-lg bg-gray-100" />
          </div>
        </div>
      </div>

      {/* Desktop skeleton */}
      <div className="hidden sm:flex flex-row overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm animate-pulse">
        <div className="h-[170px] w-[150px] shrink-0 bg-gray-100" />
        <div className="flex flex-col flex-1 px-4 pt-3 pb-4 gap-2">
          <div className="h-2.5 w-12 rounded-full bg-gray-100" />
          <div className="space-y-1.5">
            <div className="h-3.5 w-4/5 rounded-full bg-gray-100" />
            <div className="h-3.5 w-3/5 rounded-full bg-gray-100" />
          </div>
          <div className="h-3 w-28 rounded-full bg-gray-100" />
          <div className="flex items-center justify-between mt-1">
            <div className="space-y-1">
              <div className="h-4 w-20 rounded-full bg-gray-100" />
              <div className="h-3 w-14 rounded-full bg-gray-100" />
            </div>
            <div className="h-9 w-9 rounded-lg bg-gray-100" />
          </div>
        </div>
      </div>
    </>
  );
}

export default function TrendingProductsSection() {
  const { products: trendingProducts, loading } = useTrendingProducts();

  return (
    <section className="relative w-full bg-[#FCFCFD] py-14 lg:py-16">
      <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">

        {/* Section Heading */}
        <div className="flex items-start justify-between px-4 sm:px-0">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 lg:text-3xl">
              Trending <span className="text-orange-500">Products</span>
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Discover what&apos;s hot and popular right now
            </p>
            <div className="mt-2 h-[3px] w-10 rounded-full bg-orange-500" />
          </div>
          <Link
            href="/shop"
            className="flex items-center gap-1.5 text-sm font-medium text-orange-500 hover:text-orange-600 transition-colors mt-1"
          >
            View All <ArrowRight size={16} />
          </Link>
        </div>

        <ScrollReveal>
          <div className="
            mt-6
            grid grid-cols-2
            [&>*]:border-r [&>*:nth-child(2n)]:border-r-0 [&>*]:border-b [&>*]:border-gray-200
            border-t border-l border-gray-200
            sm:border-0 sm:[&>*]:border-0
            sm:mt-8 sm:grid-cols-1 sm:gap-6
            md:grid-cols-2 xl:grid-cols-3
          ">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <TrendingProductCardSkeleton key={i} />
              ))
            ) : trendingProducts.length > 0 ? (
              trendingProducts.slice(0, 6).map((product) => (
                <TrendingProductCard key={product.id} product={product} />
              ))
            ) : (
              <div className="col-span-full rounded-xl border border-gray-100 bg-white py-12 text-center shadow-sm">
                <p className="text-sm font-medium text-gray-500">
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