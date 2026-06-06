"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { SlidersHorizontal, Star, RotateCcw, X } from "lucide-react";
import { products, parsePriceNumber } from "@/app/data/data";
import ProductCard from "@/app/components/product/ProductCard";
import SectionHeading from "@/app/components/common/SectionHeading";
import { Product } from "@/app/types/types";
import { motion, AnimatePresence } from "framer-motion";

interface ShopPageProps {
  searchParams: Promise<{
    category?: string;
    search?: string;
  }>;
}

const CATEGORIES = ["Electronics", "Fashion", "Accessories", "Gaming", "Mobiles"];

export default function ShopPage({ searchParams }: ShopPageProps) {
  const resolvedParams = React.use(searchParams);

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchVal, setSearchVal] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<number>(2000);
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<string>("featured");

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Initialize filters from searchParams
  useEffect(() => {
    if (resolvedParams.category) {
      setSelectedCategory(resolvedParams.category.toLowerCase());
    }
    if (resolvedParams.search) {
      setSearchVal(resolvedParams.search);
    }
  }, [resolvedParams]);

  const handleResetFilters = () => {
    setSelectedCategory("");
    setSearchVal("");
    setMaxPrice(2000);
    setMinRating(0);
    setSortBy("featured");
  };

  // Filter and Sort Logic (Memoized)
  const processedProducts = useMemo(() => {
    let result = [...products];

    // Search Query
    if (searchVal.trim()) {
      const query = searchVal.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query) ||
          (p.description && p.description.toLowerCase().includes(query))
      );
    }

    // Category
    if (selectedCategory) {
      result = result.filter(
        (p) => p.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Price Filter
    result = result.filter((p) => {
      const priceNum = parsePriceNumber(p.price);
      return priceNum <= maxPrice;
    });

    // Rating Filter
    if (minRating > 0) {
      result = result.filter((p) => p.rating >= minRating);
    }

    // Sorting
    if (sortBy === "price-low-to-high") {
      result.sort((a, b) => parsePriceNumber(a.price) - parsePriceNumber(b.price));
    } else if (sortBy === "price-high-to-low") {
      result.sort((a, b) => parsePriceNumber(b.price) - parsePriceNumber(a.price));
    } else if (sortBy === "rating") {
      result.sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [searchVal, selectedCategory, maxPrice, minRating, sortBy]);

  return (
    <div className="bg-gray-50/50 min-h-screen py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading title="Shop Products" subtitle="Browse, filter, and find your perfect gear" />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* ────────────────────────────────────────────────────────
              Desktop Filter Sidebar (lg and up)
             ──────────────────────────────────────────────────────── */}
          <div className="hidden lg:block space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b pb-4">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <SlidersHorizontal className="h-4. w-4." /> Filters
                </h3>
                <button
                  onClick={handleResetFilters}
                  className="text-xs font-semibold text-orange-500 hover:text-orange-600 transition flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="h-3 w-3" /> Reset
                </button>
              </div>

              {/* Categories */}
              <div>
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">
                  Categories
                </h4>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedCategory("")}
                    className={`block w-full text-left text-xs py-1 px-2 rounded-md transition-colors cursor-pointer ${
                      selectedCategory === ""
                        ? "bg-orange-500 text-white font-semibold"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    All Categories
                  </button>
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat.toLowerCase())}
                      className={`block w-full text-left text-xs py-1 px-2 rounded-md transition-colors cursor-pointer ${
                        selectedCategory === cat.toLowerCase()
                          ? "bg-orange-500 text-white font-semibold"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      {cat}
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

          {/* ────────────────────────────────────────────────────────
              Main Grid & Sorting Header
             ──────────────────────────────────────────────────────── */}
          <div className="lg:col-span-3 space-y-6">
            {/* Header / Controls */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              
              {/* Desktop Product Count */}
              <div className="hidden lg:block">
                <span className="text-xs text-gray-500 font-semibold">
                  Found {processedProducts.length} {processedProducts.length === 1 ? "product" : "products"}
                </span>
              </div>

              {/* Mobile controls (Filters + Sort side by side) */}
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
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                    <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                  </div>
                </div>
              </div>

              {/* Mobile Product Count */}
              <div className="lg:hidden text-center w-full border-t border-gray-100 pt-3">
                <span className="text-xs text-gray-500 font-semibold">
                  Found {processedProducts.length} {processedProducts.length === 1 ? "product" : "products"}
                </span>
              </div>

              {/* Desktop Sort By Dropdown */}
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

            {/* Product Cards Grid */}
            {processedProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
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

      {/* ────────────────────────────────────────────────────────
          Mobile Filters Overlay Drawer
         ──────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {mobileFiltersOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileFiltersOpen(false)}
              className="fixed inset-0 z-50 bg-black lg:hidden"
            />

            {/* Slide up Drawer */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-2xl max-h-[85vh] overflow-y-auto p-6 shadow-2xl lg:hidden flex flex-col"
            >
              {/* Header */}
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

              {/* Contents */}
              <div className="space-y-6 overflow-y-auto pr-1">
                {/* Categories */}
                <div>
                  <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">
                    Categories
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedCategory("")}
                      className={`text-xs py-1.5 px-3 rounded-lg border transition cursor-pointer ${
                        selectedCategory === ""
                          ? "border-orange-500 bg-orange-50 text-orange-500 font-bold"
                          : "border-gray-200 text-gray-600 bg-white"
                      }`}
                    >
                      All Categories
                    </button>
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat.toLowerCase())}
                        className={`text-xs py-1.5 px-3 rounded-lg border transition cursor-pointer ${
                          selectedCategory === cat.toLowerCase()
                            ? "border-orange-500 bg-orange-50 text-orange-500 font-bold"
                            : "border-gray-200 text-gray-600 bg-white"
                        }`}
                      >
                        {cat}
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

              {/* View Results Action Button */}
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="mt-8 w-full py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition shadow-lg shadow-orange-500/10 cursor-pointer"
              >
                Show {processedProducts.length} Results
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
