"use client";

import Image from "next/image";
import { Plus, Minus, Trash2 } from "lucide-react";
import { CartItem as CartItemType } from "@/app/types/types";
import { useCart } from "@/app/context/CartContext";
import { motion } from "framer-motion";

interface CartItemProps {
  item: CartItemType;
}

export default function CartItem({ item }: CartItemProps) {
  const { dispatch } = useCart();

  const handleIncrement = () => {
    dispatch({
      type: "UPDATE_QTY",
      payload: { id: item.id, quantity: item.quantity + 1 },
    });
  };

  const handleDecrement = () => {
    if (item.quantity > 1) {
      dispatch({
        type: "UPDATE_QTY",
        payload: { id: item.id, quantity: item.quantity - 1 },
      });
    } else {
      handleRemove();
    }
  };

  const handleRemove = () => {
    dispatch({ type: "REMOVE", payload: { id: item.id } });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="flex items-center gap-4 border-b border-gray-100 py-4"
    >
      {/* Product Image */}
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border bg-gray-50 p-2">
        <Image
          src={item.image}
          alt={item.title}
          fill
          sizes="80px"
          className="object-contain"
        />
      </div>

      {/* Item Details */}
      <div className="flex flex-1 flex-col min-w-0">
        <h4 className="truncate text-sm font-semibold text-gray-800">
          {item.title}
        </h4>
        <p className="text-[10px] text-gray-400 uppercase tracking-wider">
          {item.category}
        </p>

        {/* Selected variants */}
        {(item.selectedColor || item.selectedStorage) && (
          <div className="mt-1 flex flex-wrap gap-2">
            {item.selectedColor && (
              <span className="inline-flex items-center rounded-md bg-gray-50 border px-1.5 py-0.5 text-[10px] font-medium text-gray-600">
                Color: {item.selectedColor}
              </span>
            )}
            {item.selectedStorage && (
              <span className="inline-flex items-center rounded-md bg-gray-50 border px-1.5 py-0.5 text-[10px] font-medium text-gray-600">
                Storage: {item.selectedStorage}
              </span>
            )}
          </div>
        )}

        {/* Quantity Controls & Price */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center rounded-lg border border-gray-200">
            <button
              onClick={handleDecrement}
              className="flex h-7 w-7 items-center justify-center text-gray-500 hover:bg-orange-50 hover:text-orange-500 transition-colors rounded-l-lg"
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="w-8 text-center text-xs font-bold text-gray-700">
              {item.quantity}
            </span>
            <button
              onClick={handleIncrement}
              className="flex h-7 w-7 items-center justify-center text-gray-500 hover:bg-orange-50 hover:text-orange-500 transition-colors rounded-r-lg"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>

          <span className="text-sm font-bold text-orange-500">
            QAR {(item.priceNumber * item.quantity).toFixed(2)}
          </span>
        </div>
      </div>

      {/* Remove Button */}
      <button
        onClick={handleRemove}
        className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors shrink-0"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </motion.div>
  );
}
