"use client";

import { useAllProducts, useBestSellerProducts, useTrendingProducts } from "@/app/hooks/useProducts";
import ProductCard from "@/app/components/product/ProductCard";
import ScrollReveal from "@/app/components/common/ScrollReveal";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

function ProductCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden bg-white p-2 animate-pulse sm:rounded-[24px] sm:border sm:border-gray-100 sm:p-4">
      <div className="h-[130px] sm:h-[210px] bg-gray-100 sm:rounded-[18px]" />
      <div className="mt-2 space-y-1.5 sm:mt-3">
        <div className="h-2.5 rounded bg-gray-100 w-1/4" />
        <div className="h-3 rounded bg-gray-100 w-4/5" />
        <div className="h-3 rounded bg-gray-100 w-3/5" />
        <div className="h-2.5 rounded bg-gray-100 w-1/3" />
        <div className="h-4 rounded bg-gray-100 w-2/5" />
      </div>
      <div className="mt-3 hidden sm:grid grid-cols-2 gap-2.5">
        <div className="h-11 rounded-xl bg-gray-100" />
        <div className="h-11 rounded-[10px] bg-gray-100" />
      </div>
    </div>
  );
}

export default function MoreToExploreSection() {
  const { products: allProducts, loading: loadingAll } = useAllProducts();
  const { products: bestSellers, loading: loadingBest } = useBestSellerProducts();
  const { products: trending, loading: loadingTrending } = useTrendingProducts();

  const loading = loadingAll || loadingBest || loadingTrending;

  // Filter products: exclude display best-sellers (8) and display trending (6)
  const displayedBestSellersIds = new Set(bestSellers.slice(0, 8).map((p) => p.id));
  const displayedTrendingIds = new Set(trending.slice(0, 6).map((p) => p.id));
  const displayedIds = new Set([...displayedBestSellersIds, ...displayedTrendingIds]);

  const notDisplayedProducts = allProducts.filter((product) => !displayedIds.has(product.id));
  const displayedProducts = allProducts.filter((product) => displayedIds.has(product.id));

  // Prioritize products not displayed, and fill the remaining spots by reusing displayed products
  const combinedProducts = [...notDisplayedProducts, ...displayedProducts];

  const count = combinedProducts.length;

  // Limits
  const mobileCount = Math.floor(Math.min(20, count) / 2) * 2;
  const desktopCount = Math.floor(Math.min(20, count) / 4) * 4;

  const displayProducts = combinedProducts.slice(0, mobileCount);

  const showOnDesktop = desktopCount > 0;
  const showOnMobile = mobileCount > 0;

  if (!loading && !showOnMobile && !showOnDesktop) return null;

  return (
    <section className={`w-full py-8 ${!showOnDesktop ? "sm:hidden" : ""} ${!showOnMobile ? "hidden sm:block" : ""}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Mobile heading */}
        <div className="flex items-start justify-between mb-6 sm:hidden">
          <div>
            <h2 className="text-[22px] font-bold tracking-tight text-[#0D0D0D]">
              More to <span className="text-orange-500">Explore</span>
            </h2>
            <p className="mt-1 text-xs text-gray-400">
              Discover other amazing products and deals
            </p>
            <div className="mt-2 h-[3px] w-10 rounded-full bg-orange-500" />
          </div>
          <Link
            href="/shop"
            className="flex items-center gap-1 text-xs font-semibold text-orange-500 hover:text-orange-600 transition-colors mt-2 shrink-0"
          >
            View All <ArrowRight size={14} />
          </Link>
        </div>

        {/* Desktop heading */}
        <div className="hidden sm:flex items-start justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 lg:text-3xl">
              More to <span className="text-orange-500">Explore</span>
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Discover other amazing products and deals
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
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-6">
            {loading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))
              : displayProducts.length > 0
              ? displayProducts.map((product, index) => {
                  const isMobileOnly = index >= desktopCount;
                  return (
                    <div
                      key={product.id}
                      className={`h-full ${isMobileOnly ? "block sm:hidden" : ""}`}
                    >
                      <ProductCard product={product} />
                    </div>
                  );
                })
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
