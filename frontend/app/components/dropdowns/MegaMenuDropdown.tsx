"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface Subcategory {
  label: string;
  href: string;
}

interface CategoryWithSubs {
  title: string;
  href: string;
  image: string;
  subcategories: Subcategory[];
}

interface MegaMenuDropdownProps {
  categories: CategoryWithSubs[];
  isOpen: boolean;
  onClose: () => void;
}

export default function MegaMenuDropdown({
  categories,
  isOpen,
  onClose,
}: MegaMenuDropdownProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop to close when clicked outside */}
          <div 
            className="fixed inset-0 z-40 bg-black/10 backdrop-blur-[2px]" 
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="absolute left-0 right-0 top-full z-50 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pt-2"
          >
            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white/95 p-8 shadow-2xl backdrop-blur-md grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-8">
              {categories.map((category) => (
                <div key={category.title} className="space-y-4">
                  {/* Category Card Header */}
                  <div className="group relative h-28 w-full overflow-hidden rounded-xl bg-gray-100">
                    <img
                      src={category.image}
                      alt={category.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/40 to-transparent flex items-end p-3">
                      <Link
                        href={category.href}
                        onClick={onClose}
                        className="text-xs font-bold text-white hover:underline uppercase tracking-wider line-clamp-2"
                      >
                        {category.title}
                      </Link>
                    </div>
                  </div>

                  {/* Subcategories List */}
                  <ul className="space-y-2">
                    {category.subcategories.map((sub) => (
                      <li key={sub.label}>
                        <Link
                          href={sub.href}
                          onClick={onClose}
                          className="group flex items-center text-xs font-semibold text-gray-600 transition hover:text-orange-500"
                        >
                          <span className="mr-1.5 h-1 w-1 rounded-full bg-gray-300 transition-colors group-hover:bg-orange-500" />
                          <span className="line-clamp-1">{sub.label}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
