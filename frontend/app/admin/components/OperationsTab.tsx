import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  Package,
  Truck,
  CheckCircle,
  PhoneCall,
  MessageCircle,
  Eye,
  ChevronDown,
  Hash,
  MapPin,
  Mail,
  AlertTriangle,
  ArrowRight,
  Calendar,
  UserCheck,
  Activity,
  ChevronRight,
} from "lucide-react";
import { AdminOrder, updateOrderStatusApi } from "../../utils/api";

interface OperationsTabProps {
  ordersList: AdminOrder[];
  setOrdersList: React.Dispatch<React.SetStateAction<AdminOrder[]>>;
  setActiveTab: (tab: any) => void;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  pending:          { label: "Pending",          color: "text-amber-600",  bg: "bg-amber-50 border-amber-200",    icon: <Clock className="h-3.5 w-3.5" /> },
  processing:       { label: "Processing",       color: "text-indigo-600", bg: "bg-indigo-50 border-indigo-200",  icon: <Package className="h-3.5 w-3.5" /> },
  assigned:         { label: "Assigned",         color: "text-blue-600",   bg: "bg-blue-50 border-blue-200",      icon: <Clock className="h-3.5 w-3.5" /> },
  out_for_delivery: { label: "Out for Delivery", color: "text-orange-600", bg: "bg-orange-50 border-orange-200",  icon: <Truck className="h-3.5 w-3.5" /> },
  shipped:          { label: "Shipped",          color: "text-blue-600",   bg: "bg-blue-50 border-blue-200",      icon: <Truck className="h-3.5 w-3.5" /> },
  delivered:        { label: "Delivered",        color: "text-green-600",  bg: "bg-green-50 border-green-200",    icon: <CheckCircle className="h-3.5 w-3.5" /> },
  completed:        { label: "Completed",        color: "text-green-600",  bg: "bg-green-50 border-green-200",    icon: <CheckCircle className="h-3.5 w-3.5" /> },
  cancelled:        { label: "Cancelled",        color: "text-red-500",    bg: "bg-red-50 border-red-200",        icon: <CheckCircle className="h-3.5 w-3.5" /> },
};

