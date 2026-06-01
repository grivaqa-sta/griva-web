"use client";

import React, { useState } from "react";
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
import { products } from "@/app/data/data";
import { useCart } from "@/app/context/CartContext";
import { useWishlist } from "@/app/context/WishlistContext";
import ProductGallery from "@/app/components/product/ProductGallery";
import ReviewCard from "@/app/components/product/ReviewCard";
import ProductCard from "@/app/components/product/ProductCard";
import ScrollReveal from "@/app/components/common/ScrollReveal";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default function ProductPage({ params }: ProductPageProps) {
  const { id: paramId } = React.use(params);
  const productId = parseInt(paramId);

  const product = products.find((p) => p.id === productId);
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedStorage, setSelectedStorage] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<"desc" | "specs" | "reviews">("desc");

  if (!product) {
    notFound();
  }

  // Set default variants if not set
  if (!selectedColor && product.colors && product.colors.length > 0) {
    setSelectedColor(product.colors[0].name);
  }
  if (!selectedStorage && product.storageOptions && product.storageOptions.length > 0) {
    setSelectedStorage(product.storageOptions[0].label);
  }

  const isWishlisted = isInWishlist(product.id);

  // Gallery images array
  const galleryImages = product.images && product.images.length > 0
    ? product.images
    : [product.image];

  // Related products
  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const handleQuantityIncrement = () => setQuantity((prev) => prev + 1);
  const handleQuantityDecrement = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      title: product.title,
      image: product.image,
      price: product.price,
      category: product.category,
      selectedColor: selectedColor || undefined,
      selectedStorage: selectedStorage || undefined,
      quantity,
    });
  };

  const handleWishlistToggle = () => {
    toggleWishlist({
      id: product.id,
      title: product.title,
      image: product.image,
      price: product.price,
      oldPrice: product.oldPrice,
      rating: product.rating,
      category: product.category,
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
              {/* Category */}
              <span className="text-xs font-bold text-orange-500 uppercase tracking-widest bg-orange-50 px-2.5 py-1 rounded-full">
                {product.category}
              </span>

              {/* Title */}
              <h1 className="mt-4 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                {product.title}
              </h1>

              {/* Ratings Summary */}
              <div className="mt-3 flex items-center gap-3">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < product.rating
                          ? "fill-orange-400 text-orange-400"
                          : "text-gray-200"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs font-semibold text-gray-500 hover:underline cursor-pointer">
                  {product.reviewCount ?? 0} Reviews
                </span>
                <span className="text-gray-300">|</span>
                <span className="text-xs font-semibold text-green-600">
                  {product.stock && product.stock > 0 ? `In Stock (${product.stock} left)` : "Out of Stock"}
                </span>
              </div>

              {/* Price Panel */}
              <div className="mt-6 flex items-baseline gap-3 border-b pb-6">
                <span className="text-3xl font-extrabold text-orange-500">
                  {product.price}
                </span>
                {product.oldPrice && (
                  <span className="text-base text-gray-400 line-through font-medium">
                    {product.oldPrice}
                  </span>
                )}
              </div>

              {/* Variant Selector: Colors */}
              {product.colors && product.colors.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">
                    Select Color: <span className="text-gray-500 font-semibold">{selectedColor}</span>
                  </h3>
                  <div className="flex items-center gap-3">
                    {product.colors.map((color) => (
                      <button
                        key={color.name}
                        onClick={() => setSelectedColor(color.name)}
                        className={`h-8 w-8 rounded-full border-2 transition-all cursor-pointer ${
                          selectedColor === color.name
                            ? "border-orange-500 scale-110 ring-4 ring-orange-100"
                            : "border-gray-200 hover:scale-105"
                        }`}
                        style={{ backgroundColor: color.hex }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Variant Selector: Storage/Sizes */}
              {product.storageOptions && product.storageOptions.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">
                    Select Storage: <span className="text-gray-500 font-semibold">{selectedStorage}</span>
                  </h3>
                  <div className="flex flex-wrap gap-2.5">
                    {product.storageOptions.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setSelectedStorage(opt.label)}
                        className={`px-4 py-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                          selectedStorage === opt.label
                            ? "border-orange-500 bg-orange-50 text-orange-500 font-bold"
                            : "border-gray-200 text-gray-700 bg-white hover:bg-gray-50"
                        }`}
                      >
                        {opt.label}
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
                  <span className="w-12 text-center text-sm font-bold text-gray-800">
                    {quantity}
                  </span>
                  <button
                    onClick={handleQuantityIncrement}
                    className="flex h-10 w-10 items-center justify-center text-gray-500 hover:bg-orange-50 hover:text-orange-500 transition rounded-r-xl cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Actions Grid */}
            <div className="mt-8 pt-6 border-t space-y-3">
              <div className="flex gap-4">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-orange-500 py-3.5 text-sm font-semibold text-white hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/10 cursor-pointer"
                >
                  <ShoppingCart className="h-4 w-4" />
                  Add to Cart
                </button>
                <button
                  onClick={handleWishlistToggle}
                  className={`flex h-12. w-12. items-center justify-center rounded-xl border transition-all cursor-pointer ${
                    isWishlisted
                      ? "border-red-200 bg-red-50 text-red-500"
                      : "border-gray-200 hover:bg-gray-50 text-gray-400 hover:text-gray-600"
                  }`}
                >
                  <Heart className={`h-5 w-5 ${isWishlisted ? "fill-red-500" : ""}`} />
                </button>
              </div>

              {/* Protection / Returns badges */}
              <div className="grid grid-cols-3 gap-2.5 pt-4 text-[10px] text-gray-500">
                <div className="flex flex-col items-center text-center p-2 rounded-lg bg-gray-50/50">
                  <Truck className="h-4 w-4 text-orange-500 mb-1" />
                  <span className="font-semibold text-gray-700">Free Shipping</span>
                  <span>Orders over $50</span>
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

        {/* Tabbed Product Details Area */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8 mb-12">
          {/* Tabs header */}
          <div className="flex border-b border-gray-100 gap-6">
            <button
              onClick={() => setActiveTab("desc")}
              className={`pb-4 text-sm font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === "desc"
                  ? "border-orange-500 text-orange-500 font-extrabold"
                  : "border-transparent text-gray-500 hover:text-gray-800"
              }`}
            >
              Description
            </button>
            <button
              onClick={() => setActiveTab("specs")}
              className={`pb-4 text-sm font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === "specs"
                  ? "border-orange-500 text-orange-500 font-extrabold"
                  : "border-transparent text-gray-500 hover:text-gray-800"
              }`}
            >
              Specifications
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`pb-4 text-sm font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === "reviews"
                  ? "border-orange-500 text-orange-500 font-extrabold"
                  : "border-transparent text-gray-500 hover:text-gray-800"
              }`}
            >
              Reviews ({product.reviews?.length ?? 0})
            </button>
          </div>

          {/* Tabs contents */}
          <div className="py-6">
            {activeTab === "desc" && (
              <div className="text-sm text-gray-600 leading-relaxed max-w-4xl space-y-4">
                <p>{product.description || "No description provided for this product."}</p>
                <p>Designed to fit perfectly into your digital lifestyle, this device combines top-notch performance with advanced utility features that meet and exceed professional standards.</p>
              </div>
            )}

            {activeTab === "specs" && (
              <div className="max-w-xl">
                {product.specs && product.specs.length > 0 ? (
                  <dl className="divide-y divide-gray-100">
                    {product.specs.map((spec) => (
                      <div key={spec.label} className="py-3.5 grid grid-cols-3 gap-4 text-sm">
                        <dt className="font-semibold text-gray-500">{spec.label}</dt>
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
              <div>
                {product.reviews && product.reviews.length > 0 ? (
                  <div className="space-y-2">
                    {product.reviews.map((rev) => (
                      <ReviewCard key={rev.id} review={rev} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-sm text-gray-500">
                    No reviews yet. Be the first to review this product!
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Related Products Grid */}
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
