// FEATURE: Delivery Boy System
// Created: 2026-06-18
// Do not modify without checking delivery feature docs

"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

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

export default function DeliveryOrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<DeliveryOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Load token (centralized validation is handled by DeliveryLayout)
  useEffect(() => {
    if (typeof window !== "undefined") {
      setToken(localStorage.getItem("griva_delivery_token"));
    }
  }, []);

  // Fetch order
  useEffect(() => {
    if (!token || !orderId) return;
    const fetchOrder = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/delivery/my-orders`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.status === 401 || res.status === 403) {
          router.replace("/delivery/login"); return;
        }
        if (!res.ok) { setError("Something went wrong, try again."); setLoading(false); return; }
        const data = await res.json();
        const found = (data.orders || []).find((o: DeliveryOrder) => String(o.id) === orderId);
        if (!found) { setError("Order not found or not assigned to you."); }
        else { setOrder(found); }
      } catch {
        setError("Check your internet connection.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [token, orderId, router]);

  const handleStatusUpdate = async (newStatus: string) => {
    if (!token || !order) return;
    setUpdating(true);
    try {
      const res = await fetch(`${API_BASE}/delivery/orders/${order.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setOrder((prev) => prev ? { ...prev, status: newStatus } : prev);
      } else {
        const data = await res.json();
        alert(data.message || "Failed to update status.");
      }
    } catch {
      alert("Check your internet connection.");
    } finally {
      setUpdating(false);
    }
  };

  const copyAddress = () => {
    if (!order) return;
    const fullAddr = order.shipping_address + (order.city ? `, ${order.city}` : "");
    navigator.clipboard.writeText(fullAddr).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const parseTotal = (tp: string) => {
    const num = parseFloat(String(tp).replace(/[$,]/g, ""));
    return isNaN(num) ? "0.00" : num.toFixed(2);
  };

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="h-8 w-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-gray-400 font-semibold">Loading order...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="text-center py-20">
        <p className="text-sm text-red-500 font-bold">{error || "Order not found."}</p>
        <button
          onClick={() => router.push("/delivery/dashboard")}
          className="mt-4 text-xs font-bold text-orange-500 underline cursor-pointer"
        >
          ← Back to Dashboard
        </button>
      </div>
    );
  }

  const totalAmount = parseTotal(order.total_price);
  const isCOD = order.payment_method?.toUpperCase().includes("COD");
  const customerName = order.customer_name || order.user?.name || "Customer";
  const customerPhone = order.customer_phone || "";
  const fullAddress = order.shipping_address + (order.city ? `, ${order.city}` : "");

  return (
    <div className="space-y-4 pb-28">
      {/* Back button */}
      <button
        onClick={() => router.push("/delivery/dashboard")}
        className="text-xs font-bold text-gray-500 cursor-pointer"
      >
        ← Back to Dashboard
      </button>

      {/* Order Header */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-black text-gray-900">
            {order.order_number || `ORD-${String(order.id).padStart(4, "0")}`}
          </h2>
          {isCOD ? (
            <span className="text-xs font-black text-red-600 bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg">
              COD: QAR {totalAmount}
            </span>
          ) : (
            <span className="text-xs font-black text-green-600 bg-green-50 border border-green-200 px-3 py-1.5 rounded-lg">
              Paid ✅
            </span>
          )}
        </div>

        {/* Customer */}
        <div className="space-y-2.5">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase">Customer</p>
            <p className="text-sm font-bold text-gray-800 mt-0.5">👤 {customerName}</p>
          </div>
          {customerPhone && (
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase">Phone</p>
              <a href={`tel:${customerPhone}`} className="text-sm font-bold text-blue-600 underline block mt-0.5">
                📞 {customerPhone}
              </a>
            </div>
          )}
          {order.customer_email && (
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase">Email</p>
              <p className="text-xs text-gray-600 mt-0.5">{order.customer_email}</p>
            </div>
          )}
        </div>
      </div>

      {/* Address Card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] font-bold text-gray-400 uppercase">📍 Delivery Address</p>
          <button
            onClick={copyAddress}
            className="text-[10px] font-bold text-orange-500 bg-orange-50 border border-orange-200 px-2 py-1 rounded-lg cursor-pointer active:bg-orange-100"
          >
            {copied ? "Copied ✅" : "📋 Copy"}
          </button>
        </div>
        <p className="text-sm font-semibold text-gray-800 leading-relaxed">{fullAddress}</p>
        {order.delivery_notes && (
          <p className="text-xs text-gray-500 italic mt-2 pt-2 border-t border-gray-100">📝 {order.delivery_notes}</p>
        )}
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress + ", Qatar")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full text-center text-xs font-bold text-orange-600 bg-orange-50 border border-orange-200 py-3 rounded-xl mt-3 active:bg-orange-100"
          style={{ minHeight: "48px", display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          🗺️ Open in Google Maps
        </a>
      </div>

      {/* Items */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4">
        <p className="text-[10px] font-bold text-gray-400 uppercase mb-3">Order Items ({order.items?.length || 0})</p>
        {(order.items || []).map((item) => (
          <div key={item.id} className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-b-0">
            <div className="h-12 w-12 rounded-xl overflow-hidden bg-gray-100 shrink-0">
              {item.product?.main_image_url ? (
                <img src={item.product.main_image_url} alt={item.product.title} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-gray-300 text-lg">📦</div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-gray-800 truncate">{item.product?.title || `Product #${item.id}`}</p>
              <p className="text-[10px] text-gray-400">Qty: {item.quantity}</p>
            </div>
            <span className="text-xs font-black text-gray-800 shrink-0">
              QAR {(parseFloat(String(item.price_at_purchase).replace(/[$,]/g, "")) * item.quantity).toFixed(2)}
            </span>
          </div>
        ))}
        <div className="flex justify-between items-center pt-3 mt-2 border-t-2 border-gray-200">
          <span className="text-sm font-bold text-gray-500">Total Amount</span>
          <span className="text-lg font-black text-gray-900">QAR {totalAmount}</span>
        </div>
      </div>

      {/* Sticky Bottom Action */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50" style={{ maxWidth: "480px", margin: "0 auto" }}>
        {order.status === "assigned" && (
          <button
            onClick={() => handleStatusUpdate("out_for_delivery")}
            disabled={updating}
            className="w-full bg-blue-500 hover:bg-blue-600 active:bg-blue-700 disabled:opacity-60 text-white text-base font-bold py-4 rounded-xl transition-colors cursor-pointer"
            style={{ minHeight: "52px" }}
          >
            {updating ? "Updating..." : "🚚 Pick Up Order"}
          </button>
        )}
        {order.status === "out_for_delivery" && (
          <button
            onClick={() => handleStatusUpdate("delivered")}
            disabled={updating}
            className="w-full bg-green-500 hover:bg-green-600 active:bg-green-700 disabled:opacity-60 text-white text-base font-bold py-4 rounded-xl transition-colors cursor-pointer"
            style={{ minHeight: "52px" }}
          >
            {updating ? "Updating..." : "✅ Mark as Delivered"}
          </button>
        )}
        {order.status === "delivered" && (
          <div className="w-full text-center text-green-600 text-base font-bold py-4 bg-green-50 border border-green-200 rounded-xl">
            Delivered ✅
          </div>
        )}
        {customerPhone && (
          <a
            href={`tel:${customerPhone}`}
            className="block w-full text-center text-sm font-bold text-blue-600 bg-blue-50 border border-blue-200 py-3.5 rounded-xl mt-2 active:bg-blue-100"
            style={{ minHeight: "48px", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            📞 Call Customer
          </a>
        )}
      </div>
    </div>
  );
}
