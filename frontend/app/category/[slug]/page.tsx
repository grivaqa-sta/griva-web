"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import {
  SlidersHorizontal,
  Star,
  RotateCcw,
  X,
  ChevronRight,
  Gamepad2,
  Smile,
  Baby,
  Smartphone,
  Utensils,
  ShieldCheck,
  BookOpen,
  LayoutGrid,
  Moon,
  Settings,
  Clock,
  Award,
  Heart,
  Zap,
  Battery,
  Watch,
  Car,
  Droplet,
  Flame,
  Tag,
  ChevronDown
} from "lucide-react";
import { useAllProducts } from "@/app/hooks/useProducts";
import { useCategories, useSubCategories } from "@/app/hooks/useCategories";
import { ApiProduct } from "@/app/types/types";
import ProductCard from "@/app/components/product/ProductCard";
import { motion, AnimatePresence } from "framer-motion";
import BreadcrumbSchema from "@/components/seo/BreadcrumbSchema";

interface BenefitItem {
  iconName: "shield" | "book" | "star" | "tag" | "clock" | "award" | "heart" | "zap";
  title: string;
  desc: string;
}

interface CategoryMetadata {
  title: string;
  tagline: string;
  gradient: string;
  bannerImage: string;
  accentColor: string;
  icon: React.ReactNode;
  benefits: BenefitItem[];
}

function getBenefitIcon(iconName: string, color: string) {
  const cls = "h-5 w-5";
  switch (iconName) {
    case "shield": return <ShieldCheck className={cls} style={{ color }} />;
    case "book": return <BookOpen className={cls} style={{ color }} />;
    case "star": return <Star className={cls} style={{ color }} />;
    case "tag": return <Tag className={cls} style={{ color }} />;
    case "clock": return <Clock className={cls} style={{ color }} />;
    case "award": return <Award className={cls} style={{ color }} />;
    case "heart": return <Heart className={cls} style={{ color }} />;
    case "zap": return <Zap className={cls} style={{ color }} />;
    default: return <Star className={cls} style={{ color }} />;
  }
}

function getSubcategoryIcon(slug: string) {
  const cls = "h-4 w-4 shrink-0";
  const s = slug.toLowerCase();
  
  if (s.includes("newborn")) return <Baby className={cls} />;
  if (s.includes("learning") && s.includes("islamic")) return <Moon className={cls} />;
  if (s.includes("learning")) return <BookOpen className={cls} />;
  if (s.includes("remote") || s.includes("control") || s.includes("gaming") || s.includes("console")) return <Gamepad2 className={cls} />;
  if (s.includes("metal")) return <Settings className={cls} />;
  
  if (s.includes("perfume")) return <Droplet className={cls} />;
  if (s.includes("buhoor") || s.includes("oud")) return <Flame className={cls} />;
  
  if (s.includes("charger") || s.includes("cable") || s.includes("adapter")) return <Zap className={cls} />;
  if (s.includes("power") || s.includes("battery")) return <Battery className={cls} />;
  if (s.includes("wearable") || s.includes("watch")) return <Watch className={cls} />;
  
  if (s.includes("kitchen") || s.includes("cook") || s.includes("appliance")) return <Utensils className={cls} />;
  if (s.includes("car") || s.includes("truck")) return <Car className={cls} />;
  
  return <Tag className={cls} />;
}

