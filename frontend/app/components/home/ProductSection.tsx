"use client";

import { useBestSellerProducts } from "@/app/hooks/useProducts";
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

export default function ProductSection() {
  const { products, loading } = useBestSellerProducts();
  const displayProducts = products.slice(0, 8);

  return (
    <section className="w-full py-8">
      <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">

        {/* Mobile heading */}
        <div className="mb-6 sm:hidden px-4">
          <h2 className="text-[22px] font-bold tracking-tight text-[#0D0D0D]">
            Best Selling <span className="text-orange-500">Products</span>
          </h2>
          <p className="mt-1 text-sm text-gray-400">
            Top rated gear loved by our customers
          </p>
          <div className="mt-2 h-[3px] w-10 rounded-full bg-orange-500" />
        </div>

        {/* Desktop heading */}
        <div className="hidden sm:flex items-start justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 lg:text-3xl">
              Best Selling <span className="text-orange-500">Products</span>
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Top rated gear loved by our customers
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
          <div className="grid grid-cols-2 gap-0 divide-x divide-y divide-gray-200  sm:gap-4 sm:border-0 sm:divide-none lg:grid-cols-4 lg:gap-6">
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