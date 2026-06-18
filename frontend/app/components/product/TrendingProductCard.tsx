"use client";

import { ApiProduct } from "@/app/types/types";
import Image from "next/image";
import Link from "next/link";
import Rating from "../rating/Rating";
import { Heart } from "lucide-react";
import { useWishlist } from "@/app/context/WishlistContext";
import { motion } from "framer-motion";

export default function TrendingProductCard({
  product,
}: {
  product?: ApiProduct;
}) {
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

  // Safe navigation fallback to /product/[id]
  const productLink = `/product/${product.id}`;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="w-full"
    >
      <Link
        href={productLink}
        className="group relative flex rounded-xl p-4 shadow-sm hover:shadow transition border border-gray-100 hover:border-orange-200"
      >
        {/* Badges */}
        <div className="absolute left-3 top-3 z-10 flex gap-1">
          {product.discount_percentage && product.discount_percentage > 0 && (
            <span className="rounded bg-orange-500 px-2 py-0.5 text-[9px] font-extrabold text-white uppercase">
              -{product.discount_percentage}%
            </span>
          )}
          {product.is_trending && (
            <span className="rounded bg-red-600 px-2 py-0.5 text-[9px] font-extrabold text-white uppercase animate-pulse">
              HOT
            </span>
          )}
        </div>

        {/* Product Image */}
        <div className="relative flex h-[130px] w-[130px] shrink-0 items-center justify-center rounded-lg bg-gray-50/50 p-2 mt-2">
          <Image
            src={product.main_image_url}
            alt={product.title}
            width={110}
            height={110}
            priority
            className="object-contain transition-transform duration-300 group-hover:scale-105"
            style={{ width: "auto", height: "auto" }}
          />
          {/* Fav Icon */}
          <button
            onClick={handleWishlistToggle}
            className="absolute right-1 top-1 z-10 rounded-full bg-white p-1.5 shadow-sm opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300 hover:text-red-500 text-gray-400 cursor-pointer border border-gray-100"
          >
            <motion.div whileTap={{ scale: 0.8 }}>
              <Heart
                size={14}
                className={`transition-colors duration-200 ${
                  isWishlisted ? "fill-red-500 text-red-500" : "text-gray-400"
                }`}
              />
            </motion.div>
          </button>
        </div>

        {/* Content */}
        <div className="ml-4 flex flex-1 flex-col justify-center min-w-0">
          {/* Category/Brand */}
          <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
            {product.brand || "Product"}
          </p>

          {/* Title */}
          <h3 className="mt-1 line-clamp-2 text-sm font-semibold leading-[1.4] text-gray-900 transition-colors group-hover:text-orange-500">
            {product.title}
          </h3>

          {/* Rating */}
          <div className="mt-1 flex items-center gap-1.5">
            <Rating rating={product.rating} />
            <span className="text-[10px] text-gray-400">({product.review_count})</span>
          </div>

          {/* Price */}
          <div className="mt-2.5 flex items-center gap-2">
            <span className="text-base font-bold text-orange-500">
              QAR {formatPrice(product.price)}
            </span>
            {product.old_price && (
              <span className="text-xs text-gray-400 line-through">
                QAR {formatPrice(product.old_price)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
