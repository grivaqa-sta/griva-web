// FEATURE: Delivery Boy System - Luxury Dashboard UI
// Inspired by Apple, Nothing, and Porsche luxury dark design systems

"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bell, 
  Menu, 
  RefreshCw, 
  Phone, 
  MapPin, 
  Package, 
  Clock, 
  DollarSign, 
  User, 
  TrendingUp, 
  LogOut, 
  Car, 
  ShieldCheck, 
  Check, 
  Calendar, 
  ChevronRight, 
  Info, 
  X,
  QrCode,
  Map,
  Compass,
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

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  assigned:          { label: "Assigned",         color: "text-blue-400",   bg: "bg-blue-950/30 border-blue-900/50" },
  out_for_delivery:  { label: "Out for Delivery", color: "text-[#FF6A00]", bg: "bg-[#FF6A00]/10 border-[#FF6A00]/30" },
  delivered:         { label: "Delivered ✅",      color: "text-green-400",  bg: "bg-green-950/30 border-green-900/50" },
  attempted:         { label: "⚠️ Attempted",      color: "text-yellow-400", bg: "bg-yellow-950/30 border-yellow-900/50" },
  rescheduled:       { label: "🔄 Rescheduled",   color: "text-purple-400", bg: "bg-purple-950/30 border-purple-900/50" },
  failed:            { label: "❌ Failed",            color: "text-red-400",    bg: "bg-red-950/30 border-red-900/50" },
};

