"use client";

import React, { useState, useRef, useEffect } from "react";
import { Search, ChevronDown, Check, X, Image as ImageIcon } from "lucide-react";

export interface ProductOption {
  id: number | string;
  title: string;
  main_image_url?: string;
  image?: string;
  price?: string | number;
  sku?: string;
  [key: string]: any;
}

interface SearchableProductSelectProps {
  products: ProductOption[];
  value: number | string;
  onChange: (value: number | string, selectedProduct?: ProductOption) => void;
  placeholder?: string;
  className?: string;
}

export default function SearchableProductSelect({
  products = [],
  value,
  onChange,
  placeholder = "Select a product...",
  className = "",
}: SearchableProductSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedProduct = products.find(
    (p) => String(p.id) === String(value) || p.main_image_url === value || p.image === value
  );

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Auto-focus search input when dropdown opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearchQuery("");
    }
  }, [isOpen]);

  // Filter products by search query
  const filteredProducts = products.filter((p) =>
    p.title?.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  return (
    <div className={`relative w-full ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-xs font-semibold text-gray-700 bg-white border border-orange-500/20 rounded-lg px-3 py-2.5 outline-none hover:border-orange-500 focus:border-orange-500 shadow-xs transition-all cursor-pointer"
      >
        <div className="flex items-center gap-2.5 min-w-0 pr-2">
          {selectedProduct ? (
            <>
              {selectedProduct.main_image_url || selectedProduct.image ? (
                <img
                  src={selectedProduct.main_image_url || selectedProduct.image}
                  alt=""
                  className="w-5 h-5 rounded object-contain p-0.5 bg-gray-50 border border-gray-200 shrink-0"
                />
              ) : (
                <div className="w-5 h-5 rounded bg-gray-100 flex items-center justify-center shrink-0">
                  <ImageIcon className="w-3 h-3 text-gray-400" />
                </div>
              )}
              <span className="truncate text-gray-900 font-bold">{selectedProduct.title}</span>
            </>
          ) : (
            <span className="text-gray-400 font-medium truncate">{placeholder}</span>
          )}
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform shrink-0 ${isOpen ? "rotate-180 text-orange-500" : ""}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1.5 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden text-left animate-in fade-in duration-150">
          {/* Search Input Bar */}
          <div className="p-2 border-b border-gray-100 bg-gray-50/80 sticky top-0 z-10">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search product title..."
                className="w-full text-xs bg-white border border-gray-200 rounded-lg pl-8 pr-7 py-1.5 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20 text-gray-800 placeholder:text-gray-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-2 text-gray-400 hover:text-gray-600 p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>

          {/* Product List Container */}
          <div className="max-h-60 overflow-y-auto divide-y divide-gray-50">
            {/* Clear / Unselect Option */}
            <div
              onClick={() => {
                onChange("", undefined);
                setIsOpen(false);
              }}
              className="px-3 py-2 hover:bg-gray-100/70 cursor-pointer text-xs text-gray-400 italic flex items-center justify-between"
            >
              <span>-- None (Clear Selection) --</span>
            </div>

            {filteredProducts.length > 0 ? (
              filteredProducts.map((p) => {
                const isSelected =
                  String(p.id) === String(value) ||
                  p.main_image_url === value ||
                  p.image === value;
                const imgSrc = p.main_image_url || p.image;

                return (
                  <div
                    key={p.id}
                    onClick={() => {
                      onChange(p.id, p);
                      setIsOpen(false);
                    }}
                    className={`px-3 py-2.5 hover:bg-orange-50/80 cursor-pointer flex items-center justify-between gap-3 transition-colors ${
                      isSelected ? "bg-orange-50 font-bold" : ""
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      {imgSrc ? (
                        <img
                          src={imgSrc}
                          alt=""
                          className="w-7 h-7 rounded-md object-contain p-0.5 bg-white border border-gray-200 shrink-0"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-md bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0">
                          <ImageIcon className="w-3.5 h-3.5 text-gray-400" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className={`text-xs truncate ${isSelected ? "text-orange-600 font-bold" : "text-gray-800"}`}>
                          {p.title}
                        </p>
                        {p.price && (
                          <p className="text-[10px] text-gray-400 font-medium">QAR {Number(p.price).toFixed(2)}</p>
                        )}
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-orange-500 shrink-0" />}
                  </div>
                );
              })
            ) : (
              <div className="px-4 py-6 text-center text-xs text-gray-400">
                No products matching &quot;{searchQuery}&quot;
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
