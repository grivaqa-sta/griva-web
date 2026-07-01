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
    const fetchDeliveryBoys = async () => {
      try {
        const drivers = await getDeliveryBoysApi();
        setDeliveryBoys(drivers || []);
      } catch (err) {
        console.error("Failed to fetch delivery boys:", err);
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

  return (
    <div className="space-y-6">
      
      {/* Metrics Banner */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        
        <div className="bg-slate-50 border border-slate-100 p-4.5 rounded-2xl">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Requests</span>
          <span className="text-2xl font-extrabold text-slate-800 mt-1 block">{totalCount}</span>
        </div>

        <div className="bg-amber-50/50 border border-amber-100 p-4.5 rounded-2xl">
          <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block">Pending Review</span>
          <span className="text-2xl font-extrabold text-amber-700 mt-1 block">{pendingCount}</span>
        </div>

        <div className="bg-green-50/50 border border-green-100 p-4.5 rounded-2xl">
          <span className="text-[10px] font-bold text-green-600 uppercase tracking-wider block">Replacements</span>
          <span className="text-2xl font-extrabold text-green-700 mt-1 block">{approvedReplCount}</span>
        </div>

        <div className="bg-emerald-50/50 border border-emerald-100 p-4.5 rounded-2xl">
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">Refunds Issued</span>
          <span className="text-2xl font-extrabold text-emerald-700 mt-1 block">{approvedRefCount}</span>
        </div>

        <div className="bg-red-50/50 border border-red-100 p-4.5 rounded-2xl col-span-2 lg:col-span-1">
          <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider block">Rejected</span>
          <span className="text-2xl font-extrabold text-red-650 mt-1 block">{rejectedCount}</span>
        </div>

      </div>

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white border border-slate-100 p-4 rounded-2xl shadow-sm">
        
        {/* Filter buttons */}
        <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
          {["all", "pending", "approved_replacement", "approved_refund", "rejected"].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                activeFilter === filter
                  ? "bg-orange-500 text-white shadow-sm"
                  : "bg-slate-50 text-slate-500 hover:text-slate-800 hover:bg-slate-100"
              }`}
            >
              {filter.replace("_", " ")}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search request, order, customer..."
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-orange-500 transition-colors"
          />
        </div>

      </div>

      {/* Requests List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-8 w-8 text-orange-500 animate-spin" />
          <p className="text-xs text-slate-400 mt-3 font-semibold uppercase tracking-wider">Fetching requests...</p>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="text-center py-16 bg-slate-50/20 border border-slate-100 rounded-2xl">
          <Undo className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <h4 className="text-sm font-bold text-slate-700">No return requests found</h4>
          <p className="text-xs text-slate-400 mt-1">Try switching filters or adjusting your search term.</p>
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
                className="bg-white border border-slate-100 hover:border-slate-200/70 rounded-2xl shadow-sm overflow-hidden transition-all duration-300"
              >
                {/* Request Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-6 py-4.5 bg-slate-50/20 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-400">#RET-{req.id}</span>
                    <span className={`inline-flex items-center text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${cfg.bg} ${cfg.color}`}>
                      {cfg.label}
                    </span>
                    <span className="inline-flex items-center text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded border border-orange-100 capitalize">
                      {req.type}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(req.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                    <span className="font-semibold text-slate-700">
                      Order: {req.order?.order_number || "—"}
                    </span>
                  </div>
                </div>

                {/* Request Body */}
                <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Left Column: Customer details */}
                  <div className="space-y-3">
                    <h5 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5" /> Customer Details
                    </h5>
                    <div className="space-y-1.5 text-xs">
                      <p className="font-bold text-slate-800">{custName}</p>
                      <p className="text-slate-550 flex items-center gap-2">
                        <Mail className="h-3 w-3 shrink-0" />
                        {custEmail}
                      </p>
                      <p className="text-slate-550 flex items-center gap-2">
                        <Phone className="h-3 w-3 shrink-0" />
                        {custPhone}
                      </p>
                    </div>
                  </div>

                  {/* Middle Column: Returned Product & reason */}
                  <div className="space-y-3">
                    <h5 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <ShoppingBag className="h-3.5 w-3.5" /> Return Item & Reason
                    </h5>
                    
                    <div className="flex gap-3">
                      <div className="h-12 w-12 bg-slate-50 border border-slate-100 rounded-xl overflow-hidden shrink-0 flex items-center justify-center relative">
                        <img
                          src={req.orderItem?.product?.main_image_url || "/images/placeholder.jpg"}
                          alt={req.orderItem?.product?.title || "Product"}
                          className="object-contain max-h-full max-w-full"
                        />
                      </div>
                      <div className="min-w-0">
                        <h6 className="text-xs font-bold text-slate-800 truncate">{req.orderItem?.product?.title || "Product"}</h6>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Qty: <span className="text-slate-700 font-bold">{req.quantity}</span>
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
                      <p className="font-semibold text-slate-700 capitalize">
                        Reason: <span className="text-slate-900 font-bold">{req.reason.replace("_", " ")}</span>
                      </p>
                      {req.description && (
                        <p className="text-slate-500 leading-relaxed bg-slate-50/50 p-2.5 border border-slate-100 rounded-xl italic">
                          "{req.description}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Photo Proof & Notes */}
                  <div className="space-y-3">
                    <h5 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
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
                            className="h-12 w-12 bg-slate-50 border border-slate-200 hover:border-orange-500 rounded-lg overflow-hidden shrink-0 flex items-center justify-center cursor-zoom-in transition-all relative group"
                          >
                            <img src={img} alt="proof" className="object-cover h-full w-full" />
                            <div className="absolute inset-0 bg-black/30 items-center justify-center hidden group-hover:flex">
                              <ExternalLink className="h-3 w-3 text-white" />
                            </div>
                          </a>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-450 italic">No proof photos uploaded.</span>
                    )}

                    {req.admin_notes && (
                      <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Decision Note:</span>
                        <p className="text-slate-700 leading-relaxed mt-0.5 whitespace-pre-line">{req.admin_notes}</p>
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
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-scaleUp">
            
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-base font-extrabold text-slate-800 capitalize">
                  {modalAction.replace("_", " ")}
                </h3>
                <p className="text-[11px] text-slate-450 mt-0.5">Request #RET-{selectedReq.id}</p>
              </div>
              <button
                onClick={handleCloseModal}
                className="h-8 w-8 rounded-full hover:bg-slate-200/60 flex items-center justify-center text-slate-400 hover:text-slate-650 transition-colors cursor-pointer"
              >
                <X className="h-4.5 w-4.5" />
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
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Assign Delivery Boy / Courier <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedDriverId || ""}
                    onChange={(e) => setSelectedDriverId(e.target.value ? Number(e.target.value) : null)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-orange-500 transition-colors"
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
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
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
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-500 transition-colors resize-none"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-650 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
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
