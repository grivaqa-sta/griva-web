// FEATURE: Delivery Boy System - Luxury Order Details
// Inspired by Apple, Nothing, and Porsche luxury dark design systems

"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  MapPin, 
  Phone, 
  Mail, 
  Compass, 
  Copy, 
  Check, 
  Package, 
  DollarSign, 
  User, 
  ShieldAlert, 
  Clock,
  ExternalLink,
  ChevronRight,
  Sun,
  Moon
} from "lucide-react";

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
  const [toastMessage, setToastMessage] = useState("");
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("griva_delivery_theme") as "dark" | "light";
      if (savedTheme) setTheme(savedTheme);
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("griva_delivery_theme", nextTheme);
    window.dispatchEvent(new CustomEvent("griva-delivery-theme-toggle", { detail: nextTheme }));
  };

  // Load token
  useEffect(() => {
    if (typeof window !== "undefined") {
      setToken(localStorage.getItem("griva_delivery_token"));
    }
  }, []);

  // Fetch order details
  useEffect(() => {
    if (!token || !orderId) return;
    const fetchOrder = async () => {
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
        if (!res.ok) { 
          setError("Something went wrong, try again."); 
          setLoading(false); 
          return; 
        }
        const data = await res.json();
        const found = (data.orders || []).find((o: DeliveryOrder) => String(o.id) === orderId);
        if (!found) { 
          setError("Order not found or not assigned to you."); 
        } else { 
          setOrder(found); 
        }
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
        showToast(`Status: ${newStatus.replace(/_/g, ' ').toUpperCase()}`);
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

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const parseTotal = (tp: string) => {
    const num = parseFloat(String(tp).replace(/[$,]/g, ""));
    return isNaN(num) ? "0.00" : num.toFixed(2);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 border-2 border-[#FF6A00] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-zinc-500 font-semibold tracking-widest animate-pulse">LOADING ORDER DETAILS...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <ShieldAlert size={40} className="text-red-500" />
        <p className="text-sm text-zinc-400 font-semibold">{error || "Order not found."}</p>
        <button
          onClick={() => router.push("/delivery/dashboard")}
          className="flex items-center gap-1.5 text-xs font-bold text-[#FF6A00] bg-zinc-950 border border-zinc-900 hover:border-zinc-800 px-4 py-2.5 rounded-xl cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>Back to Dashboard</span>
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
    <div className="min-h-screen bg-[#050505] text-white flex flex-col relative pb-32">
      
      {/* Header bar */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-zinc-900 bg-[#070707]/90 backdrop-blur-md sticky top-0 z-40">
        <button
          onClick={() => router.push("/delivery/dashboard")}
          className="flex items-center gap-1 text-xs font-bold text-zinc-400 hover:text-white cursor-pointer active:scale-95"
        >
          <ArrowLeft size={16} />
          <span>Dashboard</span>
        </button>
        <span className="text-[10px] font-black text-zinc-500 tracking-[0.2em] uppercase">Task details</span>
        <button
          onClick={toggleTheme}
          className="text-zinc-400 hover:text-white transition-colors cursor-pointer active:scale-95"
          aria-label="Toggle Theme"
        >
          {theme === "dark" ? <Sun size={18} className="text-[#FF6A00]" /> : <Moon size={18} className="text-[#FF6A00]" />}
        </button>
      </header>

      <div className="p-6 space-y-6">
        
        {/* Order Status Header Card */}
        <div className="bg-zinc-950/40 border border-zinc-900 rounded-3xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Order ID</span>
              <h2 className="text-xl font-black text-white">
                {order.order_number || `ORD-${String(order.id).padStart(4, "0")}`}
              </h2>
            </div>
            
            {isCOD ? (
              <span className="text-xs font-bold text-red-400 bg-red-950/40 border border-red-900/40 px-3 py-2 rounded-xl">
                COD QAR {totalAmount}
              </span>
            ) : (
              <span className="text-xs font-bold text-green-400 bg-green-950/40 border border-green-900/40 px-3 py-2 rounded-xl">
                Paid (Online)
              </span>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-zinc-400 border-t border-zinc-900 pt-3">
            <span className="font-semibold">Current State:</span>
            <span className="font-bold text-[#FF6A00] uppercase tracking-wide bg-[#FF6A00]/10 px-2 py-0.5 rounded-lg border border-[#FF6A00]/25">
              {order.status.replace(/_/g, ' ')}
            </span>
          </div>
        </div>

        {/* Customer Information Section */}
        <div className="bg-zinc-950/40 border border-zinc-900 rounded-3xl p-5 space-y-4 shadow-xl">
          <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Customer Details</h3>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
                <User size={16} />
              </div>
              <div>
                <p className="text-[9px] text-zinc-500 uppercase tracking-wider">Recipient Name</p>
                <p className="text-xs font-bold text-white">{customerName}</p>
              </div>
            </div>

            {customerPhone && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
                    <Phone size={16} />
                  </div>
                  <div>
                    <p className="text-[9px] text-zinc-500 uppercase tracking-wider">Contact Phone</p>
                    <p className="text-xs font-bold text-white">{customerPhone}</p>
                  </div>
                </div>
                
                <a
                  href={`tel:${customerPhone}`}
                  className="px-3.5 py-2 bg-[#FF6A00] hover:brightness-110 text-white text-[10px] font-bold rounded-xl active:scale-95 transition-all cursor-pointer flex items-center gap-1 shadow-[0_2px_10px_rgba(255,106,0,0.2)]"
                >
                  <Phone size={12} /> Call
                </a>
              </div>
            )}

            {order.customer_email && (
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
                  <Mail size={16} />
                </div>
                <div>
                  <p className="text-[9px] text-zinc-500 uppercase tracking-wider">Contact Email</p>
                  <p className="text-xs font-semibold text-zinc-300">{order.customer_email}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Address Card */}
        <div className="bg-zinc-950/40 border border-zinc-900 rounded-3xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Delivery Destination</h3>
            <button
              onClick={copyAddress}
              className="flex items-center gap-1 text-[9px] font-bold text-[#FF6A00] hover:text-[#FF8C00] transition-colors cursor-pointer"
            >
              <Copy size={12} />
              <span>{copied ? "Copied" : "Copy Address"}</span>
            </button>
          </div>

          <div className="bg-[#0b0b0b]/80 border border-zinc-900 p-4 rounded-2xl flex items-start gap-2.5">
            <MapPin size={16} className="text-[#FF6A00] shrink-0 mt-0.5" />
            <p className="text-xs font-medium text-zinc-300 leading-relaxed">{fullAddress}</p>
          </div>

          {order.delivery_notes && (
            <div className="space-y-1 bg-zinc-900/10 p-3 rounded-2xl border border-zinc-900">
              <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">Special drop instructions</span>
              <p className="text-xs text-zinc-400 italic">"{order.delivery_notes}"</p>
            </div>
          )}

          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress + ", Qatar")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-zinc-900 hover:bg-zinc-800 text-[#FF6A00] text-xs font-bold py-3.5 rounded-2xl transition-colors cursor-pointer border border-zinc-800 flex items-center justify-center gap-1.5"
            style={{ minHeight: "44px" }}
          >
            <Compass size={14} />
            <span>Open Google Navigation</span>
            <ExternalLink size={12} className="opacity-60" />
          </a>
        </div>

        {/* Order Items List */}
        <div className="bg-zinc-950/40 border border-zinc-900 rounded-3xl p-5 space-y-4 shadow-xl">
          <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Items in package ({order.items?.length || 0})</h3>
          
          <div className="divide-y divide-zinc-900/60">
            {(order.items || []).map((item) => (
              <div key={item.id} className="flex items-center gap-3.5 py-3.5 first:pt-0 last:pb-0">
                <div className="h-12 w-12 rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-900 flex items-center justify-center shrink-0">
                  {item.product?.main_image_url ? (
                    <img src={item.product.main_image_url} alt={item.product.title} className="h-full w-full object-cover" />
                  ) : (
                    <Package size={20} className="text-zinc-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white truncate">{item.product?.title || `Product #${item.id}`}</p>
                  <p className="text-[10px] text-zinc-500">Quantity check: {item.quantity}</p>
                </div>
                <span className="text-xs font-bold text-zinc-300 shrink-0">
                  QAR {(parseFloat(String(item.price_at_purchase).replace(/[$,]/g, "")) * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-zinc-900/80">
            <span className="text-xs font-bold text-zinc-500">Grand Total</span>
            <span className="text-sm font-black text-white">QAR {totalAmount}</span>
          </div>
        </div>

      </div>

      {/* Sticky Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#070707]/95 border-t border-zinc-900 p-4 z-40 max-w-[480px] mx-auto pb-safe">
        {order.status === "assigned" && (
          <button
            onClick={() => handleStatusUpdate("out_for_delivery")}
            disabled={updating}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:brightness-110 active:scale-[0.99] disabled:opacity-60 text-white text-sm font-bold py-4 rounded-2xl transition-all cursor-pointer shadow-[0_4px_16px_rgba(37,99,235,0.2)]"
            style={{ minHeight: "48px" }}
          >
            {updating ? "Updating..." : "🚚 Pick Up Order"}
          </button>
        )}
        
        {order.status === "out_for_delivery" && (
          <button
            onClick={() => handleStatusUpdate("delivered")}
            disabled={updating}
            className="w-full bg-gradient-to-r from-[#FF6A00] to-[#E04F00] hover:brightness-110 active:scale-[0.99] disabled:opacity-60 text-white text-sm font-bold py-4 rounded-2xl transition-all cursor-pointer shadow-[0_4px_16px_rgba(255,106,0,0.2)]"
            style={{ minHeight: "48px" }}
          >
            {updating ? "Updating..." : "✅ Mark as Delivered"}
          </button>
        )}

        {order.status === "delivered" && (
          <div className="w-full text-center text-green-400 text-sm font-bold py-3.5 bg-green-950/30 border border-green-900/50 rounded-2xl">
            Delivered ✅
          </div>
        )}

        {["attempted", "rescheduled", "failed"].includes(order.status) && (
          <div className="w-full text-center text-zinc-400 text-xs font-bold py-3.5 bg-zinc-950 border border-zinc-900 rounded-2xl uppercase tracking-wider">
            {order.status} — Checked by Admin
          </div>
        )}
      </div>

      {/* Dynamic Toast Popup */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: 50, x: "-50%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 left-1/2 z-[60] bg-zinc-950 border border-zinc-900 text-[#FF6A00] text-xs font-bold px-6 py-3.5 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.8)] tracking-wider"
          >
            {toastMessage.toUpperCase()}
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
