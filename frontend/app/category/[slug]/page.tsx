"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { SlidersHorizontal, Star, RotateCcw, X, ChevronRight, Laptop, Tv, Speaker, Headphones, Gamepad2, Sparkles } from "lucide-react";
import { products, parsePriceNumber } from "@/app/data/data";
import ProductCard from "@/app/components/product/ProductCard";
import { motion, AnimatePresence } from "framer-motion";

// Helper to resolve styling/taglines based on category slug
interface CategoryMetadata {
  title: string;
  tagline: string;
  gradient: string;
  icon: React.ReactNode;
}

const CATEGORY_META: Record<string, CategoryMetadata> = {
  laptops: {
    title: "Premium Laptops",
    tagline: "Unleash ultimate power and portable computing",
    gradient: "from-blue-600 via-indigo-700 to-purple-800",
    icon: <Laptop className="h-6 w-6 text-white" />,
  },
  television: {
    title: "Smart Televisions",
    tagline: "Immerse yourself in cinematic 4K QLED displays",
    gradient: "from-red-650 via-pink-700 to-rose-800",
    icon: <Tv className="h-6 w-6 text-white" />,
  },
  speakers: {
    title: "Hi-Fi Speakers",
    tagline: "Experience crystal clear theater-grade acoustics",
    gradient: "from-amber-600 via-orange-600 to-red-700",
    icon: <Speaker className="h-6 w-6 text-white" />,
  },
  headphones: {
    title: "Acoustic Headphones",
    tagline: "Drown the noise with premium studio comfort",
    gradient: "from-emerald-600 via-teal-700 to-cyan-800",
    icon: <Headphones className="h-6 w-6 text-white" />,
  },
  gaming: {
    title: "Gaming Zone",
    tagline: "Next-gen speed and high-precision peripherals",
    gradient: "from-violet-650 via-purple-750 to-fuchsia-850",
    icon: <Gamepad2 className="h-6 w-6 text-white" />,
  },
  gadgets: {
    title: "Smart Gadgets",
    tagline: "Future-proof smartwatches, VR systems, and drones",
    gradient: "from-orange-500 via-amber-500 to-yellow-600",
    icon: <Sparkles className="h-6 w-6 text-white" />,
  },
};

