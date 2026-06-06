"use client";

import { useRef, useEffect } from "react";
import { X, ShoppingBag } from "lucide-react";
import { useCart } from "@/app/context/CartContext";
import CartItem from "./CartItem";
import CartEmpty from "./CartEmpty";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function CartDrawer() {
  const { state, isDrawerOpen, closeDrawer } = useCart();
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeDrawer();
      }
    }
    if (isDrawerOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isDrawerOpen, closeDrawer]);

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={closeDrawer}
            className="fixed inset-0 z-[10000] bg-black"
          />

          {/* Drawer content */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            ref={drawerRef}
            className="fixed top-10 bottom-0 right-0 z-[10000] flex w-full max-w-md flex-col bg-white shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b px-6 py-5">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-orange-500" />
                <h2 className="text-lg font-bold text-gray-900">
                  Shopping Cart ({state.totalItems})
                </h2>
              </div>
              <button
                onClick={closeDrawer}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content area */}
            <div className="flex-1 overflow-y-auto px-6">
              {state.items.length > 0 ? (
                <div className="flex flex-col">
                  <AnimatePresence initial={false}>
                    {state.items.map((item) => (
                      <CartItem key={item.id} item={item} />
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                <CartEmpty onClose={closeDrawer} />
              )}
            </div>

            {/* Footer order summary */}
            {state.items.length > 0 && (
              <div className="border-t bg-gray-50 px-6 py-6 space-y-4">
                <div className="flex justify-between text-base font-semibold text-gray-900">
                  <span>Subtotal</span>
                  <span className="text-orange-500">${state.totalPrice.toFixed(2)}</span>
                </div>
                <p className="text-xs text-gray-400">
                  Shipping and taxes calculated at checkout.
                </p>

                <div className="flex flex-col gap-2 pt-2">
                  <Link
                    href="/cart"
                    onClick={closeDrawer}
                    className="flex items-center justify-center rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-800 hover:bg-gray-50 transition-colors"
                  >
                    View Full Cart
                  </Link>
                  <Link
                    href="/checkout"
                    onClick={closeDrawer}
                    className="flex w-full items-center justify-center rounded-xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/10 cursor-pointer"
                  >
                    Proceed to Checkout
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