const timeSince = (dateStr: string) => {
  const secs = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (secs < 60) return "just now";
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function OperationsTab({ ordersList, setOrdersList, setActiveTab }: OperationsTabProps) {
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [actionMenuOpenId, setActionMenuOpenId] = useState<number | null>(null);
  const [deliverySlots, setDeliverySlots] = useState<any[]>([]);

  useEffect(() => {
    const fetchSlots = async () => {
      try {
        const res = await fetch(`${API_BASE}/delivery-slots`);
        if (res.ok) {
          const data = await res.json();
          setDeliverySlots(data.slots || []);
        }
      } catch {}
    };
    fetchSlots();
  }, []);

  // 1. Calculate operational counts
  const newOrders = ordersList.filter(o => o.status === "pending" && !(o as any).reviewed_at);
  const processingCount = ordersList.filter(o => o.status === "processing").length;
  const assignedTotalCount = ordersList.filter(o => o.status === "assigned" || o.status === "out_for_delivery").length;
  
  const deliveredTodayCount = ordersList.filter(o => {
    const isDelivered = o.status === "delivered" || o.status === "completed";
    if (!isDelivered) return false;
    const orderDate = new Date(o.createdAt).toDateString();
    const todayDate = new Date().toDateString();
    return orderDate === todayDate;
  }).length;

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      await updateOrderStatusApi(orderId, newStatus);
      setOrdersList(prev =>
        prev.map(o => o.id === orderId ? { ...o, status: newStatus, reviewed_at: new Date().toISOString() } : o)
      );
    } catch (e) {
      console.error(e);
    }
    setUpdatingId(null);
    setActionMenuOpenId(null);
  };

  const markAsReviewed = async (orderId: number) => {
    try {
      const token = localStorage.getItem("griva_staff_token") || localStorage.getItem("griva_admin_token") || "";
      const res = await fetch(`${API_BASE}/orders/${orderId}/review`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setOrdersList(prev =>
          prev.map(o => o.id === orderId ? { ...o, reviewed_at: new Date().toISOString() } : o)
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleExpand = (orderId: number, hasReviewed: boolean) => {
    if (expandedOrderId === orderId) {
      setExpandedOrderId(null);
    } else {
      setExpandedOrderId(orderId);
      if (!hasReviewed) {
        markAsReviewed(orderId);
      }
    }
  };

  const getWhatsAppLink = (phone: string, orderNo: string) => {
    const cleanPhone = phone.replace(/[^\d+]/g, "");
    const msg = encodeURIComponent(`Hello, this is Griva Store Operations regarding your order ${orderNo}.`);
    return `https://wa.me/${cleanPhone}?text=${msg}`;
  };

  const recentOrders = ordersList.slice(0, 10);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* ── Action Required Alert Banner ── */}
      {newOrders.length > 0 && (
        <div 
          onClick={() => {
            window.history.pushState(null, "", `/admin?tab=orders&status=new`);
            setActiveTab("orders");
          }}
          className="bg-gradient-to-r from-amber-500/10 to-orange-500/5 border border-amber-500/30 rounded-2xl p-5 flex items-center justify-between shadow-sm hover:scale-[1.01] transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-600 shrink-0">
              <AlertTriangle className="h-5 w-5 animate-bounce" />
            </div>
            <div>
              <h4 className="text-sm font-black text-gray-900 uppercase tracking-wider">Action Required</h4>
              <p className="text-xs text-gray-500 mt-0.5">
                {newOrders.length} New Order{newOrders.length > 1 ? "s" : ""} Need{newOrders.length > 1 ? "" : "s"} Review and Processing
              </p>
            </div>
          </div>
          <div
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 group-hover:opacity-90 active:scale-95 text-xs font-bold text-white rounded-xl shadow-sm transition-all cursor-pointer"
          >
            Process Orders
            <ArrowRight className="h-4 w-4" />
          </div>
        </div>
      )}

      {/* ── Visual Operational Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "NEW ORDERS",
            value: `${newOrders.length} Order${newOrders.length === 1 ? "" : "s"} Waiting`,
            sub: "Pending review",
            icon: <AlertTriangle className="h-5 w-5 text-red-500 animate-pulse" />,
            color: "from-red-500/10 to-orange-500/5",
            border: "border-red-500/20",
            statusFilter: "new",
          },
          {
            label: "READY TO SHIP",
            value: `${processingCount} Order${processingCount === 1 ? "" : "s"}`,
            sub: "Awaiting dispatch",
            icon: <Package className="h-5 w-5 text-amber-500" />,
            color: "from-amber-500/10 to-yellow-500/5",
            border: "border-amber-500/20",
            statusFilter: "processing",
          },
          {
            label: "ASSIGNED TO DRIVERS",
            value: `${assignedTotalCount} Order${assignedTotalCount === 1 ? "" : "s"}`,
            sub: "With delivery team",
            icon: <Truck className="h-5 w-5 text-blue-500" />,
            color: "from-blue-500/10 to-sky-500/5",
            border: "border-blue-500/20",
            statusFilter: "assigned",
          },
          {
            label: "DELIVERED TODAY",
            value: `${deliveredTodayCount} Order${deliveredTodayCount === 1 ? "" : "s"}`,
            sub: "Completed shipments",
            icon: <CheckCircle className="h-5 w-5 text-green-500" />,
            color: "from-green-500/10 to-emerald-500/5",
            border: "border-green-500/20",
            statusFilter: "delivered",
          },
        ].map((card, i) => (
          <div
            key={i}
            onClick={() => {
              // Redirect to Orders tab with appropriate status param
              const statusParam = card.statusFilter;
              window.history.pushState(null, "", `/admin?tab=orders&status=${statusParam}`);
              setActiveTab("orders");
            }}
            className={`bg-gradient-to-br ${card.color} border ${card.border} rounded-2xl p-5 hover:scale-[1.01] transition-all cursor-pointer shadow-sm group`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{card.label}</span>
              <div className="h-8 w-8 rounded-lg bg-white border border-gray-150 flex items-center justify-center shadow-xs group-hover:border-orange-500/30">
                {card.icon}
              </div>
            </div>
            <div className="text-2xl font-black text-gray-900 tracking-tight">
              {card.value}
            </div>
            <p className="text-[10px] text-gray-400 font-semibold mt-1">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Operations Widgets Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Widget 1: Today's Delivery Slots */}
        <div className="bg-white border border-orange-500/30 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-orange-500/10">
              <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-orange-500" />
                Today's Delivery Slots
              </h4>
              <span className="text-[10px] text-gray-400 font-bold uppercase">Planning</span>
            </div>
            <div className="space-y-2.5">
              {deliverySlots.length === 0 ? (
                <p className="text-[11px] text-gray-400 py-4 text-center">No active delivery slots found.</p>
              ) : (
                deliverySlots.map(slot => {
                  const count = ordersList.filter(o => {
                    const isToday = new Date(o.createdAt).toDateString() === new Date().toDateString();
                    return isToday && Number(o.delivery_slot_id) === Number(slot.id);
                  }).length;
                  return (
                    <div
                      key={slot.id}
                      onClick={() => {
                        window.history.pushState(null, "", `/admin?tab=orders&slot=${slot.id}`);
                        setActiveTab("orders");
                      }}
                      className="flex items-center justify-between p-2.5 bg-orange-500/3 hover:bg-orange-500/8 border border-orange-500/10 rounded-xl transition-all cursor-pointer group/item"
                    >
                      <span className="text-xs font-bold text-gray-700 group-hover/item:text-orange-600 transition-colors">
                        {slot.name}
                      </span>
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-black text-gray-900 bg-white border border-orange-500/20 px-2 py-0.5 rounded-lg shadow-2xs">
                          {count} Order{count !== 1 ? "s" : ""}
                        </span>
                        <ChevronRight className="h-3 w-3 text-gray-400 opacity-0 group-hover/item:opacity-100 group-hover/item:translate-x-0.5 transition-all" />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Widget 2: Delivery Queue Summary */}
        <div className="bg-white border border-orange-500/30 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-orange-500/10">
              <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                <Truck className="h-4 w-4 text-orange-500" />
                Delivery Queue Summary
              </h4>
              <span className="text-[10px] text-gray-400 font-bold uppercase">Queue</span>
            </div>
            <div className="space-y-2.5">
              {[
                {
                  label: "Assigned To Drivers",
                  count: ordersList.filter(o => o.status === "assigned").length,
                  status: "assigned",
                  icon: <UserCheck className="h-3.5 w-3.5 text-blue-500" />,
                  color: "bg-blue-500/5 hover:bg-blue-500/10 border-blue-500/15 text-blue-700"
                },
                {
                  label: "Out For Delivery",
                  count: ordersList.filter(o => o.status === "out_for_delivery").length,
                  status: "out_for_delivery",
                  icon: <Truck className="h-3.5 w-3.5 text-orange-500" />,
                  color: "bg-orange-500/5 hover:bg-orange-500/10 border-orange-500/15 text-orange-700"
                },
                {
                  label: "Delivered Today",
                  count: ordersList.filter(o => {
                    const isDelivered = o.status === "delivered" || o.status === "completed";
                    if (!isDelivered) return false;
                    return new Date(o.createdAt).toDateString() === new Date().toDateString();
                  }).length,
                  status: "delivered",
                  icon: <CheckCircle className="h-3.5 w-3.5 text-green-500" />,
                  color: "bg-green-500/5 hover:bg-green-500/10 border-green-500/15 text-green-700"
                }
              ].map((item, i) => (
                <div
                  key={i}
                  onClick={() => {
                    window.history.pushState(null, "", `/admin?tab=orders&status=${item.status}`);
                    setActiveTab("orders");
                  }}
                  className={`flex items-center justify-between p-2.5 ${item.color} border rounded-xl transition-all cursor-pointer group/item`}
                >
                  <div className="flex items-center gap-2">
                    {item.icon}
                    <span className="text-xs font-bold transition-colors">
                      {item.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-black text-gray-900 bg-white border border-gray-150 px-2 py-0.5 rounded-lg shadow-2xs">
                      {item.count}
                    </span>
                    <ChevronRight className="h-3 w-3 text-gray-400 opacity-0 group-hover/item:opacity-100 group-hover/item:translate-x-0.5 transition-all" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Widget 3: Urgent Actions */}
        <div className="bg-white border border-orange-500/30 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-orange-500/10">
              <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="h-4 w-4 text-orange-500" />
                Urgent Actions
              </h4>
              <span className="text-[10px] text-gray-400 font-bold uppercase">Priority</span>
            </div>
            <div className="space-y-2.5">
              {[
                {
                  label: "New Orders Waiting",
                  count: newOrders.length,
                  status: "new",
                  alert: newOrders.length > 0,
                  color: "bg-red-50 border-red-200 hover:bg-red-100/70 text-red-700"
                },
                {
                  label: "Pending > 30 Minutes",
                  count: ordersList.filter(o => {
                    if (o.status !== "pending") return false;
                    const ageMs = Date.now() - new Date(o.createdAt).getTime();
                    return ageMs > 30 * 60 * 1000;
                  }).length,
                  status: "pending",
                  alert: ordersList.some(o => o.status === "pending" && (Date.now() - new Date(o.createdAt).getTime() > 30 * 60 * 1000)),
                  color: "bg-amber-50 border-amber-200 hover:bg-amber-100/70 text-amber-700"
                },
                {
                  label: "Rescheduled Deliveries",
                  count: ordersList.filter(o => o.status === "rescheduled").length,
                  status: "rescheduled",
                  alert: ordersList.some(o => o.status === "rescheduled"),
                  color: "bg-blue-50 border-blue-200 hover:bg-blue-100/70 text-blue-700"
                }
              ].map((item, i) => (
                <div
                  key={i}
                  onClick={() => {
                    window.history.pushState(null, "", `/admin?tab=orders&status=${item.status}`);
                    setActiveTab("orders");
                  }}
                  className={`flex items-center justify-between p-2.5 border rounded-xl transition-all cursor-pointer group/item ${
                    item.alert ? item.color : "bg-gray-50 border-gray-150 hover:bg-gray-100 text-gray-500"
                  }`}
                >
                  <span className="text-xs font-bold transition-colors">
                    {item.label}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-black bg-white border border-current px-2 py-0.5 rounded-lg shadow-2xs">
                      {item.count}
                    </span>
                    <ChevronRight className="h-3 w-3 text-gray-450 opacity-0 group-hover/item:opacity-100 group-hover/item:translate-x-0.5 transition-all" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Recent Orders Grid with Quick Actions ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-gray-900">Recent Store Orders</h4>
            <p className="text-[10px] text-gray-400 mt-0.5">Showing latest 10 orders</p>
          </div>
          <button
            onClick={() => setActiveTab("orders")}
            className="text-xs font-bold text-orange-500 hover:text-orange-600 transition-colors"
          >
            View All Orders
          </button>
        </div>

        <div className="bg-white border border-orange-500/30 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-orange-500/20 text-[10px] text-gray-400 font-bold uppercase tracking-wider bg-gray-50/50">
                  <th className="p-4">Order</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Phone</th>
                  <th className="p-4">Delivery Slot</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-10 text-center text-xs text-gray-400">
                      <Package className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                      No recent orders.
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order) => {
                    const displayStatus = order.status === "completed" ? "delivered" : order.status;
                    const cfg = STATUS_CONFIG[displayStatus] || STATUS_CONFIG.pending;
                    const isExpanded = expandedOrderId === order.id;
                    const orderNo = order.order_number || `ORD-${String(order.id).padStart(4, "0")}`;
                    const isUnreviewed = order.status === "pending" && !(order as any).reviewed_at;

                    return (
                      <React.Fragment key={order.id}>
                        <tr
                          onClick={() => handleToggleExpand(order.id, !isUnreviewed)}
                          className={`hover:bg-orange-500/3 transition-colors cursor-pointer group ${
                            isUnreviewed ? "border-l-4 border-l-amber-500 bg-amber-500/5" : ""
                          }`}
                        >
                          {/* Order Number */}
                          <td className="p-4">
                            <div className="flex items-center gap-2 flex-wrap max-w-[200px]">
                              <div className="flex items-center gap-1">
                                <Hash className="h-3 w-3 text-orange-400" />
                                <span className="text-xs font-black text-gray-800">
                                  {orderNo}
                                </span>
                              </div>
                              {isUnreviewed && (
                                <span className="inline-flex items-center text-[9px] font-black uppercase bg-red-500 text-white px-1.5 py-0.5 rounded-sm animate-pulse">
                                  NEW
                                </span>
                              )}
                              <span className="text-[10px] text-gray-400 font-semibold block w-full pl-4 mt-0.5">
                                {timeSince(order.createdAt)}
                              </span>
                            </div>
                          </td>

                          {/* Customer */}
                          <td className="p-4">
                            <span className="text-xs font-bold text-gray-800 block truncate max-w-[150px]">
                              {order.customer_name || order.user?.email || `Customer #${order.user_id}`}
                            </span>
                          </td>

                          {/* Phone */}
                          <td className="p-4">
                            <span className="text-xs text-gray-500 font-semibold">
                              {order.customer_phone || "—"}
                            </span>
                          </td>

                          {/* Delivery Slot */}
                          <td className="p-4">
                            <span className="text-xs text-gray-650 font-bold">
                              {(order as any).deliverySlot?.name || deliverySlots.find(s => Number(s.id) === Number(order.delivery_slot_id))?.name || "None"}
                            </span>
                          </td>

                          {/* Status Badge */}
                          <td className="p-4">
                            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg border ${cfg.bg} ${cfg.color}`}>
                              {cfg.label}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="p-4 text-right" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-2">
                              {/* Call Customer */}
                              {order.customer_phone && (
                                <a
                                  href={`tel:${order.customer_phone}`}
                                  title="Call Customer"
                                  className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 border border-blue-200 transition-colors"
                                >
                                  <PhoneCall className="h-3.5 w-3.5" />
                                </a>
                              )}

                              {/* WhatsApp Customer */}
                              {order.customer_phone && (
                                <a
                                  href={getWhatsAppLink(order.customer_phone, orderNo)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="WhatsApp Customer"
                                  className="p-1.5 rounded-lg text-green-500 hover:bg-green-50 border border-green-200 transition-colors"
                                >
                                  <MessageCircle className="h-3.5 w-3.5" />
                                </a>
                              )}

                              {/* Dropdown for Status Change */}
                              <div className="relative">
                                <button
                                  onClick={() => setActionMenuOpenId(actionMenuOpenId === order.id ? null : order.id)}
                                  className="px-2.5 py-1.5 rounded-lg border border-orange-500/20 text-[10px] font-bold text-gray-700 bg-white hover:border-orange-500/40 transition-all flex items-center gap-1 cursor-pointer"
                                >
                                  Update Status
                                  <ChevronDown className="h-3 w-3 text-gray-400" />
                                </button>
                                {actionMenuOpenId === order.id && (
                                  <>
                                    <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setActionMenuOpenId(null)} />
                                    <div className="absolute right-0 mt-1 bg-white border border-gray-150 rounded-xl shadow-lg z-50 py-1 overflow-hidden min-w-[140px] text-left">
                                      {["pending", "processing", "out_for_delivery", "delivered", "cancelled"].map((statusOption) => (
                                        <button
                                          key={statusOption}
                                          disabled={updatingId === order.id}
                                          onClick={() => handleStatusChange(order.id, statusOption)}
                                          className={`w-full text-left px-3.5 py-2 text-xs font-semibold hover:bg-orange-50 hover:text-orange-500 capitalize transition-colors ${
                                            order.status === statusOption ? "text-orange-500 font-bold" : "text-gray-700"
                                          }`}
                                        >
                                          {statusOption.replace(/_/g, " ")}
                                        </button>
                                      ))}
                                    </div>
                                  </>
                                )}
                              </div>

                              <button
                                onClick={() => handleToggleExpand(order.id, !isUnreviewed)}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer border border-orange-500/20"
                              >
                                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* Expanded details */}
                        {isExpanded && (
                          <tr className="bg-orange-500/3">
                            <td colSpan={6} className="px-6 pb-4 pt-2">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Order items summary */}
                                <div className="space-y-2">
                                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Ordered Items</span>
                                  {(order.items || []).map((item) => (
                                    <div key={item.id} className="flex items-center gap-3 bg-white border border-orange-500/20 rounded-xl p-3 shadow-xs">
                                      <div className="h-10 w-10 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                                        {item.product?.main_image_url && (
                                          <img
                                            src={item.product.main_image_url}
                                            alt={item.product.title}
                                            className="h-full w-full object-cover"
                                          />
                                        )}
                                      </div>
                                      <div className="min-w-0 flex-1">
                                        <p className="text-xs font-bold text-gray-800 truncate">{item.product?.title || `Product #${item.product_id}`}</p>
                                        <p className="text-[10px] text-gray-400">Qty: {item.quantity} × QAR {Number(item.price_at_purchase).toFixed(2)}</p>
                                      </div>
                                      <span className="text-xs font-black text-gray-800 shrink-0">
                                        QAR {(Number(item.price_at_purchase) * item.quantity).toFixed(2)}
                                      </span>
                                    </div>
                                  ))}
                                </div>

                                {/* Delivery & Shipping details */}
                                <div className="space-y-2">
                                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Shipping Address & Contact</span>
                                  <div className="bg-white border border-orange-500/20 rounded-xl p-4 space-y-3 shadow-xs">
                                    <div className="flex items-start gap-2.5">
                                      <MapPin className="h-4 w-4 text-orange-500 mt-0.5 shrink-0" />
                                      <div>
                                        <p className="text-[10px] text-gray-400 font-semibold uppercase">Shipping Address</p>
                                        <p className="text-xs font-bold text-gray-800 mt-0.5">{order.shipping_address}</p>
                                      </div>
                                    </div>
                                    <div className="flex items-start gap-2.5 pt-2 border-t border-orange-500/10">
                                      <Mail className="h-4 w-4 text-orange-500 mt-0.5 shrink-0" />
                                      <div>
                                        <p className="text-[10px] text-gray-400 font-semibold uppercase">Customer Email</p>
                                        <p className="text-xs font-bold text-gray-800 mt-0.5">{order.customer_email || order.user?.email || "—"}</p>
                                      </div>
                                    </div>
                                    {order.delivery_notes && (
                                      <div className="flex items-start gap-2.5 pt-2 border-t border-orange-500/10">
                                        <Clock className="h-4 w-4 text-orange-500 mt-0.5 shrink-0" />
                                        <div>
                                          <p className="text-[10px] text-gray-400 font-semibold uppercase">Instructions / Notes</p>
                                          <p className="text-xs font-medium text-gray-600 mt-0.5">{order.delivery_notes}</p>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
}
