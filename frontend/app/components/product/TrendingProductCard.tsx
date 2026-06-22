"use client";

import { ApiProduct } from "@/app/types/types";
import Image from "next/image";
import Link from "next/link";
import Rating from "../rating/Rating";
import { Heart, ShoppingCart } from "lucide-react";
import { useWishlist } from "@/app/context/WishlistContext";
import { useCart } from "@/app/context/CartContext";
import { motion } from "framer-motion";

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
      category: "Product",
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
      category: "Product",
      quantity: 1,
    });
  };

  const productLink = `/product/${product.id}`;

  return (
    <>
      {/* ── MOBILE CARD: flush, no rounded corners, portrait layout ── */}
      <Link
        href={productLink}
        className="sm:hidden group relative flex flex-col bg-white border-0 overflow-hidden w-full"
      >
        {/* Square image area */}
        <div className="relative w-full bg-gray-50" style={{ paddingBottom: "100%" }}>
          {/* Badges — same row, top-left */}
          <div className="absolute left-2 top-2 z-10 flex items-center gap-1">
            {product.discount_percentage && product.discount_percentage > 0 && (
              <span className="rounded bg-orange-500 px-1.5 py-0.5 text-[9px] font-extrabold text-white uppercase tracking-wide">
                -{product.discount_percentage}%
              </span>
            )}
            {product.is_trending && (
              <span className="rounded bg-gray-900 px-1.5 py-0.5 text-[9px] font-extrabold text-white uppercase tracking-wide">
                HOT
              </span>
            )}
          </div>

          {/* Heart top-right */}
          <button
            onClick={handleWishlistToggle}
            className="absolute right-2 top-2 z-20 rounded-full bg-white p-1.5 shadow-sm border border-gray-100 cursor-pointer"
          >
            <Heart
              size={13}
              className={isWishlisted ? "fill-red-500 text-red-500" : "text-gray-400"}
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
          {product.gallery_images && product.gallery_images.length > 0 && (
            <Image
              src={product.gallery_images[0]}
              alt={`${product.title} Alternate`}
              fill
              className="object-contain p-4 opacity-0 pointer-events-none"
            />
          )}
        </div>

        {/* Info area */}
        <div className="flex flex-col px-2.5 pt-2 pb-2.5 gap-0.5">
          {product.brand && product.brand.trim() !== "" && (
            <p className="text-[9px] font-semibold uppercase tracking-widest text-gray-400 truncate">
              {product.brand}
            </p>
          )}
          <h3 className="text-[11px] font-semibold leading-snug text-gray-900 line-clamp-2 min-h-[2.4em]">
            {product.title}
          </h3>
          {/* Rating */}
          <div className="flex items-center gap-1.5 flex-wrap min-h-[20px] mt-0.5">
            {(() => {
              const count = product.review_count ?? 0;
              if (count === 0) {
                return (
                  <span className="text-[9px] font-bold text-orange-500 bg-orange-50 px-1.5 py-0.5 rounded border border-orange-200">
                    New Arrival
                  </span>
                );
              } else if (count >= 1 && count <= 4) {
                return (
                  <>
                    <Rating rating={product.rating} />
                    <span className="text-[9px] text-gray-400">
                      ({count})
                    </span>
                    <span className="text-[8px] font-bold text-blue-500 bg-blue-50 px-1 py-0.5 rounded border border-blue-200 scale-90 origin-left">
                      Early Reviews
                    </span>
                  </>
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
          <div className="flex items-end justify-between mt-1">
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-bold text-orange-500">
                QAR {formatPrice(product.price)}
              </span>
              {product.old_price && (
                <span className="text-[9px] text-gray-400 line-through">
                  QAR {formatPrice(product.old_price)}
                </span>
              )}
            </div>
            <button
              onClick={handleAddToCart}
              className="flex items-center justify-center rounded-lg bg-orange-500 p-2 text-white active:scale-95 transition-all duration-150 cursor-pointer shadow-sm shrink-0"
              aria-label="Add to cart"
            >
              <ShoppingCart size={13} strokeWidth={2.2} />
            </button>
          </div>
        </div>
      </Link>

      {/* ── DESKTOP CARD: original design unchanged ── */}
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
        className="hidden sm:block w-full"
      >
        <Link
          href={productLink}
          className="group relative flex flex-row items-stretch rounded-xl border border-gray-100 bg-white shadow-sm hover:shadow-md hover:border-orange-200 transition-all duration-200 overflow-hidden"
        >
          {/* Discount Badge + HOT — desktop */}
          <div className="absolute left-3 top-3 z-20 flex gap-1">
            {product.discount_percentage && product.discount_percentage > 0 && (
              <span className="rounded bg-orange-500 px-2 py-0.5 text-[9px] font-extrabold text-white uppercase tracking-wide">
                -{product.discount_percentage}%
              </span>
            )}
            {product.is_trending && (
              <span className="rounded bg-gray-900 px-2 py-0.5 text-[9px] font-extrabold text-white uppercase tracking-wide">
                HOT
              </span>
            )}
          </div>

          {/* Heart */}
          <button
            onClick={handleWishlistToggle}
            className="absolute right-2.5 top-2.5 z-20 rounded-full bg-white p-1.5 shadow-sm border border-gray-100 hover:text-red-500 text-gray-400 transition-colors duration-200 cursor-pointer"
          >
            <motion.div whileTap={{ scale: 0.8 }}>
              <Heart
                size={14}
                className={isWishlisted ? "fill-red-500 text-red-500" : "text-gray-400"}
              />
            </motion.div>
          </button>

          {/* Desktop image */}
          <div className="relative flex h-[170px] w-[150px] shrink-0 items-center justify-center bg-gray-50/80 p-3 pt-10">
            <Image
              src={product.main_image_url}
              alt={product.title}
              width={120}
              height={120}
              priority
              className={`object-contain transition-all duration-500 ${product.gallery_images && product.gallery_images.length > 0
                  ? "group-hover:opacity-0 group-hover:scale-95"
                  : "group-hover:scale-105"
                }`}
              style={{ width: "auto", height: "auto", maxHeight: "120px" }}
            />
            {product.gallery_images && product.gallery_images.length > 0 && (
              <Image
                src={product.gallery_images[0]}
                alt={`${product.title} Alternate`}
                width={120}
                height={120}
                className="absolute inset-0 m-auto object-contain opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500 pointer-events-none"
                style={{ width: "auto", height: "auto", maxHeight: "120px" }}
              />
            )}
          </div>

          {/* Desktop content */}
          <div className="flex flex-1 flex-col justify-center px-4 py-4 min-w-0 gap-1.5">
            {product.brand && product.brand.trim() !== "" && (
              <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                {product.brand}
              </p>
            )}
            <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-gray-900 group-hover:text-orange-500 transition-colors">
              {product.title}
            </h3>
            <div className="flex items-center justify-between mt-1">
              <div className="flex flex-col leading-tight">
                <div className="flex items-center gap-1.5 flex-wrap mb-0.5 min-h-[20px]">
                  {(() => {
                    const count = product.review_count ?? 0;
                    if (count === 0) {
                      return (
                        <span className="text-[9px] font-bold text-orange-500 bg-orange-50 px-1.5 py-0.5 rounded border border-orange-200">
                          New Arrival
                        </span>
                      );
                    } else if (count >= 1 && count <= 4) {
                      return (
                        <>
                          <Rating rating={product.rating} />
                          <span className="text-[10px] text-gray-400">
                            ({count})
                          </span>
                          <span className="text-[8px] font-bold text-blue-500 bg-blue-50 px-1 py-0.5 rounded border border-blue-200 scale-90 origin-left">
                            Early Reviews
                          </span>
                        </>
                      );
                    } else {
                      return (
                        <>
                          <Rating rating={product.rating} />
                          <span className="text-[10px] text-gray-400">({count})</span>
                        </>
                      );
                    }
                  })()}
                </div>
                <span className="text-base font-bold text-orange-500">
                  QAR {formatPrice(product.price)}
                </span>
                {product.old_price && (
                  <span className="text-[11px] text-gray-400 line-through">
                    QAR {formatPrice(product.old_price)}
                  </span>
                )}
              </div>
              <button
                onClick={handleAddToCart}
                className="flex items-center justify-center rounded-lg bg-orange-500 p-2.5 text-white hover:bg-orange-600 active:scale-95 transition-all duration-150 cursor-pointer shadow-sm shrink-0"
                aria-label="Add to cart"
              >
                <ShoppingCart size={14} strokeWidth={2.2} />
              </button>
            </div>
          </div>
        </Link>
      </motion.div>
    </>
  );
}