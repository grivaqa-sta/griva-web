"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { Product } from "@/app/types/types";
import Rating from "../rating/Rating";
import { useCart } from "@/app/context/CartContext";
import { useWishlist } from "@/app/context/WishlistContext";
import { motion } from "framer-motion";

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const isWishlisted = isInWishlist(product.id);

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id: product.id,
      title: product.title,
      image: product.image,
      price: product.price,
      category: product.category,
      quantity: 1,
    });
  };

  const isHot = product.id === 2 || product.id === 4;

  return (
    <motion.div
      className="group relative bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md  flex flex-col justify-between h-full hover:border-orange-500"
    >
      <Link href={`/product/${product.id}`} className="block flex-1">
        {/* Badges */}
        <div className="absolute left-2.5 top-2.5 z-10 flex fle gap-1">
          {product.badge && (
            <div className={`rounded px-2 py-0.5 text-[9px] font-extrabold text-white uppercase ${product.badgeColor || "bg-orange-500"}`}>
              {product.badge}
            </div>
          )}
          {isHot && (
            <div className="rounded bg-red-600 px-2 py-0.5 text-[9px] font-extrabold text-white uppercase animate-pulse">
              HOT
            </div>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistToggle}
          className="absolute right-2.5 top-2.5 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white border border-gray-100 text-gray-400 hover:text-red-500 shadow-sm hover:shadow transition-all duration-200 cursor-pointer"
        >
          <motion.div whileTap={{ scale: 0.8 }}>
            <Heart
              size={16}
              className={`transition-colors duration-200 ${
                isWishlisted ? "fill-red-500 text-red-500" : "text-gray-400"
              }`}
            />
          </motion.div>
        </button>

        {/* Image Area */}
        <div className="relative flex h-[180px] items-center justify-center overflow-hidden rounded-lg bg-gray-50/50 p-2">
          <Image
            src={product.image}
            alt={product.title}
            width={120}
            height={120}
            priority
            className="object-contain"
            style={{ width: "auto", height: "auto" }}
          />
        </div>

        {/* Category */}
        <p className="mt-3 text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
          {product.category}
        </p>

        {/* Title */}
        <h3 className="mt-1 line-clamp-1 text-sm font-semibold leading-[1.4] text-gray-900 transition-colors group-hover:text-orange-500">
          {product.title}
        </h3>

        {/* Rating */}
        <div className="mt-1.5">
          <Rating rating={product.rating} />
        </div>

        {/* Price & Old Price */}
        <div className="mt-2.5 flex items-center gap-2">
          <span className="text-lg font-bold text-orange-500">{product.price}</span>
          {product.oldPrice && (
            <span className="text-xs text-gray-400 line-through">
              {product.oldPrice}
            </span>
          )}
        </div>
      </Link>

      {/* Add To Cart */}
      <button
        onClick={handleAddToCart}
        className="mt-4 cursor-pointer flex h-10 w-full items-center justify-center rounded-lg border border-orange-500 bg-white text-[11px] font-bold tracking-wide text-gray-900 transition hover:bg-orange-500 hover:text-white"
      >
        {product.buttonText || "ADD TO CART"}
      </button>
    </motion.div>
  );
}
