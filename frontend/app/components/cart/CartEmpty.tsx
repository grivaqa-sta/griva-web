"use client";

import { ShoppingCart } from "lucide-react";
import Link from "next/link";

interface CartEmptyProps {
  onClose?: () => void;
}

export default function CartEmpty({ onClose }: CartEmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-50 text-orange-500 mb-6">
        <ShoppingCart className="h-8 w-8" />
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-2">
        Your Cart is Empty
      </h3>
      <p className="text-sm text-gray-500 max-w-[240px] mb-8">
        Looks like you haven&rsquo;t added anything to your cart yet.
      </p>
      <Link
        href="/shop"
        onClick={onClose}
        className="inline-flex items-center justify-center rounded-xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white hover:bg-orange-600 transition-colors shadow-md shadow-orange-500/10"
      >
        Start Shopping
      </Link>
    </div>
  );
}
