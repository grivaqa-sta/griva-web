"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { X, Sparkles, Smile, Baby, Smartphone, Gamepad2, Utensils } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { categories } from "@/app/data/data";
import { useAllProducts } from "@/app/hooks/useProducts";

function getCategoryIcon(title: string) {
  const cls = "w-6 h-6";
  switch (title.toLowerCase()) {
    case "perfumes & buhoor":
    case "perfumes":
      return <Sparkles className={cls} />;
    case "toys":
      return <Smile className={cls} />;
    case "baby products":
      return <Baby className={cls} />;
    case "gadgets & electronics":
      return <Smartphone className={cls} />;
    case "gaming accessories":
      return <Gamepad2 className={cls} />;
    case "kitchen appliances & essentials":
      return <Utensils className={cls} />;
    default:
      return <Sparkles className={cls} />;
  }
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileCategoryDrawer({ isOpen, onClose }: Props) {
  const [activeCategory, setActiveCategory] = useState(categories[0]);
  const { products } = useAllProducts();

  // No direct category slug on ApiProduct — show all products as featured items
  const filteredProducts = products.slice(0, 6);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10001] bg-black"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "tween", duration: 0.28 }}
            className="fixed inset-x-0 bottom-0 top-0 z-[10002] flex flex-col bg-white"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white">
              <span className="text-base font-bold text-gray-900">Categories</span>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Close"
              >
                <X size={20} className="text-gray-600" />
              </button>
            </div>

            {/* Body: left sidebar + right content */}
            <div className="flex flex-1 overflow-hidden">
              {/* Left sidebar */}
              <div className="w-[88px] flex-shrink-0 bg-gray-50 border-r border-gray-100 overflow-y-auto">
                {categories.map((cat) => {
                  const isActive = cat.title === activeCategory.title;
                  return (
                    <button
                      key={cat.title}
                      onClick={() => setActiveCategory(cat)}
                      className={`w-full flex flex-col items-center gap-1.5 py-4 px-1 transition-colors border-l-[3px] ${
                        isActive
                          ? "border-orange-500 bg-white text-orange-500"
                          : "border-transparent text-gray-600 hover:bg-white"
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isActive ? "bg-orange-50" : "bg-gray-100"}`}>
                        <Image
                          src={cat.image}
                          alt={cat.title}
                          width={28}
                          height={28}
                          className="object-contain"
                        />
                      </div>
                      <span className={`text-[10px] font-semibold text-center leading-tight ${isActive ? "text-orange-500" : "text-gray-600"}`}>
                        {cat.title}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Right content */}
              <div className="flex-1 overflow-y-auto p-3">
                <h2 className="text-sm font-bold text-gray-800 mb-3">
                  {activeCategory.title}
                </h2>

                {/* Shop All link */}
                <Link
                  href={activeCategory.href}
                  onClick={onClose}
                  className="flex items-center gap-2 mb-4 px-3 py-2 rounded-xl bg-orange-50 border border-orange-100"
                >
                  <div className="w-10 h-10 rounded-lg bg-orange-500 flex items-center justify-center text-white">
                    {getCategoryIcon(activeCategory.title)}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-orange-600">Shop All</p>
                    <p className="text-[10px] text-gray-500">{activeCategory.title}</p>
                  </div>
                </Link>

                {/* Products grid */}
                {filteredProducts.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {filteredProducts.slice(0, 6).map((product) => (
                      <Link
                        key={product.id}
                        href={`/product/${product.id}`}
                        onClick={onClose}
                        className="flex flex-col items-center gap-1.5 p-2 rounded-xl border border-gray-100 hover:border-orange-200 hover:bg-orange-50/30 transition-colors"
                      >
                        <div className="w-full h-20 relative bg-gray-50 rounded-lg overflow-hidden">
                          <Image
                            src={product.main_image_url}
                            alt={product.title}
                            fill
                            className="object-contain p-1"
                          />
                        </div>
                        <p className="text-[10px] font-semibold text-gray-800 text-center line-clamp-2 leading-tight">
                          {product.title}
                        </p>
                        <span className="text-[11px] font-bold text-orange-500">QAR {Number(product.price).toFixed(2)}</span>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    <p className="text-sm">No products found</p>
                    <Link
                      href={activeCategory.href}
                      onClick={onClose}
                      className="text-orange-500 text-xs font-bold mt-2 inline-block"
                    >
                      Browse {activeCategory.title} →
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
