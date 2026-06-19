"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Filter,
  Users,
  UserCheck,
  UserMinus,
  Mail,
  Phone,
  ShieldAlert,
  DollarSign,
  ShoppingBag,
  Calendar,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  TrendingUp,
  Percent,
  AlertTriangle,
  RefreshCw,
  CheckCircle,
  Clock,
  Sparkles
} from "lucide-react";
import {
  getCustomersApi,
  getCustomerByIdApi,
  getCustomerAnalyticsApi,
  updateCustomerStatusApi,
  CustomerInfo,
  CustomerDetailInfo,
  CustomerAnalyticsData
} from "@/app/utils/api";

const FILTER_OPTIONS = [
  { value: "", label: "All Accounts" },
  { value: "ACTIVE", label: "Status: Active" },
  { value: "BLOCKED", label: "Status: Blocked" },
  { value: "VIP", label: "Segment: VIP Customers" },
  { value: "NEW", label: "Segment: New Customers" },
  { value: "REPEAT", label: "Segment: Repeat Customers" },
  { value: "HIGH_RISK", label: "Risk Level: High Risk" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Sort: Newest Joined" },
  { value: "most_orders", label: "Sort: Order Volume" },
  { value: "highest_spending", label: "Sort: Total Spending" },
  { value: "highest_success_rate", label: "Sort: Success Rate" },
];

export default function CustomersTab() {
  // Directory Data States
  const [customers, setCustomers] = useState<CustomerInfo[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, totalItems: 0, totalPages: 1 });
  const [analytics, setAnalytics] = useState<CustomerAnalyticsData | null>(null);

  // Filter States
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);

  // Dropdown States
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);

  // Loading States
  const [loading, setLoading] = useState(true);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Selected Detail States
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerDetailInfo | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Confirmation Modals
  const [confirmBlock, setConfirmBlock] = useState<{ id: number; name: string; status: "ACTIVE" | "BLOCKED" } | null>(null);
  const [actionInProgress, setActionInProgress] = useState(false);

  // Notification Banner
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Fetch Core Customers List
  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const data = await getCustomersApi({ page, limit: 10, search, filter, sort });
      setCustomers(data.customers);
      setPagination(data.pagination);
    } catch (err: any) {
      triggerAlert("error", "Failed to retrieve customers. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch Analytics Summary
  const fetchAnalytics = async () => {
    setLoadingAnalytics(true);
    try {
      const data = await getCustomerAnalyticsApi();
      setAnalytics(data);
    } catch (err) {
      console.error("Failed fetching analytics:", err);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  // Run on parameters update
  useEffect(() => {
    fetchCustomers();
  }, [page, filter, sort]);

  // Handle Search Trigger (Debounced or on key enter / click)
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchCustomers();
  };

  // Trigger Analytics load on mount
  useEffect(() => {
    fetchAnalytics();
  }, []);

  // Click outside listener for dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const triggerAlert = (type: "success" | "error", message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 4000);
  };

  // View Detailed Profile
  const handleViewDetails = async (id: number) => {
    setLoadingDetail(true);
    setIsDetailOpen(true);
    try {
      const data = await getCustomerByIdApi(id);
      if (data) {
        setSelectedCustomer(data);
      } else {
        triggerAlert("error", "Customer details could not be found.");
        setIsDetailOpen(false);
      }
    } catch (err) {
      triggerAlert("error", "Error fetching customer details.");
      setIsDetailOpen(false);
    } finally {
      setLoadingDetail(false);
    }
  };

  // Block/Unblock Status Action Handler
  const handleStatusChange = async () => {
    if (!confirmBlock) return;
    setActionInProgress(true);
    try {
      const success = await updateCustomerStatusApi(confirmBlock.id, confirmBlock.status);
      if (success) {
        triggerAlert("success", `Customer "${confirmBlock.name}" status updated to ${confirmBlock.status} successfully.`);
        // Reload directories
        fetchCustomers();
        fetchAnalytics();
        // If the side panel is showing the same customer, update its status locally
        if (selectedCustomer && selectedCustomer.id === confirmBlock.id) {
          setSelectedCustomer(prev => prev ? { ...prev, status: confirmBlock.status } : null);
        }
      } else {
        triggerAlert("error", "Failed to update customer status.");
      }
    } catch (err: any) {
      triggerAlert("error", err.message || "Failed to alter status.");
    } finally {
      setActionInProgress(false);
      setConfirmBlock(null);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300 relative">
      {/* Alert Banners */}
      {alert && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3.5 rounded-xl border shadow-xl transition-all duration-300 animate-in slide-in-from-top-5 ${
          alert.type === "success"
            ? "bg-green-50 border-green-500/30 text-green-700"
            : "bg-red-50 border-red-500/30 text-red-700"
        }`}>
          {alert.type === "success" ? <CheckCircle className="h-5 w-5 text-green-500" /> : <AlertTriangle className="h-5 w-5 text-red-500" />}
          <span className="text-xs font-bold">{alert.message}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-black bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent uppercase tracking-wider">
            Customer Directory
          </h2>
          <p className="text-xs text-gray-500 font-medium">
            Monitor client accounts, segment performance, order conversion, and secure status management.
          </p>
        </div>
        <button
          onClick={() => { fetchCustomers(); fetchAnalytics(); }}
          className="flex items-center justify-center gap-2 self-start px-4 py-2 border border-orange-500/30 hover:bg-orange-500/5 text-gray-600 hover:text-gray-900 rounded-xl transition-all text-xs font-bold cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Sync Records
        </button>
      </div>

      {/* Analytics Summaries Banner */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Customers */}
        <div className="bg-white border border-orange-500/20 rounded-2xl p-5 shadow-sm relative overflow-hidden group hover:border-orange-500/40 transition-all duration-300">
          <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-5 text-orange-500 pointer-events-none group-hover:scale-110 transition-transform duration-300">
            <Users className="h-28 w-28" />
          </div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-orange-100 rounded-xl text-orange-500">
              <Users className="h-5 w-5" />
            </div>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total Customers</span>
          </div>
          {loadingAnalytics ? (
            <div className="h-7 w-20 bg-gray-100 animate-pulse rounded-lg mt-1" />
          ) : (
            <h3 className="text-2xl font-black text-gray-900 tracking-tight">
              {analytics?.totalCustomers || 0}
            </h3>
          )}
          <span className="text-[9px] text-gray-500 font-semibold block mt-1">
            Active: <span className="text-green-500 font-bold">{analytics?.activeCustomers || 0}</span> | Blocked: <span className="text-red-500 font-bold">{analytics?.blockedCustomers || 0}</span>
          </span>
        </div>

        {/* Card 2: Repeat Customers */}
        <div className="bg-white border border-orange-500/20 rounded-2xl p-5 shadow-sm relative overflow-hidden group hover:border-orange-500/40 transition-all duration-300">
          <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-5 text-amber-500 pointer-events-none group-hover:scale-110 transition-transform duration-300">
            <UserCheck className="h-28 w-28" />
          </div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-amber-100 rounded-xl text-amber-500">
              <UserCheck className="h-5 w-5" />
            </div>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Repeat Rate</span>
          </div>
          {loadingAnalytics ? (
            <div className="h-7 w-20 bg-gray-100 animate-pulse rounded-lg mt-1" />
          ) : (
            <h3 className="text-2xl font-black text-gray-900 tracking-tight">
              {analytics?.totalCustomers ? Math.round(((analytics.repeatCustomers || 0) / analytics.totalCustomers) * 100) : 0}%
            </h3>
          )}
          <span className="text-[9px] text-gray-500 font-semibold block mt-1">
            Total repeat users: <span className="text-orange-500 font-bold">{analytics?.repeatCustomers || 0}</span>
          </span>
        </div>

        {/* Card 3: VIP Customers */}
        <div className="bg-white border border-orange-500/20 rounded-2xl p-5 shadow-sm relative overflow-hidden group hover:border-orange-500/40 transition-all duration-300">
          <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-5 text-yellow-500 pointer-events-none group-hover:scale-110 transition-transform duration-300">
            <Sparkles className="h-28 w-28" />
          </div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-yellow-100 rounded-xl text-yellow-600">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">VIP Directory</span>
          </div>
          {loadingAnalytics ? (
            <div className="h-7 w-20 bg-gray-100 animate-pulse rounded-lg mt-1" />
          ) : (
            <h3 className="text-2xl font-black text-gray-900 tracking-tight">
              {analytics?.vipCustomers || 0}
            </h3>
          )}
          <span className="text-[9px] text-gray-500 font-semibold block mt-1">
            Threshold: <span className="text-amber-500 font-bold">QAR 5000+</span>
          </span>
        </div>

        {/* Card 4: Avg Customer Value */}
        <div className="bg-white border border-orange-500/20 rounded-2xl p-5 shadow-sm relative overflow-hidden group hover:border-orange-500/40 transition-all duration-300">
          <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-5 text-green-500 pointer-events-none group-hover:scale-110 transition-transform duration-300">
            <DollarSign className="h-28 w-28" />
          </div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-green-100 rounded-xl text-green-600">
              <DollarSign className="h-5 w-5" />
            </div>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Avg Customer Value</span>
          </div>
          {loadingAnalytics ? (
            <div className="h-7 w-20 bg-gray-100 animate-pulse rounded-lg mt-1" />
          ) : (
            <h3 className="text-2xl font-black text-gray-900 tracking-tight">
              QAR {analytics?.averageCustomerValue?.toFixed(2) || "0.00"}
            </h3>
          )}
          <span className="text-[9px] text-gray-500 font-semibold block mt-1">
            High risk accounts: <span className="text-red-500 font-bold">{analytics?.highRiskCustomers || 0}</span>
          </span>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="bg-white p-4 border border-orange-500/20 rounded-2xl shadow-sm space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-orange-500/30 rounded-xl pl-10 pr-4 py-2.5 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-orange-500 transition-colors"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Filter Dropdown */}
            <div className="relative" ref={filterRef}>
              <button
                type="button"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="flex items-center justify-between gap-2 bg-white border border-orange-500/30 rounded-xl px-4 py-2.5 text-xs font-semibold text-gray-700 hover:border-orange-500 transition-colors w-48 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Filter className="h-3.5 w-3.5 text-gray-400" />
                  <span>{FILTER_OPTIONS.find(o => o.value === filter)?.label || "All Accounts"}</span>
                </div>
                <ChevronRight className={`h-3 w-3 text-gray-400 transition-transform duration-200 ${isFilterOpen ? "rotate-90 text-orange-500" : ""}`} />
              </button>
              
              {isFilterOpen && (
                <div className="absolute left-0 mt-2 w-56 bg-white border border-orange-500/20 rounded-2xl shadow-xl z-20 overflow-hidden py-1 animate-in fade-in slide-in-from-top-2 duration-200">
                  {FILTER_OPTIONS.map((o) => (
                    <button
                      key={o.value}
                      type="button"
                      onClick={() => {
                        setFilter(o.value);
                        setIsFilterOpen(false);
                        setPage(1);
                      }}
                      className={`w-full text-left px-4 py-2 text-xs font-semibold hover:bg-orange-500/5 transition-colors block ${
                        filter === o.value ? "text-orange-500 bg-orange-500/[0.03] font-bold" : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="relative" ref={sortRef}>
              <button
                type="button"
                onClick={() => setIsSortOpen(!isSortOpen)}
                className="flex items-center justify-between gap-2 bg-white border border-orange-500/30 rounded-xl px-4 py-2.5 text-xs font-semibold text-gray-700 hover:border-orange-500 transition-colors w-48 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-3.5 w-3.5 text-gray-400" />
                  <span>{SORT_OPTIONS.find(o => o.value === sort)?.label || "Sort: Newest Joined"}</span>
                </div>
                <ChevronRight className={`h-3 w-3 text-gray-400 transition-transform duration-200 ${isSortOpen ? "rotate-90 text-orange-500" : ""}`} />
              </button>
              
              {isSortOpen && (
                <div className="absolute left-0 mt-2 w-56 bg-white border border-orange-500/20 rounded-2xl shadow-xl z-20 overflow-hidden py-1 animate-in fade-in slide-in-from-top-2 duration-200">
                  {SORT_OPTIONS.map((o) => (
                    <button
                      key={o.value}
                      type="button"
                      onClick={() => {
                        setSort(o.value);
                        setIsSortOpen(false);
                        setPage(1);
                      }}
                      className={`w-full text-left px-4 py-2 text-xs font-semibold hover:bg-orange-500/5 transition-colors block ${
                        sort === o.value ? "text-orange-500 bg-orange-500/[0.03] font-bold" : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              className="px-5 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl text-xs font-bold transition-all hover:shadow-lg cursor-pointer"
            >
              Search
            </button>
          </div>
        </form>
      </div>

      {/* Customers Directory Table */}
      <div className="bg-white border border-orange-500/20 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-orange-500/20 text-[10px] text-gray-400 font-bold uppercase tracking-wider bg-gray-50/50">
                <th className="p-4">Customer Info</th>
                <th className="p-4">Contact Phone</th>
                <th className="p-4">Joined Date</th>
                <th className="p-4 text-center">Orders Stat</th>
                <th className="p-4 text-center">Success Rate</th>
                <th className="p-4">Total Revenue</th>
                <th className="p-4 text-center">Flags</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-150">
              {loading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="p-4" colSpan={9}>
                      <div className="h-10 bg-gray-100/70 rounded-xl w-full" />
                    </td>
                  </tr>
                ))
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-xs text-gray-400 font-medium">
                    No matching customer accounts found.
                  </td>
                </tr>
              ) : (
                customers.map((c) => {
                  const initials = c.name ? c.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() : "C";
                  return (
                    <tr key={c.id} className="hover:bg-orange-500/[0.01] transition-colors">
                      {/* Name & Email */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-orange-400 to-amber-500 flex items-center justify-center font-black text-xs text-white">
                            {initials}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-gray-800 block truncate max-w-[150px]">{c.name}</span>
                            <span className="text-[10px] text-gray-400 font-medium block truncate max-w-[150px]">{c.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="p-4 text-xs font-semibold text-gray-600">
                        {c.phone || "—"}
                      </td>

                      {/* Join Date */}
                      <td className="p-4 text-xs text-gray-500 font-medium">
                        {new Date(c.registrationDate).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })}
                      </td>

                      {/* Total Orders */}
                      <td className="p-4 text-center">
                        <div>
                          <span className="text-xs font-bold text-gray-800">{c.totalOrders}</span>
                          <span className="text-[9px] text-gray-400 font-semibold block">
                            {c.deliveredOrders} Del | {c.cancelledOrders} Can | {c.returnedOrders} Ret
                          </span>
                        </div>
                      </td>

                      {/* Success Rate */}
                      <td className="p-4 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          c.successRate >= 80 ? "bg-green-50 text-green-700" :
                          c.successRate >= 50 ? "bg-orange-50 text-orange-700" : "bg-red-50 text-red-700"
                        }`}>
                          {c.successRate}%
                        </span>
                      </td>

                      {/* Spending */}
                      <td className="p-4 text-xs font-black text-gray-800">
                        QAR {c.totalSpent.toFixed(2)}
                      </td>

                      {/* Segment & Risk Badges */}
                      <td className="p-4 text-center">
                        <div className="flex flex-col gap-1 items-center">
                          {/* Segment Badge */}
                          <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider leading-none ${
                            c.totalSpent >= 5000 ? "bg-amber-100 text-amber-800 border border-amber-500/20" :
                            c.totalOrders >= 2 ? "bg-blue-100 text-blue-800 border border-blue-500/10" :
                            "bg-gray-100 text-gray-800"
                          }`}>
                            {c.totalSpent >= 5000 ? "VIP" : c.totalOrders >= 2 ? "Repeat" : "New"}
                          </span>

                           {/* Risk Badge */}
                           {c.riskLevel !== "LOW" && (
                             <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold leading-none ${
                               c.riskLevel === "MEDIUM" ? "bg-orange-50 text-orange-600 border border-orange-500/20" : "bg-red-50 text-red-600 border border-red-500/20"
                             }`}>
                               {c.riskLevel} RISK
                             </span>
                           )}
                         </div>
                      </td>

                      {/* Status */}
                      <td className="p-4 text-center">
                        <button
                          onClick={() => setConfirmBlock({
                            id: c.id,
                            name: c.name,
                            status: c.status === "ACTIVE" ? "BLOCKED" : "ACTIVE"
                          })}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold hover:shadow-sm transition-all cursor-pointer ${
                            c.status === "ACTIVE"
                              ? "bg-green-100 text-green-800 border border-green-300/30 hover:bg-green-200/50"
                              : "bg-red-100 text-red-800 border border-red-300/30 hover:bg-red-200/50"
                          }`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${c.status === "ACTIVE" ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
                          {c.status}
                        </button>
                      </td>

                      {/* Details Trigger */}
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleViewDetails(c.id)}
                          className="p-1.5 text-gray-500 hover:text-orange-500 hover:bg-orange-500/5 rounded-lg transition-colors cursor-pointer"
                        >
                          <Eye className="h-4.5 w-4.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        {!loading && pagination.totalPages > 1 && (
          <div className="p-4 border-t border-orange-500/10 flex items-center justify-between">
            <span className="text-[10px] text-gray-400 font-bold uppercase">
              Page {pagination.page} of {pagination.totalPages} ({pagination.totalItems} customers)
            </span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(p - 1, 1))}
                className="p-2 border border-orange-500/20 hover:border-orange-500/40 rounded-lg text-gray-500 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                disabled={page >= pagination.totalPages}
                onClick={() => setPage(p => Math.min(p + 1, pagination.totalPages))}
                className="p-2 border border-orange-500/20 hover:border-orange-500/40 rounded-lg text-gray-500 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal: Detailed Profile View */}
      {isDetailOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
          {/* Overlay background */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsDetailOpen(false)}
          />

          {/* Modal content panel */}
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl relative z-50 flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Drawer Header */}
            <div className="p-6 border-b border-orange-500/20 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-orange-400 to-amber-500 flex items-center justify-center font-black text-sm text-white">
                  {selectedCustomer ? selectedCustomer.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() : "C"}
                </div>
                <div>
                  <h3 className="text-sm font-black text-gray-900 uppercase tracking-wide">
                    {selectedCustomer ? selectedCustomer.name : "Loading Customer..."}
                  </h3>
                  <span className="text-[10px] text-gray-400 font-bold block">
                    ID: {selectedCustomer?.id || "—"} | Registered: {selectedCustomer ? new Date(selectedCustomer.registrationDate).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }) : "—"}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsDetailOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {loadingDetail ? (
                <div className="flex flex-col items-center justify-center h-64 space-y-3">
                  <RefreshCw className="h-8 w-8 text-orange-500 animate-spin" />
                  <span className="text-xs font-bold text-gray-400 uppercase">Fetching profiles...</span>
                </div>
              ) : selectedCustomer ? (
                <>
                  {/* Account Overview Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                      <span className="text-[9px] text-gray-400 font-black uppercase block mb-1">Status & Metrics</span>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold border ${
                          selectedCustomer.status === "ACTIVE" ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"
                        }`}>
                          {selectedCustomer.status}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border ${
                          selectedCustomer.metrics.customerSegment === "VIP Customer" ? "bg-amber-50 text-amber-700 border-amber-200" :
                          selectedCustomer.metrics.customerSegment === "Repeat Customer" ? "bg-blue-50 text-blue-700 border-blue-200" :
                          "bg-gray-50 text-gray-700 border-gray-200"
                        }`}>
                          {selectedCustomer.metrics.customerSegment}
                        </span>
                        {selectedCustomer.metrics.riskLevel !== "LOW" && (
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${
                            selectedCustomer.metrics.riskLevel === "MEDIUM" ? "text-orange-600 bg-orange-50 border border-orange-500/20" :
                            "text-red-600 bg-red-50 border border-red-500/20"
                          }`}>
                            {selectedCustomer.metrics.riskLevel} RISK
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex flex-col justify-center">
                      <span className="text-[9px] text-gray-400 font-black uppercase block mb-0.5">Success Conversion</span>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-black text-gray-900">{selectedCustomer.metrics.successRate}%</span>
                        <div className="flex-1 bg-gray-200 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              selectedCustomer.metrics.successRate >= 80 ? "bg-green-500" :
                              selectedCustomer.metrics.successRate >= 50 ? "bg-orange-500" : "bg-red-500"
                            }`}
                            style={{ width: `${selectedCustomer.metrics.successRate}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Basic Information Details */}
                  <div className="bg-white border border-orange-500/10 rounded-xl p-4 space-y-3">
                    <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider border-b border-orange-500/10 pb-2">
                      Customer Information
                    </h4>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-[9px] text-gray-400 font-bold uppercase block">Email Address</span>
                        <span className="font-semibold text-gray-800 flex items-center gap-1.5 mt-0.5">
                          <Mail className="h-3.5 w-3.5 text-gray-400" />
                          {selectedCustomer.email}
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] text-gray-400 font-bold uppercase block">Phone Contact</span>
                        <span className="font-semibold text-gray-800 flex items-center gap-1.5 mt-0.5">
                          <Phone className="h-3.5 w-3.5 text-gray-400" />
                          {selectedCustomer.phone || "No phone linked"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Saved Address Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Home Address */}
                    <div className="bg-white border border-orange-500/10 rounded-xl p-4">
                      <div className="flex items-center gap-1.5 border-b border-orange-500/10 pb-2 mb-2">
                        <MapPin className="h-3.5 w-3.5 text-orange-500" />
                        <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Home Address</h4>
                      </div>
                      {selectedCustomer.addresses.home ? (
                        <div className="text-xs space-y-1 text-gray-600 font-medium">
                          <span className="font-bold text-gray-800 block">{selectedCustomer.addresses.home.fullName}</span>
                          <span className="block">{selectedCustomer.addresses.home.mobile}</span>
                          <span className="block">
                            {selectedCustomer.addresses.home.building_number ? `Bldg ${selectedCustomer.addresses.home.building_number}, ` : ""}
                            {selectedCustomer.addresses.home.street ? `Street ${selectedCustomer.addresses.home.street}, ` : ""}
                            {selectedCustomer.addresses.home.area ? `${selectedCustomer.addresses.home.area}, ` : ""}
                          </span>
                          <span className="block">{selectedCustomer.addresses.home.city}, {selectedCustomer.addresses.home.country}</span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-gray-400 italic font-medium">No Home Address registered.</span>
                      )}
                    </div>

                    {/* Office Address */}
                    <div className="bg-white border border-orange-500/10 rounded-xl p-4">
                      <div className="flex items-center gap-1.5 border-b border-orange-500/10 pb-2 mb-2">
                        <MapPin className="h-3.5 w-3.5 text-orange-500" />
                        <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Office Address</h4>
                      </div>
                      {selectedCustomer.addresses.office ? (
                        <div className="text-xs space-y-1 text-gray-600 font-medium">
                          <span className="font-bold text-gray-800 block">{selectedCustomer.addresses.office.fullName}</span>
                          <span className="block">{selectedCustomer.addresses.office.mobile}</span>
                          <span className="block">
                            {selectedCustomer.addresses.office.building_number ? `Bldg ${selectedCustomer.addresses.office.building_number}, ` : ""}
                            {selectedCustomer.addresses.office.street ? `Street ${selectedCustomer.addresses.office.street}, ` : ""}
                            {selectedCustomer.addresses.office.area ? `${selectedCustomer.addresses.office.area}, ` : ""}
                          </span>
                          <span className="block">{selectedCustomer.addresses.office.city}, {selectedCustomer.addresses.office.country}</span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-gray-400 italic font-medium">No Office Address registered.</span>
                      )}
                    </div>
                  </div>

                  {/* Financial Statistics & Value Summary */}
                  <div className="bg-white border border-orange-500/10 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider border-b border-orange-500/10 pb-2 mb-3">
                      Order Statistics
                    </h4>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="p-2 border border-gray-100 rounded-lg">
                        <span className="text-[8px] text-gray-400 font-bold uppercase block">Total Orders</span>
                        <span className="text-sm font-black text-gray-800">{selectedCustomer.stats.totalOrders}</span>
                        <span className="text-[7.5px] text-gray-400 block leading-none mt-0.5">
                          {selectedCustomer.stats.deliveredOrders} Del | {selectedCustomer.stats.cancelledOrders} Can
                        </span>
                      </div>
                      <div className="p-2 border border-gray-100 rounded-lg">
                        <span className="text-[8px] text-gray-400 font-bold uppercase block">Total Spent</span>
                        <span className="text-sm font-black text-orange-500">QAR {selectedCustomer.stats.totalSpent.toFixed(2)}</span>
                        <span className="text-[7.5px] text-gray-400 block mt-0.5">Returned: {selectedCustomer.stats.returnedOrders}</span>
                      </div>
                      <div className="p-2 border border-gray-100 rounded-lg">
                        <span className="text-[8px] text-gray-400 font-bold uppercase block">Average Order</span>
                        <span className="text-sm font-black text-gray-800">QAR {selectedCustomer.stats.averageOrderValue.toFixed(2)}</span>
                        <span className="text-[7.5px] text-gray-400 block mt-0.5">
                          Last: {selectedCustomer.stats.lastOrderDate ? new Date(selectedCustomer.stats.lastOrderDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Recent Orders (Latest 10) */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                      <ShoppingBag className="h-4 w-4 text-orange-500" />
                      Recent Purchase Orders (Latest 10)
                    </h4>
                    <div className="border border-orange-500/10 rounded-xl overflow-hidden bg-white">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-orange-500/10 text-[9px] text-gray-400 font-bold uppercase bg-gray-50/70">
                            <th className="p-3">Order Number</th>
                            <th className="p-3">Date</th>
                            <th className="p-3">Amount</th>
                            <th className="p-3 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {selectedCustomer.recentOrders.length === 0 ? (
                            <tr>
                              <td colSpan={4} className="p-4 text-center text-[10px] text-gray-400 italic">
                                This customer has not placed any orders yet.
                              </td>
                            </tr>
                          ) : (
                            selectedCustomer.recentOrders.map(o => (
                              <tr key={o.id} className="text-[11px] font-medium text-gray-700">
                                <td className="p-3 font-bold text-gray-800">{o.orderNumber || `Order #${o.id}`}</td>
                                <td className="p-3">{new Date(o.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</td>
                                <td className="p-3 font-bold">{o.amount}</td>
                                <td className="p-3 text-center">
                                  <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                    o.status === "completed" || o.status === "delivered" ? "bg-green-50 text-green-700" :
                                    o.status === "cancelled" ? "bg-red-50 text-red-700" :
                                    o.status === "returned" ? "bg-purple-50 text-purple-700" :
                                    "bg-orange-50 text-orange-700"
                                  }`}>
                                    {o.status}
                                  </span>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              ) : null}
            </div>

            {/* Drawer Footer Actions */}
            {selectedCustomer && (
              <div className="p-6 border-t border-orange-500/20 bg-gray-50 flex gap-3">
                <button
                  onClick={() => setConfirmBlock({
                    id: selectedCustomer.id,
                    name: selectedCustomer.name,
                    status: selectedCustomer.status === "ACTIVE" ? "BLOCKED" : "ACTIVE"
                  })}
                  className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all hover:shadow-lg cursor-pointer ${
                    selectedCustomer.status === "ACTIVE"
                      ? "bg-red-500 hover:bg-red-600 text-white"
                      : "bg-green-500 hover:bg-green-600 text-white"
                  }`}
                >
                  {selectedCustomer.status === "ACTIVE" ? "Block Account" : "Activate Account"}
                </button>
                <button
                  onClick={() => setIsDetailOpen(false)}
                  className="px-6 py-3 border border-orange-500/20 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  Close Profile
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confirmation Modal: Block/Unblock status change */}
      {confirmBlock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setConfirmBlock(null)} />

          {/* Modal box */}
          <div className="bg-white rounded-2xl border border-orange-500/30 p-6 max-w-sm w-full relative z-10 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-red-500 mb-3">
              <ShieldAlert className="h-6 w-6" />
              <h4 className="text-sm font-black uppercase tracking-wide">Security Confirmation</h4>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed font-semibold mb-6">
              Are you absolutely sure you want to change the status of customer{" "}
              <span className="text-orange-500 font-extrabold">"{confirmBlock.name}"</span> to{" "}
              <span className={`font-black ${confirmBlock.status === "BLOCKED" ? "text-red-500" : "text-green-500"}`}>
                {confirmBlock.status}
              </span>
              ?
              {confirmBlock.status === "BLOCKED" && " This will prevent them from signing in to the platform."}
            </p>
            <div className="flex gap-3">
              <button
                disabled={actionInProgress}
                onClick={handleStatusChange}
                className={`flex-1 py-2.5 text-xs font-bold rounded-xl text-white transition-all cursor-pointer ${
                  confirmBlock.status === "BLOCKED" ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"
                }`}
              >
                {actionInProgress ? "Updating..." : "Yes, Confirm"}
              </button>
              <button
                disabled={actionInProgress}
                onClick={() => setConfirmBlock(null)}
                className="flex-1 py-2.5 border border-orange-500/20 text-gray-500 hover:bg-gray-100 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
