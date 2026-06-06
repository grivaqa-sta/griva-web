"use client";

import Link from "next/link";
import { CheckCircle } from "lucide-react";
import SectionHeading from "@/app/components/common/SectionHeading";

export default function OrderSuccessPage() {
  return (
    <div className="bg-gray-50/50 min-h-[70vh] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full bg-white p-10 rounded-3xl shadow-sm border border-gray-100 text-center">
        <div className="flex justify-center mb-6">
          <CheckCircle className="h-20 w-20 text-green-500" />
        </div>
        
        <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
          Order Placed Successfully!
        </h2>
        
        <p className="text-gray-600 mb-8">
          Thank you for your purchase. Your order has been placed and will be processed soon. 
          You have chosen <strong>Cash on Delivery (COD)</strong> as your payment method.
        </p>

        <div className="bg-orange-50 rounded-xl p-4 mb-8 border border-orange-100">
          <p className="text-sm text-orange-800">
            Please keep exact change ready at the time of delivery for a smooth experience.
          </p>
        </div>

        <Link
          href="/shop"
          className="inline-flex items-center justify-center rounded-xl bg-orange-500 px-8 py-3.5 text-sm font-bold text-white hover:bg-orange-600 transition shadow-md shadow-orange-500/10"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
