"use client";

import Link from "next/link";
import { User, ShoppingCart, Heart, ChevronDown, X, Phone, Globe } from "lucide-react";
import { motion } from "framer-motion";
import { useCart } from "@/app/context/CartContext";
import { useWishlist } from "@/app/context/WishlistContext";
import { useState } from "react";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "FAQ", href: "/faq" },
];

const categories = ["Electronics", "Fashion", "Accessories", "Gaming", "Mobiles"];

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const { state: cartState, openDrawer } = useCart();
  const { items: wishlistItems } = useWishlist();
  const [categoriesOpen, setCategoriesOpen] = useState(false);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[10000] bg-black"
      />

      {/* Drawer */}
      <motion.div
        initial={{ x: "-100%" }}
        animate={{ x: 0 }}
        exit={{ x: "-100%" }}
        transition={{ type: "tween", duration: 0.3 }}
        className="fixed inset-y-0 left-0 z-[10001] flex w-full max-w-xs flex-col bg-white p-6 shadow-2xl overflow-y-auto"
      >
        <div className="flex items-center justify-between border-b pb-4">
          <h2 className="text-xl font-bold text-gray-900">
            GR<span className="text-orange-500">i</span>VA Menu
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Links */}
        <nav className="flex-1 space-y-1 mt-6">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={onClose}
              className="block rounded-lg px-4 py-2.5 text-sm font-semibold text-gray-900 hover:bg-orange-50 hover:text-orange-500 transition-colors"
            >
              {link.label}
            </Link>
          ))}

          {/* Categories Accordion */}
          <div className="space-y-1">
            <button
              onClick={() => setCategoriesOpen(!categoriesOpen)}
              className="flex w-full items-center justify-between rounded-lg px-4 py-2.5 text-sm font-semibold text-gray-900 hover:bg-orange-50 hover:text-orange-500 transition-colors text-left"
            >
              <span>Categories</span>
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-200 ${
                  categoriesOpen ? "rotate-180 text-orange-500" : "text-gray-400"
                }`}
              />
            </button>
            {categoriesOpen && (
              <div className="pl-6 space-y-1">
                {categories.map((cat) => (
                  <Link
                    key={cat}
                    href={`/shop?category=${cat.toLowerCase()}`}
                    onClick={onClose}
                    className="block rounded-md px-4 py-2 text-xs font-medium text-gray-600 hover:bg-orange-50 hover:text-orange-500 transition-colors"
                  >
                    {cat}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* Footer info & quick buttons */}
        <div className="mt-auto border-t pt-6 space-y-4">
          <div className="flex flex-col gap-2">
            <Link
              href="/wishlist"
              onClick={onClose}
              className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-800 hover:bg-gray-50 transition"
            >
              <Heart className="h-4 w-4 text-orange-500" />
              Wishlist ({wishlistItems.length})
            </Link>
            <button
              onClick={() => {
                onClose();
                openDrawer();
              }}
              className="flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 transition"
            >
              <ShoppingCart className="h-4 w-4" />
              Cart ({cartState.totalItems})
            </button>
          </div>

          <div className="space-y-2.5 text-xs text-gray-500 pl-2">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-orange-500" />
              <span>+08 9229 8228</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-orange-500" />
              <span>English / USD</span>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}
