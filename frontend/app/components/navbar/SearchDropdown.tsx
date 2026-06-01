"use client";

import Link from "next/link";
import Image from "next/image";
import { Search, History, Trash2, X } from "lucide-react";
import { useSearch } from "@/app/context/SearchContext";
import { products } from "@/app/data/data";
import { motion, AnimatePresence } from "framer-motion";

interface SearchDropdownProps {
  onClose: () => void;
}

export default function SearchDropdown({ onClose }: SearchDropdownProps) {
  const {
    searchQuery,
    setSearchQuery,
    recentSearches,
    addRecentSearch,
    clearRecentSearches,
  } = useSearch();

  // Filter products based on search query
  const filteredProducts = searchQuery
    ? products
        .filter((product) =>
          product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.category.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 5)
    : [];

  const handleSearchItemClick = (query: string) => {
    setSearchQuery(query);
    addRecentSearch(query);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="absolute top-full left-0 z-50 mt-2 w-full rounded-lg border border-gray-100 bg-white p-4 shadow-xl"
    >
      <div className="flex items-center justify-between border-b pb-2 mb-3">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Search Suggestions
        </span>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Query suggestions */}
      {searchQuery && (
        <div className="mb-4">
          {filteredProducts.length > 0 ? (
            <div className="flex flex-col gap-2">
              {filteredProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/product/${product.id}`}
                  onClick={() => {
                    addRecentSearch(searchQuery);
                    onClose();
                  }}
                  className="flex items-center gap-3 rounded-md p-2 hover:bg-orange-50 transition-colors"
                >
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded border bg-gray-50">
                    <Image
                      src={product.image}
                      alt={product.title}
                      fill
                      className="object-contain p-1"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-xs font-semibold text-gray-800">
                      {product.title}
                    </p>
                    <p className="text-[10px] text-gray-400 uppercase">
                      {product.category}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-orange-500">
                    {product.price}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="py-2 text-center text-xs text-gray-500">
              No products found for &ldquo;{searchQuery}&rdquo;
            </p>
          )}
        </div>
      )}

      {/* Recent Searches */}
      {recentSearches.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              <History className="h-3. w-3" /> Recent Searches
            </span>
            <button
              onClick={clearRecentSearches}
              className="flex items-center gap-1 text-[10px] font-semibold text-red-500 hover:text-red-600 transition-colors"
            >
              <Trash2 className="h-3 w-3" /> Clear All
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {recentSearches.map((query) => (
              <button
                key={query}
                onClick={() => handleSearchItemClick(query)}
                className="flex items-center gap-1 rounded-full bg-gray-50 border border-gray-100 px-3 py-1 text-xs text-gray-600 hover:bg-orange-50 hover:border-orange-200 transition-all"
              >
                <span>{query}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {!searchQuery && recentSearches.length === 0 && (
        <div className="py-4 text-center text-xs text-gray-400">
          Start typing to see product suggestions...
        </div>
      )}
    </motion.div>
  );
}
