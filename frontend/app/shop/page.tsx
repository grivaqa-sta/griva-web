"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { SlidersHorizontal, Star, RotateCcw, X, ChevronDown } from "lucide-react";
import { useAllProducts } from "@/app/hooks/useProducts";
import { ApiProduct } from "@/app/types/types";
import ProductCard from "@/app/components/product/ProductCard";
import SectionHeading from "@/app/components/common/SectionHeading";
import { motion, AnimatePresence } from "framer-motion";
import BreadcrumbSchema from "@/components/seo/BreadcrumbSchema";

interface ShopPageProps {
  searchParams: Promise<{
    category?: string;
    search?: string;
  }>;
}

const CATEGORIES = [
  { name: "Perfumes & Buhoor", slug: "perfumes-buhoor" },
  { name: "Toys", slug: "toys" },
  { name: "Baby Products", slug: "baby-products" },
  { name: "Gadgets & Electronics", slug: "gadgets-electronics" },
  { name: "Gaming Accessories", slug: "gaming-accessories" },
  { name: "Kitchen Appliances & Essentials", slug: "kitchen-appliances-essentials" },
];

// Skeleton card
function ProductCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-none bg-white p-2 animate-pulse sm:rounded-[28px] sm:border sm:border-gray-100 sm:p-4">
      <div className="h-[170px] sm:h-[240px] rounded-[18px] sm:rounded-[24px] bg-gray-100" />
      <div className="mt-4 space-y-2">
        <div className="h-4 rounded bg-gray-100 w-3/4" />
        <div className="h-4 rounded bg-gray-100 w-1/2" />
        <div className="h-3 rounded bg-gray-100 w-1/3" />
      </div>
    </div>
  );
}

