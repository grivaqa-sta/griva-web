"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { ApiProduct } from "@/app/types/types";
import Rating from "../rating/Rating";
import { useCart } from "@/app/context/CartContext";
import { useWishlist } from "@/app/context/WishlistContext";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const ORANGE = "#FF6A00";
const INK = "#0D0D0D";

export default function ProductCard({ product }: { product?: ApiProduct }) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

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
      whileHover={isDesktop ? { y: -5 } : {}}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="group relative flex flex-col overflow-hidden bg-white p-2 transition-all duration-300
        rounded-none sm:rounded-[24px] sm:p-4
        border-1 border-gray-200 sm:border sm:border-[#ECECEC]
        shadow-none sm:shadow-[0_4px_16px_rgba(0,0,0,0.18)]"
      onMouseEnter={(e) => {
        if (!isDesktop) return;
        e.currentTarget.style.borderColor = "#FF6A0055";
        e.currentTarget.style.boxShadow = "0 18px 40px rgba(255,106,0,0.14)";
      }}
      onMouseLeave={(e) => {
        if (!isDesktop) return;
        e.currentTarget.style.borderColor = "#ECECEC";
        e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.18)";
      }}
    >
      <Link href={`/product/${product.id}`} className="flex flex-col">
        {/* Wishlist */}
        <button
          onClick={handleWishlistToggle}
          className="absolute right-2 top-2 z-20 flex h-7 w-7 items-center justify-center rounded-full transition-all duration-300 sm:right-4 sm:top-4 sm:h-9 sm:w-9"
        >
          <motion.div whileTap={{ scale: 0.85 }}>
            <Heart
              size={13}
              className={`transition-colors duration-300 sm:h-4 sm:w-4 ${
                isWishlisted ? "fill-red-500 text-red-500" : "text-[#0D0D0D]"
              }`}
            />
          </motion.div>
        </button>

        {/* Image Section */}
        <div
          className="relative flex h-[140px] items-center justify-center overflow-hidden rounded-none p-3 sm:h-[230px] sm:rounded-[18px] sm:p-8"
          style={{ background: "linear-gradient(150deg, #F7F6F4 0%, #FFFFFF 55%, #F4F3F1 100%)" }}
        >
          <div
            className="absolute inset-0"
            style={{ background: "radial-gradient(circle at 80% 15%, rgba(255,106,0,0.07), transparent 50%)" }}
          />

          {product.discount_percentage && product.discount_percentage > 0 ? (
            <div
              className="absolute left-2 top-2 max-w-[70%] truncate rounded-full px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-white sm:left-4 sm:top-4 sm:px-3 sm:text-[10px]"
              style={{ backgroundColor: ORANGE, boxShadow: "0 6px 14px rgba(255,106,0,0.28)" }}
            >
              -{product.discount_percentage}%
            </div>
          ) : (
            <div
              className="absolute left-2 top-2 max-w-[60%] truncate rounded-full border bg-white/90 px-2 py-0.5 text-[8px] font-semibold uppercase tracking-wider sm:left-4 sm:top-4 sm:max-w-none sm:px-3 sm:text-[10px]"
              style={{ borderColor: "#ECECEC", color: INK }}
            >
              {product.brand || "Product"}
            </div>
          )}

          <Image
            src={product.main_image_url}
            alt={product.title}
            width={160}
            height={160}
            priority
            className="relative z-10 h-auto max-h-[100px] w-auto object-contain sm:group-hover:scale-110 transition-transform duration-500 sm:max-h-[160px]"
          />
        </div>

        {/* Content */}
        <div className="mt-2 flex flex-col gap-1.5 sm:mt-5 sm:gap-3">
          <h3
  className="truncate text-[11px] font-semibold leading-snug tracking-[-0.01em] sm:line-clamp-2 sm:text-[15px] sm:leading-6"
  style={{ color: INK }}
>
  <span className="sm:group-hover:text-[#FF6A00] transition-colors duration-300">
    {product.title}
  </span>
</h3>

          {/* Price */}
          <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
            <span className="flex items-baseline gap-0.5 leading-none">
              <span className="text-[9px] font-bold uppercase tracking-wide text-gray-400 sm:text-[11px]">
                QAR
              </span>
              <span
                className="tabular-nums text-[15px] font-extrabold tracking-tight sm:text-2xl"
                style={{ color: INK }}
              >
                {formatPrice(product.price)}
              </span>
            </span>

            {product.old_price && (
              <span className="text-[8px] font-semibold uppercase text-gray-400 line-through sm:text-[10px]">
                QAR {formatPrice(product.old_price)}
              </span>
            )}
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1 sm:gap-2">
            <Rating rating={product.rating} />
            <span className="text-[9px] font-medium text-gray-400 sm:text-xs">
              ({product.review_count || 0})
            </span>
          </div>
        </div>
      </Link>

      {/* Desktop Buttons only */}
      <div className="mt-5 hidden grid-cols-2 gap-2.5 sm:grid">
        <button
          onClick={handleAddToCart}
          className="flex h-12 items-center justify-center rounded-xl border px-2 text-sm font-semibold transition-all duration-300"
          style={{ borderColor: "white", color: INK, backgroundColor: "transparent" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = ORANGE;
            e.currentTarget.style.color = "#fff";
            e.currentTarget.style.boxShadow = "0 14px 28px rgba(255,106,0,0.32)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = INK;
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          Add to Cart
        </button>

        <Link href={`/product/${product.id}`}>
          <button
            className="flex h-12 w-full cursor-pointer items-center justify-center rounded-[10px] px-2 text-sm font-semibold text-white transition-all duration-300 hover:scale-[1.02]"
            style={{ backgroundColor: INK, boxShadow: "0 10px 20px rgba(13,13,13,0.2)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = ORANGE;
              e.currentTarget.style.boxShadow = "0 14px 28px rgba(255,106,0,0.32)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = INK;
              e.currentTarget.style.boxShadow = "0 10px 20px rgba(13,13,13,0.2)";
            }}
          >
            Buy Now
          </button>
        </Link>
      </div>
    </motion.div>
  );
}