export default function DeliveryDashboard() {
  const router = useRouter();
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [driverName, setDriverName] = useState("Griva Driver");
  const [driverEmail, setDriverEmail] = useState("driver@griva.qa");
  const [activeTab, setActiveTab] = useState<'deliveries' | 'scan' | 'profile'>('deliveries');

  // FEATURE: Delivery Attempt Management state
  const [activeModal, setActiveModal] = useState<{ type: 'not_answering' | 'come_later' | 'failed'; orderId: number } | null>(null);
  const [modalNote, setModalNote] = useState("");
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState("");
  const [callCount, setCallCount] = useState<number | null>(null);
  const [rescheduleOption, setRescheduleOption] = useState<string | null>(null);
  const [failedReason, setFailedReason] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState("");

  // Payment terminal state
  const [selectedPaymentOrderId, setSelectedPaymentOrderId] = useState<number | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Theme toggle state
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

  // Load token, decode details, and fetch fresh profile from API
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedToken = localStorage.getItem("griva_delivery_token");
      setToken(savedToken);
      if (savedToken) {
        try {
          const payload = JSON.parse(atob(savedToken.split(".")[1]));
          if (payload.name) setDriverName(payload.name);
          if (payload.email) setDriverEmail(payload.email);
        } catch {}

        // Fetch fresh profile details from API
        fetch(`${API_BASE}/auth/profile`, {
          headers: { Authorization: `Bearer ${savedToken}` },
        })
          .then((res) => {
            if (res.ok) return res.json();
            throw new Error("Failed to fetch profile");
          })
          .then((data) => {
            if (data?.user) {
              if (data.user.name) setDriverName(data.user.name);
              if (data.user.email) setDriverEmail(data.user.email);
            }
          })
          .catch((err) => console.log("Profile API status check:", err.message));
      }
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
      if (!res.ok) { 
        setError("Something went wrong, try again."); 
        setLoading(false); 
        return; 
      }
      const data = await res.json();
      setOrders(data.orders || []);
    } catch {
      setError("Check your internet connection.");
    } finally {
      setLoading(false);
    }
  }, [token, router]);

  useEffect(() => { 
    if (token) fetchOrders(); 
  }, [token, fetchOrders]);

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
        router.replace("/delivery/login"); 
        return;
      }
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
        );
        showToast(`Status updated to ${newStatus.replace(/_/g, ' ')}`);
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

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem("griva_delivery_token");
    router.push("/delivery/login");
  };

  // Attempt Management modal helpers
  const openModal = (type: 'not_answering' | 'come_later' | 'failed', orderId: number) => {
    setActiveModal({ type, orderId });
    setModalNote("");
    setModalLoading(false);
    setModalError("");
    setCallCount(null);
    setRescheduleOption(null);
    setFailedReason(null);
  };

  const closeModal = () => {
    setActiveModal(null);
    setModalNote("");
    setModalError("");
    setCallCount(null);
    setRescheduleOption(null);
    setFailedReason(null);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const getRescheduleTime = (option: string): string => {
    const now = new Date();
    if (option === "1h") {
      now.setHours(now.getHours() + 1);
    } else if (option === "2h") {
      now.setHours(now.getHours() + 2);
    } else if (option === "evening") {
      now.setHours(18, 0, 0, 0);
    } else if (option === "tomorrow") {
      now.setDate(now.getDate() + 1);
      now.setHours(10, 0, 0, 0);
    }
    return now.toISOString();
  };

  const handleMarkAttempted = async () => {
    if (!token || !activeModal) return;
    setModalLoading(true);
    setModalError("");
    try {
      const noteText = callCount ? `Called ${callCount} time(s). ${modalNote}`.trim() : modalNote;
      const res = await fetch(`${API_BASE}/delivery/orders/${activeModal.orderId}/attempted`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ note: noteText }),
      });
      if (res.ok) {
        closeModal();
        fetchOrders();
        showToast("Reported to administrator");
      } else {
        const data = await res.json();
        setModalError(data.message || "Something went wrong.");
      }
    } catch {
      setModalError("Check your internet connection.");
    } finally {
      setModalLoading(false);
    }
  };

  const handleMarkRescheduled = async () => {
    if (!token || !activeModal || !rescheduleOption) return;
    setModalLoading(true);
    setModalError("");
    try {
      const res = await fetch(`${API_BASE}/delivery/orders/${activeModal.orderId}/rescheduled`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ rescheduleTime: getRescheduleTime(rescheduleOption), note: modalNote }),
      });
      if (res.ok) {
        closeModal();
        fetchOrders();
        showToast("Order rescheduled");
      } else {
        const data = await res.json();
        setModalError(data.message || "Something went wrong.");
      }
    } catch {
      setModalError("Check your internet connection.");
    } finally {
      setModalLoading(false);
    }
  };

  const handleMarkFailed = async () => {
    if (!token || !activeModal) return;
    if (!failedReason) {
      setModalError("Please select a reason.");
      return;
    }
    setModalLoading(true);
    setModalError("");
    try {
      const res = await fetch(`${API_BASE}/delivery/orders/${activeModal.orderId}/failed`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ reason: failedReason, note: modalNote }),
      });
      if (res.ok) {
        closeModal();
        fetchOrders();
        showToast("Reported delivery fail");
      } else {
        const data = await res.json();
        setModalError(data.message || "Something went wrong.");
      }
    } catch {
      setModalError("Check your internet connection.");
    } finally {
      setModalLoading(false);
    }
  };

  const parseTotal = (tp: string) => {
    const num = parseFloat(String(tp).replace(/[$,]/g, ""));
    return isNaN(num) ? "0.00" : num.toFixed(2);
  };

  // Auto-select active out_for_delivery order for payment
  const outForDeliveryOrders = orders.filter(o => o.status === "out_for_delivery");
  useEffect(() => {
    if (outForDeliveryOrders.length > 0) {
      if (!selectedPaymentOrderId || !outForDeliveryOrders.some(o => o.id === selectedPaymentOrderId)) {
        setSelectedPaymentOrderId(outForDeliveryOrders[0].id);
      }
    } else {
      setSelectedPaymentOrderId(null);
    }
  }, [orders, selectedPaymentOrderId, outForDeliveryOrders]);

  // Simulate customer scanning driver phone & paying
  const handleSimulatePayment = (orderId: number) => {
    if (isProcessingPayment) return;
    setIsProcessingPayment(true);
    setPaymentSuccess(false);

    // Simulate 2.5s transaction auth
    setTimeout(() => {
      handleStatusUpdate(orderId, "delivered").then(() => {
        setIsProcessingPayment(false);
        setPaymentSuccess(true);
        showToast("Payment Authenticated & Approved");
        setTimeout(() => {
          setPaymentSuccess(false);
          setActiveTab('deliveries');
        }, 1500);
      });
    }, 2500);
  };

  // Compute metrics dynamically
  const totalAssigned = orders.length;
  const totalDelivered = orders.filter(o => o.status === "delivered").length;
  const totalPending = orders.filter(o => ["assigned", "out_for_delivery", "rescheduled"].includes(o.status)).length;
  const totalEarningsToday = orders
    .filter(o => o.status === "delivered" && o.payment_method?.toUpperCase().includes("COD"))
    .reduce((sum, o) => sum + parseFloat(parseTotal(o.total_price)), 0)
    .toFixed(2);

  const todayStr = new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });

  return (
    <div className="flex flex-col min-h-screen bg-[#050505] text-white select-none">
      
      {/* Premium Dark Header */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-zinc-900 bg-[#070707]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <img 
            src={theme === "dark" ? "/images/logo-light.png" : "/images/logo-dark.png"} 
            alt="Griva Logo" 
            className="h-6 w-auto object-contain" 
          />
          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-[0.25em] border-l border-zinc-800 pl-2">DELIVERY</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="text-zinc-400 hover:text-white transition-colors cursor-pointer mr-1 active:scale-95"
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? <Sun size={20} className="text-[#FF6A00]" /> : <Moon size={20} className="text-[#FF6A00]" />}
          </button>
          <button className="relative text-zinc-400 hover:text-white transition-colors cursor-pointer" aria-label="Notifications">
            <Bell size={20} />
            <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-[#FF6A00]" />
          </button>
          <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-[#FF6A00] to-[#E04F00] flex items-center justify-center font-bold text-xs text-white shadow-[0_0_10px_rgba(255,106,0,0.3)]">
            {driverName.slice(0, 2).toUpperCase()}
          </div>
        </div>
      </header>

      {/* Main Page Area */}
      <div className="flex-1 overflow-y-auto px-6 py-6 pb-28">
        <AnimatePresence mode="wait">
          
          {/* TAB 1: DELIVERIES DASHBOARD */}
          {activeTab === 'deliveries' && (
            <motion.div
              key="deliveries"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Hero Greeting Section */}
              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-[#FF6A00] tracking-widest uppercase">Overview</span>
                  <h2 className="text-2xl font-black text-white tracking-tight">My Deliveries</h2>
                  <p className="text-xs text-zinc-400 font-semibold">{todayStr}</p>
                </div>
                <button
                  onClick={fetchOrders}
                  disabled={loading}
                  className="flex items-center gap-1.5 px-3 py-2 bg-zinc-950 border border-zinc-900 text-xs font-bold text-[#FF6A00] hover:text-[#FF8C00] rounded-xl cursor-pointer hover:border-zinc-800 transition-all active:scale-95 disabled:opacity-50 shadow-md"
                  style={{ minHeight: "36px" }}
                >
                  <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
                  <span>{loading ? "Syncing" : "Refresh"}</span>
                </button>
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Assigned", val: totalAssigned, icon: <Package size={14} className="text-blue-400" />, desc: "Active list" },
                  { label: "Delivered", val: totalDelivered, icon: <Check size={14} className="text-green-400" />, desc: "Delivered today" },
                  { label: "Pending", val: totalPending, icon: <Clock size={14} className="text-yellow-400" />, desc: "Awaiting drop" },
                  { label: "COD Earnings", val: `QAR ${totalEarningsToday}`, icon: <DollarSign size={14} className="text-[#FF6A00]" />, desc: "Cash on delivery" },
                ].map((stat, i) => (
                  <div key={i} className="bg-zinc-950/40 border border-zinc-900 rounded-2xl p-4 space-y-1.5 shadow-[inset_0_2px_4px_rgba(255,255,255,0.01)] relative overflow-hidden">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{stat.label}</span>
                      {stat.icon}
                    </div>
                    <p className="text-lg font-extrabold text-white tracking-tight">{stat.val}</p>
                    <p className="text-[9px] text-zinc-500 font-semibold">{stat.desc}</p>
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-zinc-900/10 blur-[10px]" />
                  </div>
                ))}
              </div>

              {error && (
                <div className="bg-red-950/30 border border-red-900/50 text-red-400 text-xs font-bold p-3.5 rounded-2xl text-center">
                  {error}
                </div>
              )}

              {/* Delivery list */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold tracking-widest text-zinc-400 uppercase ml-1">Assigned Tasks ({orders.length})</h3>
                
                {loading && orders.length === 0 && (
                  <div className="space-y-4">
                    {[1, 2].map((n) => (
                      <div key={n} className="h-44 w-full bg-zinc-950/30 border border-zinc-900 rounded-3xl animate-pulse" />
                    ))}
                  </div>
                )}

                {/* Empty State */}
                {!loading && orders.length === 0 && !error && (
                  <div className="text-center py-12 px-6 bg-zinc-950/40 border border-zinc-900 rounded-3xl space-y-4 flex flex-col items-center shadow-lg">
                    {/* SVG 3D Package Glow Illustration */}
                    <div className="relative w-16 h-16 flex items-center justify-center">
                      <div className="absolute inset-0 bg-[#FF6A00]/10 rounded-full blur-[20px]" />
                      <svg className="h-12 w-12 text-[#FF6A00]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M21 7.5V16.5L12 21.5L3 16.5V7.5L12 2.5L21 7.5Z" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M12 22.08V12" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M12 12L21 7.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M12 12L3 7.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M12 2.5L21 7.5L12 12.5L3 7.5L12 2.5Z" fill="currentColor" fillOpacity="0.05" />
                        <path d="M7.5 9.75L12 12.25L16.5 9.75" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-white">No Orders Today</h4>
                      <p className="text-xs text-zinc-500">You're all caught up! Pull down to refresh or check again later.</p>
                    </div>
                  </div>
                )}

                {/* Order cards */}
                {orders.map((order) => {
                  const statusCfg = STATUS_LABELS[order.status] || { label: order.status, color: "text-zinc-400", bg: "bg-zinc-950 border-zinc-900" };
                  const totalAmount = parseTotal(order.total_price);
                  const isCOD = order.payment_method?.toUpperCase().includes("COD");
                  const customerName = order.customer_name || order.user?.name || "Customer";
                  const customerPhone = order.customer_phone || "";
                  const isUpdating = updatingId === order.id;

                  return (
                    <div 
                      key={order.id} 
                      className="bg-zinc-950/50 backdrop-blur-md border border-zinc-900 hover:border-zinc-800 rounded-3xl overflow-hidden shadow-xl transition-all duration-300 relative before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/[0.01] before:to-transparent before:pointer-events-none"
                    >
                      {/* Card Top Details */}
                      <div className="px-5 pt-5 pb-3 flex items-center justify-between border-b border-zinc-900/60">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white tracking-wider">
                            {order.order_number || `ORD-${String(order.id).padStart(4, "0")}`}
                          </span>
                          <span className={`inline-flex items-center text-[9px] font-bold px-2 py-0.5 rounded-lg border ${statusCfg.bg} ${statusCfg.color} uppercase tracking-wider`}>
                            {statusCfg.label}
                          </span>
                        </div>
                        {isCOD ? (
                          <span className="text-[10px] font-bold text-red-400 bg-red-950/30 border border-red-900/35 px-2.5 py-1 rounded-xl">
                            Collect QAR {totalAmount}
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-green-400 bg-green-950/30 border border-green-900/35 px-2.5 py-1 rounded-xl">
                            Prepaid
                          </span>
                        )}
                      </div>

                      {/* Customer info body */}
                      <div className="p-5 space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-bold text-zinc-100 flex items-center gap-1.5">
                              <span className="text-zinc-500">👤</span> {customerName}
                            </p>
                            {customerPhone && (
                              <a
                                href={`tel:${customerPhone}`}
                                className="text-[10px] font-bold text-[#FF6A00] flex items-center gap-1 hover:underline cursor-pointer"
                              >
                                <Phone size={10} /> Call Now
                              </a>
                            )}
                          </div>
                          
                          <div className="bg-[#0c0c0c]/80 border border-zinc-900/80 rounded-2xl p-3.5 space-y-1 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]">
                            <p className="text-[8px] font-bold tracking-widest text-zinc-500 uppercase">Delivery Address</p>
                            <p className="text-xs font-semibold text-zinc-300 leading-relaxed flex items-start gap-1">
                              <MapPin size={12} className="text-[#FF6A00] shrink-0 mt-0.5" />
                              <span>
                                {order.shipping_address}
                                {order.city && `, ${order.city}`}
                              </span>
                            </p>
                          </div>

                          {order.delivery_notes && (
                            <p className="text-[11px] text-zinc-500 italic bg-zinc-900/20 px-3 py-2 rounded-xl border border-zinc-900/40">
                              📝 Notes: {order.delivery_notes}
                            </p>
                          )}
                        </div>

                        {/* Items Preview */}
                        <div className="border-t border-zinc-900/80 pt-3 space-y-1.5">
                          <div className="flex justify-between text-[9px] font-bold tracking-widest text-zinc-500 uppercase">
                            <span>Order Items ({order.items?.length || 0})</span>
                            <span>QTY</span>
                          </div>
                          {(order.items || []).map((item) => (
                            <div key={item.id} className="flex items-center justify-between text-xs font-medium text-zinc-400">
                              <span className="truncate max-w-[80%]">{item.product?.title || `Product #${item.id}`}</span>
                              <span className="text-[10px] font-bold text-zinc-500">×{item.quantity}</span>
                            </div>
                          ))}
                        </div>

                        {/* Primary action buttons */}
                        <div className="space-y-3 pt-2">
                          {/* Pick Up Action */}
                          {order.status === "assigned" && (
                            <button
                              onClick={() => handleStatusUpdate(order.id, "out_for_delivery")}
                              disabled={isUpdating}
                              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:brightness-110 active:scale-[0.99] disabled:opacity-60 text-white text-xs font-bold py-3.5 rounded-2xl transition-all cursor-pointer shadow-[0_4px_12px_rgba(0,0,0,0.3)] flex items-center justify-center gap-2"
                              style={{ minHeight: "44px" }}
                            >
                              <span>🚚 Pick Up Order</span>
                            </button>
                          )}

                          {/* Complete Action */}
                          {order.status === "out_for_delivery" && (
                            <div className="space-y-2">
                              <button
                                onClick={() => handleStatusUpdate(order.id, "delivered")}
                                disabled={isUpdating}
                                className="w-full bg-gradient-to-r from-[#FF6A00] to-[#E04F00] hover:brightness-110 active:scale-[0.99] disabled:opacity-60 text-white text-xs font-bold py-3.5 rounded-2xl transition-all cursor-pointer shadow-[0_4px_16px_rgba(255,106,0,0.2)] flex items-center justify-center gap-2"
                                style={{ minHeight: "44px" }}
                              >
                                <Check size={14} />
                                <span>Mark as Delivered</span>
                              </button>

                              {/* Delivery Attempt Options */}
                              <div className="grid grid-cols-3 gap-1.5 pt-1">
                                <button
                                  onClick={() => openModal('not_answering', order.id)}
                                  className="py-2.5 rounded-xl border border-yellow-900/40 bg-yellow-950/10 text-yellow-500 hover:bg-yellow-950/20 active:scale-95 text-[10px] font-bold transition-all cursor-pointer"
                                >
                                  📞 No Answer
                                </button>
                                <button
                                  onClick={() => openModal('come_later', order.id)}
                                  className="py-2.5 rounded-xl border border-blue-900/40 bg-blue-950/10 text-blue-400 hover:bg-blue-950/20 active:scale-95 text-[10px] font-bold transition-all cursor-pointer"
                                >
                                  🔄 Come Later
                                </button>
                                <button
                                  onClick={() => openModal('failed', order.id)}
                                  className="py-2.5 rounded-xl border border-red-900/40 bg-red-950/10 text-red-400 hover:bg-red-950/20 active:scale-95 text-[10px] font-bold transition-all cursor-pointer"
                                >
                                  ❌ Failed
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Quick Navigation and Call utilities */}
                          <div className="grid grid-cols-2 gap-2.5 pt-1">
                            {customerPhone ? (
                              <a
                                href={`tel:${customerPhone}`}
                                className="flex items-center justify-center gap-1.5 py-3 bg-zinc-900 hover:bg-zinc-800 rounded-xl text-[10px] font-bold text-zinc-300 border border-zinc-800 transition-colors"
                                style={{ minHeight: "40px" }}
                              >
                                <Phone size={12} className="text-[#FF6A00]" />
                                <span>Call Customer</span>
                              </a>
                            ) : (
                              <div className="flex items-center justify-center gap-1.5 py-3 bg-zinc-900 opacity-40 rounded-xl text-[10px] font-bold text-zinc-500 border border-zinc-800">
                                <Phone size={12} />
                                <span>No Phone</span>
                              </div>
                            )}

                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.shipping_address + (order.city ? `, ${order.city}, Qatar` : ", Qatar"))}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-center gap-1.5 py-3 bg-zinc-900 hover:bg-zinc-800 rounded-xl text-[10px] font-bold text-[#FF6A00] border border-zinc-800 transition-colors"
                              style={{ minHeight: "40px" }}
                            >
                              <Compass size={12} />
                              <span>Open Maps</span>
                            </a>
                          </div>

                          {/* View details */}
                          <Link
                            href={`/delivery/order/${order.id}`}
                            className="block w-full text-center text-[10px] font-bold text-zinc-500 hover:text-zinc-300 py-2 transition-colors border-t border-zinc-900/50 mt-1"
                          >
                            View Order Details & Item Pictures →
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* TAB 2: GRIVA PAY TERMINAL */}
          {activeTab === 'scan' && (
            <motion.div
              key="scan"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-6 flex flex-col items-center justify-center min-h-[60vh]"
            >
              <div className="text-center space-y-2">
                <span className="text-[10px] font-bold text-[#FF6A00] tracking-widest uppercase">Griva Pay Terminal</span>
                <h2 className="text-2xl font-black text-white">Collect Payment</h2>
                <p className="text-xs text-zinc-500 max-w-xs mx-auto">Present this screen to the customer to scan the payment QR code and complete transaction checkout.</p>
              </div>

              {outForDeliveryOrders.length === 0 ? (
                <div className="w-full max-w-sm bg-zinc-950/40 border border-zinc-900 rounded-3xl p-8 text-center space-y-4 shadow-xl">
                  <div className="relative w-16 h-16 flex items-center justify-center mx-auto">
                    <div className="absolute inset-0 bg-[#FF6A00]/5 rounded-full blur-[15px]" />
                    <QrCode size={36} className="text-zinc-700" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-zinc-300">No Active Deliveries</p>
                    <p className="text-xs text-zinc-500">Pick up an assigned order and change its status to 'Out for Delivery' to collect payment here.</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('deliveries')}
                    className="px-5 py-2.5 bg-zinc-900 border border-zinc-800 text-xs font-bold text-zinc-300 hover:text-white rounded-xl active:scale-95 transition-all"
                  >
                    Go to Deliveries
                  </button>
                </div>
              ) : (() => {
                const currentOrder = outForDeliveryOrders.find(o => o.id === selectedPaymentOrderId) || outForDeliveryOrders[0];
                const totalAmount = parseTotal(currentOrder.total_price);
                const isCOD = currentOrder.payment_method?.toUpperCase().includes("COD");
                const customerName = currentOrder.customer_name || currentOrder.user?.name || "Customer";

                return (
                  <div className="w-full max-w-sm space-y-5">
                    {/* Order Selector (if more than 1 order out for delivery) */}
                    {outForDeliveryOrders.length > 1 && (
                      <div className="bg-zinc-950/40 border border-zinc-900 rounded-2xl p-3 flex items-center justify-between">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider ml-1">Select Order:</label>
                        <select
                          value={selectedPaymentOrderId || ""}
                          onChange={(e) => setSelectedPaymentOrderId(Number(e.target.value))}
                          className="bg-zinc-900 border border-zinc-800 text-xs text-white px-3 py-1.5 rounded-xl outline-none focus:border-[#FF6A00]"
                        >
                          {outForDeliveryOrders.map(o => (
                            <option key={o.id} value={o.id}>
                              {o.order_number || `ORD-${o.id}`} ({o.customer_name || "Customer"})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Main Transaction Card */}
                    <div className="bg-zinc-950/60 backdrop-blur-xl border border-zinc-900 rounded-3xl p-6 space-y-5 shadow-2xl relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/[0.01] before:to-transparent before:pointer-events-none">
                      <div className="text-center space-y-1">
                        <span className="text-[9px] font-bold tracking-wider text-zinc-500 uppercase">
                          {currentOrder.order_number || `ORD-${String(currentOrder.id).padStart(4, "0")}`}
                        </span>
                        <p className="text-xs text-zinc-400 font-semibold">Customer: {customerName}</p>
                        
                        <div className="pt-2">
                          {isCOD ? (
                            <div className="inline-flex flex-col items-center">
                              <span className="text-[9px] font-bold tracking-wider text-red-400 bg-red-950/30 border border-red-900/40 px-2 py-0.5 rounded-lg uppercase">
                                Payment Due COD
                              </span>
                              <span className="text-3xl font-black text-white tracking-tight mt-1.5">
                                QAR {totalAmount}
                              </span>
                            </div>
                          ) : (
                            <div className="inline-flex flex-col items-center">
                              <span className="text-[9px] font-bold tracking-wider text-green-400 bg-green-950/30 border border-green-900/40 px-2 py-0.5 rounded-lg uppercase">
                                Prepaid Order
                              </span>
                              <span className="text-sm font-bold text-zinc-400 mt-2">
                                Handover Package Directly
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* QR Display Area */}
                      {isCOD && (
                        <div className="bg-[#020202] border border-zinc-900 rounded-2xl p-6 flex flex-col items-center justify-center relative overflow-hidden shadow-inner group">
                          {/* Ambient glow behind QR */}
                          <div className="absolute w-36 h-36 rounded-full bg-[#FF6A00]/5 blur-[25px] pointer-events-none group-hover:bg-[#FF6A00]/10 transition-all duration-500" />
                          
                          {/* Elegant QR Code SVG with central Griva logo */}
                          <svg width="170" height="170" viewBox="0 0 29 29" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white relative z-10 transition-all duration-300">
                            {/* Corner markers */}
                            <rect x="1" y="1" width="7" height="7" fill="currentColor" />
                            <rect x="2" y="2" width="5" height="5" fill="black" />
                            <rect x="3" y="3" width="3" height="3" fill="#FF6A00" />
                            
                            <rect x="21" y="1" width="7" height="7" fill="currentColor" />
                            <rect x="22" y="2" width="5" height="5" fill="black" />
                            <rect x="23" y="3" width="3" height="3" fill="#FF6A00" />
                            
                            <rect x="1" y="21" width="7" height="7" fill="currentColor" />
                            <rect x="2" y="22" width="5" height="5" fill="black" />
                            <rect x="3" y="23" width="3" height="3" fill="#FF6A00" />
                            
                            {/* Random QR code dot patterns */}
                            <rect x="9" y="1" width="1" height="2" fill="currentColor" />
                            <rect x="11" y="2" width="2" height="1" fill="currentColor" />
                            <rect x="14" y="0" width="1" height="4" fill="currentColor" />
                            <rect x="16" y="2" width="3" height="2" fill="currentColor" />
                            <rect x="11" y="5" width="2" height="2" fill="currentColor" />
                            <rect x="16" y="5" width="1" height="1" fill="currentColor" />
                            <rect x="9" y="8" width="4" height="1" fill="currentColor" />
                            <rect x="15" y="8" width="2" height="2" fill="currentColor" />
                            <rect x="18" y="8" width="1" height="1" fill="currentColor" />
                            
                            {/* Griva 'i' logo representation in center */}
                            <rect x="12" y="12" width="5" height="5" fill="#020202" />
                            <circle cx="14.5" cy="13.2" r="1.1" fill="#FF6A00" />
                            <rect x="14" y="14.8" width="1" height="2" fill="white" />
                            
                            {/* Bottom right area dots */}
                            <rect x="9" y="15" width="2" height="1" fill="currentColor" />
                            <rect x="1" y="11" width="3" height="1" fill="currentColor" />
                            <rect x="5" y="13" width="1" height="3" fill="currentColor" />
                            <rect x="21" y="9" width="3" height="2" fill="currentColor" />
                            <rect x="26" y="10" width="2" height="1" fill="currentColor" />
                            <rect x="23" y="13" width="2" height="2" fill="currentColor" />
                            <rect x="20" y="16" width="3" height="1" fill="currentColor" />
                            <rect x="18" y="20" width="2" height="3" fill="currentColor" />
                            <rect x="22" y="21" width="1" height="2" fill="currentColor" />
                            <rect x="25" y="23" width="3" height="1" fill="currentColor" />
                            <rect x="27" y="21" width="1" height="3" fill="currentColor" />
                            <rect x="10" y="22" width="2" height="1" fill="currentColor" />
                            <rect x="13" y="25" width="1" height="3" fill="currentColor" />
                            <rect x="9" y="27" width="3" height="1" fill="currentColor" />
                          </svg>

                          <span className="text-[9px] font-bold text-zinc-500 tracking-widest uppercase mt-4 flex items-center gap-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#FF6A00] animate-ping" />
                            Awaiting customer scan...
                          </span>
                        </div>
                      )}

                      {/* Payment logo icons row */}
                      {isCOD && (
                        <div className="flex items-center justify-center gap-3 text-[10px] text-zinc-600 font-bold border-t border-zinc-900 pt-4">
                          <span>Apple Pay</span>
                          <span className="h-1 w-1 bg-zinc-800 rounded-full" />
                          <span>QPay</span>
                          <span className="h-1 w-1 bg-zinc-800 rounded-full" />
                          <span>Griva Pay</span>
                          <span className="h-1 w-1 bg-zinc-800 rounded-full" />
                          <span>Card</span>
                        </div>
                      )}

                      {/* Action buttons */}
                      <div className="space-y-2 pt-2">
                        {isCOD ? (
                          <button
                            onClick={() => handleSimulatePayment(currentOrder.id)}
                            disabled={isProcessingPayment}
                            className="w-full bg-gradient-to-r from-[#FF6A00] to-[#E04F00] hover:brightness-110 active:scale-[0.99] disabled:opacity-50 text-white text-xs font-bold py-4 rounded-2xl transition-all cursor-pointer shadow-[0_4px_16px_rgba(255,106,0,0.2)] flex items-center justify-center gap-2"
                            style={{ minHeight: "44px" }}
                          >
                            {isProcessingPayment ? (
                              <>
                                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                <span>Verifying Transaction...</span>
                              </>
                            ) : (
                              <span>Simulate Customer Payment</span>
                            )}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStatusUpdate(currentOrder.id, "delivered").then(() => {
                              showToast("Handover Confirmed");
                              setActiveTab('deliveries');
                            })}
                            className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:brightness-110 active:scale-[0.99] text-white text-xs font-bold py-4 rounded-2xl transition-all cursor-pointer shadow-[0_4px_16px_rgba(34,197,94,0.15)]"
                            style={{ minHeight: "44px" }}
                          >
                            Confirm Handover & Deliver
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          )}

          {/* TAB 3: DRIVER PROFILE & ACCOUNT PAGE */}
          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-[#FF6A00] tracking-widest uppercase">My Station</span>
                <h2 className="text-2xl font-black text-white">Driver Profile</h2>
              </div>

              {/* Avatar Profile Card */}
              <div className="bg-zinc-950/50 border border-zinc-900 rounded-3xl p-6 flex flex-col items-center text-center space-y-4 shadow-xl">
                <div className="h-20 w-20 rounded-full bg-gradient-to-tr from-[#FF6A00] to-[#E04F00] flex items-center justify-center text-3xl font-bold text-white shadow-lg border border-zinc-800">
                  {driverName.slice(0, 2).toUpperCase()}
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white">{driverName}</h3>
                  <p className="text-xs text-zinc-500">{driverEmail}</p>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] font-bold text-green-400">
                  <ShieldCheck size={12} />
                  <span>Active Carrier Status</span>
                </div>
              </div>

              {/* Vehicle info block */}
              <div className="bg-zinc-950/40 border border-zinc-900 rounded-2xl p-5 space-y-4">
                <h4 className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase">Assigned Transport</h4>
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 shrink-0">
                    <Car size={20} />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-white">Porsche Taycan Delivery Fleet</p>
                    <p className="text-[10px] text-zinc-500">Plate: QA-551-DELIV (Standard EV)</p>
                  </div>
                </div>
              </div>

              {/* Settings list */}
              <div className="bg-zinc-950/40 border border-zinc-900 rounded-2xl divide-y divide-zinc-900">
                <div className="p-4 flex items-center justify-between text-xs text-zinc-300 font-semibold">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-zinc-500" />
                    <span>Shift Schedule</span>
                  </div>
                  <span className="text-[10px] font-bold text-[#FF6A00] bg-[#FF6A00]/10 border border-[#FF6A00]/25 px-2 py-0.5 rounded-lg">8 AM - 6 PM</span>
                </div>
                <div className="p-4 flex items-center justify-between text-xs text-zinc-300 font-semibold">
                  <div className="flex items-center gap-2">
                    <TrendingUp size={14} className="text-zinc-500" />
                    <span>Weekly Drop Rating</span>
                  </div>
                  <span className="text-[10px] font-bold text-white bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded-lg">4.9 / 5.0 ★</span>
                </div>
              </div>

              {/* Log out */}
              <button
                onClick={handleLogout}
                className="w-full bg-zinc-900 hover:bg-red-950/20 hover:text-red-400 hover:border-red-900/50 border border-zinc-800 text-xs font-bold py-4 rounded-2xl transition-colors cursor-pointer flex items-center justify-center gap-2"
                style={{ minHeight: "48px" }}
              >
                <LogOut size={14} />
                <span>Log Out Delivery Portal</span>
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Luxury Sticky Bottom Navigation Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#070707]/95 border-t border-zinc-900 shadow-[0_-4px_24px_rgba(0,0,0,0.8)] max-w-[480px] mx-auto pb-safe">
        <div className="flex h-16 items-center justify-around px-4 relative">
          
          {/* Deliveries Tab button */}
          <button
            onClick={() => setActiveTab('deliveries')}
            className={`flex flex-col items-center justify-center w-16 h-full transition-all cursor-pointer ${
              activeTab === 'deliveries' ? "text-[#FF6A00] scale-105" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <Package size={20} />
            <span className="text-[9px] mt-1 font-bold tracking-wider">Deliveries</span>
          </button>

          {/* Central Glowing QR Scan button */}
          <div className="relative -top-5 flex flex-col items-center">
            <button
              onClick={() => setActiveTab('scan')}
              className={`h-14 w-14 rounded-full bg-gradient-to-br from-[#FF6A00] to-[#E04F00] text-white flex items-center justify-center cursor-pointer transition-all active:scale-95 shadow-[0_0_24px_rgba(255,106,0,0.5)] border-4 border-[#050505]`}
              aria-label="Scan QR Code"
            >
              <QrCode size={22} />
            </button>
          </div>

          {/* Profile Tab button */}
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center justify-center w-16 h-full transition-all cursor-pointer ${
              activeTab === 'profile' ? "text-[#FF6A00] scale-105" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <User size={20} />
            <span className="text-[9px] mt-1 font-bold tracking-wider">Profile</span>
          </button>
          
        </div>
      </nav>

      {/* FEATURE: Delivery Attempt Management — Bottom Sheet Modals */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={closeModal}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative bg-[#070707] border-t border-zinc-800 rounded-t-[32px] w-full max-w-[480px] p-6 pb-10 shadow-2xl z-10 before:absolute before:top-2 before:left-1/2 before:-translate-x-1/2 before:w-12 before:h-1 before:rounded-full before:bg-zinc-800"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close x */}
              <button 
                onClick={closeModal} 
                className="absolute top-4 right-4 h-8 w-8 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 flex items-center justify-center cursor-pointer active:scale-95"
              >
                <X size={14} />
              </button>

              {/* 1. CUSTOMER NOT ANSWERING MODAL */}
              {activeModal.type === 'not_answering' && (
                <div className="space-y-5 pt-2">
                  <div className="space-y-1">
                    <h3 className="text-lg font-black text-white">Customer Not Answering</h3>
                    <p className="text-xs text-zinc-500">Confirm call history details before notifying support.</p>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Call Count Attempted</p>
                    <div className="flex gap-2">
                      {[1, 2, 3].map(n => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setCallCount(n)}
                          className={`flex-1 py-3 rounded-2xl text-xs font-bold border transition-colors cursor-pointer ${
                            callCount === n ? 'bg-yellow-500 border-yellow-400 text-black' : 'bg-zinc-950 text-zinc-400 border-zinc-900'
                          }`}
                          style={{ minHeight: "44px" }}
                        >
                          {n} Call{n > 1 ? 's' : ''}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Notes / Details</p>
                    <textarea
                      value={modalNote}
                      onChange={(e) => setModalNote(e.target.value)}
                      placeholder="Phone switched off or customer rejected line..."
                      className="w-full bg-zinc-950 border border-zinc-900 rounded-2xl p-3 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-yellow-500/80 transition-colors shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]"
                      rows={3}
                    />
                  </div>

                  {modalError && <p className="text-red-400 text-xs font-bold">{modalError}</p>}
                  
                  <button
                    onClick={handleMarkAttempted}
                    disabled={modalLoading}
                    className="w-full bg-yellow-500 hover:brightness-110 active:scale-[0.99] text-black text-xs font-bold py-3.5 rounded-2xl disabled:opacity-60 cursor-pointer shadow-[0_4px_16px_rgba(234,179,8,0.25)] flex items-center justify-center gap-1.5"
                    style={{ minHeight: "44px" }}
                  >
                    <span>{modalLoading ? "Saving Attempt..." : "Log Attempt & Notify Store"}</span>
                  </button>
                </div>
              )}

              {/* 2. COME BACK LATER MODAL */}
              {activeModal.type === 'come_later' && (
                <div className="space-y-5 pt-2">
                  <div className="space-y-1">
                    <h3 className="text-lg font-black text-white">Reschedule Delivery</h3>
                    <p className="text-xs text-zinc-500">Select customer's preferred reschedule timeframe.</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { key: '1h', label: 'In 1 Hour' },
                      { key: '2h', label: 'In 2 Hours' },
                      { key: 'evening', label: 'This Evening (after 6pm)' },
                      { key: 'tomorrow', label: 'Tomorrow Morning' },
                    ].map(opt => (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => setRescheduleOption(opt.key)}
                        className={`py-3 px-2 rounded-2xl text-xs font-bold border transition-colors cursor-pointer ${
                          rescheduleOption === opt.key ? 'bg-blue-600 border-blue-500 text-white shadow-lg' : 'bg-zinc-950 text-zinc-400 border-zinc-900'
                        }`}
                        style={{ minHeight: "44px" }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Reschedule Notes</p>
                    <textarea
                      value={modalNote}
                      onChange={(e) => setModalNote(e.target.value)}
                      placeholder="Customer will be home at 7 PM..."
                      className="w-full bg-zinc-950 border border-zinc-900 rounded-2xl p-3 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500/80 transition-colors shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]"
                      rows={3}
                    />
                  </div>

                  {modalError && <p className="text-red-400 text-xs font-bold">{modalError}</p>}
                  
                  <button
                    onClick={handleMarkRescheduled}
                    disabled={modalLoading || !rescheduleOption}
                    className="w-full bg-blue-600 hover:brightness-110 active:scale-[0.99] text-white text-xs font-bold py-3.5 rounded-2xl disabled:opacity-60 cursor-pointer shadow-[0_4px_16px_rgba(37,99,235,0.25)]"
                    style={{ minHeight: "44px" }}
                  >
                    <span>{modalLoading ? "Saving Slot..." : "Confirm Delivery Reschedule"}</span>
                  </button>
                </div>
              )}

              {/* 3. COULD NOT DELIVER MODAL */}
              {activeModal.type === 'failed' && (
                <div className="space-y-5 pt-2">
                  <div className="space-y-1">
                    <h3 className="text-lg font-black text-white">Fail Delivery Status</h3>
                    <p className="text-xs text-zinc-500">Please choose the exact cause of delivery failure.</p>
                  </div>
                  
                  <div className="space-y-2.5">
                    {[
                      { key: 'customer_refused', label: '🚫 Customer Refused Order' },
                      { key: 'wrong_address', label: '📍 Incorrect/Wrong Address' },
                    ].map(opt => (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => { setFailedReason(opt.key); setModalError(''); }}
                        className={`w-full py-3.5 rounded-2xl text-xs font-bold border transition-colors cursor-pointer text-left px-4 flex items-center justify-between ${
                          failedReason === opt.key ? 'bg-red-950/40 border-red-500 text-red-400' : 'bg-zinc-950 text-zinc-400 border-zinc-900'
                        }`}
                        style={{ minHeight: "44px" }}
                      >
                        <span>{opt.label}</span>
                        {failedReason === opt.key && <span className="h-1.5 w-1.5 rounded-full bg-red-400" />}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Failure Details</p>
                    <textarea
                      value={modalNote}
                      onChange={(e) => setModalNote(e.target.value)}
                      placeholder="Customer cancelled the checkout or moved away..."
                      className="w-full bg-zinc-950 border border-zinc-900 rounded-2xl p-3 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-red-500/80 transition-colors shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]"
                      rows={3}
                    />
                  </div>

                  {modalError && <p className="text-red-400 text-xs font-bold">{modalError}</p>}
                  
                  <button
                    onClick={handleMarkFailed}
                    disabled={modalLoading}
                    className="w-full bg-red-600 hover:brightness-110 active:scale-[0.99] text-white text-xs font-bold py-3.5 rounded-2xl disabled:opacity-60 cursor-pointer shadow-[0_4px_16px_rgba(220,38,38,0.25)]"
                    style={{ minHeight: "44px" }}
                  >
                    <span>{modalLoading ? "Saving Status..." : "Confirm Delivery Fail"}</span>
                  </button>
                </div>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
