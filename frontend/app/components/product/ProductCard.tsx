"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { ApiProduct } from "@/app/types/types";
import Rating from "../rating/Rating";
import { useCart } from "@/app/context/CartContext";
import { useWishlist } from "@/app/context/WishlistContext";
import { motion } from "framer-motion";

export default function ProductCard({
  product,
}: {
  product?: ApiProduct;
}) {
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

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.25 }}
      className="group relative flex flex-col overflow-hidden rounded-[22px] border border-gray-200 bg-white p-3 shadow-[0_8px_30px_rgba(15,23,42,0.04)] transition-all duration-300 hover:border-orange-300 hover:shadow-[0_20px_45px_rgba(249,115,22,0.12)] sm:rounded-[28px] sm:p-4"
    >
      <Link
        href={`/product/${product.id}`}
        className="flex flex-col"
      >
        {/* Wishlist */}
        <button
          onClick={handleWishlistToggle}
          className="absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-all duration-300 hover:scale-105 hover:text-red-500 sm:right-5 sm:top-5 sm:h-10 sm:w-10"
        >
          <motion.div whileTap={{ scale: 0.85 }}>
            <Heart
              size={16}
              className={`transition-colors duration-300 sm:h-[18px] sm:w-[18px] ${
                isWishlisted
                  ? "fill-red-500 text-red-500"
                  : "text-gray-400"
              }`}
            />
          </motion.div>
        </button>

        {/* Image Section */}
        <div className="relative flex h-[170px] items-center justify-center overflow-hidden rounded-[18px] bg-gradient-to-br from-blue-200 via-orange-200 to-blue-100 p-4 sm:h-[240px] sm:rounded-[24px] sm:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.08),transparent_45%)]" />

          {/* Discount badge */}
          {product.discount_percentage && product.discount_percentage > 0 ? (
            <div className="absolute left-3 top-3 max-w-[70%] truncate rounded-full bg-orange-500 px-2 py-1 text-[8px] font-bold uppercase tracking-wider text-white shadow-sm sm:left-4 sm:top-4 sm:px-3 sm:text-[10px]">
              -{product.discount_percentage}%
            </div>
          ) : (
            <div className="absolute left-3 top-3 max-w-[70%] truncate rounded-full bg-white px-2 py-1 text-[8px] font-semibold uppercase tracking-wider text-orange-500 shadow-sm sm:left-4 sm:top-4 sm:max-w-none sm:px-3 sm:text-[10px]">
              {product.brand || "Product"}
            </div>
          )}

          <Image
            src={product.main_image_url}
            alt={product.title}
            width={160}
            height={160}
            priority
            className="relative z-10 h-auto max-h-[120px] w-auto object-contain transition-transform duration-500 group-hover:scale-110 sm:max-h-[165px]"
          />
        </div>

        {/* Content */}
        <div className="mt-4 flex flex-col gap-2 sm:mt-5 sm:gap-3">
          {/* Mobile */}
          <div className="sm:hidden">
            <h3 className="truncate text-[13px] font-semibold text-gray-900 transition-colors duration-300 group-hover:text-orange-500">
              {product.title}
            </h3>

            <div className="mt-1 flex items-center gap-2 overflow-hidden whitespace-nowrap">
              {/* Current Price */}
              <div className="flex items-center gap-1 leading-none">
                <span className="relative top-[1px] text-[11px] font-bold uppercase text-red-500">
                  QAR
                </span>

                <span className="text-[18px] font-bold tracking-tight text-orange-500">
                  {formatPrice(product.price)}
                </span>
              </div>

              {/* Old Price */}
              {product.old_price && (
                <div className="flex items-center leading-none text-gray-400 line-through">
                  <span className="mr-1 flex items-center self-center text-[9px] font-semibold uppercase text-gray-400">
                    QAR
                  </span>

                  <span className="text-[11px] font-medium">
                    {formatPrice(product.old_price)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Desktop */}
          <div className="hidden sm:block">
            {/* Title - Single Line */}
            <h3 className="truncate text-[15px] font-semibold leading-6 tracking-[-0.02em] text-gray-900 transition-colors duration-300 group-hover:text-orange-500">
              {product.title}
            </h3>

            {/* Prices - Same Row */}
            <div className="mt-2 flex items-center justify-between gap-3">
              {product.old_price ? (
                <div className="flex items-center leading-none text-gray-400 line-through">
                  <span className="mr-1 flex items-center self-center text-[10px] font-semibold uppercase text-gray-400">
                    QAR
                  </span>

                  <span className="text-sm font-medium">
                    {formatPrice(product.old_price)}
                  </span>
                </div>
              ) : (
                <div />
              )}

              <div className="flex shrink-0 items-center whitespace-nowrap leading-none">
                <span className="mr-1 flex items-center self-center text-[15px] font-bold uppercase text-red-500">
                  QAR
                </span>

                <span className="text-xl font-bold tracking-tight text-orange-500">
                  {formatPrice(product.price)}
                </span>
              </div>
            </div>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1 sm:gap-2">
            <Rating rating={product.rating} />

            <span className="text-[10px] font-medium text-gray-400 sm:text-xs">
              ({product.review_count || 0})
            </span>
          </div>
        </div>
      </Link>

      {/* Mobile Button */}
      <div className="mt-4 sm:hidden">
        <Link
          href={`/product/${product.id}`}
          className="block w-full"
        >
          <button className="flex h-10 w-full items-center justify-center rounded-[10px] bg-gradient-to-r from-orange-500 to-orange-600 text-xs font-semibold text-white shadow-[0_10px_20px_rgba(249,115,22,0.25)] transition-all duration-300">
            Buy Now
          </button>
        </Link>
      </div>

      {/* Desktop Buttons */}
      <div className="mt-5 hidden grid-cols-2 gap-3 sm:grid">
        <button
          onClick={handleAddToCart}
          className="flex h-12 items-center justify-center rounded-[5px] bg-gray-100 px-2 text-sm font-semibold text-gray-700 transition-all duration-300 hover:bg-gray-200"
        >
          Add to Cart
        </button>

        <Link href={`/product/${product.id}`}>
          <button className="flex h-12 w-full items-center justify-center rounded-[10px] bg-gradient-to-r from-orange-500 to-orange-600 px-2 text-sm font-semibold text-white shadow-[0_10px_20px_rgba(249,115,22,0.25)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_14px_28px_rgba(249,115,22,0.35)]">
            Buy Now
          </button>
        </Link>
      </div>
    </motion.div>
  );
}