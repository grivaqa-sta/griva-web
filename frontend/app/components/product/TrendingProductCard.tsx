"use client";

import { ApiProduct } from "@/app/types/types";
import Image from "next/image";
import Link from "next/link";
import Rating from "../rating/Rating";
import { Heart, ShoppingCart } from "lucide-react";
import { useWishlist } from "@/app/context/WishlistContext";
import { useCart } from "@/app/context/CartContext";

const ORANGE = "#FF6A00";
const INK = "#0D0D0D";

export default function TrendingProductCard({
  product,
}: {
  product?: ApiProduct;
}) {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();

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
      oldPrice: product.old_price
        ? `QAR ${formatPrice(product.old_price)}`
        : undefined,
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
      return null;
    } else if (stock >= 1 && stock <= 5) {
      return (
        <span className="text-amber-500 flex items-center gap-1 text-[10px]">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block"></span>
          Low Stock ({stock})
        </span>
      );
    } else {
      return (
        <span className="text-red-500 flex items-center gap-1 text-[10px]">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block"></span>
          Out of Stock
        </span>
      );
    }
  };

  const productLink = `/product/${product.slug}`;

  return (
    <div className="w-full h-full">
      {/* ── MOBILE CARD: flush, portrait layout ── */}
      <div className="sm:hidden group relative flex flex-col bg-white border border-[#E5E7EB] rounded-lg overflow-hidden w-full p-2.5">
        <Link href={productLink} className="flex flex-col w-full">
          {/* Square image area */}
          <div className="relative w-full bg-gray-50/50 rounded-md overflow-hidden" style={{ paddingBottom: "100%" }}>
            {/* Badges — top-left */}
            <div className="absolute left-2 top-2 z-10 flex items-center gap-1">
              {(product.discount_percentage ?? 0) > 0 && (
                <span
                  className="rounded px-1.5 py-0.5 text-[8px] font-bold text-white uppercase tracking-wide"
                  style={{ backgroundColor: ORANGE }}
                >
                  {product.discount_percentage}% OFF
                </span>
              )}
              {product.is_trending && (
                <span className="rounded bg-gray-950 px-1.5 py-0.5 text-[8px] font-bold text-white uppercase tracking-wide">
                  HOT
                </span>
              )}
            </div>

            {/* Heart top-right */}
            <button
              onClick={handleWishlistToggle}
              className="absolute right-2 top-2 z-20 rounded-full bg-white p-1.5 shadow-sm border border-[#E5E7EB] cursor-pointer"
              aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            >
              <Heart
                size={12}
                className={isWishlisted ? "fill-red-500 text-red-500" : "text-[#0D0D0D]"}
              />
            </button>

            {/* Images */}
            <Image
              src={product.main_image_url}
              alt={product.title}
              fill
              priority
              className="object-contain p-4"
            />
          </div>

          {/* Info area */}
          <div className="flex flex-col pt-2 pb-1 gap-1">
            <div className="text-[9px] font-semibold uppercase tracking-wider text-gray-400 h-3.5 overflow-hidden">
              {product.brand && product.brand.trim() !== "" ? product.brand : "\u00A0"}
            </div>
            <h3 className="text-xs font-semibold leading-snug text-gray-900 line-clamp-2 h-8">
              {product.title}
            </h3>

            {/* Rating */}
            <div className="flex items-center gap-1 h-4 overflow-hidden">
              {(() => {
                const count = product.review_count ?? 0;
                if (count === 0) {
                  return (
                    <span className="text-[8px] font-bold text-orange-500 bg-orange-50 px-1 py-0.2 rounded border border-orange-100">
                      New Arrival
                    </span>
                  );
                } else {
                  return (
                    <>
                      <Rating rating={product.rating} />
                      <span className="text-[9px] text-gray-400">({count})</span>
                    </>
                  );
                }
              })()}
            </div>

            {/* Stock status */}
            <div className="h-4 flex items-center my-0.5">
              {getStockStatus()}
            </div>

            <div className="flex items-center justify-between mt-1">
              <div className="flex flex-col leading-tight">
                <span className="text-xs sm:text-sm font-extrabold text-[#0D0D0D]">
                  QAR {formatPrice(product.price)}
                </span>
                {product.old_price && (
                  <span className="text-[10px] text-gray-400 line-through decoration-gray-400 font-medium">
                    QAR {formatPrice(product.old_price)}
                  </span>
                )}
              </div>
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex items-center justify-center rounded bg-orange-500 p-2 text-white active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all shrink-0"
                aria-label="Add to cart"
              >
                <ShoppingCart size={12} strokeWidth={2.2} />
              </button>
            </div>
          </div>
        </Link>
      </div>

      {/* ── DESKTOP CARD: original design stable ── */}
      <div className="hidden sm:block w-full">
        <div
          className="group relative flex flex-row items-stretch rounded-lg border border-[#E5E7EB] bg-white transition-colors duration-200 overflow-hidden"
        >
          {/* Discount Badge + HOT — desktop */}
          <div className="absolute left-3 top-3 z-20 flex gap-1">
            {(product.discount_percentage ?? 0) > 0 && (
              <span
                className="rounded px-1.5 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider"
                style={{ backgroundColor: ORANGE }}
              >
                {product.discount_percentage}% OFF
              </span>
            )}
            {product.is_trending && (
              <span className="rounded bg-gray-950 px-1.5 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider">
                HOT
              </span>
            )}
          </div>

          {/* Heart */}
          <button
            onClick={handleWishlistToggle}
            className="absolute right-2.5 top-2.5 z-20 rounded-full bg-white p-1.5 shadow-sm border border-[#E5E7EB] text-gray-500 hover:text-red-500 transition-colors duration-200 cursor-pointer"
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart
              size={13}
              className={isWishlisted ? "fill-red-500 text-red-500" : "text-[#0D0D0D]"}
            />
          </button>

          {/* Desktop image */}
          <Link href={productLink} className="relative flex h-[170px] w-[150px] shrink-0 items-center justify-center bg-gray-50/50 p-3 pt-10">
            <Image
              src={product.main_image_url}
              alt={product.title}
              width={120}
              height={120}
              priority
              className="object-contain transition-all duration-500 max-h-[120px]"
              style={{ width: "auto", height: "auto" }}
            />
          </Link>

          {/* Desktop content */}
          <div className="flex flex-1 flex-col justify-center px-4 py-3 min-w-0 gap-1.5">
            <div className="text-[9px] font-semibold uppercase tracking-wider text-gray-400 h-3.5 overflow-hidden">
              {product.brand && product.brand.trim() !== "" ? product.brand : "\u00A0"}
            </div>
            <Link href={productLink}>
              <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-gray-900 group-hover:text-orange-500 transition-colors">
                {product.title}
              </h3>
            </Link>

            <div className="flex items-center gap-1.5 h-4 overflow-hidden">
              {(() => {
                const count = product.review_count ?? 0;
                if (count === 0) {
                  return (
                    <span className="text-[8px] font-bold text-orange-500 bg-orange-50 px-1.5 py-0.5 rounded border border-orange-200">
                      New Arrival
                    </span>
                  );
                } else {
                  return (
                    <>
                      <Rating rating={product.rating} />
                      <span className="text-[9px] text-gray-400">({count})</span>
                    </>
                  );
                }
              })()}
            </div>

            {/* Stock Display */}
            <div className="h-4 flex items-center">
              {getStockStatus()}
            </div>

            <div className="flex items-center justify-between mt-1">
              <div className="flex flex-col leading-tight">
                <span className="text-base font-extrabold text-[#0D0D0D]">
                  QAR {formatPrice(product.price)}
                </span>
                {product.old_price && (
                  <span className="text-[11px] text-gray-400 line-through decoration-gray-400 font-medium">
                    QAR {formatPrice(product.old_price)}
                  </span>
                )}
              </div>
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex items-center justify-center rounded bg-orange-500 p-2 text-white hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all shrink-0 shadow-sm"
                aria-label="Add to cart"
              >
                <ShoppingCart size={13} strokeWidth={2.2} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}