export default function CategoryPage() {
  const params = useParams();
  const slug = (params.slug as string)?.toLowerCase() || "";

  // Filter States
  const [maxPrice, setMaxPrice] = useState<number>(2000);
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<string>("featured");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Get metadata
  const meta = CATEGORY_META[slug] || {
    title: slug.charAt(0).toUpperCase() + slug.slice(1),
    tagline: "Browse our premium selected catalog products",
    gradient: "from-zinc-800 via-zinc-900 to-black",
    icon: <Sparkles className="h-6 w-6 text-white" />,
  };

  // Filter and Sort Logic
  const filteredProducts = useMemo(() => {
    // 1. Match category
    let result = products.filter(
      (p) => p.category.toLowerCase() === slug
    );

    // 2. Price filter
    result = result.filter((p) => {
      const priceNum = parsePriceNumber(p.price);
      return priceNum <= maxPrice;
    });

    // 3. Rating filter
    if (minRating > 0) {
      result = result.filter((p) => p.rating >= minRating);
    }

    // 4. Sorting
    if (sortBy === "price-low-to-high") {
      result.sort((a, b) => parsePriceNumber(a.price) - parsePriceNumber(b.price));
    } else if (sortBy === "price-high-to-low") {
      result.sort((a, b) => parsePriceNumber(b.price) - parsePriceNumber(a.price));
    } else if (sortBy === "rating") {
      result.sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [slug, maxPrice, minRating, sortBy]);

  const handleResetFilters = () => {
    setMaxPrice(2000);
    setMinRating(0);
    setSortBy("featured");
  };

  return (
    <div className="bg-gray-50/40 min-h-screen py-8 selection:bg-orange-500 selection:text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Breadcrumbs (SEO compliance) */}
        <nav className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
          <Link href="/" className="hover:text-orange-500 transition-colors">Home</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href="/shop" className="hover:text-orange-500 transition-colors">Shop</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-gray-900 capitalize font-bold">{meta.title}</span>
        </nav>

        {/* Dynamic Glassmorphic Category Banner */}
        <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-r ${meta.gradient} p-8 md:p-12 text-white shadow-xl shadow-zinc-950/10`}>
          <div className="absolute -right-16 -top-16 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute right-10 bottom-10 opacity-10 blur-xs">
            {meta.icon}
          </div>
          <div className="relative max-w-2xl space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20">
                {meta.icon}
              </div>
              <span className="text-[10px] font-black tracking-widest uppercase text-white/80">Category Catalog</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">{meta.title}</h1>
            <p className="text-sm md:text-base text-white/85 leading-relaxed">{meta.tagline}</p>
          </div>
        </div>

        {/* Filters and Grid Wrapper */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Desktop Filter Sidebar */}
          <div className="hidden lg:block space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b pb-4">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4" /> Filters
                </h3>
                <button
                  onClick={handleResetFilters}
                  className="text-xs font-semibold text-orange-500 hover:text-orange-600 transition flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="h-3 w-3" /> Reset
                </button>
              </div>

              {/* Price Filter */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Max Price
                  </h4>
                  <span className="text-xs font-bold text-orange-500">${maxPrice}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="2000"
                  step="50"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                />
                <div className="flex justify-between text-[10px] text-gray-400 mt-1 font-semibold">
                  <span>$0</span>
                  <span>$2,000</span>
                </div>
              </div>

              {/* Ratings Filter */}
              <div>
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">
                  Min Rating
                </h4>
                <div className="space-y-2">
                  {[4, 3, 2, 0].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setMinRating(rating)}
                      className={`flex w-full items-center gap-2 text-xs py-1 px-2 rounded-md transition cursor-pointer ${
                        minRating === rating
                          ? "bg-orange-505 bg-orange-500 text-white font-semibold"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      {rating === 0 ? (
                        <span>Any Rating</span>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <div className="flex items-center gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 ${
                                  i < rating
                                    ? minRating === rating
                                      ? "fill-white text-white"
                                      : "fill-orange-400 text-orange-400"
                                    : "text-gray-200"
                                }`}
                              />
                            ))}
                          </div>
                          <span>&amp; Up</span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Catalog view grid */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Header control board */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs text-gray-500 font-semibold">
                  Found {filteredProducts.length} {filteredProducts.length === 1 ? "product" : "products"} in <span className="text-gray-900 font-bold capitalize">{meta.title}</span>
                </span>
              </div>

              {/* Mobile controls */}
              <div className="flex lg:hidden w-full gap-3">
                <button
                  onClick={() => setMobileFiltersOpen(true)}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition cursor-pointer"
                >
                  <SlidersHorizontal className="h-4 w-4" /> Filters
                </button>
                <div className="flex-1 relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 outline-none cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <option value="featured">Sort: Featured</option>
                    <option value="price-low-to-high">Sort: Lowest Price</option>
                    <option value="price-high-to-low">Sort: Highest Price</option>
                    <option value="rating">Sort: Top Rated</option>
                  </select>
                </div>
              </div>

              {/* Desktop sort by selector */}
              <div className="hidden lg:flex items-center gap-2">
                <span className="text-xs text-gray-500 font-semibold">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 outline-none cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <option value="featured">Featured</option>
                  <option value="price-low-to-high">Price: Low to High</option>
                  <option value="price-high-to-low">Price: High to Low</option>
                  <option value="rating">Rating</option>
                </select>
              </div>
            </div>

            {/* Product card loop */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                {filteredProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-xs">
                <p className="text-sm font-semibold text-gray-500">
                  No products matched the filters inside this category.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="mt-4 inline-flex items-center justify-center rounded-xl bg-orange-500 px-6 py-2.5 text-xs font-semibold text-white hover:bg-orange-600 transition shadow-md shadow-orange-500/10 cursor-pointer"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile drawer filter settings */}
      <AnimatePresence>
        {mobileFiltersOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileFiltersOpen(false)}
              className="fixed inset-0 z-50 bg-black lg:hidden"
            />

            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-2xl max-h-[85vh] overflow-y-auto p-6 shadow-2xl lg:hidden flex flex-col"
            >
              <div className="flex items-center justify-between border-b pb-4 mb-6">
                <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                  <SlidersHorizontal className="h-5 w-5" /> Filter Settings
                </h3>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      handleResetFilters();
                      setMobileFiltersOpen(false);
                    }}
                    className="text-xs font-semibold text-orange-500"
                  >
                    Reset All
                  </button>
                  <button
                    onClick={() => setMobileFiltersOpen(false)}
                    className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="space-y-6 overflow-y-auto pr-1">
                {/* Price Slider */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                      Max Price
                    </h4>
                    <span className="text-xs font-bold text-orange-500">${maxPrice}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="2000"
                    step="50"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                  />
                </div>

                {/* Ratings */}
                <div>
                  <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">
                    Minimum Rating
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {[4, 3, 2, 0].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => setMinRating(rating)}
                        className={`flex items-center justify-center gap-1.5 text-xs py-2 px-3 rounded-lg border transition cursor-pointer ${
                          minRating === rating
                            ? "border-orange-500 bg-orange-50 text-orange-500 font-bold"
                            : "border-gray-200 text-gray-650 bg-white"
                        }`}
                      >
                        {rating === 0 ? (
                          <span>Any Rating</span>
                        ) : (
                          <div className="flex items-center gap-1">
                            <div className="flex items-center gap-0.5">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-3 w-3 ${
                                    i < rating
                                      ? "fill-orange-400 text-orange-400"
                                      : "text-gray-200"
                                  }`}
                                />
                              ))}
                            </div>
                            <span>&amp; Up</span>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="mt-8 w-full py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition shadow-lg shadow-orange-500/10 cursor-pointer"
              >
                Show {filteredProducts.length} Results
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
