"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Menu,
  ShoppingCart,
  Search,
  Headphones,
  Heart,
} from "lucide-react";
import { useCart } from "@/app/context/CartContext";
import { useWishlist } from "@/app/context/WishlistContext";
import { useSearch } from "@/app/context/SearchContext";
import { useScrolled } from "@/app/hooks/useScrolled";
import SearchDropdown from "./SearchDropdown";
import MobileMenu from "./MobileMenu";
import { AnimatePresence, motion } from "framer-motion";


export default function Navbar() {
  const scrolled = useScrolled(10);

  const { state: cartState, openDrawer } = useCart();
  const { items: wishlistItems } = useWishlist();
  const { searchQuery, setSearchQuery, filters, setFilters } = useSearch();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);

  // Close search dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setFilters((prev) => ({
      ...prev,
      category: value === "All Categories" ? "" : value.toLowerCase(),
    }));
  };

  return (
    <header
      className={`sticky top-10 w-full border-b border-gray-100 bg-white transition-all duration-300 px-4 sm:px-6 lg:px-8 xl:px-10 ${mobileMenuOpen ? "z-[10001]" : "z-40"
        } ${scrolled ? "py-2 shadow-md" : "py-4"}`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <h1 className="text-2xl tracking-tight text-black font-semibold">
            GR<span className="text-orange-500 font-extrabold">i</span>VA
          </h1>
        </Link>

        {/* Search Bar - Desktop */}
        <div ref={searchRef} className="hidden lg:relative lg:flex flex-1 max-w-2xl items-center justify-center">
          <div className="flex h-10 w-full overflow-hidden rounded-md border border-orange-500 bg-white shadow-sm focus-within:ring-2 focus-within:ring-orange-200">
            {/* Category Dropdown */}
            <div className="border-r border-gray-200 pr-4 bg-gray-50">
              <select
                className="
      pl-5
      pr-8
      h-full
      text-xs
      font-semibold
      text-gray-700
      outline-none
      cursor-pointer
      bg-transparent
      hover:bg-gray-100
      transition-colors
    "
                value={
                  filters.category
                    ? filters.category.charAt(0).toUpperCase() + filters.category.slice(1)
                    : "All Categories"
                }
                onChange={handleCategoryChange}
              >
                <option>All Categories</option>
                <option>Electronics</option>
                <option>Fashion</option>
                <option>Accessories</option>
                <option>Gaming</option>
                <option>Mobiles</option>
              </select>
            </div>

            {/* Input */}
            <div className="flex flex-1 items-center px-3 gap-2">
              <Search size={14} className="text-gray-400 shrink-0" />
              <input
                type="text"
                placeholder="Search for products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                className="w-full border-none bg-transparent text-xs text-black outline-none placeholder:text-gray-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-gray-400 hover:text-gray-600 text-[10px] uppercase font-bold shrink-0"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Search Button */}
            <Link
              href={`/shop?search=${encodeURIComponent(searchQuery)}`}
              onClick={() => setSearchFocused(false)}
              className="bg-orange-500 flex items-center justify-center px-6 text-xs font-bold text-white transition hover:bg-orange-600 uppercase shrink-0"
            >
              Search
            </Link>
          </div>

          {/* Suggestions Dropdown */}
          <AnimatePresence>
            {searchFocused && (
              <SearchDropdown onClose={() => setSearchFocused(false)} />
            )}
          </AnimatePresence>
        </div>

        {/* Right Actions */}
        <div className="hidden lg:flex items-center gap-6 shrink-0">
          {/* Help */}
          <div className="flex items-center gap-2">
            <Headphones size={18} className="text-black" />
            <div className="leading-tight">
              <p className="text-[10px] text-gray-400">Need Help?</p>
              <p className="text-xs font-bold text-orange-500 hover:underline">+08 9229 8228</p>
            </div>
          </div>

          {/* Wishlist */}
          <Link href="/wishlist" className="relative flex items-center gap-2 group">
            <div className="relative">
              <Heart size={18} className="text-black group-hover:text-orange-500 transition-colors" />
              {wishlistItems.length > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4. w-4. items-center justify-center rounded-full bg-orange-500 text-[9px] font-bold text-white px-1">
                  {wishlistItems.length}
                </span>
              )}
            </div>
            <div className="text-left leading-tight">
              <p className="text-[10px] text-gray-400">Favorites</p>
              <p className="text-xs font-bold text-black group-hover:text-orange-500 transition-colors">Wishlist</p>
            </div>
          </Link>

          {/* Cart */}
          <button
            onClick={openDrawer}
            className="relative flex items-center gap-2 group cursor-pointer"
          >
            <div className="relative">
              <ShoppingCart size={18} className="text-black group-hover:text-orange-500 transition-colors" />
              {cartState.totalItems > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4. w-4. items-center justify-center rounded-full bg-orange-500 text-[9px] font-bold text-white px-1">
                  {cartState.totalItems}
                </span>
              )}
            </div>
            <div className="text-left leading-tight">
              <p className="text-[10px] text-gray-400">My Cart</p>
              <p className="text-xs font-bold text-black group-hover:text-orange-500 transition-colors">
                ${cartState.totalPrice.toFixed(2)}
              </p>
            </div>
          </button>
        </div>

        {/* Mobile Actions: Cart & Hamburger */}
        <div className="flex items-center gap-2 lg:hidden">
          {/* Wishlist Button (Mobile) */}
          {/* Search Toggle Button (Mobile) */}
          <button
            onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            className={`p-2 transition-colors rounded-lg cursor-pointer ${
              mobileSearchOpen ? "text-orange-500 bg-orange-50" : "text-gray-700 hover:text-orange-500"
            }`}
            aria-label="Toggle Search"
          >
            <Search size={20} />
          </button>

          {/* Wishlist Button (Mobile) */}
          <Link
            href="/wishlist"
            className="relative p-2 text-gray-700 hover:text-orange-500 transition-colors rounded-lg"
          >
            <Heart size={20} />
            {wishlistItems.length > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 text-[9px] font-bold text-white">
                {wishlistItems.length}
              </span>
            )}
          </Link>

          {/* Cart Button (Mobile) */}
          <button
            onClick={openDrawer}
            className="relative p-2 text-gray-700 hover:text-orange-500 transition-colors rounded-lg cursor-pointer"
          >
            <ShoppingCart size={20} />
            {cartState.totalItems > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 text-[9px] font-bold text-white">
                {cartState.totalItems}
              </span>
            )}
          </button>

          {/* Hamburger Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="rounded-lg p-2 text-gray-700 transition hover:bg-orange-50 hover:text-orange-500"
          >
            <Menu size={24} />
          </button>
        </div>
      </div>

      {/* Mobile Inline Search Bar */}
      <AnimatePresence>
        {mobileSearchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-gray-100 px-4 py-2 lg:hidden overflow-hidden"
          >
            <div className="flex overflow-hidden rounded-md border border-orange-500 shadow-sm focus-within:ring-2 focus-within:ring-orange-200">
              <input
                type="text"
                placeholder="Search for products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 text-sm outline-none bg-white text-black"
                autoFocus
              />
              <Link
                href={`/shop?search=${encodeURIComponent(searchQuery)}`}
                onClick={() => setMobileSearchOpen(false)}
                className="bg-orange-500 flex items-center justify-center px-4 text-white hover:bg-orange-600 transition-colors"
              >
                <Search size={18} />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <MobileMenu
            isOpen={mobileMenuOpen}
            onClose={() => setMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>
    </header>
  );
}
