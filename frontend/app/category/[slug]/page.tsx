"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { SlidersHorizontal, Star, RotateCcw, X, ChevronRight, Gamepad2, Sparkles, Smile, Baby, Smartphone, Utensils } from "lucide-react";
import { useAllProducts } from "@/app/hooks/useProducts";
import { ApiProduct, Category, SubCategory } from "@/app/types/types";
import { categoryService } from "@/app/services/category.service";
import { subCategoryService } from "@/app/services/subCategory.service";
import ProductCard from "@/app/components/product/ProductCard";
import { motion, AnimatePresence } from "framer-motion";

interface CategoryMetadata {
  title: string;
  tagline: string;
  gradient: string;
  bannerImage: string;
  accentColor: string;
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
    accentColor: "#FF6A00",
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
    accentColor: "#FF6A00",
    icon: <Utensils className="h-6 w-6 text-white" />,
  },
};

function ProductCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-[22px] border border-gray-100 bg-white p-3 sm:rounded-[28px] sm:p-4 animate-pulse">
      <div className="h-[170px] sm:h-[240px] rounded-[18px] sm:rounded-[24px] bg-gray-100" />
      <div className="mt-4 space-y-2">
        <div className="h-4 rounded bg-gray-100 w-3/4" />
        <div className="h-4 rounded bg-gray-100 w-1/2" />
        <div className="h-3 rounded bg-gray-100 w-1/3" />
      </div>
    </div>
  );
}

