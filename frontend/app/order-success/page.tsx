"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { CheckCircle, Package, ShoppingBag, MessageSquare } from "lucide-react";

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("order");
  const urlTotal = searchParams.get("total");

  const [whatsappNumber, setWhatsappNumber] = useState("+97455551234");
  const [lastOrderInfo, setLastOrderInfo] = useState<{ phone?: string; total?: string } | null>(null);

  useEffect(() => {
    // Read from localStorage
    try {
      const stored = localStorage.getItem("griva-last-order");
      if (stored) {
        setLastOrderInfo(JSON.parse(stored));
      }
    } catch {}

    // Fetch settings for WhatsApp number
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings`);
        if (res.ok) {
          const data = await res.json();
          if (data?.settings?.whatsappNumber) {
            setWhatsappNumber(data.settings.whatsappNumber);
          }
        }
      } catch {}
    };
    fetchSettings();
  }, []);

  const orderTotal = urlTotal || lastOrderInfo?.total || "";
  const cleanedWhatsapp = whatsappNumber.replace(/[^\d]/g, "");

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

        {orderNumber && (
          <div className="mt-4 mb-6">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Order Number</p>
            <p className="text-2xl font-black text-orange-500 tracking-wide">{orderNumber}</p>
          </div>
        )}

        <p className="text-gray-600 mb-6 text-sm leading-relaxed">
          Thank you for your purchase. Your order has been placed and will be processed soon.
          You have chosen <strong className="text-gray-900">Cash on Delivery (COD)</strong> as your payment method.
        </p>

        {/* WhatsApp Click to Confirm */}
        {orderNumber && (
          <div className="bg-green-50/60 rounded-2xl p-5 mb-6 border border-green-100 text-left">
            <h4 className="text-sm font-bold text-green-800 mb-1 flex items-center gap-1.5">
              <MessageSquare className="h-4 w-4 text-green-600" />
              WhatsApp Confirmation
            </h4>
            <p className="text-xs text-green-700 mb-4 leading-relaxed">
              In Qatar, confirming your order via WhatsApp helps speed up the processing and delivery. Click below to share your order details with our support team.
            </p>
            <a
              href={`https://wa.me/${cleanedWhatsapp}?text=${encodeURIComponent(
                `Hello Griva! I would like to confirm my order: *${orderNumber}*\nTotal Amount: *${orderTotal}*`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] text-white hover:bg-[#20ba5a] py-3 text-sm font-bold transition-all shadow-md shadow-green-500/10 cursor-pointer"
            >
              Confirm on WhatsApp
            </a>
          </div>
        )}

        <div className="bg-orange-50/50 rounded-xl p-4 mb-6 border border-orange-100 text-left text-xs leading-relaxed text-orange-800">
          <p className="font-semibold mb-1">💡 Guest checkout notes:</p>
          <p className="mb-2">
            You checked out as a guest. You can track this order's status at any time using your order number and phone number.
          </p>
          <p>
            If you decide to register a customer account using the same phone number or email in the future, all your guest orders will be automatically linked to your new profile.
          </p>
        </div>

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
