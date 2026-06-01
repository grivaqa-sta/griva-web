"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface DropdownItem {
  label: string;
  href: string;
}

interface NavDropdownProps {
  items: DropdownItem[];
  isOpen: boolean;
}

export default function ShopeCategoryDropDown({
  items,
  isOpen,
}: NavDropdownProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="absolute left-0 top-full z-50 w-56 pt-2"
        >
          <div className="rounded-md border border-gray-100 bg-white py-2 shadow-xl">
            {items.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="block px-5 py-2.5 text-sm font-medium text-black transition hover:bg-orange-50 hover:text-orange-500"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}