const CATEGORY_META: Record<string, CategoryMetadata> = {
  "perfumes-buhoor": {
    title: "Perfumes & Buhoor",
    tagline: "Premium French perfumes, local Buhoor & Oud oils",
    gradient: "from-amber-700 via-rose-800 to-amber-900",
    bannerImage: "/banners/banner_perfumes-buhoor.png",
    accentColor: "#f59e0b",
    icon: <Flame className="h-6 w-6 text-white" />,
    benefits: [
      { iconName: "shield", title: "100% Authentic", desc: "Premium Selection" },
      { iconName: "clock", title: "Long Lasting", desc: "All Day Projection" },
      { iconName: "award", title: "Premium Oud", desc: "Sourced Locally" }
    ]
  },
  "toys": {
    title: "Toys & Games",
    tagline: "Learning toys, Islamic learning kits & RC vehicles",
    gradient: "from-sky-500 via-indigo-600 to-purple-700",
    bannerImage: "/banners/banner_toys.png",
    accentColor: "#FF6A00",
    icon: <Smile className="h-6 w-6 text-white" />,
    benefits: [
      { iconName: "shield", title: "Safe & Durable", desc: "Premium Quality" },
      { iconName: "book", title: "Learning & Fun", desc: "For All Ages" },
      { iconName: "star", title: "Trusted by Parents", desc: "Across Qatar" }
    ]
  },
  "baby-products": {
    title: "Baby Products",
    tagline: "Baby storage, play mats, bath access & bouncers",
    gradient: "from-teal-400 via-cyan-500 to-emerald-600",
    bannerImage: "/banners/banner_baby-products.png",
    accentColor: "#34d399",
    icon: <Baby className="h-6 w-6 text-white" />,
    benefits: [
      { iconName: "shield", title: "Certified Safe", desc: "100% Non-Toxic" },
      { iconName: "heart", title: "Ultra Soft", desc: "Gentle on Baby" },
      { iconName: "star", title: "Loved by Moms", desc: "Top Qatar Choice" }
    ]
  },
  "gadgets-electronics": {
    title: "Gadgets & Electronics",
    tagline: "Power banks, premium chargers, cables & smart wearables",
    gradient: "from-blue-600 via-indigo-700 to-purple-800",
    bannerImage: "/banners/banner_gadgets-electronics.png",
    accentColor: "#3b82f6",
    icon: <Smartphone className="h-6 w-6 text-white" />,
    benefits: [
      { iconName: "shield", title: "Official Warranty", desc: "100% Original" },
      { iconName: "zap", title: "Fast Charging", desc: "High Efficiency" },
      { iconName: "award", title: "Top Performance", desc: "Qatar Verified" }
    ]
  },
  "gaming-accessories": {
    title: "Gaming Accessories",
    tagline: "Mobile game triggers, cooling fans & high-grade audio",
    gradient: "from-violet-600 via-purple-700 to-fuchsia-800",
    bannerImage: "/banners/banner_gaming-accessories.png",
    accentColor: "#8b5cf6",
    icon: <Gamepad2 className="h-6 w-6 text-white" />,
    benefits: [
      { iconName: "shield", title: "Pro Grade Quality", desc: "Zero Input Delay" },
      { iconName: "zap", title: "Extreme Cooling", desc: "Lag-Free Play" },
      { iconName: "award", title: "Competitive Edge", desc: "Loved by Gamers" }
    ]
  },
  "kitchen-appliances-essentials": {
    title: "Kitchen Appliances & Essentials",
    tagline: "Storage racks, automated coffee makers & smart egg boilers",
    gradient: "from-orange-500 via-amber-600 to-red-700",
    bannerImage: "/banners/banner_kitchen-appliances-essentials.png",
    accentColor: "#FF6A00",
    icon: <Utensils className="h-6 w-6 text-white" />,
    benefits: [
      { iconName: "shield", title: "Food Grade Safe", desc: "BPA Free Materials" },
      { iconName: "tag", title: "Smart Kitchen", desc: "Effortless Cooking" },
      { iconName: "award", title: "Highly Durable", desc: "Long Warranty" }
    ]
  }
};

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

