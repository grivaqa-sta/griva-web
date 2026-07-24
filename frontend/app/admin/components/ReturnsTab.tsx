"use client";
import React, { useState, useEffect } from "react";
import {
  Search,
  Check,
  X,
  Undo,
  AlertCircle,
  Loader2,
  ExternalLink,
  Calendar,
  Phone,
  Mail,
  User,
  ShoppingBag,
  FileText
} from "lucide-react";
import { getAllReturnRequestsApi, updateReturnRequestStatusApi, getDeliveryBoysApi } from "../../utils/api";
import { useToast } from "@/app/context/ToastContext";
import { useSocket } from "@/app/context/SocketContext";
import { useAdminTheme } from "@/app/admin/context/AdminThemeContext";

interface DeliveryBoy {
  id: number;
  name: string;
  email: string;
  activeOrderCount: number;
}

interface ReturnRequest {
  id: number;
  order_id: number;
  user_id: number;
  order_item_id: number;
  quantity: number;
  type: "replacement" | "refund";
  reason: string;
  description: string;
  images: string[];
  status: "pending" | "approved_replacement" | "approved_refund" | "rejected" | string;
  admin_notes: string;
  createdAt: string;
  updatedAt: string;
  order?: {
    id: number;
    order_number: string;
    customer_name?: string;
    customer_phone?: string;
    customer_email?: string;
  };
  orderItem?: {
    id: number;
    product_id: number;
    quantity: number;
    price_at_purchase: number;
    selected_color?: string;
    selected_storage?: string;
    variant?: {
      id: number;
      sku?: string;
      stock?: number;
    };
    product?: {
      id: number;
      title: string;
      main_image_url: string;
      stock?: number;
    };
  };
  user?: {
    id: number;
    name?: string;
    email: string;
  };
}

