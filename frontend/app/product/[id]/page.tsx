"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
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
import ProductGallery from "@/app/components/product/ProductGallery";
import ProductCard from "@/app/components/product/ProductCard";
import ScrollReveal from "@/app/components/common/ScrollReveal";

interface ProductPageProps {
  params: Promise<{ id: string }>;
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
  const { id: paramId } = React.use(params);
  const productId = parseInt(paramId);

  const { product, loading } = useProduct(productId);
  const { products: allProducts } = useAllProducts();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<"desc" | "specs" | "reviews">("desc");

  const [freeShippingThreshold, setFreeShippingThreshold] = useState(150);
  const [reviewsList, setReviewsList] = useState<any[]>([]);

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
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reviews/product/${productId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.reviews) {
            setReviewsList(data.reviews);
          }
        }
      } catch {}
    };
    if (productId) {
      fetchReviews();
    }
  }, [productId]);

  // Loading state — full page skeleton
  if (loading) return <ProductSkeleton />;

  // Not found
  if (!product) {
    notFound();
  }

  const isWishlisted = isInWishlist(product.id);

  // Gallery images — use gallery_images or fall back to main_image_url
  const galleryImages =
    product.gallery_images && product.gallery_images.length > 0
      ? product.gallery_images
      : [product.main_image_url];

  // Related products — same subcategory, exclude current
  const relatedProducts = allProducts
    .filter(
      (p) => p.subcategory_id === product.subcategory_id && p.id !== product.id
    )
    .slice(0, 4);

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
      category: "Product",
      selectedColor: selectedColor || undefined,
      selectedStorage: selectedSize || undefined,
      quantity,
    });
  };

  const handleWishlistToggle = () => {
    toggleWishlist({
      id: product.id,
      title: product.title,
      image: product.main_image_url,
      price: `QAR ${formatPrice(product.price)}`,
      oldPrice: product.old_price ? `QAR ${formatPrice(product.old_price)}` : undefined,
      rating: product.rating,
      category: "Product",
    });
  };

  return (
    <div className="bg-gray-50/50 min-h-screen py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <div className="text-xs text-gray-500 mb-6 flex items-center gap-1.5">
          <Link href="/" className="hover:text-orange-500 transition-colors">Home</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-orange-500 transition-colors">Shop</Link>
          <span>/</span>
          <span className="text-gray-900 truncate max-w-[200px]">{product.title}</span>
        </div>

        {/* Core Product Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          {/* Left Panel: Gallery */}
          <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <ProductGallery images={galleryImages} title={product.title} />
          </div>

          {/* Right Panel: Buying Panel */}
          <div className="lg:col-span-6 flex flex-col justify-between bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm">
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
                  const count = product.review_count ?? 0;
                  if (count === 0) {
                    return (
                      <>
                        <span className="text-[10px] font-bold text-orange-500 bg-orange-50 px-2.5 py-1 rounded border border-orange-200">
                          New Arrival
                        </span>
                        <span 
                          onClick={() => setActiveTab("reviews")}
                          className="text-xs font-semibold text-gray-500 hover:underline cursor-pointer"
                        >
                          Be first to review
                        </span>
                      </>
                    );
                  } else if (count >= 1 && count <= 4) {
                    return (
                      <>
                        <div className="flex items-center gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < Math.round(product.rating)
                                  ? "fill-orange-400 text-orange-400"
                                  : "text-gray-200"
                              }`}
                            />
                          ))}
                        </div>
                        <span 
                          onClick={() => setActiveTab("reviews")}
                          className="text-xs font-semibold text-gray-500 hover:underline cursor-pointer"
                        >
                          {count} {count === 1 ? "Review" : "Reviews"}
                        </span>
                        <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2.5 py-1 rounded border border-blue-200">
                          Early Reviews
                        </span>
                      </>
                    );
                  } else {
                    return (
                      <>
                        <div className="flex items-center gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < Math.round(product.rating)
                                  ? "fill-orange-400 text-orange-400"
                                  : "text-gray-200"
                              }`}
                            />
                          ))}
                        </div>
                        <span 
                          onClick={() => setActiveTab("reviews")}
                          className="text-xs font-semibold text-gray-500 hover:underline cursor-pointer"
                        >
                          {count} Reviews
                        </span>
                      </>
                    );
                  }
                })()}
                <span className="text-gray-300">|</span>
                <span className="text-xs font-semibold text-green-600">
                  {product.stock > 0 ? `In Stock (${product.stock} left)` : "Out of Stock"}
                </span>
              </div>

              {/* Price Panel */}
              <div className="mt-6 flex items-baseline gap-3 border-b pb-6">
                <span className="text-3xl font-extrabold text-orange-500">
                  QAR {formatPrice(product.price)}
                </span>
                {product.old_price && (
                  <span className="text-base text-gray-400 line-through font-medium">
                    QAR {formatPrice(product.old_price)}
                  </span>
                )}
                {(product.discount_percentage ?? 0) > 0 && (
                  <span className="text-xs font-bold text-white bg-orange-500 px-2 py-0.5 rounded-full">
                    -{product.discount_percentage}%
                  </span>
                )}
              </div>

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
                  <span className="font-semibold text-gray-700">30-Day Returns</span>
                  <span>100% money back</span>
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

        {/* Tabbed Product Details */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8 mb-12">
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
              <div className="max-w-xl">
                {product.specifications && product.specifications.length > 0 ? (
                  <dl className="divide-y divide-gray-100">
                    {product.specifications.map((spec) => (
                      <div key={spec.name} className="py-3.5 grid grid-cols-3 gap-4 text-sm">
                        <dt className="font-semibold text-gray-500">{spec.name}</dt>
                        <dd className="font-medium text-gray-900 col-span-2">{spec.value}</dd>
                      </div>
                    ))}
                  </dl>
                ) : (
                  <p className="text-sm text-gray-500">No specifications listed for this product.</p>
                )}
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="space-y-4 max-w-2xl py-2 text-sm text-gray-600">
                {reviewsList.length === 0 ? (
                  <div className="text-center py-8 text-sm text-gray-500">
                    No reviews yet. Be the first to review this product!
                  </div>
                ) : (
                  reviewsList.map((review) => (
                    <div key={review.id} className="bg-gray-50/50 rounded-2xl border p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-bold text-gray-900">{review.title || "User Review"}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">By {review.user?.email || "Customer"}</p>
                        </div>
                        <div className="flex gap-0.5 text-orange-500 font-black">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <span key={i}>{i < review.rating ? "★" : "☆"}</span>
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-600 mt-1 leading-relaxed">{review.body}</p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <ScrollReveal>
            <div className="mb-12">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Related Products</h2>
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {relatedProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          </ScrollReveal>
        )}
      </div>
    </div>
  );
}
