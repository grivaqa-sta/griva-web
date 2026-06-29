"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { X, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { categories } from "@/app/data/data";
import { useAllProducts } from "@/app/hooks/useProducts";
import { categoryService } from "@/app/services/category.service";
import { subCategoryService } from "@/app/services/subCategory.service";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileCategoryDrawer({ isOpen, onClose }: Props) {
  const [activeCategory, setActiveCategory] = useState(categories[0]);
  const { products } = useAllProducts();
  const [dbCategories, setDbCategories] = useState<any[]>([]);
  const [dbSubcategories, setDbSubcategories] = useState<any[]>([]);
  const [loadingTaxonomy, setLoadingTaxonomy] = useState(true);

  useEffect(() => {
    async function loadTaxonomy() {
      try {
        const [catRes, subRes] = await Promise.all([
          categoryService.getCategories(),
          subCategoryService.getSubCategories(),
        ]);
        const cData = catRes?.data || catRes;
        const sData = subRes?.data || subRes;
        setDbCategories(Array.isArray(cData) ? cData : []);
        setDbSubcategories(Array.isArray(sData) ? sData : []);
      } catch (err) {
        console.error("[MobileCategoryDrawer] Failed to load taxonomy:", err);
      } finally {
        setLoadingTaxonomy(false);
      }
    }
    loadTaxonomy();
  }, []);

  const activeSlug = activeCategory.href.split("/").pop();
  const matchedDbCategory = useMemo(() => {
    return dbCategories.find((c) => c.slug === activeSlug);
  }, [dbCategories, activeSlug]);

  const validSubcategoryIds = useMemo(() => {
    if (!matchedDbCategory) return new Set<number>();
    return new Set(
      dbSubcategories
        .filter((sub) => sub.category_id === matchedDbCategory.id)
        .map((sub) => sub.id)
    );
  }, [matchedDbCategory, dbSubcategories]);

  const filteredProducts = useMemo(() => {
    if (loadingTaxonomy) return [];
    if (!matchedDbCategory) return [];
    return products.filter((p) => validSubcategoryIds.has(p.subcategory_id));
  }, [products, matchedDbCategory, validSubcategoryIds, loadingTaxonomy]);

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
                {categories.map((cat) => {
                  const isActive = cat.title === activeCategory.title;
                  return (
                    <button
                      key={cat.title}
                      onClick={() => setActiveCategory(cat)}
                      className={`w-full flex flex-col items-center gap-1 py-3 px-1 transition-all duration-200 ${isActive
                          ? "bg-white text-orange-500 shadow-[0_1px_3px_rgba(0,0,0,0.05)] border-l-[3px] border-orange-500"
                          : "text-gray-500 hover:text-gray-900 border-l-[3px] border-transparent"
                        }`}
                    >
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${isActive ? "bg-orange-50/70 scale-105" : "bg-gray-200/50"}`}>
                        <Image
                          src={cat.image}
                          alt={cat.title}
                          width={26}
                          height={26}
                          className="object-contain"
                        />
                      </div>
                      <span className={`text-[10px] font-bold tracking-tight text-center leading-tight transition-colors ${isActive ? "text-orange-500 font-extrabold" : "text-gray-500"}`}>
                        {cat.title}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Right content */}
              <div className="flex-1 overflow-y-auto p-3">
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5 px-0.5">
                  {activeCategory.title}
                </h2>

                {/* Shop All link */}
                <Link
                  href={activeCategory.href}
                  onClick={onClose}
                  className="flex items-center justify-between mb-4 px-4 py-3.5 rounded-xl bg-orange-50/50 border border-orange-100/50 hover:bg-orange-50 active:scale-[0.98] transition-all"
                >
                  <div>
                    <p className="text-xs font-bold text-orange-600 tracking-wide uppercase">Shop All</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">Explore {activeCategory.title} collection</p>
                  </div>
                  <ChevronRight size={16} className="text-orange-500" />
                </Link>

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
