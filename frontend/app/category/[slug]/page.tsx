"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { SlidersHorizontal, Star, RotateCcw, X, ChevronRight, Gamepad2, Sparkles, Smile, Baby, Smartphone, Utensils } from "lucide-react";
import { products, parsePriceNumber } from "@/app/data/data";
import ProductCard from "@/app/components/product/ProductCard";
import { motion, AnimatePresence } from "framer-motion";

// Helper to resolve styling/taglines based on category slug
interface CategoryMetadata {
  title: string;
  tagline: string;
  gradient: string;
  bannerImage: string; // Path to hero banner image under /public/banners/
  accentColor: string; // Tailwind color for glow accents
  icon: React.ReactNode;
}

const CATEGORY_META: Record<string, CategoryMetadata> = {
  "perfumes-buhoor": {
    title: "Perfumes & Buhoor",
    tagline: "Premium French perfumes, local Buhoor & Oud oils",
    gradient: "from-amber-700 via-rose-800 to-amber-900",
    bannerImage: "/banners/banner_perfumes-buhoor.png",
    accentColor: "#f59e0b",
    icon: <Sparkles className="h-6 w-6 text-white" />,
  },
  "toys": {
    title: "Toys & Games",
    tagline: "Learning toys, Islamic learning kits & RC vehicles",
    gradient: "from-sky-500 via-indigo-600 to-purple-700",
    bannerImage: "/banners/banner_toys.png",
    accentColor: "#f97316",
    icon: <Smile className="h-6 w-6 text-white" />,
  },
  "baby-products": {
    title: "Baby Products",
    tagline: "Baby storage, play mats, bath access & bouncers",
    gradient: "from-teal-400 via-cyan-500 to-emerald-600",
    bannerImage: "/banners/banner_baby-products.png",
    accentColor: "#34d399",
    icon: <Baby className="h-6 w-6 text-white" />,
  },
  "gadgets-electronics": {
    title: "Gadgets & Electronics",
    tagline: "Power banks, premium chargers, cables & smart wearables",
    gradient: "from-blue-600 via-indigo-700 to-purple-800",
    bannerImage: "/banners/banner_gadgets-electronics.png",
    accentColor: "#3b82f6",
    icon: <Smartphone className="h-6 w-6 text-white" />,
  },
  "gaming-accessories": {
    title: "Gaming Accessories",
    tagline: "Mobile game triggers, cooling fans & high-grade audio",
    gradient: "from-violet-600 via-purple-700 to-fuchsia-800",
    bannerImage: "/banners/banner_gaming-accessories.png",
    accentColor: "#8b5cf6",
    icon: <Gamepad2 className="h-6 w-6 text-white" />,
  },
  "kitchen-appliances-essentials": {
    title: "Kitchen Appliances & Essentials",
    tagline: "Storage racks, automated coffee makers & smart egg boilers",
    gradient: "from-orange-500 via-amber-600 to-red-700",
    bannerImage: "/banners/banner_kitchen-appliances-essentials.png",
    accentColor: "#f97316",
    icon: <Utensils className="h-6 w-6 text-white" />,
  },
};

export default function CategoryPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = (params.slug as string)?.toLowerCase() || "";
  const subParam = searchParams.get("sub") || "";

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
    bannerImage: "",
    accentColor: "#f97316",
    icon: <Sparkles className="h-6 w-6 text-white" />,
  };

  // Filter and Sort Logic
  const filteredProducts = useMemo(() => {
    // 1. Match category
    let result = products.filter(
      (p) => p.category.toLowerCase() === slug
    );

    // 2. Filter by subcategory if parameter is present
    if (subParam) {
      const subKeyword = subParam.replace(/-/g, " ");
      const subResult = result.filter(p => 
        p.title.toLowerCase().includes(subKeyword.toLowerCase()) || 
        p.description?.toLowerCase().includes(subKeyword.toLowerCase())
      );
      if (subResult.length > 0) {
        result = subResult;
      }
    }

    // 3. Price filter
    result = result.filter((p) => {
      const priceNum = parsePriceNumber(p.price);
      return priceNum <= maxPrice;
    });

    // 4. Rating filter
    if (minRating > 0) {
      result = result.filter((p) => p.rating >= minRating);
    }

    // 5. Sorting
    if (sortBy === "price-low-to-high") {
      result.sort((a, b) => parsePriceNumber(a.price) - parsePriceNumber(b.price));
    } else if (sortBy === "price-high-to-low") {
      result.sort((a, b) => parsePriceNumber(b.price) - parsePriceNumber(a.price));
    } else if (sortBy === "rating") {
      result.sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [slug, subParam, maxPrice, minRating, sortBy]);

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

        {/* Premium Full-Bleed Category Hero Banner */}
        <div
          className="relative overflow-hidden rounded-3xl text-white shadow-2xl"
          style={{
            minHeight: "220px",
            background: meta.bannerImage
              ? `url(${meta.bannerImage}) center/cover no-repeat`
              : `linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)`,
          }}
        >
          {/* Dark overlay for text legibility — lighter on right to show image */}
          <div
            className="absolute inset-0 rounded-3xl"
            style={{
              background: meta.bannerImage
                ? "linear-gradient(to right, rgba(10,10,15,0.88) 0%, rgba(10,10,15,0.6) 50%, rgba(10,10,15,0.15) 100%)"
                : "rgba(0,0,0,0.3)",
            }}
          />

          {/* Subtle orange glow accent top-left */}
          <div
            className="absolute -top-10 -left-10 w-48 h-48 rounded-full blur-3xl opacity-30 pointer-events-none"
            style={{ backgroundColor: meta.accentColor }}
          />

          {/* Bottom orange glow line accent */}
          <div
            className="absolute bottom-0 left-0 right-0 h-0.5 opacity-60"
            style={{ background: `linear-gradient(to right, ${meta.accentColor}, transparent)` }}
          />

          {/* Content */}
          <div className="relative p-8 md:p-12 max-w-2xl space-y-4">
            <div className="flex items-center gap-2.5">
              <div
                className="p-2.5 rounded-xl border border-white/20 backdrop-blur-md"
                style={{ background: "rgba(255,255,255,0.08)" }}
              >
                {meta.icon}
              </div>
              <span className="text-[10px] font-black tracking-[3px] uppercase text-white/60">
                Category Catalog
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
              {meta.title.includes("&") ? (
                <>
                  {meta.title.split("&")[0]}
                  <span style={{ color: meta.accentColor }}>&</span>
                  {meta.title.split("&")[1]}
                </>
              ) : meta.title}
            </h1>

            <p className="text-sm md:text-base text-white/75 leading-relaxed max-w-md">
              {meta.tagline}
            </p>

            {/* Trust badges row */}
            <div className="flex flex-wrap gap-3 pt-2">
              {[
                { icon: "🚚", label: "Qatar-Wide Delivery" },
                { icon: "💳", label: "Cash on Delivery" },
                { icon: "↩️", label: "7-Day Returns" },
              ].map((badge) => (
                <span
                  key={badge.label}
                  className="flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-full border border-white/20"
                  style={{ background: "rgba(255,255,255,0.08)", backdropFilter: "blur(8px)" }}
                >
                  <span>{badge.icon}</span>
                  <span className="text-white/80">{badge.label}</span>
                </span>
              ))}
            </div>
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