export default function ShopPage({ searchParams }: ShopPageProps) {
  const resolvedParams = React.use(searchParams);

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchVal, setSearchVal] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<number>(2000);
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<string>("featured");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [openSortDropdown, setOpenSortDropdown] = useState(false);

  // Initialize filters from searchParams
  useEffect(() => {
    if (resolvedParams.category) {
      setSelectedCategory(resolvedParams.category.toLowerCase());
    }
    if (resolvedParams.search) {
      setSearchVal(resolvedParams.search);
    }
  }, [resolvedParams]);

  const isRatingSearch = /(\d)\s*stars?/i.test(searchVal);
  // Fetch all products from API (search/price passed to backend)
  const { products, loading } = useAllProducts(
    (searchVal && !isRatingSearch) || maxPrice < 2000
      ? {
          search: (searchVal && !isRatingSearch) ? searchVal : undefined,
          maxPrice: maxPrice < 2000 ? maxPrice : undefined,
        }
      : undefined
  );

  const handleResetFilters = () => {
    setSelectedCategory("");
    setSearchVal("");
    setMaxPrice(2000);
    setMinRating(0);
    setSortBy("featured");
  };

  // Client-side filter for category, rating, and sort
  const processedProducts = useMemo((): ApiProduct[] => {
    let result = [...products];

    // Intercept rating searches like "1 star review", "5 star", etc.
    const starSearchMatch = searchVal.match(/(\d)\s*stars?/i);
    let ratingFromSearch: number | null = null;
    if (starSearchMatch) {
      ratingFromSearch = parseInt(starSearchMatch[1]);
    }

    if (ratingFromSearch !== null) {
      result = result.filter((p) => Math.round(Number(p.rating || 0)) === ratingFromSearch);
    }

    // Category filter (client-side — match against brand/title since no category slug on ApiProduct)
    // The category filtering by subcategory is done on category page; shop page shows all
    if (selectedCategory) {
      result = result.filter((p) => {
        const titleLower = p.title.toLowerCase();
        const descLower = (p.short_description || p.description || "").toLowerCase();
        const categoryMapped: Record<string, string[]> = {
          "perfumes-buhoor": ["perfume", "oud", "buhoor", "fragrance", "scent"],
          "toys": ["toy", "learning", "islamic", "remote control", "rc"],
          "baby-products": ["baby", "infant", "play mat", "bouncer", "cradle"],
          "gadgets-electronics": ["drone", "vr", "smartwatch", "speaker", "camera", "laptop", "macbook", "headphone", "earphone"],
          "gaming-accessories": ["gaming", "xbox", "ps5", "controller", "trigger", "game"],
          "kitchen-appliances-essentials": ["coffee", "kitchen", "rack", "espresso", "egg boiler"],
        };
        const keywords = categoryMapped[selectedCategory] || [];
        return keywords.some(
          (kw) => titleLower.includes(kw) || descLower.includes(kw)
        );
      });
    }

    // Rating Filter
    if (minRating > 0) {
      result = result.filter((p) => p.rating >= minRating);
    }

    // Sorting
    if (sortBy === "price-low-to-high") {
      result.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sortBy === "price-high-to-low") {
      result.sort((a, b) => Number(b.price) - Number(a.price));
    } else if (sortBy === "rating") {
      result.sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [products, selectedCategory, minRating, sortBy, searchVal]);

  return (
    <div className="bg-gray-50/50 min-h-screen pb-16">
      <title>Online Shop Qatar — Electronics, Gadgets & Tech Accessories | GRIVA</title>
      <meta name="description" content="Browse our complete collection of verified premium electronics in Qatar. Filter by category, price, and customer ratings. Direct same day delivery across Doha." />
      <link rel="canonical" href="https://thegriva.com/shop" />
      <BreadcrumbSchema items={[
        { name: "Home", path: "/" },
        { name: "Shop", path: "/shop" }
      ]} />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading title="Shop Products" subtitle="Browse, filter, and find your perfect gear" />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Desktop Filter Sidebar */}
          <div className="hidden lg:block space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-6">
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

              {/* Search */}
              <div>
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">Search</h4>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs text-gray-700 outline-none focus:border-orange-400"
                />
              </div>

              {/* Categories */}
              <div>
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">
                  Categories
                </h4>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedCategory("")}
                    className={`block w-full text-left text-xs py-1 px-2 rounded-md transition-colors cursor-pointer ${selectedCategory === ""
                      ? "bg-orange-500 text-white font-semibold"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                  >
                    All Categories
                  </button>
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.slug}
                      onClick={() => setSelectedCategory(cat.slug)}
                      className={`block w-full text-left text-xs py-1 px-2 rounded-md transition-colors cursor-pointer ${selectedCategory === cat.slug
                        ? "bg-orange-500 text-white font-semibold"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Filter */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Max Price
                  </h4>
                  <span className="text-xs font-bold text-orange-500">QAR {maxPrice}</span>
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
                  <span>QAR 0</span>
                  <span>QAR 2,000</span>
                </div>
              </div>

              {/* Ratings Filter */}
              <div>
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">
                  Min Rating
                </h4>
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1, 0].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setMinRating(rating)}
                      className={`flex w-full items-center gap-2 text-xs py-1 px-2 rounded-md transition cursor-pointer ${minRating === rating
                        ? "bg-orange-500 text-white font-semibold"
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
                                className={`h-3 w-3 ${i < rating
                                  ? minRating === rating
                                    ? "fill-white text-white"
                                    : "fill-orange-400 text-orange-400"
                                  : "text-gray-200"
                                  }`}
                              />
                            ))}
                          </div>
                          <span>& Up</span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Grid & Sorting Header */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 px-4 py-3 shadow-sm flex items-center justify-between">
              <span className="text-xs text-gray-500 font-semibold">
                {loading ? "Loading..." : `Found ${processedProducts.length} ${processedProducts.length === 1 ? "product" : "products"}`}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setMobileFiltersOpen(true)}
                  className="lg:hidden flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition cursor-pointer"
                >
                  <SlidersHorizontal className="h-4 w-4" /> Filters
                </button>

                <div className="hidden lg:flex items-center gap-2">
                  <span className="text-xs text-gray-500 font-semibold">Sort by:</span>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setOpenSortDropdown(!openSortDropdown)}
                      className="flex items-center justify-between gap-1.5 px-4.5 py-2 bg-white border border-orange-500/20 hover:border-orange-500/50 rounded-xl text-xs font-bold text-gray-700 cursor-pointer shadow-sm min-w-[150px] text-left"
                    >
                      <span>
                        {sortBy === "featured" && "Featured"}
                        {sortBy === "price-low-to-high" && "Price: Low to High"}
                        {sortBy === "price-high-to-low" && "Price: High to Low"}
                        {sortBy === "rating" && "Rating"}
                      </span>
                      <ChevronDown size={14} className={`text-gray-400 shrink-0 transition-transform ${openSortDropdown ? "rotate-180 text-orange-500" : ""}`} />
                    </button>

                    {openSortDropdown && (
                      <>
                        <div className="fixed inset-0 z-40 bg-transparent cursor-default" onClick={() => setOpenSortDropdown(false)} />
                        <div className="absolute right-0 top-full mt-1 bg-white border border-gray-100 rounded-xl shadow-xl z-50 py-1 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 min-w-[150px]">
                          <button
                            type="button"
                            onClick={() => { setSortBy("featured"); setOpenSortDropdown(false); }}
                            className={`w-full text-left px-3 py-2 text-xs font-semibold ${sortBy === "featured" ? "text-orange-500 bg-orange-50/50 font-bold" : "text-gray-700 hover:bg-orange-50 hover:text-orange-500"}`}
                          >
                            Featured
                          </button>
                          <button
                            type="button"
                            onClick={() => { setSortBy("price-low-to-high"); setOpenSortDropdown(false); }}
                            className={`w-full text-left px-3 py-2 text-xs font-semibold ${sortBy === "price-low-to-high" ? "text-orange-500 bg-orange-50/50 font-bold" : "text-gray-700 hover:bg-orange-50 hover:text-orange-500"}`}
                          >
                            Price: Low to High
                          </button>
                          <button
                            type="button"
                            onClick={() => { setSortBy("price-high-to-low"); setOpenSortDropdown(false); }}
                            className={`w-full text-left px-3 py-2 text-xs font-semibold ${sortBy === "price-high-to-low" ? "text-orange-500 bg-orange-50/50 font-bold" : "text-gray-700 hover:bg-orange-50 hover:text-orange-500"}`}
                          >
                            Price: High to Low
                          </button>
                          <button
                            type="button"
                            onClick={() => { setSortBy("rating"); setOpenSortDropdown(false); }}
                            className={`w-full text-left px-3 py-2 text-xs font-semibold ${sortBy === "rating" ? "text-orange-500 bg-orange-50/50 font-bold" : "text-gray-700 hover:bg-orange-50 hover:text-orange-500"}`}
                          >
                            Rating
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Product Cards Grid */}
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-0 divide-x divide-y divide-gray-200 border border-gray-200 sm:gap-6 sm:border-0 sm:divide-none">
                {Array.from({ length: 6 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : processedProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-0 divide-x divide-y divide-gray-200 border border-gray-200 sm:gap-6 sm:border-0 sm:divide-none">
                {processedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
                <p className="text-sm font-semibold text-gray-500">
                  No products match your active filters.
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

      {/* Mobile Filters Overlay Drawer */}
      <AnimatePresence>
        {mobileFiltersOpen && (
          <div>
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
                    onClick={() => { handleResetFilters(); setMobileFiltersOpen(false); }}
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
                {/* Search */}
                <div>
                  <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">Search</h4>
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchVal}
                    onChange={(e) => setSearchVal(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs text-gray-700 outline-none focus:border-orange-400"
                  />
                </div>

                {/* Categories */}
                <div>
                  <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">
                    Categories
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedCategory("")}
                      className={`text-xs py-1.5 px-3 rounded-lg border transition cursor-pointer ${selectedCategory === ""
                        ? "border-orange-500 bg-orange-50 text-orange-500 font-bold"
                        : "border-gray-200 text-gray-600 bg-white"
                        }`}
                    >
                      All Categories
                    </button>
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.slug}
                        onClick={() => setSelectedCategory(cat.slug)}
                        className={`text-xs py-1.5 px-3 rounded-lg border transition cursor-pointer ${selectedCategory === cat.slug
                          ? "border-orange-500 bg-orange-50 text-orange-500 font-bold"
                          : "border-gray-200 text-gray-600 bg-white"
                          }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Slider */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                      Max Price
                    </h4>
                    <span className="text-xs font-bold text-orange-500">QAR {maxPrice}</span>
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
                    {[5, 4, 3, 2, 1, 0].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => setMinRating(rating)}
                        className={`flex items-center justify-center gap-1.5 text-xs py-2 px-3 rounded-lg border transition cursor-pointer ${minRating === rating
                          ? "border-orange-500 bg-orange-50 text-orange-500 font-bold"
                          : "border-gray-200 text-gray-600 bg-white"
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
                                  className={`h-3 w-3 ${i < rating
                                    ? "fill-orange-400 text-orange-400"
                                    : "text-gray-200"
                                    }`}
                                />
                              ))}
                            </div>
                            <span>& Up</span>
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
                Show {processedProducts.length} Results
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}