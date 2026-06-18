"use client";

import Link from "next/link";
import { Heart, ArrowLeft } from "lucide-react";
import { useWishlist } from "@/app/context/WishlistContext";
import ProductCard from "@/app/components/product/ProductCard";
import SectionHeading from "@/app/components/common/SectionHeading";
import { ApiProduct } from "@/app/types/types";
import { motion, AnimatePresence } from "framer-motion";

export default function WishlistPage() {
  const { items, toggleWishlist } = useWishlist();

  return (
    <div className="bg-gray-50/50 min-h-screen py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading title="My Wishlist" subtitle="Your favorite products saved in one place" />

        {items.length > 0 ? (
          <div>
            <div className="flex justify-between items-center mb-6">
              <span className="text-xs font-semibold text-gray-500">
                Showing {items.length} {items.length === 1 ? "item" : "items"}
              </span>
              <Link
                href="/shop"
                className="text-xs font-semibold text-gray-500 hover:text-orange-500 transition flex items-center gap-1"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Continue Shopping
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              <AnimatePresence>
                {items.map((item) => {
                  // Map WishlistItem to ApiProduct type to feed into ProductCard
                  const productObj = {
                    id: item.productId,
                    title: item.title,
                    main_image_url: typeof item.image === "string" ? item.image : "",
                    price: item.price.replace(/[^\d.]/g, ""),
                    old_price: item.oldPrice ? item.oldPrice.replace(/[^\d.]/g, "") : undefined,
                    rating: item.rating,
                    brand: item.category,
                  } as unknown as ApiProduct;

                  return (
                    <motion.div
                      layout
                      key={item.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ProductCard product={productObj} />
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center max-w-lg mx-auto mt-8">
            <div className="h-16 w-16 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Your Wishlist is Empty</h3>
            <p className="text-sm text-gray-500 mb-8">
              Keep track of items you love. Click the heart icon on any product to save it here.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center justify-center rounded-xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white hover:bg-orange-600 transition shadow-md shadow-orange-500/10"
            >
              Discover Products
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
