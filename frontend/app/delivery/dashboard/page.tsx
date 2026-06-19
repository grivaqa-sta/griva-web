// FEATURE: Delivery Boy System
// Created: 2026-06-18
// Do not modify without checking delivery feature docs

"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

interface OrderItem {
  id: number;
  quantity: number;
  price_at_purchase: string;
  product?: {
    id: number;
    title: string;
    main_image_url?: string;
    price?: string;
  };
}

interface DeliveryOrder {
  id: number;
  order_number?: string;
  status: string;
  total_price: string;
  shipping_address: string;
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
  payment_method: string;
  payment_status?: string;
  delivery_notes?: string;
  city?: string;
  assigned_at?: string;
  items?: OrderItem[];
  user?: { id: number; name: string; email: string };
}

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  assigned:          { label: "Assigned",         color: "text-blue-700",   bg: "bg-blue-50 border-blue-200" },
  out_for_delivery:  { label: "Out for Delivery", color: "text-orange-700", bg: "bg-orange-50 border-orange-200" },
  delivered:         { label: "Delivered ✅",      color: "text-green-700",  bg: "bg-green-50 border-green-200" },
};

export default function DeliveryDashboard() {
  const router = useRouter();
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Load token (centralized validation is handled by DeliveryLayout)
  useEffect(() => {
    if (typeof window !== "undefined") {
      setToken(localStorage.getItem("griva_delivery_token"));
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/delivery/my-orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401 || res.status === 403) {
        router.replace("/delivery/login");
        return;
      }
      if (!res.ok) { setError("Something went wrong, try again."); setLoading(false); return; }
      const data = await res.json();
      setOrders(data.orders || []);
    } catch {
      setError("Check your internet connection.");
    } finally {
      setLoading(false);
    }
  }, [token, router]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleStatusUpdate = async (orderId: number, newStatus: string) => {
    if (!token) return;
    setUpdatingId(orderId);
    try {
      const res = await fetch(`${API_BASE}/delivery/orders/${orderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.status === 401 || res.status === 403) {
        router.replace("/delivery/login"); return;
      }
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
        );
      } else {
        const data = await res.json();
        alert(data.message || "Failed to update status.");
      }
    } catch {
      alert("Check your internet connection.");
    } finally {
      setUpdatingId(null);
    }
  };

  // Parse total price — remove $ prefix if present
  const parseTotal = (tp: string) => {
    const num = parseFloat(String(tp).replace(/[$,]/g, ""));
    return isNaN(num) ? "0.00" : num.toFixed(2);
  };

  const todayStr = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return (
    <div className="space-y-5">
      {/* Today header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-black text-gray-900">My Deliveries</h1>
          <p className="text-xs text-gray-400 font-semibold">{todayStr}</p>
        </div>
        <button
          onClick={fetchOrders}
          disabled={loading}
          className="text-xs font-bold text-orange-500 bg-orange-50 border border-orange-200 px-3 py-2 rounded-xl active:bg-orange-100 cursor-pointer disabled:opacity-50"
          style={{ minHeight: "40px" }}
        >
          {loading ? "Loading..." : "↻ Refresh"}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-xs font-bold p-3 rounded-xl text-center">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && orders.length === 0 && (
        <div className="text-center py-16">
          <div className="h-8 w-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-gray-400 font-semibold">Loading orders...</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && orders.length === 0 && !error && (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
          <div className="text-4xl mb-3">📦</div>
          <h3 className="text-sm font-black text-gray-600">No Orders Today</h3>
          <p className="text-xs text-gray-400 mt-1">Pull to refresh or tap the Refresh button.</p>
        </div>
      )}

      {/* Order Cards */}
      {orders.map((order) => {
        const statusCfg = STATUS_LABELS[order.status] || { label: order.status, color: "text-gray-600", bg: "bg-gray-50 border-gray-200" };
        const totalAmount = parseTotal(order.total_price);
        const isCOD = order.payment_method?.toUpperCase().includes("COD");
        const customerName = order.customer_name || order.user?.name || "Customer";
        const customerPhone = order.customer_phone || "";
        const isUpdating = updatingId === order.id;

        return (
          <div key={order.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            {/* Card Header */}
            <div className="px-4 pt-4 pb-3 flex items-center justify-between">
              <div>
                <span className="text-xs font-black text-gray-800">
                  {order.order_number || `ORD-${String(order.id).padStart(4, "0")}`}
                </span>
                <span className={`ml-2 inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-lg border ${statusCfg.bg} ${statusCfg.color}`}>
                  {statusCfg.label}
                </span>
              </div>
              {/* Payment badge */}
              {isCOD ? (
                <span className="text-[10px] font-black text-red-600 bg-red-50 border border-red-200 px-2.5 py-1 rounded-lg">
                  Collect QAR {totalAmount}
                </span>
              ) : (
                <span className="text-[10px] font-black text-green-600 bg-green-50 border border-green-200 px-2.5 py-1 rounded-lg">
                  Already Paid
                </span>
              )}
            </div>

            {/* Customer Info */}
            <div className="px-4 pb-3 space-y-2">
              <div>
                <p className="text-xs font-bold text-gray-800">👤 {customerName}</p>
                {customerPhone && (
                  <a
                    href={`tel:${customerPhone}`}
                    className="text-xs font-bold text-blue-600 underline block mt-0.5"
                  >
                    📞 {customerPhone}
                  </a>
                )}
              </div>
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">📍 Delivery Address</p>
                <p className="text-xs font-semibold text-gray-700 leading-relaxed">
                  {order.shipping_address}
                  {order.city && `, ${order.city}`}
                </p>
              </div>
              {order.delivery_notes && (
                <p className="text-xs text-gray-500 italic">📝 {order.delivery_notes}</p>
              )}
            </div>

            {/* Items */}
            <div className="px-4 pb-3">
              <p className="text-[10px] font-bold text-gray-400 uppercase mb-1.5">Items ({order.items?.length || 0})</p>
              {(order.items || []).map((item) => (
                <div key={item.id} className="flex items-center gap-2 py-1.5 border-b border-gray-50 last:border-b-0">
                  <span className="text-xs text-gray-700 flex-1 truncate">
                    {item.product?.title || `Product #${item.id}`}
                  </span>
                  <span className="text-[10px] font-bold text-gray-500 shrink-0">×{item.quantity}</span>
                </div>
              ))}
              <div className="flex justify-between items-center pt-2 mt-1 border-t border-gray-100">
                <span className="text-xs font-bold text-gray-500">Total</span>
                <span className="text-sm font-black text-gray-900">QAR {totalAmount}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="px-4 pb-4 space-y-2">
              {/* Status action button */}
              {order.status === "assigned" && (
                <button
                  onClick={() => handleStatusUpdate(order.id, "out_for_delivery")}
                  disabled={isUpdating}
                  className="w-full bg-blue-500 hover:bg-blue-600 active:bg-blue-700 disabled:opacity-60 text-white text-sm font-bold py-3.5 rounded-xl transition-colors cursor-pointer"
                  style={{ minHeight: "48px" }}
                >
                  {isUpdating ? "Updating..." : "🚚 Pick Up Order"}
                </button>
              )}
              {order.status === "out_for_delivery" && (
                <button
                  onClick={() => handleStatusUpdate(order.id, "delivered")}
                  disabled={isUpdating}
                  className="w-full bg-green-500 hover:bg-green-600 active:bg-green-700 disabled:opacity-60 text-white text-sm font-bold py-3.5 rounded-xl transition-colors cursor-pointer"
                  style={{ minHeight: "48px" }}
                >
                  {isUpdating ? "Updating..." : "✅ Mark as Delivered"}
                </button>
              )}
              {order.status === "delivered" && (
                <div className="w-full text-center text-green-600 text-sm font-bold py-3.5 bg-green-50 border border-green-200 rounded-xl">
                  Delivered ✅
                </div>
              )}

              {/* Utility buttons */}
              <div className="flex gap-2">
                <a
                  href={`tel:${customerPhone}`}
                  className="flex-1 text-center text-xs font-bold text-blue-600 bg-blue-50 border border-blue-200 py-3 rounded-xl active:bg-blue-100"
                  style={{ minHeight: "48px", display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  📞 Call Customer
                </a>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.shipping_address + (order.city ? `, ${order.city}, Qatar` : ", Qatar"))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-center text-xs font-bold text-orange-600 bg-orange-50 border border-orange-200 py-3 rounded-xl active:bg-orange-100"
                  style={{ minHeight: "48px", display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  🗺️ Open Maps
                </a>
              </div>

              {/* View detail link */}
              <Link
                href={`/delivery/order/${order.id}`}
                className="block w-full text-center text-xs font-bold text-gray-500 bg-gray-50 border border-gray-200 py-2.5 rounded-xl active:bg-gray-100"
              >
                View Full Details →
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