export default function CategoryPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = (params.slug as string)?.toLowerCase() || "";
  const subParam = searchParams.get("sub") || "";

  const [maxPrice, setMaxPrice] = useState<number>(2000);
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<string>("featured");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [taxonomyLoading, setTaxonomyLoading] = useState(true);

  useEffect(() => {
    async function loadTaxonomy() {
      try {
        const [catRes, subRes] = await Promise.all([
          categoryService.getCategories(),
          subCategoryService.getSubCategories(),
        ]);
        const cData = catRes?.data || catRes;
        const sData = subRes?.data || subRes;
        setCategories(Array.isArray(cData) ? cData : []);
        setSubCategories(Array.isArray(sData) ? sData : []);
      } catch (err) {
        console.error("[CategoryPage] Failed to load taxonomy:", err);
      } finally {
        setTaxonomyLoading(false);
      }
    }
    loadTaxonomy();
  }, []);

  const { products: allProducts, loading: productsLoading } = useAllProducts();
  const loading = taxonomyLoading || productsLoading;

  const matchedCategory = useMemo(() => {
    return categories.find(
      (c) => c.slug === slug || c.href?.includes(slug)
    );
  }, [categories, slug]);

  const categorySubcategories = useMemo(() => {
    if (!matchedCategory) return [];
    const filtered = subCategories.filter(
      (s) => s.category_id === matchedCategory.id
    );

    // If it's the perfumes category, sort according to the user's specific order
    if (slug === "perfumes-buhoor") {
      const order = ["perfumes", "body-spray", "body-lotion", "buhoor", "car-fragrance"];
      return filtered.sort((a, b) => {
        const indexA = order.indexOf(a.slug);
        const indexB = order.indexOf(b.slug);
        const valA = indexA !== -1 ? indexA : 999;
        const valB = indexB !== -1 ? indexB : 999;
        return valA - valB;
      });
    }

    return filtered;
  }, [subCategories, matchedCategory, slug]);

  const matchedSubcategory = useMemo(() => {
    if (!subParam) return null;
    return categorySubcategories.find(
      (s) => s.slug === subParam || s.href?.endsWith(`?sub=${subParam}`)
    );
  }, [categorySubcategories, subParam]);

  const validSubcategoryIds = useMemo(() => {
    if (!matchedCategory) return new Set<number>();
    return new Set(
      categorySubcategories.map((s) => s.id)
    );
  }, [matchedCategory, categorySubcategories]);

  const filteredProducts = useMemo((): ApiProduct[] => {
    let result = allProducts.filter((p) =>
      validSubcategoryIds.has(p.subcategory_id)
    );
    if (validSubcategoryIds.size === 0 && !taxonomyLoading) {
      result = [...allProducts];
    }
    if (matchedSubcategory) {
      result = result.filter((p) => p.subcategory_id === matchedSubcategory.id);
    } else if (subParam) {
      const subKeyword = subParam.replace(/-/g, " ").toLowerCase();
      const subResult = result.filter(
        (p) =>
          p.title.toLowerCase().includes(subKeyword) ||
          (p.description || "").toLowerCase().includes(subKeyword) ||
          (p.short_description || "").toLowerCase().includes(subKeyword)
      );
      if (subResult.length > 0) result = subResult;
    }
    result = result.filter((p) => Number(p.price) <= maxPrice);
    if (minRating > 0) {
      result = result.filter((p) => p.rating >= minRating);
    }
    if (sortBy === "price-low-to-high") {
      result.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sortBy === "price-high-to-low") {
      result.sort((a, b) => Number(b.price) - Number(a.price));
    } else if (sortBy === "rating") {
      result.sort((a, b) => b.rating - a.rating);
    }
    return result;
  }, [allProducts, validSubcategoryIds, taxonomyLoading, matchedSubcategory, subParam, maxPrice, minRating, sortBy]);

  const handleResetFilters = () => {
    setMaxPrice(2000);
    setMinRating(0);
    setSortBy("featured");
  };

  const meta = CATEGORY_META[slug] || {
    title: slug.charAt(0).toUpperCase() + slug.slice(1),
    tagline: "Browse our premium selected catalog products",
    gradient: "from-zinc-800 via-zinc-900 to-black",
    bannerImage: "",
    accentColor: "#FF6A00",
    icon: <Sparkles className="h-6 w-6 text-white" />,
  };

  return (
    <div
      className="bg-gray-50/40 min-h-screen py-8"
      style={{ ["--tw-selection-bg" as string]: "#FF6A00" }}
    >
      <style>{`::selection { background-color: #FF6A00; color: white; }`}</style>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">

        {/* Breadcrumbs */}
        <nav className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
          <Link
            href="/"
            className="transition-colors"
            onMouseEnter={(e) => (e.currentTarget.style.color = "#FF6A00")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "")}
          >
            Home
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link
            href="/shop"
            className="transition-colors"
            onMouseEnter={(e) => (e.currentTarget.style.color = "#FF6A00")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "")}
          >
            Shop
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-gray-900 capitalize font-bold">{meta.title}</span>
        </nav>

        {/* Category Hero Banner */}
        <div
          className="relative overflow-hidden rounded-3xl text-white shadow-2xl"
          style={{
            minHeight: "220px",
            background: matchedCategory?.image_url
              ? `url(${matchedCategory.image_url}) center/cover no-repeat`
              : meta.bannerImage
              ? `url(${meta.bannerImage}) center/cover no-repeat`
              : `linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)`,
          }}
        >
          <div
            className="absolute inset-0 rounded-3xl"
            style={{
              background: (matchedCategory?.image_url || meta.bannerImage)
                ? "linear-gradient(to right, rgba(10,10,15,0.88) 0%, rgba(10,10,15,0.6) 50%, rgba(10,10,15,0.15) 100%)"
                : "rgba(0,0,0,0.3)",
            }}
          />
          <div
            className="absolute -top-10 -left-10 w-48 h-48 rounded-full blur-3xl opacity-30 pointer-events-none"
            style={{ backgroundColor: meta.accentColor }}
          />
          <div
            className="absolute bottom-0 left-0 right-0 h-0.5 opacity-60"
            style={{ background: `linear-gradient(to right, ${meta.accentColor}, transparent)` }}
          />
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

        {/* Subcategories Horizontal Scroll/Chips */}
        {categorySubcategories.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar scroll-smooth">
            <Link
              href={`/category/${slug}`}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                !subParam
                  ? "bg-orange-500 border-orange-500 text-white shadow-md shadow-orange-500/10"
                  : "bg-white border-gray-200 text-gray-700 hover:border-orange-200 hover:text-orange-500"
              }`}
            >
              All Products
            </Link>
            {categorySubcategories.map((sub) => {
              const isSelected = subParam === sub.slug || sub.href?.endsWith(`?sub=${subParam}`);
              return (
                <Link
                  key={sub.id}
                  href={`/category/${slug}?sub=${sub.slug}`}
                  className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                    isSelected
                      ? "bg-orange-500 border-orange-500 text-white shadow-md shadow-orange-500/10"
                      : "bg-white border-gray-200 text-gray-700 hover:border-orange-200 hover:text-orange-500"
                  }`}
                >
                  {sub.title}
                </Link>
              );
            })}
          </div>
        )}

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
                  className="text-xs font-semibold transition flex items-center gap-1 cursor-pointer"
                  style={{ color: "#FF6A00" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#e05a00")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#FF6A00")}
                >
                  <RotateCcw className="h-3 w-3" /> Reset
                </button>
              </div>

              {/* Price Filter */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Max Price</h4>
                  <span className="text-xs font-bold" style={{ color: "#FF6A00" }}>QAR {maxPrice}</span>
                </div>
                <input
                  type="range" min="0" max="2000" step="50" value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  style={{ accentColor: "#FF6A00" }}
                />
                <div className="flex justify-between text-[10px] text-gray-400 mt-1 font-semibold">
                  <span>QAR 0</span><span>QAR 2,000</span>
                </div>
              </div>

              {/* Ratings Filter */}
              <div>
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">Min Rating</h4>
                <div className="space-y-2">
                  {[4, 3, 2, 0].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setMinRating(rating)}
                      className="flex w-full items-center gap-2 text-xs py-1 px-2 rounded-md transition cursor-pointer"
                      style={
                        minRating === rating
                          ? { backgroundColor: "#FF6A00", color: "white", fontWeight: 600 }
                          : { color: "#4b5563" }
                      }
                      onMouseEnter={(e) => {
                        if (minRating !== rating) e.currentTarget.style.backgroundColor = "#f9fafb";
                      }}
                      onMouseLeave={(e) => {
                        if (minRating !== rating) e.currentTarget.style.backgroundColor = "";
                      }}
                    >
                      {rating === 0 ? (
                        <span>Any Rating</span>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <div className="flex items-center gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className="h-3 w-3"
                                style={{
                                  fill: i < rating ? (minRating === rating ? "white" : "#FF6A00") : "transparent",
                                  color: i < rating ? (minRating === rating ? "white" : "#FF6A00") : "#e5e7eb",
                                }}
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

          {/* Catalog view grid */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs text-gray-500 font-semibold">
                  {loading ? "Loading..." : `Found ${filteredProducts.length} ${filteredProducts.length === 1 ? "product" : "products"} in `}
                  {!loading && <span className="text-gray-900 font-bold capitalize">{meta.title}</span>}
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
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="flex-1 appearance-none rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 outline-none cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <option value="featured">Sort: Featured</option>
                  <option value="price-low-to-high">Sort: Lowest Price</option>
                  <option value="price-high-to-low">Sort: Highest Price</option>
                  <option value="rating">Sort: Top Rated</option>
                </select>
              </div>

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
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                {Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)}
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                {filteredProducts.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-xs">
                <p className="text-sm font-semibold text-gray-500">
                  No products matched the filters inside this category.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="mt-4 inline-flex items-center justify-center rounded-xl px-6 py-2.5 text-xs font-semibold text-white transition cursor-pointer"
                  style={{
                    backgroundColor: "#FF6A00",
                    boxShadow: "0 4px 6px -1px rgba(255,106,0,0.10)",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#e05a00")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#FF6A00")}
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
              initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }}
              onClick={() => setMobileFiltersOpen(false)}
              className="fixed inset-0 z-50 bg-black lg:hidden"
            />
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
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
                    className="text-xs font-semibold"
                    style={{ color: "#FF6A00" }}
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
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Max Price</h4>
                    <span className="text-xs font-bold" style={{ color: "#FF6A00" }}>QAR {maxPrice}</span>
                  </div>
                  <input
                    type="range" min="0" max="2000" step="50" value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    style={{ accentColor: "#FF6A00" }}
                  />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">Minimum Rating</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {[4, 3, 2, 0].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => setMinRating(rating)}
                        className="flex items-center justify-center gap-1.5 text-xs py-2 px-3 rounded-lg border transition cursor-pointer"
                        style={
                          minRating === rating
                            ? { borderColor: "#FF6A00", backgroundColor: "#FF6A0010", color: "#FF6A00", fontWeight: 700 }
                            : { borderColor: "#e5e7eb", color: "#4b5563", backgroundColor: "white" }
                        }
                      >
                        {rating === 0 ? <span>Any Rating</span> : (
                          <div className="flex items-center gap-1">
                            <div className="flex items-center gap-0.5">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className="h-3 w-3"
                                  style={{
                                    fill: i < rating ? "#FF6A00" : "transparent",
                                    color: i < rating ? "#FF6A00" : "#e5e7eb",
                                  }}
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
                className="mt-8 w-full py-3 text-white rounded-xl font-semibold transition cursor-pointer"
                style={{
                  backgroundColor: "#FF6A00",
                  boxShadow: "0 4px 6px -1px rgba(255,106,0,0.10)",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#e05a00")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#FF6A00")}
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