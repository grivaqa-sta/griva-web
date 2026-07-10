"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { X, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAllProducts } from "@/app/hooks/useProducts";
import { useCategories, useSubCategories } from "@/app/hooks/useCategories";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const isValidImageSrc = (src?: string | null) => {
  if (!src || typeof src !== 'string') return false;
  const trimmed = src.trim();
  if (trimmed === '') return false;
  return trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('/') || trimmed.startsWith('data:');
};

export default function MobileCategoryDrawer({ isOpen, onClose }: Props) {
  const { products } = useAllProducts();
  const { categories: dbCategories, loading: loadingCats } = useCategories();
  const { subCategories: dbSubcategories, loading: loadingSubs } = useSubCategories();
  const loadingTaxonomy = loadingCats || loadingSubs;

  const activeDbCategories = useMemo(() => {
    return dbCategories.filter((c) => c.is_active);
  }, [dbCategories]);

  const [activeCategory, setActiveCategory] = useState<any>(null);

  // Set the default active category once database categories load
  useEffect(() => {
    if (activeDbCategories.length > 0 && !activeCategory) {
      setActiveCategory(activeDbCategories[0]);
    }
  }, [activeDbCategories, activeCategory]);

  const activeSlug = activeCategory?.slug || "";

  const validSubcategoryIds = useMemo(() => {
    if (!activeCategory) return new Set<number>();
    return new Set(
      dbSubcategories
        .filter((sub) => sub.category_id === activeCategory.id)
        .map((sub) => sub.id)
    );
  }, [activeCategory, dbSubcategories]);

  const filteredProducts = useMemo(() => {
    if (loadingTaxonomy || !activeCategory) return [];
    return products.filter((p) => validSubcategoryIds.has(p.subcategory_id));
  }, [products, activeCategory, validSubcategoryIds, loadingTaxonomy]);

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
            className="fixed inset-x-0 bottom-0 top-0 z-[10002] flex flex-col bg-white ios-drawer-container"
          >
            <style>{`
              .ios-drawer-container {
                font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "SF Compact Text", "Helvetica Neue", Helvetica, Arial, sans-serif;
                -webkit-font-smoothing: antialiased;
              }
            `}</style>

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
              <div className="w-[88px] flex-shrink-0 bg-[#F8F9FA] border-r border-gray-100 overflow-y-auto">
                {loadingCats ? (
                  <div className="flex flex-col items-center justify-center py-8 space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="w-11 h-11 rounded-xl bg-gray-200 animate-pulse" />
                    ))}
                  </div>
                ) : (
                  activeDbCategories.map((cat) => {
                    const isActive = activeCategory && cat.id === activeCategory.id;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat)}
                        className={`w-full flex flex-col items-center gap-1 py-3 px-1 transition-all duration-200 ${isActive
                            ? "bg-white text-orange-500 shadow-[0_1px_3px_rgba(0,0,0,0.05)] border-l-[3px] border-orange-500"
                            : "text-gray-500 hover:text-gray-900 border-l-[3px] border-transparent"
                          }`}
                      >
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${isActive ? "bg-orange-50/70 scale-105" : "bg-gray-200/50"} overflow-hidden relative`}>
                          {isValidImageSrc(cat.mobile_image_url || cat.image_url) ? (
                            <Image
                              src={(cat.mobile_image_url || cat.image_url)!.trim()}
                              alt={cat.title}
                              fill
                              className="object-contain p-2"
                              sizes="44px"
                            />
                          ) : (
                            <span className="text-xs font-bold text-gray-400">
                              {cat.title.charAt(0)}
                            </span>
                          )}
                        </div>
                        <span className={`text-[10px] font-bold tracking-tight text-center leading-tight transition-colors ${isActive ? "text-orange-500 font-extrabold" : "text-gray-500"}`}>
                          {cat.title}
                        </span>
                      </button>
                    );
                  })
                )}
              </div>

              {/* Right content */}
              <div className="flex-1 overflow-y-auto p-3">
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5 px-0.5">
                  {activeCategory?.title || ""}
                </h2>

                {/* Shop All link */}
                {activeCategory && (
                  <Link
                    href={activeCategory.href || `/category/${activeCategory.slug}`}
                    onClick={onClose}
                    className="flex items-center justify-between mb-4 px-4 py-3.5 rounded-xl bg-orange-50/50 border border-orange-100/50 hover:bg-orange-50 active:scale-[0.98] transition-all"
                  >
                    <div>
                      <p className="text-xs font-bold text-orange-600 tracking-wide uppercase">Shop All</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">Explore {activeCategory.title} collection</p>
                    </div>
                    <ChevronRight size={16} className="text-orange-500" />
                  </Link>
                )}

                {/* Products grid */}
                {loadingTaxonomy ? (
                  <div className="grid grid-cols-2 gap-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="animate-pulse flex flex-col p-2.5 rounded-2xl bg-white border border-gray-100/80 shadow-sm">
                        <div className="w-full h-24 bg-gray-100/70 rounded-xl mb-2"></div>
                        <div className="h-3 bg-gray-100/70 rounded w-3/4 mb-1"></div>
                        <div className="h-3 bg-gray-100/70 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : filteredProducts.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {filteredProducts.slice(0, 6).map((product) => (
                      <Link
                        key={product.id}
                        href={`/product/${product.slug}`}
                        onClick={onClose}
                        className="flex flex-col p-2.5 rounded-2xl bg-white border border-gray-100/80 active:scale-[0.97] transition-all duration-200 shadow-sm"
                      >
                        <div className="w-full h-24 relative bg-gray-50/60 rounded-xl overflow-hidden mb-2 flex items-center justify-center">
                          <Image
                            src={product.main_image_url}
                            alt={product.title}
                            fill
                            className="object-contain p-1.5 transition-transform duration-300 hover:scale-105"
                          />
                        </div>
                        <p className="text-[10px] font-medium text-gray-800 line-clamp-2 leading-snug px-0.5">
                          {product.title}
                        </p>
                        <div className="mt-auto pt-1.5 flex items-center justify-between px-0.5">
                          <span className="text-[11px] font-bold text-orange-500">QAR {Number(product.price).toFixed(2)}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  activeCategory && (
                    <div className="text-center py-12 text-gray-400">
                      <p className="text-sm">No products found</p>
                      <Link
                        href={activeCategory.href || `/category/${activeCategory.slug}`}
                        onClick={onClose}
                        className="text-orange-500 text-xs font-bold mt-2 inline-block"
                      >
                        Browse {activeCategory.title} →
                      </Link>
                    </div>
                  )
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