export default function CategoryPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const slug = (params.slug as string)?.toLowerCase() || "";
  const subParam = searchParams.get("sub") || "";

  const [maxPrice, setMaxPrice] = useState<number>(1000000);
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<string>("featured");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [openSortDropdown, setOpenSortDropdown] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Categories & subcategories from API (cached — no repeat fetches on navigation)
  const { categories, loading: categoriesLoading } = useCategories();
  const { subCategories, loading: subCategoriesLoading } = useSubCategories();

  // Smooth scroll to category products grid on filter changes
  useEffect(() => {
    if (!categoriesLoading && categories.length > 0) {
      const el = document.getElementById("category-products-grid");
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
  }, [subParam, minRating, maxPrice, categoriesLoading, categories]);

  const { products: allProducts, loading: productsLoading } = useAllProducts();
  const loading = categoriesLoading || subCategoriesLoading || productsLoading;

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

  // Compute maximum price dynamically for products in this category
  const categoryMaxPrice = useMemo(() => {
    const matchedProds = allProducts.filter((p) => validSubcategoryIds.has(p.subcategory_id));
    if (matchedProds.length === 0) return 2000;
    const maxVal = Math.max(...matchedProds.map((p) => Number(p.price || 0)));
    return Math.max(Math.ceil(maxVal), 2000);
  }, [allProducts, validSubcategoryIds]);

  const filteredProducts = useMemo((): ApiProduct[] => {
    if (loading) return [];
    if (!matchedCategory) return [];

    let result = allProducts.filter((p) =>
      validSubcategoryIds.has(p.subcategory_id)
    );
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
    if (maxPrice < 1000000) {
      result = result.filter((p) => Number(p.price) <= maxPrice);
    }
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
  }, [allProducts, matchedCategory, validSubcategoryIds, loading, matchedSubcategory, subParam, maxPrice, minRating, sortBy]);

  const handleResetFilters = () => {
    setMaxPrice(1000000);
    setMinRating(0);
    setSortBy("featured");
    if (subParam) {
      router.push(`/category/${slug}`);
    }
  };

  // Dynamically compute and format category title for the metadata
  const fallbackTitle = useMemo(() => {
    if (matchedCategory?.title) {
      const title = matchedCategory.title;
      if (title === title.toUpperCase()) {
        return title
          .toLowerCase()
          .split(" ")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ");
      }
      return title;
    }
    return slug
      .replace(/[-_]/g, " ")
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  }, [matchedCategory, slug]);

  const meta = CATEGORY_META[slug] || {
    title: fallbackTitle,
    tagline: "Browse our premium selected catalog products",
    gradient: "from-zinc-800 via-zinc-900 to-black",
    bannerImage: "",
    accentColor: "#FF6A00",
    icon: <Tag className="h-6 w-6 text-white" />,
  };

  return (
    <div
      className="bg-gray-50/40 min-h-screen py-8"
      style={{ ["--tw-selection-bg" as string]: "#FF6A00" }}
    >
      <title>{meta.title} Qatar — Online Catalog & Premium Accessories | GRIVA</title>
      <meta name="description" content={`Shop ${meta.title} in Qatar. ${meta.tagline}. Same day doorstep delivery across Doha and secure Cash on Delivery.`} />
      <link rel="canonical" href={`https://thegriva.com/category/${slug}`} />
      <BreadcrumbSchema items={[
        { name: "Home", path: "/" },
        { name: "Shop", path: "/shop" },
        { name: meta.title, path: `/category/${slug}` }
      ]} />
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
          className="relative overflow-hidden rounded-3xl text-white shadow-2xl bg-zinc-950"
          style={{
            minHeight: "220px",
            background: `linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)`,
          }}
        >
          {/* Background Image with smooth fade-in to prevent flashing of old image */}
          {(() => {
            const imageUrl = !loading
              ? (matchedCategory?.image_url || meta.bannerImage)
              : null;
            if (!imageUrl) return null;
            return (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 z-0"
              >
                <img
                  src={imageUrl}
                  alt={meta.title}
                  className="h-full w-full object-cover object-center"
                />
              </motion.div>
            );
          })()}

          <div
            className="absolute inset-0 z-1 rounded-3xl"
            style={{
              background: (matchedCategory?.image_url || meta.bannerImage)
                ? "linear-gradient(to right, rgba(10,10,15,0.88) 0%, rgba(10,10,15,0.6) 50%, rgba(10,10,15,0.15) 100%)"
                : "rgba(0,0,0,0.3)",
            }}
          />
          <div
            className="absolute -top-10 -left-10 w-48 h-48 rounded-full blur-3xl opacity-30 pointer-events-none z-1"
            style={{ backgroundColor: meta.accentColor }}
          />
          <div
            className="absolute bottom-0 left-0 right-0 h-0.5 opacity-60 z-1"
            style={{ background: `linear-gradient(to right, ${meta.accentColor}, transparent)` }}
          />
          <div className="relative z-10 p-8 md:p-12 max-w-2xl flex flex-col justify-center min-h-[220px]">
            <div className="space-y-4">
              {/* Premium Top Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-[10px] font-bold tracking-widest uppercase text-white/95 w-fit">
                <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ backgroundColor: meta.accentColor || "#FF6A00" }} />
                Premium Qatar Collection
              </div>

              {/* Heading */}
              <h1 className="text-3xl md:text-5xl font-extrabold tracking-wider uppercase leading-tight">
                {meta.title.includes("&") ? (
                  <>
                    {meta.title.split("&")[0]}
                    <span style={{ color: meta.accentColor || "#FF6A00" }}> & </span>
                    {meta.title.split("&")[1]}
                  </>
                ) : meta.title}
              </h1>

              {/* Tagline */}
              <p className="text-xs md:text-sm text-white/85 leading-relaxed max-w-md font-medium tracking-wide">
                {meta.tagline}
              </p>

              {/* Professional Benefit Blocks */}
              {meta.benefits && meta.benefits.length > 0 && (
                <div className="flex flex-wrap gap-5 pt-3">
                  {meta.benefits.map((benefit, i) => (
                    <div key={i} className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10 backdrop-blur-xs">
                        {getBenefitIcon(benefit.iconName, meta.accentColor || "#FF6A00")}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-white tracking-wide leading-tight">{benefit.title}</span>
                        <span className="text-[9px] text-white/60 font-semibold tracking-wide mt-0.5">{benefit.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Subcategories Horizontal Scroll/Chips */}
        {categorySubcategories.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar scroll-smooth">
            <Link
              href={`/category/${slug}`}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border cursor-pointer ${
                !subParam
                  ? "bg-orange-50 border-orange-500 text-orange-600 shadow-sm"
                  : "bg-white border-gray-200 text-gray-700 hover:border-orange-200 hover:text-orange-500"
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              All Products
            </Link>
            {categorySubcategories.map((sub) => {
              const isSelected = subParam === sub.slug || sub.href?.endsWith(`?sub=${subParam}`);
              return (
                <Link
                  key={sub.id}
                  href={`/category/${slug}?sub=${sub.slug}`}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border cursor-pointer ${
                    isSelected
                      ? "bg-orange-50 border-orange-500 text-orange-600 shadow-sm"
                      : "bg-white border-gray-200 text-gray-700 hover:border-orange-200 hover:text-orange-500"
                  }`}
                >
                  {getSubcategoryIcon(sub.slug)}
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
                  <span className="text-xs font-bold" style={{ color: "#FF6A00" }}>QAR {maxPrice === 1000000 ? categoryMaxPrice : maxPrice}</span>
                </div>
                <input
                  type="range" min="0" max={categoryMaxPrice} step={categoryMaxPrice > 5000 ? 100 : 50} value={maxPrice === 1000000 ? categoryMaxPrice : maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  style={{ accentColor: "#FF6A00" }}
                />
                <div className="flex justify-between text-[10px] text-gray-400 mt-1 font-semibold">
                  <span>QAR 0</span><span>QAR {categoryMaxPrice}</span>
                </div>
              </div>

              {/* Ratings Filter */}
              <div>
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">Min Rating</h4>
                <div className="space-y-2">
                  {[5, 4, 3, 2].map((rating) => {
                    const isSelected = minRating === rating;
                    return (
                      <button
                        key={rating}
                        onClick={() => setMinRating(rating)}
                        className={`flex w-full items-center justify-between text-xs py-2 px-3 rounded-xl transition-all border cursor-pointer ${
                          isSelected
                            ? "bg-orange-50/50 border-orange-200 text-orange-600 font-semibold"
                            : "bg-transparent border-transparent text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <div className="flex items-center gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className="h-3.5 w-3.5"
                                style={{
                                  fill: i < rating ? "#FF6A00" : "transparent",
                                  color: i < rating ? "#FF6A00" : "#d1d5db",
                                }}
                              />
                            ))}
                          </div>
                          <span className={isSelected ? "text-orange-600" : "text-gray-400 font-medium"}>& Up</span>
                        </div>
                      </button>
                    );
                  })}

                  <div className="pt-2">
                    <button
                      onClick={() => setMinRating(0)}
                      className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all text-center cursor-pointer ${
                        minRating === 0
                          ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
                          : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200/50"
                      }`}
                    >
                      Any Rating
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Catalog view grid */}
          <div id="category-products-grid" className="lg:col-span-3 space-y-6">
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
                <div className="flex-1 relative">
                  <button
                    type="button"
                    onClick={() => setOpenSortDropdown(!openSortDropdown)}
                    className="w-full flex items-center justify-between gap-1.5 px-4 py-2.5 bg-white border border-orange-500/20 hover:border-orange-500/50 rounded-xl text-xs font-bold text-gray-700 cursor-pointer shadow-sm text-left"
                  >
                    <span>
                      {sortBy === "featured" && "Sort: Featured"}
                      {sortBy === "price-low-to-high" && "Sort: Lowest Price"}
                      {sortBy === "price-high-to-low" && "Sort: Highest Price"}
                      {sortBy === "rating" && "Sort: Top Rated"}
                    </span>
                    <ChevronDown size={14} className={`text-gray-400 shrink-0 transition-transform ${openSortDropdown ? "rotate-180 text-orange-500" : ""}`} />
                  </button>

                  {openSortDropdown && (
                    <>
                      <div className="fixed inset-0 z-40 bg-transparent cursor-default" onClick={() => setOpenSortDropdown(false)} />
                      <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-100 rounded-xl shadow-xl z-50 py-1 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                        <button
                          type="button"
                          onClick={() => { setSortBy("featured"); setOpenSortDropdown(false); }}
                          className={`w-full text-left px-3 py-2 text-xs font-semibold ${sortBy === "featured" ? "text-orange-500 bg-orange-50/50 font-bold" : "text-gray-700 hover:bg-orange-50 hover:text-orange-500"}`}
                        >
                          Sort: Featured
                        </button>
                        <button
                          type="button"
                          onClick={() => { setSortBy("price-low-to-high"); setOpenSortDropdown(false); }}
                          className={`w-full text-left px-3 py-2 text-xs font-semibold ${sortBy === "price-low-to-high" ? "text-orange-500 bg-orange-50/50 font-bold" : "text-gray-700 hover:bg-orange-50 hover:text-orange-500"}`}
                        >
                          Sort: Lowest Price
                        </button>
                        <button
                          type="button"
                          onClick={() => { setSortBy("price-high-to-low"); setOpenSortDropdown(false); }}
                          className={`w-full text-left px-3 py-2 text-xs font-semibold ${sortBy === "price-high-to-low" ? "text-orange-500 bg-orange-50/50 font-bold" : "text-gray-700 hover:bg-orange-50 hover:text-orange-500"}`}
                        >
                          Sort: Highest Price
                        </button>
                        <button
                          type="button"
                          onClick={() => { setSortBy("rating"); setOpenSortDropdown(false); }}
                          className={`w-full text-left px-3 py-2 text-xs font-semibold ${sortBy === "rating" ? "text-orange-500 bg-orange-50/50 font-bold" : "text-gray-700 hover:bg-orange-50 hover:text-orange-500"}`}
                        >
                          Sort: Top Rated
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>

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

            {/* Active Filter Chips */}
            {(subParam || minRating > 0 || maxPrice < 1000000) && (
              <div className="flex flex-wrap gap-2 items-center py-2 animate-in fade-in duration-200">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mr-1">Active Filters:</span>
                
                {subParam && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-100 text-xs font-semibold text-orange-600">
                    Subcategory: {subCategories.find(s => s.slug === subParam || s.href?.endsWith(`?sub=${subParam}`))?.title || subParam}
                    <Link href={`/category/${slug}`} className="hover:text-orange-850 focus:outline-none ml-1 cursor-pointer">
                      <X className="h-3.5 w-3.5" />
                    </Link>
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

                <button
                  onClick={handleResetFilters}
                  className="text-xs font-bold text-gray-500 hover:text-orange-500 underline ml-2 cursor-pointer transition-colors"
                >
                  Clear All
                </button>
              </div>
            )}

            {/* Product card loop */}
            {loading ? (
              <div className={`grid gap-0 divide-x divide-y divide-gray-200 border border-gray-200 sm:gap-6 sm:border-0 sm:divide-none ${
                viewMode === "list" ? "grid-cols-1" : "grid-cols-2 md:grid-cols-3"
              }`}>
                {Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)}
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className={`grid gap-0 divide-x divide-y divide-gray-200 border border-gray-200 sm:gap-6 sm:border-0 sm:divide-none ${
                viewMode === "list" ? "grid-cols-1" : "grid-cols-2 md:grid-cols-3"
              }`}>
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
                    <span className="text-xs font-bold" style={{ color: "#FF6A00" }}>QAR {maxPrice === 1000000 ? categoryMaxPrice : maxPrice}</span>
                  </div>
                  <input
                    type="range" min="0" max={categoryMaxPrice} step={categoryMaxPrice > 5000 ? 100 : 50} value={maxPrice === 1000000 ? categoryMaxPrice : maxPrice}
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