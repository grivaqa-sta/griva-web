"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, ArrowLeft, Trash2, Plus, Minus } from "lucide-react";
import { useCart } from "@/app/context/CartContext";
import SectionHeading from "@/app/components/common/SectionHeading";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/app/context/ToastContext";
import { getSettingsApi } from "@/app/utils/api";

export default function CartPage() {
  const { state, dispatch } = useCart();
  const { confirm, toast } = useToast();

  const handleIncrement = (id: number, currentQty: number) => {
    dispatch({
      type: "UPDATE_QTY",
      payload: { id, quantity: currentQty + 1 },
    });
  };

  const handleDecrement = (id: number, currentQty: number) => {
    if (currentQty > 1) {
      dispatch({
        type: "UPDATE_QTY",
        payload: { id, quantity: currentQty - 1 },
      });
    } else {
      handleRemove(id);
    }
  };

  const handleRemove = (id: number) => {
    dispatch({ type: "REMOVE", payload: { id } });
  };

  const handleClear = async () => {
    const isConfirmed = await confirm(
      "Are you sure you want to remove all items from your cart?",
      "Clear Cart"
    );
    if (isConfirmed) {
      dispatch({ type: "CLEAR" });
      toast.success("Cart cleared successfully.");
    }
  };

  const [shippingConfig, setShippingConfig] = useState({
    shippingFee: 10,
    freeShippingThreshold: 99,
  });

  const [stockStatus, setStockStatus] = useState<Record<number, { available: number; ok: boolean; active: boolean; title: string }>>({});
  const [checkingStock, setCheckingStock] = useState(false);

  useEffect(() => {
    const checkStock = async () => {
      if (state.items.length === 0) return;
      setCheckingStock(true);
      const statusMap: typeof stockStatus = {};
      for (const item of state.items) {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${item.productId}`);
          if (res.ok) {
            const data = await res.json();
            const product = data.data;
            if (product) {
              statusMap[item.id] = {
                available: product.stock,
                ok: item.quantity <= product.stock && product.is_active,
                active: product.is_active,
                title: product.title,
              };
            } else {
              statusMap[item.id] = { available: 0, ok: false, active: false, title: item.title };
            }
          } else {
            statusMap[item.id] = { available: 0, ok: false, active: false, title: item.title };
          }
        } catch (err) {
          console.error(err);
        }
      }
      setStockStatus(statusMap);
      setCheckingStock(false);
    };

    checkStock();
  }, [state.items]);

  const hasCartErrors = Object.values(stockStatus).some((s) => !s.ok);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings = await getSettingsApi();
        if (settings) {
          setShippingConfig({
            shippingFee: settings.shippingFee !== undefined ? Number(settings.shippingFee) : 10,
            freeShippingThreshold: settings.freeShippingThreshold !== undefined ? Number(settings.freeShippingThreshold) : 99,
          });
        }
      } catch {
        // Use defaults silently
      }
    };
    fetchSettings();
  }, []);

  const shippingCost =
    state.totalPrice >= shippingConfig.freeShippingThreshold || state.totalPrice === 0
      ? 0
      : shippingConfig.shippingFee;
  const orderTotal = state.totalPrice + shippingCost;

  return (
    <div className="bg-gray-50/50 min-h-screen py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading title="Your Shopping Cart" subtitle="Manage items before completing purchase" />

        {state.items.length > 0 ? (
          <div className="space-y-6">
            {/* Free Shipping Alert Card */}
            <div className="bg-white rounded-2xl border border-orange-500/20 shadow-sm p-5 animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
                    <span className="text-lg">🚚</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">
                      {state.totalPrice >= shippingConfig.freeShippingThreshold ? (
                        <span className="text-green-600 font-extrabold">You qualify for Free Delivery!</span>
                      ) : (
                        <span>Free Shipping Above QAR {shippingConfig.freeShippingThreshold.toFixed(0)}</span>
                      )}
                    </h4>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      {state.totalPrice >= shippingConfig.freeShippingThreshold ? (
                        "Your order will be shipped free of charge within Qatar."
                      ) : (
                        <>Add <span className="font-bold text-orange-500">QAR {(shippingConfig.freeShippingThreshold - state.totalPrice).toFixed(2)}</span> more to get Free Delivery</>
                      )}
                    </p>
                  </div>
                </div>
                {state.totalPrice < shippingConfig.freeShippingThreshold && (
                  <Link
                    href="/shop"
                    className="text-xs font-bold text-orange-500 hover:text-orange-600 transition shrink-0 self-start sm:self-center"
                  >
                    + Add More Items
                  </Link>
                )}
              </div>

              {/* Progress Bar */}
              <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-500 ease-out rounded-full"
                  style={{
                    width: `${Math.min((state.totalPrice / shippingConfig.freeShippingThreshold) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left side: Item list */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex justify-between items-center mb-2">
                <button
                  onClick={handleClear}
                  className="text-xs font-semibold text-red-500 hover:text-red-600 transition flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Clear Cart
                </button>
                <Link
                  href="/shop"
                  className="text-xs font-semibold text-gray-500 hover:text-orange-500 transition flex items-center gap-1"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Continue Shopping
                </Link>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                <AnimatePresence initial={false}>
                  {state.items.map((item, idx) => (
                    <motion.div
                      layout
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      className={`flex flex-col sm:flex-row items-start sm:items-center gap-4 py-4 ${
                        idx !== state.items.length - 1 ? "border-b border-gray-100" : ""
                      }`}
                    >
                      {/* Image */}
                      <div className="relative h-20 w-20 shrink-0 rounded-lg border bg-gray-50 p-2">
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          sizes="80px"
                          className="object-contain"
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <Link href={`/product/${item.productId}`} className="truncate text-sm font-semibold text-gray-900 hover:text-orange-500 block transition">
                          {item.title}
                        </Link>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
                          {item.category}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          {item.selectedColor && (
                            <span className="text-[10px] bg-gray-50 border px-1.5 py-0.5 rounded text-gray-500">
                              Color: {item.selectedColor}
                            </span>
                          )}
                          {item.selectedStorage && (
                            <span className="text-[10px] bg-gray-50 border px-1.5 py-0.5 rounded text-gray-500">
                              Storage: {item.selectedStorage}
                            </span>
                          )}
                        </div>
                        {/* HIGH-9: Stock error warning notice */}
                        {stockStatus[item.id] && !stockStatus[item.id].ok && (
                          <div className="mt-1.5 text-xs text-red-500 font-bold bg-red-50 border border-red-100 rounded-lg px-2.5 py-1 inline-block animate-fadeIn">
                            {!stockStatus[item.id].active ? (
                              "⚠️ This product is currently inactive / unavailable."
                            ) : (
                              `⚠️ Requested quantity exceeds stock. Only ${stockStatus[item.id].available} available.`
                            )}
                          </div>
                        )}
                      </div>

                      {/* Qty Controls */}
                      <div className="flex items-center rounded-lg border border-gray-200 bg-white">
                        <button
                          onClick={() => handleDecrement(item.id, item.quantity)}
                          className="flex h-8 w-8 items-center justify-center text-gray-500 hover:bg-orange-50 hover:text-orange-500 transition cursor-pointer"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-8 text-center text-xs font-bold text-gray-700">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleIncrement(item.id, item.quantity)}
                          className="flex h-8 w-8 items-center justify-center text-gray-500 hover:bg-orange-50 hover:text-orange-500 transition cursor-pointer"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {/* Price */}
                      <div className="text-right sm:min-w-[80px]">
                        <span className="text-sm font-bold text-orange-500">
                          QAR {(item.priceNumber * item.quantity).toFixed(2)}
                        </span>
                        <p className="text-[10px] text-gray-400">
                          QAR {item.priceNumber.toFixed(2)} each
                        </p>
                      </div>

                      {/* Delete */}
                      <button
                        onClick={() => handleRemove(item.id)}
                        className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors cursor-pointer"
                      >
                        {/* MED-8: Fix invalid Tailwind CSS class */}
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Right side: Order Summary */}
            <div className="lg:col-span-4">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6 sticky top-24">
                <h3 className="text-base font-bold text-gray-900 border-b pb-4">
                  Order Summary
                </h3>

                <div className="space-y-4 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-semibold text-gray-900">QAR {state.totalPrice.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between text-gray-600">
                    <span>Shipping Estimate</span>
                    <span className="font-semibold text-gray-900">
                      {shippingCost === 0 ? (
                        <span className="text-green-600">Free</span>
                      ) : (
                        `QAR ${shippingCost.toFixed(2)}`
                      )}
                    </span>
                  </div>

                  <div className="border-t pt-4 flex justify-between text-base font-bold text-gray-900">
                    <span>Order Total</span>
                    <span className="text-orange-500">QAR {orderTotal.toFixed(2)}</span>
                  </div>
                </div>

                {/* HIGH-9: Disable Proceed to Checkout if stock errors exist */}
                {hasCartErrors ? (
                  <button
                    disabled
                    className="w-full flex items-center justify-center rounded-xl bg-gray-300 py-3.5 text-sm font-bold text-gray-500 cursor-not-allowed shadow-none"
                  >
                    Resolve Stock Issues to Checkout
                  </button>
                ) : (
                  <Link
                    href="/checkout"
                    className="w-full flex items-center justify-center rounded-xl bg-orange-500 py-3.5 text-sm font-semibold text-white hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/10 cursor-pointer"
                  >
                    Proceed to Checkout
                  </Link>
                )}

                <div className="pt-2 text-center text-xs text-gray-400">
                  Secured by 256-bit SSL connection
                </div>
              </div>
            </div>
          </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center max-w-lg mx-auto mt-8">
            <div className="h-16 w-16 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Your Cart is Empty</h3>
            <p className="text-sm text-gray-500 mb-8">
              You haven&rsquo;t added any items to your shopping cart. Discover our latest arrivals and offers!
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center justify-center rounded-xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white hover:bg-orange-600 transition shadow-md shadow-orange-500/10"
            >
              Explore Products
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