export default function ReturnsTab() {
  const { socket } = useSocket();
  const { isDark } = useAdminTheme();
  const [requests, setRequests] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const { toast } = useToast();

  // Action Modal State
  const [selectedReq, setSelectedReq] = useState<ReturnRequest | null>(null);
  const [modalAction, setModalAction] = useState<"approved_replacement" | "approved_refund" | "rejected" | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);

  // Delivery Boy Assignment State
  const [deliveryBoys, setDeliveryBoys] = useState<DeliveryBoy[]>([]);
  const [selectedDriverId, setSelectedDriverId] = useState<number | null>(null);

  const fetchReturnRequests = async () => {
    setLoading(true);
    try {
      const data = await getAllReturnRequestsApi();
      setRequests(data);
    } catch (err: any) {
      toast.error("Failed to load return requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReturnRequests();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleUpdate = () => {
      fetchReturnRequests();
    };

    socket.on("order-updated", handleUpdate);
    socket.on("dashboard-metrics-updated", handleUpdate);

    return () => {
      socket.off("order-updated", handleUpdate);
      socket.off("dashboard-metrics-updated", handleUpdate);
    };
  }, [socket]);

  useEffect(() => {
    const fetchDeliveryBoys = async () => {
      try {
        const drivers = await getDeliveryBoysApi();
        setDeliveryBoys(drivers || []);
      } catch {
        // silently ignore
      }
    };
    fetchDeliveryBoys();
  }, []);

  const handleOpenActionModal = (req: ReturnRequest, action: typeof modalAction) => {
    setSelectedReq(req);
    setModalAction(action);
    setAdminNotes("");
    setSelectedDriverId(null);
  };

  const handleCloseModal = () => {
    setSelectedReq(null);
    setModalAction(null);
    setAdminNotes("");
    setSelectedDriverId(null);
  };

  const handleSubmitAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReq || !modalAction) return;

    if ((modalAction === "approved_replacement" || modalAction === "approved_refund") && !selectedDriverId) {
      toast.error("Please select a delivery boy to handle the return pickup task.");
      return;
    }

    setIsSubmittingAction(true);
    try {
      const success = await updateReturnRequestStatusApi(
        selectedReq.id,
        modalAction,
        adminNotes,
        selectedDriverId || undefined
      );
      if (success) {
        toast.success(`Request #${selectedReq.id} updated successfully!`);
        fetchReturnRequests();
        handleCloseModal();
      } else {
        toast.error("Failed to update request status");
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred");
    } finally {
      setIsSubmittingAction(false);
    }
  };

  // Filter & Search requests
  const filteredRequests = requests.filter((req) => {
    // 1. Status Filter
    if (activeFilter !== "all" && req.status !== activeFilter) return false;

    // 2. Search query matches
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const orderNum = req.order?.order_number?.toLowerCase() || "";
    const customerName = (req.order?.customer_name || req.user?.name || "").toLowerCase();
    const customerPhone = (req.order?.customer_phone || "").toLowerCase();
    const productTitle = req.orderItem?.product?.title?.toLowerCase() || "";

    return (
      orderNum.includes(query) ||
      customerName.includes(query) ||
      customerPhone.includes(query) ||
      productTitle.includes(query) ||
      req.id.toString().includes(query)
    );
  });

  // Calculate quick metrics
  const totalCount = requests.length;
  const pendingCount = requests.filter(r => r.status === "pending").length;
  const approvedReplCount = requests.filter(r => r.status === "approved_replacement").length;
  const approvedRefCount = requests.filter(r => r.status === "approved_refund").length;
  const rejectedCount = requests.filter(r => r.status === "rejected").length;

  const card = isDark ? "bg-gray-800 border-gray-700" : "bg-slate-50 border-slate-100";
  const cardText = isDark ? "text-gray-200" : "text-slate-800";
  const mutedText = isDark ? "text-gray-400" : "text-slate-400";

  return (
    <div className="space-y-6">
      
      {/* Metrics Banner */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">

        <div className={`${card} border p-4 rounded-2xl`}>
          <span className={`text-[10px] font-bold ${mutedText} uppercase tracking-wider block`}>Total Requests</span>
          <span className={`text-2xl font-extrabold ${cardText} mt-1 block`}>{totalCount}</span>
        </div>

        <div className={`${isDark ? "bg-amber-900/20 border-amber-800/40" : "bg-amber-50/50 border-amber-100"} border p-4 rounded-2xl`}>
          <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider block">Pending Review</span>
          <span className="text-2xl font-extrabold text-amber-600 mt-1 block">{pendingCount}</span>
        </div>

        <div className={`${isDark ? "bg-green-900/20 border-green-800/40" : "bg-green-50/50 border-green-100"} border p-4 rounded-2xl`}>
          <span className="text-[10px] font-bold text-green-500 uppercase tracking-wider block">Replacements</span>
          <span className="text-2xl font-extrabold text-green-600 mt-1 block">{approvedReplCount}</span>
        </div>

        <div className={`${isDark ? "bg-emerald-900/20 border-emerald-800/40" : "bg-emerald-50/50 border-emerald-100"} border p-4 rounded-2xl`}>
          <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider block">Refunds Issued</span>
          <span className="text-2xl font-extrabold text-emerald-600 mt-1 block">{approvedRefCount}</span>
        </div>

        <div className={`${isDark ? "bg-red-900/20 border-red-800/40" : "bg-red-50/50 border-red-100"} border p-4 rounded-2xl col-span-2 lg:col-span-1`}>
          <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider block">Rejected</span>
          <span className="text-2xl font-extrabold text-red-500 mt-1 block">{rejectedCount}</span>
        </div>

      </div>

      {/* Control Bar */}
      <div className={`flex flex-col md:flex-row gap-4 justify-between items-center border p-4 rounded-2xl shadow-sm ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-slate-100"}`}>

        {/* Filter buttons */}
        <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
          {["all", "pending", "approved_replacement", "approved_refund", "rejected"].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                activeFilter === filter
                  ? "bg-orange-500 text-white shadow-sm"
                  : isDark ? "bg-gray-700 text-gray-300 hover:bg-gray-600" : "bg-slate-50 text-slate-500 hover:text-slate-800 hover:bg-slate-100"
              }`}
            >
              {filter.replace("_", " ")}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${isDark ? "text-gray-500" : "text-slate-400"}`} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search request, order, customer..."
            className={`w-full pl-9 pr-4 py-2 border rounded-xl text-xs focus:outline-none focus:border-orange-500 transition-colors ${isDark ? "bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-500" : "border-slate-200 text-slate-800"}`}
          />
        </div>

      </div>

      {/* Requests List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-8 w-8 text-orange-500 animate-spin" />
          <p className={`text-xs mt-3 font-semibold uppercase tracking-wider ${isDark ? "text-gray-500" : "text-slate-400"}`}>Fetching requests...</p>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className={`text-center py-16 border rounded-2xl ${isDark ? "bg-gray-800/30 border-gray-700" : "bg-slate-50/20 border-slate-100"}`}>
          <Undo className={`h-10 w-10 mx-auto mb-3 ${isDark ? "text-gray-600" : "text-slate-300"}`} />
          <h4 className={`text-sm font-bold ${isDark ? "text-gray-300" : "text-slate-700"}`}>No return requests found</h4>
          <p className={`text-xs mt-1 ${isDark ? "text-gray-500" : "text-slate-400"}`}>Try switching filters or adjusting your search term.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((req) => {
            const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
              pending: { label: "Pending Review", color: "text-amber-700", bg: "bg-amber-50 border-amber-100" },
              approved_replacement: { label: "Approved (Replacement)", color: "text-green-700", bg: "bg-green-50 border-green-100" },
              approved_refund: { label: "Approved (Refund)", color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-100" },
              rejected: { label: "Rejected", color: "text-red-650", bg: "bg-red-50 border-red-100" },
            };
            const cfg = statusConfig[req.status] || { label: req.status, color: "text-slate-600", bg: "bg-slate-50 border-slate-100" };

            const custName = req.order?.customer_name || req.user?.name || "Griva Customer";
            const custPhone = req.order?.customer_phone || "—";
            const custEmail = req.order?.customer_email || req.user?.email || "—";

            return (
              <div
                key={req.id}
                className={`border rounded-2xl shadow-sm overflow-hidden transition-all duration-300 ${isDark ? "bg-gray-800 border-gray-700 hover:border-gray-600" : "bg-white border-slate-100 hover:border-slate-200/70"}`}
              >
                {/* Request Header */}
                <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-6 py-4 border-b ${isDark ? "bg-gray-800/50 border-gray-700" : "bg-slate-50/20 border-slate-100"}`}>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-bold ${isDark ? "text-gray-500" : "text-slate-400"}`}>#RET-{req.id}</span>
                    <span className={`inline-flex items-center text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${cfg.bg} ${cfg.color}`}>
                      {cfg.label}
                    </span>
                    <span className="inline-flex items-center text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded border border-orange-100 capitalize">
                      {req.type}
                    </span>
                  </div>
                  
                  <div className={`flex items-center gap-4 text-xs ${isDark ? "text-gray-500" : "text-slate-500"}`}>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(req.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                    <span className={`font-semibold ${isDark ? "text-gray-300" : "text-slate-700"}`}>
                      Order: {req.order?.order_number || "—"}
                    </span>
                  </div>
                </div>

                {/* Request Body */}
                <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Left Column: Customer details */}
                  <div className="space-y-3">
                    <h5 className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${isDark ? "text-gray-500" : "text-slate-400"}`}>
                      <User className="h-3.5 w-3.5" /> Customer Details
                    </h5>
                    <div className="space-y-1.5 text-xs">
                      <p className={`font-bold ${isDark ? "text-gray-200" : "text-slate-800"}`}>{custName}</p>
                      <p className={`flex items-center gap-2 ${isDark ? "text-gray-400" : "text-slate-500"}`}>
                        <Mail className="h-3 w-3 shrink-0" />
                        {custEmail}
                      </p>
                      <p className={`flex items-center gap-2 ${isDark ? "text-gray-400" : "text-slate-500"}`}>
                        <Phone className="h-3 w-3 shrink-0" />
                        {custPhone}
                      </p>
                    </div>
                  </div>

                  {/* Middle Column: Returned Product & reason */}
                  <div className="space-y-3">
                    <h5 className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${isDark ? "text-gray-500" : "text-slate-400"}`}>
                      <ShoppingBag className="h-3.5 w-3.5" /> Return Item & Reason
                    </h5>
                    
                    <div className="flex gap-3">
                      <div className={`h-12 w-12 border rounded-xl overflow-hidden shrink-0 flex items-center justify-center relative ${isDark ? "bg-gray-700 border-gray-600" : "bg-slate-50 border-slate-100"}`}>
                        <img
                          src={req.orderItem?.product?.main_image_url || "/images/placeholder.jpg"}
                          alt={req.orderItem?.product?.title || "Product"}
                          className="object-contain max-h-full max-w-full"
                        />
                      </div>
                      <div className="min-w-0">
                        <h6 className={`text-xs font-bold truncate ${isDark ? "text-gray-200" : "text-slate-800"}`}>{req.orderItem?.product?.title || "Product"}</h6>
                        <p className={`text-[10px] mt-0.5 ${isDark ? "text-gray-500" : "text-slate-400"}`}>
                          Qty: <span className={`font-bold ${isDark ? "text-gray-300" : "text-slate-700"}`}>{req.quantity}</span>
                          {req.orderItem?.selected_color && ` | Color: ${req.orderItem.selected_color}`}
                          {req.orderItem?.selected_storage && ` | Storage: ${req.orderItem.selected_storage}`}
                        </p>
                        {(req.orderItem?.variant || req.orderItem?.product) && (
                          <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">
                            Current Stock: <span className={(req.orderItem?.variant ? req.orderItem.variant.stock : req.orderItem?.product?.stock) && (req.orderItem?.variant ? req.orderItem.variant.stock : req.orderItem?.product?.stock)! > 0 ? "text-green-600" : "text-red-500"}>
                              {(req.orderItem?.variant ? req.orderItem.variant.stock : req.orderItem?.product?.stock) ?? 0} units
                            </span>
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="pt-2 text-xs space-y-1">
                      <p className={`font-semibold capitalize ${isDark ? "text-gray-400" : "text-slate-700"}`}>
                        Reason: <span className={`font-bold ${isDark ? "text-gray-200" : "text-slate-900"}`}>{req.reason.replace("_", " ")}</span>
                      </p>
                      {req.description && (
                        <p className={`leading-relaxed p-2.5 border rounded-xl italic ${isDark ? "text-gray-400 bg-gray-700/50 border-gray-600" : "text-slate-500 bg-slate-50/50 border-slate-100"}`}>
                          "{req.description}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Photo Proof & Notes */}
                  <div className="space-y-3">
                    <h5 className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${isDark ? "text-gray-500" : "text-slate-400"}`}>
                      <FileText className="h-3.5 w-3.5" /> Proof & Status Notes
                    </h5>
                    
                    {req.images && req.images.length > 0 ? (
                      <div className="flex gap-2 flex-wrap">
                        {req.images.map((img, idx) => (
                          <a
                            key={idx}
                            href={img}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`h-12 w-12 border hover:border-orange-500 rounded-lg overflow-hidden shrink-0 flex items-center justify-center cursor-zoom-in transition-all relative group ${isDark ? "bg-gray-700 border-gray-600" : "bg-slate-50 border-slate-200"}`}
                          >
                            <img src={img} alt="proof" className="object-cover h-full w-full" />
                            <div className="absolute inset-0 bg-black/30 items-center justify-center hidden group-hover:flex">
                              <ExternalLink className="h-3 w-3 text-white" />
                            </div>
                          </a>
                        ))}
                      </div>
                    ) : (
                      <span className={`text-[10px] italic ${isDark ? "text-gray-600" : "text-slate-400"}`}>No proof photos uploaded.</span>
                    )}

                    {req.admin_notes && (
                      <div className={`border rounded-xl p-3 text-xs ${isDark ? "bg-gray-700/50 border-gray-600" : "bg-slate-50 border-slate-100"}`}>
                        <span className={`text-[9px] font-bold uppercase tracking-wider block ${isDark ? "text-gray-500" : "text-slate-400"}`}>Decision Note:</span>
                        <p className={`leading-relaxed mt-0.5 whitespace-pre-line ${isDark ? "text-gray-300" : "text-slate-700"}`}>{req.admin_notes}</p>
                      </div>
                    )}

                    {/* Pending Action Triggers */}
                    {req.status === "pending" && (
                      <div className="pt-2 flex flex-wrap gap-2">
                        <button
                          onClick={() => handleOpenActionModal(req, "approved_replacement")}
                          className="flex-1 min-w-[120px] py-2 px-3 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition cursor-pointer"
                        >
                          <Check className="h-3.5 w-3.5" /> Approve Replace
                        </button>
                        <button
                          onClick={() => handleOpenActionModal(req, "approved_refund")}
                          className="flex-1 min-w-[120px] py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition cursor-pointer"
                        >
                          <Check className="h-3.5 w-3.5" /> Approve Refund
                        </button>
                        <button
                          onClick={() => handleOpenActionModal(req, "rejected")}
                          className="flex-1 min-w-[100px] py-2 px-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition cursor-pointer"
                        >
                          <X className="h-3.5 w-3.5" /> Reject Request
                        </button>
                      </div>
                    )}
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CONFIRMATION / ACTION MODAL */}
      {selectedReq && modalAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className={`rounded-3xl border shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-scaleUp ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-slate-100"}`}>
            
            <div className={`px-6 py-5 border-b flex justify-between items-center ${isDark ? "bg-gray-800/80 border-gray-700" : "bg-slate-50/50 border-slate-100"}`}>
              <div>
                <h3 className={`text-base font-extrabold capitalize ${isDark ? "text-gray-100" : "text-slate-800"}`}>
                  {modalAction.replace("_", " ")}
                </h3>
                <p className={`text-[11px] mt-0.5 ${isDark ? "text-gray-500" : "text-slate-400"}`}>Request #RET-{selectedReq.id}</p>
              </div>
              <button
                onClick={handleCloseModal}
                className={`h-8 w-8 rounded-full flex items-center justify-center transition-colors cursor-pointer ${isDark ? "text-gray-500 hover:bg-gray-700 hover:text-gray-300" : "text-slate-400 hover:bg-slate-200/60"}`}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitAction} className="p-6 space-y-4">
              
              {/* Replacement validation banner if variant has stock warning */}
              {modalAction === "approved_replacement" && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 space-y-1.5">
                  <div className="flex gap-2 text-amber-700 text-xs font-bold items-start">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>Replacement Stock Verification</span>
                  </div>
                  <p className="text-[10px] text-amber-600 leading-relaxed">
                    Product Title: <span className="font-bold">{selectedReq.orderItem?.product?.title}</span><br />
                    Required Qty: <span className="font-bold">{selectedReq.quantity}</span> | Available Stock: <span className="font-bold">{(selectedReq.orderItem?.variant ? selectedReq.orderItem.variant.stock : selectedReq.orderItem?.product?.stock) ?? 0} units</span>
                  </p>
                  {((selectedReq.orderItem?.variant ? selectedReq.orderItem.variant.stock : selectedReq.orderItem?.product?.stock) ?? 0) < selectedReq.quantity && (
                    <p className="text-[9px] font-bold text-red-500 bg-white border border-red-150 rounded-lg p-2 mt-1">
                      ⚠️ Warning: Stock is insufficient. Approving replacement will automatically convert to a full refund fallback and notify the customer.
                    </p>
                  )}
                </div>
              )}

              {/* Assign Delivery Driver Dropdown */}
              {(modalAction === "approved_replacement" || modalAction === "approved_refund") && (
                <div className="space-y-1.5">
                  <label className={`block text-[10px] font-bold uppercase tracking-wider ${isDark ? "text-gray-400" : "text-slate-400"}`}>
                    Assign Delivery Boy / Courier <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedDriverId || ""}
                    onChange={(e) => setSelectedDriverId(e.target.value ? Number(e.target.value) : null)}
                    className={`w-full rounded-xl border px-3.5 py-2.5 text-xs focus:outline-none focus:border-orange-500 transition-colors ${isDark ? "bg-gray-700 border-gray-600 text-gray-200" : "bg-white border-slate-200 text-slate-800"}`}
                    required
                  >
                    <option value="">-- Choose Driver (Required) --</option>
                    {deliveryBoys.map((driver) => (
                      <option key={driver.id} value={driver.id}>
                        {driver.name} ({driver.activeOrderCount} active tasks)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-1.5">
                <label className={`block text-[10px] font-bold uppercase tracking-wider ${isDark ? "text-gray-400" : "text-slate-400"}`}>
                  Provide Decision Notes / Feedback
                  {modalAction === "rejected" && <span className="text-red-500 ml-1">* Required for rejection email</span>}
                </label>
                <textarea
                  rows={4}
                  required={modalAction === "rejected"}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder={
                    modalAction === "rejected"
                      ? "Explain clearly to the customer why their request was rejected..."
                      : "Add details about replacement tracking or refund timeline..."
                  }
                  className={`w-full rounded-xl border px-3.5 py-2.5 text-xs focus:outline-none focus:border-orange-500 transition-colors resize-none ${isDark ? "bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-500" : "bg-white border-slate-200 text-slate-800 placeholder-slate-400"}`}
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition cursor-pointer ${isDark ? "bg-gray-700 text-gray-300 hover:bg-gray-600" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAction || (modalAction === "rejected" && !adminNotes.trim())}
                  className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider text-white rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 shadow-md ${
                    modalAction === "rejected"
                      ? "bg-red-600 hover:bg-red-700 shadow-red-500/10"
                      : "bg-orange-500 hover:bg-orange-600 shadow-orange-500/10"
                  }`}
                >
                  {isSubmittingAction && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Confirm
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
