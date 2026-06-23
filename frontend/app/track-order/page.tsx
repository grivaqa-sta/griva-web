"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { orderService, TrackedOrder } from "@/app/services/order.service";
import SectionHeading from "@/app/components/common/SectionHeading";
import {
  Search,
  Package,
  Calendar,
  MapPin,
  CreditCard,
  AlertCircle,
  CheckCircle2,
  Truck,
  Loader2,
  Clock,
  ArrowRight,
  ShoppingBag,
} from "lucide-react";

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const initialOrder = searchParams.get("order") || "";
  const initialPhone = searchParams.get("phone") || "";

  const [orderNumber, setOrderNumber] = useState(initialOrder);
  const [phone, setPhone] = useState(initialPhone);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [guestOrders, setGuestOrders] = useState<Array<{ order_number: string; phone: string; total: string; date?: string }>>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("griva-guest-orders");
      if (stored) {
        setGuestOrders(JSON.parse(stored));
      }
    } catch {}
  }, []);


  // Auto-search if query params are present
  useEffect(() => {
    if (initialOrder && initialPhone) {
      handleSearch(initialOrder, initialPhone);
    }
  }, [initialOrder, initialPhone]);

  const handleSearch = async (targetOrder = orderNumber, targetPhone = phone) => {
    if (!targetOrder.trim() || !targetPhone.trim()) {
      setError("Please fill in both fields.");
      return;
    }

    setLoading(true);
    setError("");
    setOrder(null);

    try {
      const response = await orderService.trackOrder(targetOrder.trim(), targetPhone.trim());
      if (response.success && response.order) {
        setOrder(response.order);
      } else {
        setError(response.message || "Could not find order. Please verify details.");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        "An error occurred while tracking. Please check your credentials and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const getMilestoneIndex = (status: string): number => {
    switch (status) {
      case "pending":
        return 0;
      case "processing":
      case "assigned":
        return 1;
      case "out_for_delivery":
      case "shipped":
        return 2;
      case "delivered":
      case "completed":
        return 3;
      default:
        return 0;
    }
  };

  const milestones = [
    { label: "Placed", desc: "Order received", icon: Clock },
    { label: "Processing", desc: "Being packaged", icon: Package },
    { label: "In Transit", desc: "Out with rider", icon: Truck },
    { label: "Delivered", desc: "Received successfully", icon: CheckCircle2 },
  ];

  const currentStep = order ? getMilestoneIndex(order.status) : 0;
  const isCancelled = order?.status === "cancelled";

  return (
    <div className="bg-gray-50/50 min-h-screen py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <SectionHeading title="Track Your Order" subtitle="Enter order number and phone number for real-time status" />

        {/* Search Panel */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label htmlFor="orderNumber" className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                Order Number
              </label>
              <input
                id="orderNumber"
                type="text"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="e.g. GRV-20260619-0001"
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 focus:border-orange-500 focus:outline-none transition shadow-sm"
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                Customer Phone
              </label>
              <input
                id="phone"
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +97455551234"
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 focus:border-orange-500 focus:outline-none transition shadow-sm"
              />
            </div>
          </div>

          <button
            onClick={() => handleSearch()}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 py-3.5 text-sm font-bold text-white transition-all shadow-md shadow-orange-500/10 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Finding Order...
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                Track Order
              </>
            )}
          </button>

          {error && (
            <div className="mt-6 flex items-start gap-2.5 rounded-2xl bg-red-50 border border-red-100 p-4 text-xs text-red-800 animate-fadeIn">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
              <div>
                <p className="font-semibold">Tracking failed</p>
                <p className="mt-0.5">{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* Recent Guest Orders List */}
        {!order && guestOrders.length > 0 && (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8 mt-6">
            <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Package className="h-4.5 w-4.5 text-orange-500" />
              Recent Guest Orders
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {guestOrders.map((gOrder) => (
                <div
                  key={gOrder.order_number}
                  onClick={() => {
                    setOrderNumber(gOrder.order_number);
                    setPhone(gOrder.phone);
                    handleSearch(gOrder.order_number, gOrder.phone);
                  }}
                  className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-orange-50/30 hover:border-orange-200 transition-all cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <div className="h-9 w-9 rounded-xl bg-orange-100/60 border border-orange-200/50 flex items-center justify-center text-orange-600 shrink-0">
                      <ShoppingBag className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-800 group-hover:text-orange-500 transition-colors">
                        {gOrder.order_number}
                      </p>
                      <p className="text-[10px] text-gray-400 font-semibold mt-0.5">
                        {gOrder.date
                          ? new Date(gOrder.date).toLocaleDateString("en-US", {
                              dateStyle: "medium",
                            })
                          : "Recently placed"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 mt-3 sm:mt-0">
                    <div className="sm:text-right">
                      <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Total Amount</p>
                      <p className="text-xs font-bold text-gray-800">{gOrder.total}</p>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-orange-500 group-hover:translate-x-0.5 transition-transform">
                      Track Now <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Order Details Display */}
        {order && (
          <div className="mt-8 space-y-6 animate-fadeIn">
            {/* Header info */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4 gap-4">
                <div>
                  <span className="text-xs font-bold text-orange-500 bg-orange-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                    {order.status.replace("_", " ")}
                  </span>
                  <h3 className="text-xl font-black text-gray-900 mt-2">
                    Order {order.order_number}
                  </h3>
                </div>
                <div className="text-right sm:text-right">
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Total Price</p>
                  <p className="text-xl font-black text-orange-500 mt-1">{order.total_price}</p>
                </div>
              </div>

              {/* Cancelled Alert Banner */}
              {isCancelled && (
                <div className="my-6 flex items-center gap-2 rounded-xl bg-red-50 border border-red-100 p-4 text-sm text-red-800">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <span>This order has been cancelled. Please contact customer care for assistance.</span>
                </div>
              )}

              {/* Status Timeline */}
              {!isCancelled && (
                <div className="my-8">
                  <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-2">
                    {/* Progress line for desktop */}
                    <div className="absolute hidden md:block left-0 right-0 h-1 bg-gray-100 top-1/2 -translate-y-1/2 z-0" />
                    <div
                      className="absolute hidden md:block left-0 h-1 bg-orange-500 top-1/2 -translate-y-1/2 transition-all duration-500 z-0"
                      style={{ width: `${(currentStep / 3) * 100}%` }}
                    />

                    {milestones.map((m, idx) => {
                      const Icon = m.icon;
                      const active = idx <= currentStep;
                      return (
                        <div key={m.label} className="flex md:flex-col items-center gap-4 md:gap-2 relative z-10 w-full md:w-auto">
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                              active
                                ? "bg-orange-500 border-orange-500 text-white shadow-md shadow-orange-500/20"
                                : "bg-white border-gray-200 text-gray-300"
                            }`}
                          >
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="md:text-center text-left">
                            <p className={`text-xs font-bold ${active ? "text-gray-900" : "text-gray-400"}`}>
                              {m.label}
                            </p>
                            <p className="text-[10px] text-gray-400 font-semibold">{m.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Details grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-gray-100 text-sm">
                <div className="space-y-1">
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-gray-400" /> Date & Time
                  </p>
                  <p className="font-semibold text-gray-800">
                    {new Date(order.createdAt).toLocaleString("en-US", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-gray-400" /> Delivery Address
                  </p>
                  <p className="font-semibold text-gray-800 leading-snug">
                    {order.shipping_address}
                  </p>
                  {order.delivery_notes && (
                    <p className="text-xs text-orange-500 mt-1">
                      Note: &ldquo;{order.delivery_notes}&rdquo;
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <CreditCard className="h-3.5 w-3.5 text-gray-400" /> Payment Info
                  </p>
                  <p className="font-semibold text-gray-800">
                    {order.payment_method}
                  </p>
                  <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded mt-1 uppercase ${
                    order.payment_status === "paid" 
                      ? "bg-green-50 text-green-700 border border-green-200" 
                      : "bg-red-50 text-red-700 border border-red-200"
                  }`}>
                    {order.payment_status}
                  </span>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8">
              <h4 className="text-base font-bold text-gray-900 mb-4 border-b pb-3">Items in Order</h4>
              <div className="divide-y divide-gray-100">
                {order.items &&
                  order.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                      <div className="relative h-14 w-14 shrink-0 rounded-lg border bg-gray-50 p-1">
                        <Image
                          src={item.product?.main_image_url || "/placeholder-product.png"}
                          alt={item.product?.title || "Product"}
                          fill
                          sizes="56px"
                          className="object-contain"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {item.product?.title || "Unknown Product"}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-400 font-semibold">
                          <span>Qty: {item.quantity}</span>
                          {item.selected_color && (
                            <span className="bg-gray-50 border px-1 py-0.2 rounded text-[10px]">
                              {item.selected_color}
                            </span>
                          )}
                          {item.selected_storage && (
                            <span className="bg-gray-50 border px-1 py-0.2 rounded text-[10px]">
                              {item.selected_storage}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-orange-500">
                          QAR {(parseFloat(item.price_at_purchase as string) * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>


          </div>
        )}
      </div>
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-gray-50/50 min-h-[70vh] flex items-center justify-center">
          <div className="h-8 w-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <TrackOrderContent />
    </Suspense>
  );
}
