"use client";

import Link from "next/link";
import { User, ShoppingCart, ChevronDown, ChevronRight, X, Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/app/context/CartContext";
import { useState } from "react";
import { categoriesTree } from "@/app/data/data";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "Track Order", href: "/track-order" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "FAQ", href: "/faq" },
];

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const { state: cartState, openDrawer } = useCart();
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleCategory = (title: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setExpandedCategory(expandedCategory === title ? null : title);
  };

  return (
    <div>
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
                className={`h-4 w-4 transition-transform duration-200 ${categoriesOpen ? "rotate-180 text-orange-500" : "text-gray-400"
                  }`}
              />
            </button>

            {categoriesOpen && (
              <div className="pl-3 space-y-1 border-l-2 border-gray-100 ml-4 mt-1">
                {categoriesTree.map((cat) => {
                  const isExpanded = expandedCategory === cat.title;
                  return (
                    <div key={cat.title} className="space-y-1">
                      <div className="flex items-center justify-between w-full rounded-md pr-2 hover:bg-gray-55">
                        <Link
                          href={cat.href}
                          onClick={onClose}
                          className="flex-1 block px-3 py-2 text-xs font-semibold text-gray-700 hover:text-orange-500 transition-colors"
                        >
                          {cat.title}
                        </Link>
                        <button
                          onClick={(e) => toggleCategory(cat.title, e)}
                          className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                        >
                          <ChevronRight
                            size={14}
                            className={`transform transition-transform duration-200 ${isExpanded ? "rotate-90 text-orange-500" : ""
                              }`}
                          />
                        </button>
                      </div>

                      {isExpanded && (
                        <div className="pl-4 space-y-1 border-l border-gray-100 ml-4 pb-1">
                          {cat.subcategories.map((sub) => (
                            <Link
                              key={sub.label}
                              href={sub.href}
                              onClick={onClose}
                              className="block rounded-md px-3 py-1.5 text-[11px] font-medium text-gray-500 hover:bg-orange-50 hover:text-orange-500 transition-colors"
                            >
                              {sub.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </nav>

        {/* Footer info & quick buttons */}
        <div className="mt-auto border-t pt-6 space-y-4">
          <div className="flex flex-col gap-2">
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
              <Globe className="h-4 w-4 text-orange-500" />
              <span>English / USD</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
