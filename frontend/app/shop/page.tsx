"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { SlidersHorizontal, Star, RotateCcw, X, ChevronDown, ChevronRight } from "lucide-react";
import { useAllProducts } from "@/app/hooks/useProducts";
import { ApiProduct, Category, SubCategory } from "@/app/types/types";
import { categoryService } from "@/app/services/category.service";
import { subCategoryService } from "@/app/services/subCategory.service";
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
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>("");
  const [searchVal, setSearchVal] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<number>(1000000);
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<string>("featured");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Dynamic categories & subcategories from API
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);

  useEffect(() => {
    async function loadTaxonomy() {
      try {
        const [catRes, subRes] = await Promise.all([
          categoryService.getCategories(),
          subCategoryService.getSubCategories(),
        ]);
        // categoryService.getCategories() returns response.data.data (already unwrapped array)
        const cData = Array.isArray(catRes) ? catRes : (catRes?.data || []);
        // subCategoryService.getSubCategories() returns response.data = { success, data: [...] }
        const sRaw = subRes?.data || subRes;
        const sData = Array.isArray(sRaw) ? sRaw : (sRaw?.data || []);
        setCategories(Array.isArray(cData) ? cData : []);
        setSubCategories(Array.isArray(sData) ? sData : []);
      } catch (err) {
        console.error("[ShopPage] Failed to load taxonomy:", err);
      }
    }
    loadTaxonomy();
  }, []);

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
    (searchVal && !isRatingSearch) || maxPrice < 1000000
      ? {
          search: (searchVal && !isRatingSearch) ? searchVal : undefined,
          maxPrice: maxPrice < 1000000 ? maxPrice : undefined,
        }
      : undefined
  );

  const [maxProductPrice, setMaxProductPrice] = useState<number>(2000);

  useEffect(() => {
    if (products.length > 0 && maxPrice === 1000000) {
      const maxVal = Math.max(...products.map((p) => Number(p.price || 0)));
      setMaxProductPrice(Math.max(Math.ceil(maxVal), 2000));
    }
  }, [products, maxPrice]);

  const handleResetFilters = () => {
    setSelectedCategory("");
    setSelectedSubCategory("");
    setSearchVal("");
    setMaxPrice(1000000);
    setMinRating(0);
    setSortBy("featured");
  };

  // Helper to clean up category titles that are in all caps (e.g. "FLOWERS & BOUQUETS")
  const formatCategoryTitle = (title: string) => {
    if (!title) return "";
    if (title === title.toUpperCase()) {
      return title
        .toLowerCase()
        .split(" ")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
    }
    return title;
  };

  // Toggle category open/closed and reset subcategory selection
  const handleSelectCategory = (slug: string) => {
    if (selectedCategory === slug) {
      setSelectedCategory("");
    } else {
      setSelectedCategory(slug);
    }
    setSelectedSubCategory("");
  };

  // Get subcategories of the currently selected category
  const activeSubCategories = useMemo(() => {
    if (!selectedCategory) return [];
    const matchedCat = categories.find(
      (c) => c.slug === selectedCategory || c.href?.includes(selectedCategory)
    );
    if (!matchedCat) return [];
    return subCategories.filter((s) => s.category_id === matchedCat.id);
  }, [selectedCategory, categories, subCategories]);

  // Build a set of subcategory IDs belonging to the selected category
  const selectedCategorySubIds = useMemo(() => {
    if (!selectedCategory) return null;
    if (activeSubCategories.length === 0) return null;
    return new Set(activeSubCategories.map((s) => s.id));
  }, [selectedCategory, activeSubCategories]);

  // Client-side filter for category, subcategory, rating, and sort
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

    // Subcategory filter — if a specific subcategory is selected, filter by that
    if (selectedSubCategory) {
      const matchedSub = activeSubCategories.find(
        (s) => s.slug === selectedSubCategory
      );
      if (matchedSub) {
        result = result.filter((p) => p.subcategory_id === matchedSub.id);
      }
    } else if (selectedCategory) {
      if (selectedCategorySubIds) {
        // Category filter — show all products from all subcategories of this category
        result = result.filter((p) => selectedCategorySubIds.has(p.subcategory_id));
      } else {
        result = []; // Show no products if there are no subcategories in this category
      }
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
  }, [products, selectedCategory, selectedSubCategory, selectedCategorySubIds, activeSubCategories, minRating, sortBy, searchVal]);

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

              {/* Categories & Subcategories */}
              <div>
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">
                  Categories
                </h4>
                <div className="space-y-1">
                  <button
                    onClick={() => handleSelectCategory("")}
                    className={`block w-full text-left text-xs py-1.5 px-2 rounded-md transition-colors cursor-pointer ${selectedCategory === ""
                      ? "bg-orange-500 text-white font-semibold"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                  >
                    All Categories
                  </button>
                  {categories.map((cat) => {
                    const isExpanded = selectedCategory === cat.slug;
                    const catSubCategories = subCategories.filter((s) => s.category_id === cat.id);
                    return (
                      <div key={cat.slug}>
                        <button
                          onClick={() => handleSelectCategory(cat.slug)}
                          className={`flex w-full items-center justify-between text-left text-xs py-1.5 px-2 rounded-md transition-colors cursor-pointer ${isExpanded
                            ? "bg-orange-500 text-white font-semibold"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            }`}
                        >
                          <span>{formatCategoryTitle(cat.title)}</span>
                          {catSubCategories.length > 0 && (
                            isExpanded
                              ? <ChevronDown className="h-3 w-3 shrink-0" />
                              : <ChevronRight className="h-3 w-3 shrink-0" />
                          )}
                        </button>
                        {/* Subcategories — shown when this category is expanded */}
                        {isExpanded && catSubCategories.length > 0 && (
                          <div className="ml-3 mt-1 space-y-0.5 border-l-2 border-orange-100 pl-2">
                            <button
                              onClick={() => setSelectedSubCategory("")}
                              className={`block w-full text-left text-[11px] py-1 px-2 rounded-md transition-colors cursor-pointer ${selectedSubCategory === ""
                                ? "bg-orange-50 text-orange-600 font-semibold"
                                : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                                }`}
                            >
                              All {formatCategoryTitle(cat.title)}
                            </button>
                            {catSubCategories.map((sub) => (
                              <button
                                key={sub.slug}
                                onClick={() => setSelectedSubCategory(sub.slug)}
                                className={`block w-full text-left text-[11px] py-1 px-2 rounded-md transition-colors cursor-pointer ${selectedSubCategory === sub.slug
                                  ? "bg-orange-50 text-orange-600 font-semibold"
                                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                                  }`}
                              >
                                {sub.title}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Price Filter */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Max Price
                  </h4>
                  <span className="text-xs font-bold text-orange-500">QAR {maxPrice === 1000000 ? maxProductPrice : maxPrice}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={maxProductPrice}
                  step={maxProductPrice > 5000 ? 100 : 50}
                  value={maxPrice === 1000000 ? maxProductPrice : maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                />
                <div className="flex justify-between text-[10px] text-gray-400 mt-1 font-semibold">
                  <span>QAR 0</span>
                  <span>QAR {maxProductPrice}</span>
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

                {/* Categories & Subcategories */}
                <div>
                  <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">
                    Categories
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleSelectCategory("")}
                      className={`text-xs py-1.5 px-3 rounded-lg border transition cursor-pointer ${selectedCategory === ""
                        ? "border-orange-500 bg-orange-50 text-orange-500 font-bold"
                        : "border-gray-200 text-gray-600 bg-white"
                        }`}
                    >
                      All Categories
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat.slug}
                        onClick={() => handleSelectCategory(cat.slug)}
                        className={`text-xs py-1.5 px-3 rounded-lg border transition cursor-pointer flex items-center gap-1 ${selectedCategory === cat.slug
                          ? "border-orange-500 bg-orange-50 text-orange-500 font-bold"
                          : "border-gray-200 text-gray-600 bg-white"
                          }`}
                      >
                        {formatCategoryTitle(cat.title)}
                        {subCategories.some((s) => s.category_id === cat.id) && (
                          selectedCategory === cat.slug
                            ? <ChevronDown className="h-3 w-3 shrink-0" />
                            : <ChevronRight className="h-3 w-3 shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                  {/* Subcategories for selected category */}
                  {selectedCategory && activeSubCategories.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100">
                      <button
                        onClick={() => setSelectedSubCategory("")}
                        className={`text-[11px] py-1 px-2.5 rounded-lg border transition cursor-pointer ${selectedSubCategory === ""
                          ? "border-orange-400 bg-orange-50 text-orange-600 font-bold"
                          : "border-gray-200 text-gray-500 bg-white"
                          }`}
                      >
                        All
                      </button>
                      {activeSubCategories.map((sub) => (
                        <button
                          key={sub.slug}
                          onClick={() => setSelectedSubCategory(sub.slug)}
                          className={`text-[11px] py-1 px-2.5 rounded-lg border transition cursor-pointer ${selectedSubCategory === sub.slug
                            ? "border-orange-400 bg-orange-50 text-orange-600 font-bold"
                            : "border-gray-200 text-gray-500 bg-white"
                            }`}
                        >
                          {sub.title}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Price Slider */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                      Max Price
                    </h4>
                    <span className="text-xs font-bold text-orange-500">QAR {maxPrice === 1000000 ? maxProductPrice : maxPrice}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={maxProductPrice}
                    step={maxProductPrice > 5000 ? 100 : 50}
                    value={maxPrice === 1000000 ? maxProductPrice : maxPrice}
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