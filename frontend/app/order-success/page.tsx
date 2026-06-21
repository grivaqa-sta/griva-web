"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { CheckCircle, Package, ShoppingBag } from "lucide-react";
import { useUser } from "@/app/context/UserContext";

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("order");
  const urlTotal = searchParams.get("total");
  const slotName = searchParams.get("slot");

  const { isAuthenticated } = useUser();
  const [lastOrderInfo, setLastOrderInfo] = useState<{ phone?: string; total?: string } | null>(null);

  useEffect(() => {
    // Read from localStorage
    try {
      const stored = localStorage.getItem("griva-last-order");
      if (stored) {
        setLastOrderInfo(JSON.parse(stored));
      }
    } catch {}
  }, []);

  return (
    <div className="bg-gray-50/50 min-h-[85vh] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full bg-white p-8 sm:p-10 rounded-3xl shadow-sm border border-gray-100 text-center">
        <div className="flex justify-center mb-6">
          <div className="h-20 w-20 rounded-full bg-green-50 border-2 border-green-200 flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-green-500" />
          </div>
        </div>

        <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
          Order Placed Successfully!
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 mb-6 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
          {orderNumber && (
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Order Number</p>
              <p className="text-lg font-black text-orange-500 tracking-wide">{orderNumber}</p>
            </div>
          )}
          {slotName && (
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Preferred Delivery Slot</p>
              <p className="text-sm font-bold text-gray-800 tracking-wide">{slotName}</p>
            </div>
          )}
        </div>

        <p className="text-gray-600 mb-6 text-sm leading-relaxed">
          Thank you for your purchase. Your order has been placed and will be processed soon.
          You have chosen <strong className="text-gray-900">Cash on Delivery (COD)</strong> as your payment method.
        </p>

        {!isAuthenticated && (
          <div className="bg-orange-50/50 rounded-xl p-4 mb-6 border border-orange-100 text-left text-xs leading-relaxed text-orange-800">
            <p className="font-semibold mb-1">💡 Guest checkout notes:</p>
            <p className="mb-2">
              You checked out as a guest. You can track this order's status at any time using your order number and phone number.
            </p>
            <p>
              If you decide to register a customer account using the same phone number or email in the future, all your guest orders will be automatically linked to your new profile.
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href={`/track-order?order=${orderNumber || ""}&phone=${lastOrderInfo?.phone || ""}`}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 py-3 text-sm font-bold text-white hover:bg-orange-600 transition shadow-md shadow-orange-500/10 cursor-pointer"
          >
            <Package className="h-4 w-4" />
            Track Order
          </Link>
          <Link
            href="/shop"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gray-100 px-6 py-3 text-sm font-bold text-gray-700 hover:bg-gray-200 transition cursor-pointer"
          >
            <ShoppingBag className="h-4 w-4" />
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-gray-50/50 min-h-[70vh] flex items-center justify-center">
          <div className="h-8 w-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <OrderSuccessContent />
    </Suspense>
  );
}
