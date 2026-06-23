"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { ApiProduct } from "@/app/types/types";
import Rating from "../rating/Rating";
import { useCart } from "@/app/context/CartContext";
import { useWishlist } from "@/app/context/WishlistContext";

const ORANGE = "#FF6A00";
const INK = "#0D0D0D";

export default function ProductCard({ product }: { product?: ApiProduct }) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  if (!product) return null;

  const isWishlisted = isInWishlist(product.id);

  const formatPrice = (price?: string | number) => {
    if (!price) return null;
    const value = typeof price === "string" ? Number(price) : price;
    if (Number.isNaN(value)) return String(price);
    return value.toFixed(2);
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist({
      id: product.id,
      title: product.title,
      image: product.main_image_url,
      price: `QAR ${formatPrice(product.price)}`,
      oldPrice: product.old_price ? `QAR ${formatPrice(product.old_price)}` : undefined,
      rating: product.rating,
      category: product.brand || "Product",
      stock: product.stock,
    });
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id: product.id,
      title: product.title,
      image: product.main_image_url,
      price: `QAR ${formatPrice(product.price)}`,
      category: product.brand || "Product",
      quantity: 1,
    });
  };

  const getStockStatus = () => {
    const stock = product.stock ?? 0;
    if (stock > 5) {
      return (
        <span className="text-green-600 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-green-600 inline-block"></span>
          In Stock ({stock})
        </span>
      );
    } else if (stock >= 1 && stock <= 5) {
      return (
        <span className="text-amber-500 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>
          Low Stock ({stock})
        </span>
      );
    } else {
      return (
        <span className="text-red-500 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-red-500 inline-block"></span>
          Out of Stock
        </span>
      );
    }
  };

  return (
    <div
      className="group relative flex flex-col h-full bg-white p-3 border border-[#E5E7EB] rounded-lg transition-colors duration-200 overflow-hidden"
    >
      {/* ── Heart Icon (Top Right) ── */}
      <button
        onClick={handleWishlistToggle}
        className="absolute right-2.5 top-2.5 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white border border-[#ECECEC] shadow-sm text-gray-500 hover:text-red-500 transition-colors duration-200 cursor-pointer"
        aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
      >
        <Heart
          size={14}
          className={`transition-colors duration-200 ${
            isWishlisted ? "fill-red-500 text-red-500" : "text-[#0D0D0D]"
          }`}
        />
      </button>

      <Link href={`/product/${product.id}`} className="flex flex-col h-full">
        {/* ── Product Image ── */}
        <div className="relative flex h-[140px] sm:h-[180px] w-full items-center justify-center overflow-hidden rounded-md bg-gray-50/50 p-4 transition-all duration-300">
          {/* ── Offer Badge (Top Left) ── */}
          {(product.discount_percentage ?? 0) > 0 && (
            <div
              className="absolute left-2.5 top-2.5 z-20 rounded px-1.5 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider"
              style={{ backgroundColor: ORANGE }}
            >
              {product.discount_percentage}% OFF
            </div>
          )}

          <div className="relative w-full h-full flex items-center justify-center">
            <Image
              src={product.main_image_url}
              alt={product.title}
              width={160}
              height={160}
              priority
              className={`relative z-10 h-auto max-h-[110px] sm:max-h-[140px] w-auto object-contain transition-all duration-500 ${
                product.gallery_images && product.gallery_images.length > 0
                  ? "group-hover:opacity-0 group-hover:scale-95 group-hover:pointer-events-none"
                  : "group-hover:scale-105"
              }`}
            />
            {product.gallery_images && product.gallery_images.length > 0 && (
              <Image
                src={product.gallery_images[0]}
                alt={`${product.title} Alternate`}
                width={160}
                height={160}
                className="absolute inset-0 z-10 m-auto h-auto max-h-[110px] sm:max-h-[140px] w-auto object-contain opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500 pointer-events-none"
              />
            )}
          </div>
        </div>

        {/* ── Content ── */}
        <div className="mt-3 flex flex-col flex-grow gap-1">
          {/* Brand */}
          <div className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-gray-400 h-4.5 overflow-hidden">
            {product.brand && product.brand.trim() !== "" ? product.brand : "\u00A0"}
          </div>

          {/* Title */}
          <h3 className="line-clamp-2 text-xs sm:text-sm font-semibold leading-snug text-gray-900 h-8 sm:h-10">
            {product.title}
          </h3>

          {/* Rating / New Arrival Badge */}
          <div className="flex items-center gap-1.5 h-5 my-0.5 overflow-hidden">
            {(() => {
              const count = product.review_count ?? 0;
              if (count === 0) {
                return (
                  <span className="text-[8px] sm:text-[9px] font-bold text-orange-500 bg-orange-50 px-1.5 py-0.5 rounded border border-orange-200">
                    New Arrival
                  </span>
                );
              } else {
                return (
                  <>
                    <Rating rating={product.rating} />
                    <span className="text-[9px] font-medium text-gray-400">
                      ({count})
                    </span>
                  </>
                );
              }
            })()}
          </div>

          {/* Price */}
          <div className="flex items-center gap-2 h-6 my-1">
            <span className="text-sm sm:text-base font-extrabold text-[#0D0D0D]">
              QAR {formatPrice(product.price)}
            </span>
            {product.old_price && (
              <span className="text-[11px] sm:text-xs text-gray-400 line-through decoration-gray-400 font-medium">
                QAR {formatPrice(product.old_price)}
              </span>
            )}
          </div>

          {/* Stock Display */}
          <div className="flex items-center text-[10px] sm:text-xs font-semibold h-5 mb-2">
            {getStockStatus()}
          </div>
        </div>
      </Link>

      {/* ── Add to Cart Button (Full Width) ── */}
      <button
        onClick={handleAddToCart}
        disabled={product.stock === 0}
        className="w-full py-2 px-4 rounded border text-xs sm:text-sm font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        style={{
          borderColor: product.stock === 0 ? "#E5E7EB" : "#ECECEC",
          color: product.stock === 0 ? "#9CA3AF" : INK,
          backgroundColor: product.stock === 0 ? "#F3F4F6" : "transparent"
        }}
        onMouseEnter={(e) => {
          if (product.stock === 0) return;
          e.currentTarget.style.backgroundColor = ORANGE;
          e.currentTarget.style.borderColor = ORANGE;
          e.currentTarget.style.color = "#fff";
          e.currentTarget.style.boxShadow = "0 10px 20px rgba(255,106,0,0.2)";
        }}
        onMouseLeave={(e) => {
          if (product.stock === 0) return;
          e.currentTarget.style.backgroundColor = "transparent";
          e.currentTarget.style.borderColor = "#ECECEC";
          e.currentTarget.style.color = INK;
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
      </button>
    </div>
  );
}