"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import {
  Heart,
  ShoppingCart,
  ShieldCheck,
  Truck,
  RotateCcw,
  Plus,
  Minus,
  Star,
} from "lucide-react";
import { useProduct, useAllProducts } from "@/app/hooks/useProducts";
import { useCart } from "@/app/context/CartContext";
import { useWishlist } from "@/app/context/WishlistContext";
import { subCategoryService } from "@/app/services/subCategory.service";
import { useUser } from "@/app/context/UserContext";
import { useToast } from "@/app/context/ToastContext";
import { api } from "@/app/lib/axios";
import ProductGallery from "@/app/components/product/ProductGallery";
import ProductCard from "@/app/components/product/ProductCard";
import ScrollReveal from "@/app/components/common/ScrollReveal";
import { trackViewContent, trackAddToCart } from "@/app/components/common/PixelScripts";
import ProductSchema from "@/components/seo/ProductSchema";
import BreadcrumbSchema from "@/components/seo/BreadcrumbSchema";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

// Full-page skeleton while product loads
function ProductSkeleton() {
  return (
    <div className="bg-gray-50/50 min-h-screen py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 animate-pulse">
        <div className="h-4 w-48 rounded bg-gray-100 mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm h-[420px]" />
          <div className="lg:col-span-6 bg-white rounded-2xl p-8 border border-gray-100 shadow-sm space-y-4">
            <div className="h-4 w-24 rounded bg-gray-100" />
            <div className="h-8 w-3/4 rounded bg-gray-100" />
            <div className="h-4 w-1/2 rounded bg-gray-100" />
            <div className="h-10 w-1/3 rounded bg-gray-100" />
            <div className="h-12 rounded-xl bg-gray-100 mt-8" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductPage({ params }: ProductPageProps) {
  const { slug } = React.use(params);
  const router = useRouter();

  const { product, loading } = useProduct(slug);
  const { products: allProducts } = useAllProducts();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { isAuthenticated } = useUser();
  const { toast } = useToast();

  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [subCategories, setSubCategories] = useState<any[]>([]);

  useEffect(() => {
    async function loadSubCategories() {
      try {
        const subRes = await subCategoryService.getSubCategories();
        const sData = subRes?.data || subRes;
        setSubCategories(Array.isArray(sData) ? sData : []);
      } catch (err) {
        console.error("Failed to load subcategories in product page:", err);
      }
    }
    loadSubCategories();
  }, []);
  const [quantity, setQuantity] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<"desc" | "specs" | "reviews">("desc");

  const [freeShippingThreshold, setFreeShippingThreshold] = useState(150);
  const [reviewsList, setReviewsList] = useState<any[]>([]);

  const [submittingReview, setSubmittingReview] = useState(false);
  const [newRating, setNewRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [newBody, setNewBody] = useState<string>("");

  const reviewsTabRef = React.useRef<HTMLDivElement>(null);

  const handleScrollToReviews = () => {
    setActiveTab("reviews");
    setTimeout(() => {
      reviewsTabRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const averageRating = React.useMemo(() => {
    if (reviewsList.length === 0) return product?.rating ? parseFloat(Number(product.rating).toFixed(1)) : 0;
    const sum = reviewsList.reduce((acc, r) => acc + r.rating, 0);
    return parseFloat((sum / reviewsList.length).toFixed(1));
  }, [reviewsList, product?.rating]);

  const ratingDistribution = React.useMemo(() => {
    const counts = [0, 0, 0, 0, 0];
    reviewsList.forEach((r) => {
      const rating = Math.min(5, Math.max(1, Math.round(r.rating)));
      counts[rating - 1]++;
    });
    return counts;
  }, [reviewsList]);

  const formatAuthorName = (email?: string) => {
    if (!email) return "Verified Customer";
    const parts = email.split("@");
    if (!parts[0]) return "Verified Customer";
    return parts[0]
      .split(/[\._-]/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const getInitials = (email?: string) => {
    if (!email) return "VC";
    const formatted = formatAuthorName(email);
    const parts = formatted.split(" ");
    if (parts.length >= 2) {
      return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
  };

  const renderStars = (rating: number, size = "h-4 w-4") => {
    return (
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => {
          const diff = rating - i;
          if (diff >= 1) {
            return (
              <Star
                key={i}
                className={`${size} fill-amber-400 text-amber-400`}
              />
            );
          } else if (diff > 0) {
            return (
              <div key={i} className="relative inline-block">
                <Star className={`${size} text-gray-200`} />
                <div className="absolute top-0 left-0 overflow-hidden w-[50%]">
                  <Star className={`${size} fill-amber-400 text-amber-400`} />
                </div>
              </div>
            );
          } else {
            return (
              <Star
                key={i}
                className={`${size} text-gray-200`}
              />
            );
          }
        })}
      </div>
    );
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBody.trim()) {
      toast.error("Please enter review details.");
      return;
    }
    setSubmittingReview(true);
    try {
      const res = await api.post("/reviews", {
        product_id: product?.id,
        rating: newRating,
        title: null,
        body: newBody,
      });
      toast.success("Review posted successfully!");
      setNewRating(5);
      setNewBody("");
      
      // Refresh reviews list
      if (product?.id) {
        const reviewsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reviews/product/${product.id}`);
        if (reviewsRes.ok) {
          const data = await reviewsRes.json();
          if (data.reviews) {
            setReviewsList(data.reviews);
          }
        }
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.error || "Failed to post review. Please try again.");
    } finally {
      setSubmittingReview(false);
    }
  };

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings`);
        if (res.ok) {
          const data = await res.json();
          if (data.settings?.freeShippingThreshold) {
            setFreeShippingThreshold(parseFloat(data.settings.freeShippingThreshold));
          }
        }
      } catch {}
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!product?.id) return;
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reviews/product/${product.id}`);
        if (res.ok) {
          const data = await res.json();
          if (data.reviews) {
            setReviewsList(data.reviews);
          }
        }
      } catch {}
    };
    fetchReviews();
  }, [product?.id]);

  // Related products — prioritizing:
  // 1. Same subcategory
  // 2. Same main category (via parent category_id of subcategory)
  // 3. General fallback (other products in catalog)
  const relatedProducts = React.useMemo(() => {
    if (!product) return [];

    // Find current subcategory details
    const currentSubcat = subCategories.find((s) => s.id === product.subcategory_id);
    const categoryId = currentSubcat?.category_id;

    // Find all subcategories belonging to the same category
    const siblingSubcategoryIds = categoryId
      ? subCategories.filter((s) => s.category_id === categoryId).map((s) => s.id)
      : [];

    // 1. Same subcategory (excluding current product)
    const sameSubcat = allProducts.filter(
      (p) => p.subcategory_id === product.subcategory_id && p.id !== product.id
    );

    // 2. Sibling subcategories in the same main category (excluding current and sameSubcat)
    const sameCategory = allProducts.filter(
      (p) =>
        siblingSubcategoryIds.includes(p.subcategory_id) &&
        p.id !== product.id &&
        !sameSubcat.some((x) => x.id === p.id)
    );

    // 3. Fallback to any other products (excluding current, sameSubcat, and sameCategory)
    const generalFallback = allProducts.filter(
      (p) =>
        p.id !== product.id &&
        !sameSubcat.some((x) => x.id === p.id) &&
        !sameCategory.some((x) => x.id === p.id)
    );

    return [...sameSubcat, ...sameCategory, ...generalFallback].slice(0, 6);
  }, [product, allProducts, subCategories]);

  // Fire ViewContent pixel event when product loads
  useEffect(() => {
    if (product) {
      const price = parseFloat(String(product.price || "0").replace(/[^0-9.]/g, ""));
      trackViewContent(product.id, product.title, price);
    }
  }, [product?.id]);

  // Loading state — full page skeleton
  if (loading) return <ProductSkeleton />;

  // Not found
  if (!product) {
    notFound();
  }

  const isWishlisted = isInWishlist(product.id);

  // Gallery images — combine main_image_url and gallery_images, filtering duplicates
  const galleryImages = Array.from(
    new Set([product.main_image_url, ...(product.gallery_images || [])].filter(Boolean))
  );

  // Color variants — filter variants where color is defined
  const colorVariants = (product.variants || []).filter((v) => v.color);

  // Set defaults if not yet selected
  if (!selectedColor && colorVariants.length > 0) {
    setSelectedColor(colorVariants[0].color!);
  }

  const formatPrice = (price?: string | number) => {
    if (!price) return "0.00";
    return Number(price).toFixed(2);
  };

  const handleQuantityIncrement = () => setQuantity((prev) => (product && prev < product.stock ? prev + 1 : prev));
  const handleQuantityDecrement = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      title: product.title,
      image: product.main_image_url,
      price: `QAR ${formatPrice(product.price)}`,
      category: product.brand || "Product",
      selectedColor: selectedColor || undefined,
      selectedStorage: selectedSize || undefined,
      quantity,
      slug: product.slug,
    });
    // Fire AddToCart pixel event
    const price = parseFloat(String(product.price || "0").replace(/[^0-9.]/g, ""));
    trackAddToCart(product.id, product.title, price * quantity);
  };

  const handleBuyNow = () => {
    if (typeof window !== "undefined") {
      const buyNowItem = {
        productId: product.id,
        title: product.title,
        image: product.main_image_url,
        price: `QAR ${formatPrice(product.price)}`,
        priceNumber: product.price,
        quantity,
        category: product.brand || "Product",
        selectedColor: selectedColor || undefined,
        selectedStorage: selectedSize || undefined,
        slug: product.slug,
      };
      sessionStorage.setItem("griva-buynow-item", JSON.stringify(buyNowItem));
    }
    router.push("/checkout?buyNow=true");
  };

  const handleWishlistToggle = () => {
    toggleWishlist({
      id: product.id,
      title: product.title,
      image: product.main_image_url,
      price: `QAR ${formatPrice(product.price)}`,
      oldPrice: product.old_price ? `QAR ${formatPrice(product.old_price)}` : undefined,
      rating: product.rating,
      category: product.brand || "Product",
      slug: product.slug,
    });
  };

  const productMetaDesc = product.short_description || product.description?.substring(0, 155) || `Buy ${product.title} at GriVA Qatar. Premium electronics with same day delivery in Doha and COD options.`;
  const canonicalUrl = `https://thegriva.com/product/${product.slug || slug}`;
  const breadcrumbItems = [
    { name: "Home", path: "/" },
    { name: "Shop", path: "/shop" },
    { name: product.title, path: `/product/${product.slug || slug}` }
  ];

  return (
    <div className="bg-white min-h-screen pt-8 pb-0 sm:pb-8">
      <title>{product.title} — QAR {formatPrice(product.price)} | GriVA Qatar</title>
      <meta name="description" content={productMetaDesc} />
      <link rel="canonical" href={canonicalUrl} />
      <ProductSchema product={product} />
      <BreadcrumbSchema items={breadcrumbItems} />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <div className="text-xs text-gray-500 mb-6 flex items-center gap-1.5">
          <Link href="/" className="hover:text-orange-500 transition-colors">Home</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-orange-500 transition-colors">Shop</Link>
          <span>/</span>
          <span className="text-gray-900 truncate max-w-[200px]">{product.title}</span>
        </div>

        {/* Unified Premium Card */}
        <div className="bg-white rounded-[32px] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 md:p-10 mb-12 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            {/* Left Column: Gallery */}
            <div className="lg:col-span-6">
              <ProductGallery images={galleryImages} title={product.title} />
            </div>

            {/* Right Column: Buying Panel */}
            <div className="lg:col-span-6 flex flex-col justify-between">
            <div>
              {/* Brand badge */}
              {product.brand && (
                <span className="text-xs font-bold text-orange-500 uppercase tracking-widest bg-orange-50 px-2.5 py-1 rounded-full">
                  {product.brand}
                </span>
              )}

              {/* Title */}
              <h1 className="mt-4 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                {product.title}
              </h1>

              {/* Ratings Summary */}
              <div className="mt-3 flex items-center gap-3">
                {(() => {
                  const count = reviewsList.length > 0 ? reviewsList.length : (product.review_count ?? 0);
                  if (count === 0) {
                    return (
                      <>
                        <span className="text-[10px] font-bold text-orange-500 bg-orange-50 px-2.5 py-1 rounded border border-orange-200">
                          New Arrival
                        </span>
                        <span 
                          onClick={handleScrollToReviews}
                          className="text-xs font-semibold text-gray-500 hover:underline cursor-pointer"
                        >
                          Be first to review
                        </span>
                      </>
                    );
                  } else if (count >= 1 && count <= 4) {
                    return (
                      <>
                        <div 
                          onClick={handleScrollToReviews}
                          className="flex items-center gap-0.5 cursor-pointer"
                        >
                          {renderStars(averageRating, "h-4 w-4")}
                        </div>
                        <span 
                          onClick={handleScrollToReviews}
                          className="text-xs font-semibold text-gray-500 hover:underline cursor-pointer"
                        >
                          {count} {count === 1 ? "Review" : "Reviews"}
                        </span>
                        <span 
                          onClick={handleScrollToReviews}
                          className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2.5 py-1 rounded border border-blue-200 cursor-pointer"
                        >
                          Early Reviews
                        </span>
                      </>
                    );
                  } else {
                    return (
                      <>
                        <div 
                          onClick={handleScrollToReviews}
                          className="flex items-center gap-0.5 cursor-pointer"
                        >
                          {renderStars(averageRating, "h-4 w-4")}
                        </div>
                        <span 
                          onClick={handleScrollToReviews}
                          className="text-xs font-semibold text-gray-500 hover:underline cursor-pointer"
                        >
                          {count} Reviews
                        </span>
                      </>
                    );
                  }
                })()}
                {product.stock === 0 ? (
                  <>
                    <span className="text-gray-300">|</span>
                    <span className="text-xs font-semibold text-red-500">
                      Out of Stock
                    </span>
                  </>
                ) : product.stock <= 5 ? (
                  <>
                    <span className="text-gray-300">|</span>
                    <span className="text-xs font-semibold text-amber-500">
                      Low Stock (only {product.stock} left)
                    </span>
                  </>
                ) : null}
              </div>

              {/* Price Panel */}
              <div className="mt-6 flex items-baseline gap-3 border-b pb-6 flex-wrap">
                <span className="text-2xl sm:text-3xl font-extrabold text-black whitespace-nowrap">
                  QAR {formatPrice(product.price)}
                </span>
                {product.old_price && (
                  <span className="text-sm sm:text-base text-gray-400 line-through font-medium whitespace-nowrap">
                    QAR {formatPrice(product.old_price)}
                  </span>
                )}
                {(product.discount_percentage ?? 0) > 0 && (
                  <span className="text-[10px] sm:text-xs font-bold text-white bg-orange-500 px-2 py-0.5 rounded uppercase tracking-wider whitespace-nowrap">
                    {product.discount_percentage}% OFF
                  </span>
                )}
              </div>

              {/* Product Short Description */}
              {(product.short_description || product.description) && (
                <div className="mt-6 text-sm text-gray-600 leading-relaxed border-b pb-6">
                  <p>{product.short_description || product.description}</p>
                </div>
              )}

              {/* Color Variants */}
              {colorVariants.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">
                    Select Color: <span className="text-gray-500 font-semibold">{selectedColor}</span>
                  </h3>
                  <div className="flex items-center gap-3 flex-wrap">
                    {colorVariants.map((v) => (
                      <button
                        key={v.color}
                        onClick={() => setSelectedColor(v.color!)}
                        title={v.color}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                          selectedColor === v.color
                            ? "border-orange-500 bg-orange-50 text-orange-500 font-bold"
                            : "border-gray-200 text-gray-700 bg-white hover:bg-gray-50"
                        }`}
                      >
                        {v.color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size Variants */}
              {(product.variants || []).some((v) => v.size) && (
                <div className="mt-6">
                  <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">
                    Select Size: <span className="text-gray-500 font-semibold">{selectedSize}</span>
                  </h3>
                  <div className="flex flex-wrap gap-2.5">
                    {(product.variants || [])
                      .filter((v) => v.size)
                      .map((v) => (
                        <button
                          key={v.size}
                          onClick={() => setSelectedSize(v.size!)}
                          className={`px-4 py-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                            selectedSize === v.size
                              ? "border-orange-500 bg-orange-50 text-orange-500 font-bold"
                              : "border-gray-200 text-gray-700 bg-white hover:bg-gray-50"
                          }`}
                        >
                          {v.size}
                        </button>
                      ))}
                  </div>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="mt-6">
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">
                  Quantity:
                </h3>
                <div className="flex items-center rounded-xl border border-gray-200 w-fit bg-white">
                  <button
                    onClick={handleQuantityDecrement}
                    className="flex h-10 w-10 items-center justify-center text-gray-500 hover:bg-orange-50 hover:text-orange-500 transition rounded-l-xl cursor-pointer"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-12 text-center text-sm font-bold text-gray-800">{quantity}</span>
                  <button
                    onClick={handleQuantityIncrement}
                    className="flex h-10 w-10 items-center justify-center text-gray-500 hover:bg-orange-50 hover:text-orange-500 transition rounded-r-xl cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 pt-6 border-t space-y-3">
              <div className="flex gap-4">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-orange-500 py-3.5 text-sm font-semibold text-white hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/10 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingCart className="h-4 w-4" />
                  {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                </button>
                <button
                  onClick={handleWishlistToggle}
                  className={`flex h-12 w-12 items-center justify-center rounded-xl border transition-all cursor-pointer ${
                    isWishlisted
                      ? "border-red-200 bg-red-50 text-red-500"
                      : "border-gray-200 hover:bg-gray-50 text-gray-400 hover:text-gray-600"
                  }`}
                >
                  <Heart className={`h-5 w-5 ${isWishlisted ? "fill-red-500" : ""}`} />
                </button>
              </div>

              {/* Trust badges */}
              <div className="grid grid-cols-3 gap-2.5 pt-4 text-[10px] text-gray-500">
                <div className="flex flex-col items-center text-center p-2 rounded-lg bg-gray-50/50">
                  <Truck className="h-4 w-4 text-orange-500 mb-1" />
                  <span className="font-semibold text-gray-700">Free Shipping</span>
                  <span>Orders over QAR {freeShippingThreshold.toFixed(0)}</span>
                </div>
                <div className="flex flex-col items-center text-center p-2 rounded-lg bg-gray-50/50">
                  <RotateCcw className="h-4 w-4 text-orange-500 mb-1" />
                  <span className="font-semibold text-gray-700">7-Day Returns</span>
                  <span>7 days return only</span>
                </div>
                <div className="flex flex-col items-center text-center p-2 rounded-lg bg-gray-50/50">
                  <ShieldCheck className="h-4 w-4 text-orange-500 mb-1" />
                  <span className="font-semibold text-gray-700">Full Warranty</span>
                  <span>Guaranteed quality</span>
                </div>
              </div>
            </div>
            </div>
          </div>
        </div>

        {/* Tabbed Product Details */}
        <div ref={reviewsTabRef} className="bg-white rounded-[24px] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 md:p-8 mb-12 w-full">
          <div className="flex border-b border-gray-100 gap-6">
            {(["desc", "specs", "reviews"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 text-sm font-bold border-b-2 transition-all cursor-pointer ${
                  activeTab === tab
                    ? "border-orange-500 text-orange-500 font-extrabold"
                    : "border-transparent text-gray-500 hover:text-gray-800"
                }`}
              >
                {tab === "desc" ? "Description" : tab === "specs" ? "Specifications" : `Reviews (${reviewsList.length})`}
              </button>
            ))}
          </div>

          <div className="py-6">
            {activeTab === "desc" && (
              <div className="text-sm text-gray-600 leading-relaxed max-w-4xl space-y-4">
                <p>{product.description || product.short_description || "No description provided for this product."}</p>
              </div>
            )}

            {activeTab === "specs" && (
              <div className="max-w-2xl overflow-hidden rounded-2xl border border-gray-100 shadow-sm bg-white">
                {product.specifications && product.specifications.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100 text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-1/3">
                            Specification
                          </th>
                          <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-2/3">
                            Detail
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-150 bg-white">
                        {product.specifications.map((spec, index) => (
                          <tr key={spec.name} className={index % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                            <td className="px-6 py-4 font-semibold text-gray-700 whitespace-nowrap">
                              {spec.name}
                            </td>
                            <td className="px-6 py-4 font-medium text-gray-900 whitespace-pre-wrap">
                              {spec.value}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-6 text-center text-sm text-gray-500">
                    No specifications listed for this product.
                  </div>
                )}
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full">
                {/* Left Column: Dashboard and Write Review */}
                <div className="lg:col-span-4 space-y-6">
                  {/* Ratings Summary Dashboard */}
                  <div className="bg-gray-50/50 rounded-2xl border border-gray-100 p-6 space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className="text-4xl font-extrabold text-gray-900">
                          {averageRating}
                        </div>
                        <div className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mt-1">
                          out of 5
                        </div>
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center">
                          {renderStars(averageRating, "h-4 w-4")}
                        </div>
                        <div className="text-xs text-gray-500 font-medium">
                          Based on {reviewsList.length} {reviewsList.length === 1 ? "rating" : "ratings"}
                        </div>
                      </div>
                    </div>

                    {/* Progress bars */}
                    <div className="space-y-2.5 border-t pt-4 border-gray-100">
                      {[5, 4, 3, 2, 1].map((stars) => {
                        const count = ratingDistribution[stars - 1];
                        const percentage = reviewsList.length > 0 ? (count / reviewsList.length) * 100 : 0;
                        return (
                          <div key={stars} className="flex items-center gap-3 text-xs">
                            <span className="w-10 text-gray-600 font-bold flex items-center gap-1 justify-end">
                              {stars} <Star className="h-3 w-3 fill-amber-400 text-amber-400 inline" />
                            </span>
                            <div className="flex-1 h-2 bg-gray-200/60 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-amber-400 rounded-full transition-all duration-500"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="w-8 text-gray-400 text-right">
                              {Math.round(percentage)}%
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Write a Review Section */}
                  <div className="border border-gray-200/80 rounded-2xl p-6 bg-white shadow-sm h-fit">
                    <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4">
                      Write a Review
                    </h3>
                    {isAuthenticated ? (
                      <form onSubmit={handleSubmitReview} className="space-y-4">
                        {/* Star rating picker */}
                        <div>
                          <label className="block text-[10px] font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Rating</label>
                          <div 
                            className="flex items-center gap-1"
                            onMouseLeave={() => setHoverRating(null)}
                          >
                            {Array.from({ length: 5 }).map((_, i) => {
                              const starValue = i + 1;
                              const isFilled = hoverRating !== null ? starValue <= hoverRating : starValue <= newRating;
                              return (
                                <button
                                  key={i}
                                  type="button"
                                  onClick={() => setNewRating(starValue)}
                                  onMouseEnter={() => setHoverRating(starValue)}
                                  className="focus:outline-none transition-transform active:scale-110 p-0.5"
                                >
                                  <Star
                                    className={`h-6 w-6 transition-all ${
                                      isFilled
                                        ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_2px_rgba(245,158,11,0.2)]"
                                        : "text-gray-200 hover:text-gray-300"
                                    }`}
                                  />
                                </button>
                              );
                            })}
                          </div>
                        </div>


                        {/* Body textarea */}
                        <div>
                          <label className="block text-[10px] font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Review Details</label>
                          <textarea
                            rows={4}
                            placeholder="Write your comments here..."
                            value={newBody}
                            onChange={(e) => setNewBody(e.target.value)}
                            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-xs text-black bg-white outline-none focus:ring-1 focus:ring-black focus:border-black placeholder:text-gray-400 transition-all"
                            required
                          />
                        </div>

                        {/* Submit Button */}
                        <button
                          type="submit"
                          disabled={submittingReview}
                          className="w-full bg-black hover:bg-neutral-900 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-black/10 active:scale-[0.98] transition-all text-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                          {submittingReview ? "Posting Review..." : "Submit Review"}
                        </button>
                      </form>
                    ) : (
                      <div className="text-center py-6">
                        <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                          You need to be logged in to write a review.
                        </p>
                        <Link
                          href={`/auth/login?redirect=/product/${product.slug}`}
                          className="inline-block w-full text-center bg-black hover:bg-neutral-900 text-white font-semibold py-2.5 px-4 rounded-xl text-xs shadow-md shadow-black/10 transition-all cursor-pointer"
                        >
                          Login to Review
                        </Link>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column: Review List */}
                <div className="lg:col-span-8 space-y-4">
                  <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">
                    Customer Reviews ({reviewsList.length})
                  </h3>
                  {reviewsList.length === 0 ? (
                    <div className="text-center py-12 border rounded-2xl bg-gray-50/20 text-xs text-gray-500">
                      No reviews yet. Be the first to review this product!
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-[720px] overflow-y-auto pr-2">
                      {reviewsList.map((review) => {
                        const dateString = review.createdAt
                          ? new Date(review.createdAt).toLocaleDateString(undefined, {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })
                          : "Recently";
                        const authorName = formatAuthorName(review.user?.email);
                        const initials = getInitials(review.user?.email);

                        return (
                          <div
                            key={review.id}
                            className="bg-white rounded-2xl border border-gray-100 p-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-md transition-all duration-300 flex gap-4 items-start"
                          >
                            {/* Avatar */}
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm">
                              {initials}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                                <div>
                                  <h4 className="font-bold text-gray-900 text-sm truncate max-w-[200px]">
                                    {authorName}
                                  </h4>
                                  <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="text-[10px] text-gray-400">{dateString}</span>
                                    {review.verified && (
                                      <span className="inline-flex items-center gap-0.5 text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded font-semibold border border-green-100">
                                        <svg
                                          className="h-3 w-3 fill-current"
                                          viewBox="0 0 20 20"
                                        >
                                          <path
                                            fillRule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                            clipRule="evenodd"
                                          />
                                        </svg>
                                        Verified Buyer
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="flex gap-0.5">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-3.5 w-3.5 ${
                                        i < review.rating
                                          ? "fill-amber-400 text-amber-400"
                                          : "text-gray-200"
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>

                              <p className="text-gray-600 leading-relaxed text-xs">
                                {review.body}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <ScrollReveal>
            <div className="mb-0 sm:mb-12 w-full">
              <h2 className="text-xl font-bold text-gray-900 mb-6">You May Also Like</h2>
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-0 divide-x divide-y divide-gray-200 border border-gray-200 sm:gap-6 sm:border-0 sm:divide-none">
                {relatedProducts.map((p, idx) => (
                  <div key={p.id} className={idx >= 4 ? "lg:hidden" : ""}>
                    <ProductCard product={p} />
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        )}

        {/* Spacing for mobile sticky action bar */}
        <div className="h-14 sm:hidden" aria-hidden="true" />
      </div>

      {/* Mobile Sticky Bottom Action Bar (Only visible on mobile) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 p-3 shadow-[0_-4px_12px_rgba(0,0,0,0.08)] sm:hidden flex items-center gap-3 pb-safe">
        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-orange-500 py-3 text-sm font-semibold text-orange-500 hover:bg-orange-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <ShoppingCart size={16} />
          Add to Cart
        </button>
        <button
          onClick={handleBuyNow}
          disabled={product.stock === 0}
          className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-orange-500 py-3 text-sm font-semibold text-white hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-md shadow-orange-500/20"
        >
          Buy Now
        </button>
      </div>
    </div>
  );
}
