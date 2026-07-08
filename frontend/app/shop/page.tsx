"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { SlidersHorizontal, Star, RotateCcw, X, ChevronDown, ChevronRight } from "lucide-react";
import { useAllProducts } from "@/app/hooks/useProducts";
import { useCategories, useSubCategories } from "@/app/hooks/useCategories";
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
  const [searchInputVal, setSearchInputVal] = useState<string>("");
  const [searchVal, setSearchVal] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<number>(1000000);
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<string>("featured");
  const [minDiscount, setMinDiscount] = useState<number>(0);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const searchParamsHook = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Dynamic categories & subcategories from API (cached — no repeat fetches on navigation)
  const { categories } = useCategories();
  const { subCategories } = useSubCategories();

  const [openSortDropdown, setOpenSortDropdown] = useState(false);
  const hasInitializedRef = useRef(false);

  // Debounce search input value
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchVal(searchInputVal);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchInputVal]);

  // Initialize filters from URL on first mount
  useEffect(() => {
    if (hasInitializedRef.current) return;

    const categoryParam = searchParamsHook.get("category") || resolvedParams.category || "";
    const subParam = searchParamsHook.get("sub") || "";
    const searchParam = searchParamsHook.get("search") || resolvedParams.search || "";
    const ratingParam = searchParamsHook.get("rating") || "";
    const maxPriceParam = searchParamsHook.get("maxPrice") || "";
    const sortByParam = searchParamsHook.get("sortBy") || "featured";
    const discountParam = searchParamsHook.get("minDiscount") || "";

    if (categoryParam) setSelectedCategory(categoryParam.toLowerCase());
    if (subParam) setSelectedSubCategory(subParam.toLowerCase());
    if (searchParam) {
      setSearchInputVal(searchParam);
      setSearchVal(searchParam);
    }
    if (ratingParam) setMinRating(Number(ratingParam));
    if (maxPriceParam) setMaxPrice(Number(maxPriceParam));
    if (sortByParam) setSortBy(sortByParam);
    if (discountParam) setMinDiscount(Number(discountParam));

    hasInitializedRef.current = true;
  }, [resolvedParams]);

  // Sync URL changes (e.g. from Navbar clicks) to state after initialization
  useEffect(() => {
    if (!hasInitializedRef.current) return;

    const categoryParam = searchParamsHook.get("category") || "";
    const subParam = searchParamsHook.get("sub") || "";
    const searchParam = searchParamsHook.get("search") || "";
    const ratingParam = searchParamsHook.get("rating") ? Number(searchParamsHook.get("rating")) : 0;
    const maxPriceParam = searchParamsHook.get("maxPrice") ? Number(searchParamsHook.get("maxPrice")) : 1000000;
    const sortByParam = searchParamsHook.get("sortBy") || "featured";
    const discountParam = searchParamsHook.get("minDiscount") ? Number(searchParamsHook.get("minDiscount")) : 0;

    if (categoryParam.toLowerCase() !== selectedCategory) {
      setSelectedCategory(categoryParam.toLowerCase());
    }
    if (subParam.toLowerCase() !== selectedSubCategory) {
      setSelectedSubCategory(subParam.toLowerCase());
    }
    if (searchParam !== searchInputVal) {
      setSearchInputVal(searchParam);
      setSearchVal(searchParam);
    }
    if (ratingParam !== minRating) {
      setMinRating(ratingParam);
    }
    if (maxPriceParam !== maxPrice) {
      setMaxPrice(maxPriceParam);
    }
    if (sortByParam !== sortBy) {
      setSortBy(sortByParam);
    }
    if (discountParam !== minDiscount) {
      setMinDiscount(discountParam);
    }
  }, [searchParamsHook]);

  // Sync state to URL params
  useEffect(() => {
    if (!hasInitializedRef.current) return;

    const params = new URLSearchParams();
    if (selectedCategory) params.set("category", selectedCategory);
    if (selectedSubCategory) params.set("sub", selectedSubCategory);
    if (searchVal) params.set("search", searchVal);
    if (minRating > 0) params.set("rating", String(minRating));
    if (maxPrice < 1000000) params.set("maxPrice", String(maxPrice));
    if (sortBy !== "featured") params.set("sortBy", sortBy);
    if (minDiscount > 0) params.set("minDiscount", String(minDiscount));

    const newQuery = params.toString();
    const newPath = `${pathname}${newQuery ? `?${newQuery}` : ""}`;
    window.history.replaceState(null, "", newPath);
  }, [selectedCategory, selectedSubCategory, searchVal, minRating, maxPrice, sortBy, minDiscount, pathname]);

  // Smooth scroll to products grid on filter changes
  useEffect(() => {
    if (categories.length > 0 && (selectedCategory || selectedSubCategory)) {
      const el = document.getElementById("shop-products-grid");
      if (el) {
        const offset = 140;
        const elementPosition = el.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.scrollY - offset;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth"
        });
      }
    }
  }, [selectedCategory, selectedSubCategory, categories.length]);

  const isRatingSearch = /(\d)\s*stars?/i.test(searchVal);
  // Fetch all products from API once for high-speed client-side filtering and fuzzy matching
  const { products, loading } = useAllProducts();

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
    setSearchInputVal("");
    setSearchVal("");
    setMaxPrice(1000000);
    setMinRating(0);
    setSortBy("featured");
    setMinDiscount(0);
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

    // Search filter: exact match, word prefix match, or subsequence/fuzzy match
    if (searchVal && !isRatingSearch) {
      const query = searchVal.toLowerCase().trim();
      result = result.filter((p) => {
        const title = (p.title || "").toLowerCase();
        const desc = (p.description || "").toLowerCase();
        const tags = Array.isArray(p.tags) ? p.tags.map(t => String(t).toLowerCase()) : [];
        const brand = (p.brand || "").toLowerCase();

        // 1. Substring matches
        if (title.includes(query) || desc.includes(query) || brand.includes(query) || tags.some(t => t.includes(query))) {
          return true;
        }

        // 2. Word prefix matches (e.g. "chrg" or "s25" starts some words)
        const titleWords = title.split(/\s+/);
        if (titleWords.some(word => word.startsWith(query))) {
          return true;
        }

        // 3. Subsequence matches (e.g. "chrg" subsequences "charger")
        let queryIdx = 0;
        for (let charIdx = 0; charIdx < title.length && queryIdx < query.length; charIdx++) {
          if (title[charIdx] === query[queryIdx]) {
            queryIdx++;
          }
        }
        if (queryIdx === query.length) {
          return true;
        }

        return false;
      });
    }

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

    // Max Price filter
    if (maxPrice < 1000000) {
      result = result.filter((p) => Number(p.price || 0) <= maxPrice);
    }

    // Rating Filter
    if (minRating > 0) {
      result = result.filter((p) => p.rating >= minRating);
    }

    // Discount Filter
    if (minDiscount > 0) {
      result = result.filter((p) => {
        const pct = p.discount_percentage !== undefined && p.discount_percentage !== null
          ? Number(p.discount_percentage)
          : (p.old_price && Number(p.old_price) > Number(p.price))
            ? Math.round(((Number(p.old_price) - Number(p.price)) / Number(p.old_price)) * 100)
            : 0;
        return pct >= minDiscount;
      });
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
  }, [products, selectedCategory, selectedSubCategory, selectedCategorySubIds, activeSubCategories, minRating, sortBy, searchVal, maxPrice, minDiscount]);

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
                  value={searchInputVal}
                  onChange={(e) => setSearchInputVal(e.target.value)}
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
          <div id="shop-products-grid" className="lg:col-span-3 space-y-6">
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

            {/* Active Filter Chips */}
            {(selectedCategory || selectedSubCategory || minRating > 0 || maxPrice < 1000000 || searchVal || minDiscount > 0) && (
              <div className="flex flex-wrap gap-2 items-center py-2 animate-in fade-in duration-200">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mr-1">Active Filters:</span>
                
                {selectedCategory && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-100 text-xs font-semibold text-orange-600">
                    Category: {formatCategoryTitle(categories.find(c => c.slug === selectedCategory)?.title || selectedCategory)}
                    <button onClick={() => handleSelectCategory(selectedCategory)} className="hover:text-orange-850 focus:outline-none ml-1 cursor-pointer">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                )}

                {selectedSubCategory && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-100 text-xs font-semibold text-orange-600">
                    Subcategory: {subCategories.find(s => s.slug === selectedSubCategory)?.title || selectedSubCategory}
                    <button onClick={() => setSelectedSubCategory("")} className="hover:text-orange-850 focus:outline-none ml-1 cursor-pointer">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                )}

                {searchVal && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-100 text-xs font-semibold text-orange-600">
                    Search: "{searchVal}"
                    <button onClick={() => setSearchVal("")} className="hover:text-orange-850 focus:outline-none ml-1 cursor-pointer">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                )}

                {minRating > 0 && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-100 text-xs font-semibold text-orange-600">
                    Rating: {minRating}+ Stars
                    <button onClick={() => setMinRating(0)} className="hover:text-orange-850 focus:outline-none ml-1 cursor-pointer">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                )}

                {maxPrice < 1000000 && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-100 text-xs font-semibold text-orange-600">
                    Price: &le; QAR {maxPrice}
                    <button onClick={() => setMaxPrice(1000000)} className="hover:text-orange-850 focus:outline-none ml-1 cursor-pointer">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                )}

                {minDiscount > 0 && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-100 text-xs font-semibold text-orange-600">
                    Min Discount: {minDiscount}%+ OFF
                    <button onClick={() => setMinDiscount(0)} className="hover:text-orange-850 focus:outline-none ml-1 cursor-pointer">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                )}

                <button
                  onClick={handleResetFilters}
                  className="text-xs font-bold text-gray-500 hover:text-orange-500 underline ml-2 cursor-pointer transition-colors"
                >
                  Clear All
                </button>
              </div>
            )}

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
                    value={searchInputVal}
                    onChange={(e) => setSearchInputVal(e.target.value)}
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