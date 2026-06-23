"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User as UserIcon, MapPin, Package, LogOut,
  Edit, Trash2, Plus, Loader2, Star, Home, Briefcase,
  Clock, Truck, CheckCircle, XCircle, ChevronDown,
  Heart, Bell, HelpCircle, ChevronRight, MessageSquare,
  MessageCircle, Undo, Search, Check, ShieldCheck, Mail, Phone, Calendar
} from "lucide-react";
import { addressService } from "@/app/services/address.service";
import { orderService, MyOrder } from "@/app/services/order.service";
import { useUser } from "@/app/context/UserContext";
import { useWishlist } from "@/app/context/WishlistContext";
import { Address, AddressRequest } from "@/app/types/types";
import { useToast } from "@/app/context/ToastContext";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  pending:   { label: "Pending",   color: "text-amber-600",  bg: "bg-amber-50 border-amber-200",    icon: <Clock className="h-3 w-3" /> },
  processing:{ label: "Processing",color: "text-orange-600", bg: "bg-orange-50 border-orange-200",  icon: <Clock className="h-3 w-3" /> },
  shipped:   { label: "Shipped",   color: "text-blue-600",   bg: "bg-blue-50 border-blue-200",      icon: <Truck className="h-3 w-3" /> },
  completed: { label: "Completed", color: "text-green-600",  bg: "bg-green-50 border-green-200",    icon: <CheckCircle className="h-3 w-3" /> },
  delivered: { label: "Delivered", color: "text-green-600",  bg: "bg-green-50 border-green-200",    icon: <CheckCircle className="h-3 w-3" /> },
  cancelled: { label: "Cancelled", color: "text-red-500",    bg: "bg-red-50 border-red-200",        icon: <XCircle className="h-3 w-3" /> },
};

const emptyForm: AddressRequest = {
  label: "home",
  fullName: "",
  mobile: "",
  area: "",
  street: "",
  building_number: "",
  villa_apartment: "",
  floor: "",
  landmark: "",
  zone: "",
  city: "Doha",
  country: "Qatar",
  isDefault: false,
};

const labelIcons = {
  home: Home,
  office: Briefcase,
  other: MapPin,
};

const labelColors = {
  home: "bg-blue-50 text-blue-600 border-blue-100",
  office: "bg-purple-50 text-purple-600 border-purple-100",
  other: "bg-slate-50 text-slate-650 border-slate-200",
};

export default function AccountPage() {
  const router = useRouter();
  const { toast, confirm } = useToast();
  const { logout, isAuthenticated, isCustomer, loading: userLoading, state } = useUser();
  const [activeTab, setActiveTab] = useState("profile");

  const profile = state.profileData;
  const profileLoading = userLoading;
  const profileError = "";

  const { items: wishlistItems } = useWishlist();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!userLoading) {
      if (!isAuthenticated) {
        router.push("/auth/login");
      } else if (!isCustomer) {
        router.push("/admin");
      }
    }
  }, [isAuthenticated, isCustomer, userLoading, router]);

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [addressesError, setAddressesError] = useState("");
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [formData, setFormData] = useState<AddressRequest>(emptyForm);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");

  // Orders state
  const [orders, setOrders] = useState<MyOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState("");
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);

  // Search & Filter state for Orders
  const [orderSearchQuery, setOrderSearchQuery] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");

  // Profile Edit Simulation
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profileMobile, setProfileMobile] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState("");

  useEffect(() => {
    if (profile) {
      setProfileName(profile.name);
      setProfileMobile("+974 5555 4321"); // Simulated mobile fallback
    }
  }, [profile]);

  // Fetch addresses and orders on load / authentication
  useEffect(() => {
    if (isAuthenticated) {
      fetchAddresses();
      fetchOrders();
    }
  }, [isAuthenticated]);

  const fetchAddresses = async () => {
    setAddressesLoading(true);
    setAddressesError("");
    try {
      const data = await addressService.getAddresses();
      const result = Array.isArray(data)
        ? data
        : Array.isArray(data?.addresses)
        ? data.addresses
        : Array.isArray(data?.data)
        ? data.data
        : [];
      setAddresses(result);
    } catch {
      setAddressesError("Unable to load addresses.");
    } finally {
      setAddressesLoading(false);
    }
  };

  const fetchOrders = async () => {
    setOrdersLoading(true);
    setOrdersError("");
    try {
      const data = await orderService.getMyOrders();
      setOrders(data.orders || []);
    } catch {
      setOrdersError("Unable to load orders.");
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/auth/login");
  };

  const handleCancelOrder = async (orderId: number) => {
    const isConfirmed = await confirm(
      "Are you sure you want to cancel this order? This action cannot be undone.",
      "Cancel Order"
    );
    if (!isConfirmed) {
      return;
    }
    try {
      const response = await orderService.cancelOrder(orderId);
      if (response.success) {
        toast.success("Order cancelled successfully.");
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: "cancelled" } : o))
        );
      } else {
        toast.error(response.message || "Failed to cancel order.");
      }
    } catch (err: any) {
      toast.error(
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to cancel order. Please try again."
      );
    }
  };

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError("");
    try {
      if (editingAddress !== null) {
        await addressService.updateAddress(editingAddress.id, formData);
      } else {
        await addressService.createAddress(formData);
      }
      await fetchAddresses();
      closeForm();
    } catch {
      setFormError("Failed to save address. Please try again.");
    } finally {
      setFormLoading(false);
    }
  };

  const openAddAddress = () => {
    setFormData(emptyForm);
    setEditingAddress(null);
    setFormError("");
    setIsAddingAddress(true);
  };

  const openEditAddress = (addr: Address) => {
    setFormData({
      label: addr.label,
      fullName: addr.fullName,
      mobile: addr.mobile,
      area: addr.area,
      street: addr.street,
      building_number: addr.building_number,
      villa_apartment: addr.villa_apartment ?? "",
      floor: addr.floor ?? "",
      landmark: addr.landmark ?? "",
      zone: addr.zone ?? "",
      city: addr.city || "Doha",
      country: addr.country || "Qatar",
      isDefault: addr.isDefault,
    });
    setEditingAddress(addr);
    setFormError("");
    setIsAddingAddress(true);
  };

  const closeForm = () => {
    setIsAddingAddress(false);
    setEditingAddress(null);
    setFormError("");
  };

  const deleteAddress = async (id: number) => {
    try {
      await addressService.deleteAddress(id);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
    } catch {
      setAddressesError("Failed to delete address.");
    }
  };

  const setDefaultAddress = async (id: number) => {
    try {
      await addressService.setDefaultAddress(id);
      setAddresses((prev) =>
        prev.map((a) => ({ ...a, isDefault: a.id === id }))
      );
    } catch {
      setAddressesError("Failed to set default address.");
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileSuccessMsg("");
    setTimeout(() => {
      setProfileSaving(false);
      setIsEditingProfile(false);
      setProfileSuccessMsg("Profile updated successfully!");
      if (profile) {
        profile.name = profileName; // Update local state simulation
      }
      setTimeout(() => setProfileSuccessMsg(""), 3000);
    }, 1000);
  };

  // Stepper calculator helper
  const getOrderStatusStep = (status: string) => {
    switch (status) {
      case "pending":
        return 1;
      case "processing":
        return 2;
      case "shipped":
        return 3;
      case "completed":
      case "delivered":
        return 4;
      default:
        return 1;
    }
  };

  // Filter & Search Logic for Orders
  const filteredOrders = orders.filter((order) => {
    if (orderStatusFilter !== "all") {
      const step = getOrderStatusStep(order.status);
      if (orderStatusFilter === "pending" && step > 2) return false;
      if (orderStatusFilter === "shipped" && order.status !== "shipped") return false;
      if (orderStatusFilter === "completed" && order.status !== "completed" && order.status !== "delivered") return false;
      if (orderStatusFilter === "cancelled" && order.status !== "cancelled") return false;
    }

    if (orderSearchQuery.trim() !== "") {
      const query = orderSearchQuery.toLowerCase();
      const orderNumMatch = (order.order_number || `ORD-${order.id}`).toLowerCase().includes(query);
      const productMatch = (order.items || []).some(
        (item) => (item.product?.title || "").toLowerCase().includes(query)
      );
      return orderNumMatch || productMatch;
    }

    return true;
  });

  const inputClass =
    "mt-1.5 block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all duration-200 shadow-sm";

  const labelClass =
    "block text-xs font-black uppercase tracking-widest text-slate-400";

  return (
    <div className="bg-slate-50/50 min-h-[90vh] py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">

          {/* Left Sidebar (Flipkart Style refined) */}
          <div className="md:col-span-3 space-y-5">
            
            {/* User Greeting Box */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="h-14 w-14 rounded-full bg-gradient-to-tr from-orange-500 via-orange-600 to-amber-500 flex items-center justify-center text-white font-black text-xl shadow-md border-2 border-white ring-4 ring-orange-500/10">
                {(profile?.name || "C").charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Welcome back,</p>
                <h4 className="text-sm font-black text-slate-800 truncate mt-0.5">{profileName || profile?.name || "Customer"}</h4>
              </div>
            </div>

            {/* Structured Navigation Directory */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-100">
              
              {/* My Orders Section */}
              <button
                onClick={() => {
                  setActiveTab("orders");
                  closeForm();
                }}
                className={`w-full flex items-center justify-between px-6 py-4.5 text-left font-black text-xs tracking-wider transition-all cursor-pointer relative group ${
                  activeTab === "orders" ? "text-orange-500 bg-orange-50/20" : "text-slate-700 hover:text-orange-500"
                }`}
              >
                {activeTab === "orders" && <span className="absolute left-0 top-0 bottom-0 w-[4px] bg-orange-500 rounded-r-md" />}
                <div className="flex items-center gap-3">
                  <Package className={`h-4.5 w-4.5 transition-colors duration-250 ${activeTab === "orders" ? "text-orange-500" : "text-slate-400 group-hover:text-orange-500"}`} />
                  <span>MY ORDERS</span>
                </div>
                <ChevronRight className={`h-4 w-4 text-slate-400 transition-transform duration-250 ${activeTab === "orders" ? "text-orange-500 translate-x-0.5" : "group-hover:translate-x-0.5"}`} />
              </button>

              {/* Account Settings */}
              <div className="px-6 py-4.5 space-y-3">
                <div className="flex items-center gap-3 text-xs font-black text-slate-400 tracking-wider">
                  <UserIcon className="h-4.5 w-4.5" />
                  <span>ACCOUNT SETTINGS</span>
                </div>
                <div className="pl-7.5 space-y-3 flex flex-col text-xs font-black tracking-wider">
                  <button
                    onClick={() => {
                      setActiveTab("profile");
                      closeForm();
                    }}
                    className={`text-left transition-colors relative cursor-pointer ${
                      activeTab === "profile" ? "text-orange-500" : "text-slate-500 hover:text-orange-500"
                    }`}
                  >
                    {activeTab === "profile" && <span className="absolute -left-3.5 top-0.5 bottom-0.5 w-[3px] bg-orange-500 rounded-r-sm" />}
                    PROFILE INFORMATION
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab("addresses");
                      closeForm();
                    }}
                    className={`text-left transition-colors relative cursor-pointer ${
                      activeTab === "addresses" ? "text-orange-500" : "text-slate-500 hover:text-orange-500"
                    }`}
                  >
                    {activeTab === "addresses" && <span className="absolute -left-3.5 top-0.5 bottom-0.5 w-[3px] bg-orange-500 rounded-r-sm" />}
                    MANAGE ADDRESSES
                  </button>
                </div>
              </div>

              {/* My Stuff */}
              <div className="px-6 py-4.5 space-y-3">
                <div className="flex items-center gap-3 text-xs font-black text-slate-400 tracking-wider">
                  <Heart className="h-4.5 w-4.5" />
                  <span>MY STUFF</span>
                </div>
                <div className="pl-7.5 space-y-3 flex flex-col text-xs font-black tracking-wider">
                  <Link href="/wishlist" className="text-left text-slate-500 hover:text-orange-500 transition-colors flex items-center justify-between">
                    <span>MY WISHLIST</span>
                    <span className="px-2 py-0.5 bg-orange-50 text-orange-500 rounded-full text-[9px] font-black">{wishlistItems.length}</span>
                  </Link>
                  <button
                    onClick={() => {
                      setActiveTab("notifications");
                      closeForm();
                    }}
                    className={`text-left transition-colors relative cursor-pointer flex items-center justify-between ${
                      activeTab === "notifications" ? "text-orange-500" : "text-slate-500 hover:text-orange-500"
                    }`}
                  >
                    {activeTab === "notifications" && <span className="absolute -left-3.5 top-0.5 bottom-0.5 w-[3px] bg-orange-500 rounded-r-sm" />}
                    <span>NOTIFICATIONS</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab("support");
                      closeForm();
                    }}
                    className={`text-left transition-colors relative cursor-pointer ${
                      activeTab === "support" ? "text-orange-500" : "text-slate-500 hover:text-orange-500"
                    }`}
                  >
                    {activeTab === "support" && <span className="absolute -left-3.5 top-0.5 bottom-0.5 w-[3px] bg-orange-500 rounded-r-sm" />}
                    SUPPORT CENTER
                  </button>
                </div>
              </div>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-6 py-4.5 text-left font-black text-xs tracking-wider text-red-500 hover:bg-red-50/20 transition-colors cursor-pointer"
              >
                <LogOut className="h-4.5 w-4.5 shrink-0 text-red-400" />
                <span>LOGOUT</span>
              </button>

            </div>

          </div>

          {/* Right Content Panel */}
          <div className="md:col-span-9">
            <div className="bg-white rounded-2xl border border-slate-100 p-6 md:p-10 min-h-[70vh] shadow-sm">

              {/* PROFILE TAB */}
              {activeTab === "profile" && (
                <div className="space-y-8 animate-fadeIn">
                  
                  {/* Tab Header */}
                  <div className="border-b border-slate-100 pb-5 flex justify-between items-center">
                    <div>
                      <h3 className="text-xl font-black text-slate-800">Profile Details</h3>
                      <p className="text-xs text-slate-400 mt-0.5">Manage your personal settings and contact cards</p>
                    </div>
                    {!isEditingProfile && (
                      <button
                        onClick={() => setIsEditingProfile(true)}
                        className="flex items-center gap-1.5 px-4.5 py-2 text-xs font-black uppercase tracking-wider text-orange-500 hover:bg-orange-50 border border-orange-200 rounded-xl transition cursor-pointer shadow-sm shadow-orange-500/5"
                      >
                        <Edit className="h-3.5 w-3.5" /> Edit Profile
                      </button>
                    )}
                  </div>

                  {profileSuccessMsg && (
                    <div className="flex items-center gap-2.5 text-green-700 bg-green-50/50 border border-green-150 p-4 rounded-2xl text-xs font-bold shadow-sm animate-fadeIn">
                      <CheckCircle className="h-4.5 w-4.5 text-green-600" /> {profileSuccessMsg}
                    </div>
                  )}

                  {profileLoading && (
                    <div className="flex items-center justify-center py-20">
                      <Loader2 className="h-8 w-8 text-orange-500 animate-spin" />
                    </div>
                  )}

                  {profile && !profileLoading && (
                    <div className="space-y-8">
                      
                      {/* Summary Cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                        
                        {/* Orders count */}
                        <div className="p-5 bg-gradient-to-br from-orange-50/20 to-orange-500/5 border border-orange-100 rounded-2xl flex items-center gap-4 hover:shadow-md hover:-translate-y-0.5 transition duration-300">
                          <div className="h-11 w-11 rounded-xl bg-orange-100 flex items-center justify-center text-orange-650 shadow-sm shadow-orange-500/10">
                            <Package className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-2xl font-black text-slate-800">{orders.length}</p>
                            <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-0.5">Total Orders</p>
                          </div>
                        </div>

                        {/* Addresses count */}
                        <div className="p-5 bg-gradient-to-br from-blue-50/20 to-blue-500/5 border border-blue-100 rounded-2xl flex items-center gap-4 hover:shadow-md hover:-translate-y-0.5 transition duration-300">
                          <div className="h-11 w-11 rounded-xl bg-blue-100 flex items-center justify-center text-blue-650 shadow-sm shadow-blue-500/10">
                            <MapPin className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-2xl font-black text-slate-800">{addresses.length}</p>
                            <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-0.5">Saved Addresses</p>
                          </div>
                        </div>

                        {/* Wishlist count */}
                        <div className="p-5 bg-gradient-to-br from-red-50/20 to-red-500/5 border border-red-100 rounded-2xl flex items-center gap-4 hover:shadow-md hover:-translate-y-0.5 transition duration-300">
                          <div className="h-11 w-11 rounded-xl bg-red-100 flex items-center justify-center text-red-650 shadow-sm shadow-red-500/10">
                            <Heart className="h-5 w-5 animate-pulse" />
                          </div>
                          <div>
                            <p className="text-2xl font-black text-slate-800">{wishlistItems.length}</p>
                            <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-0.5">Wishlist Items</p>
                          </div>
                        </div>

                      </div>

                      {/* Details Sheet */}
                      {isEditingProfile ? (
                        <form onSubmit={handleSaveProfile} className="max-w-xl space-y-5 bg-slate-50/30 p-6 rounded-2xl border border-slate-100 shadow-sm">
                          <div>
                            <label className={labelClass}>Full Name</label>
                            <input
                              type="text"
                              required
                              value={profileName}
                              onChange={(e) => setProfileName(e.target.value)}
                              className={inputClass}
                            />
                          </div>

                          <div>
                            <label className={labelClass}>Email Address</label>
                            <input
                              type="email"
                              disabled
                              value={profile.email}
                              className={`${inputClass} bg-slate-100/50 cursor-not-allowed text-slate-400 border-slate-200/50 shadow-none`}
                            />
                            <p className="text-[10px] text-slate-400 mt-1.5 font-bold">Contact support to update your registered email address.</p>
                          </div>

                          <div>
                            <label className={labelClass}>Mobile Number</label>
                            <input
                              type="tel"
                              value={profileMobile}
                              onChange={(e) => setProfileMobile(e.target.value)}
                              className={inputClass}
                            />
                          </div>

                          <div className="pt-2 flex gap-3">
                            <button
                              type="submit"
                              disabled={profileSaving}
                              className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md shadow-orange-500/15 transition disabled:opacity-60 flex items-center gap-1.5 cursor-pointer"
                            >
                              {profileSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                              Save Changes
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setProfileName(profile.name);
                                setIsEditingProfile(false);
                              }}
                              className="px-6 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-black text-xs uppercase tracking-wider rounded-xl transition cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      ) : (
                        <div className="max-w-2xl divide-y divide-slate-100 bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 p-6 gap-6 hover:bg-slate-50/10 transition">
                            <div className="flex items-start gap-3">
                              <UserIcon className="h-5 w-5 text-slate-400 mt-0.5" />
                              <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Full Name</p>
                                <p className="text-sm font-bold text-slate-800 mt-1">{profileName || profile.name}</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-3">
                              <Mail className="h-5 w-5 text-slate-400 mt-0.5" />
                              <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email Address</p>
                                <p className="text-sm font-bold text-slate-800 mt-1">{profile.email}</p>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 p-6 gap-6 hover:bg-slate-50/10 transition">
                            <div className="flex items-start gap-3">
                              <Phone className="h-5 w-5 text-slate-400 mt-0.5" />
                              <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Mobile Number</p>
                                <p className="text-sm font-bold text-slate-800 mt-1">{profileMobile}</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-3">
                              <ShieldCheck className="h-5 w-5 text-slate-400 mt-0.5" />
                              <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Account Safety</p>
                                <p className="text-xs font-black text-green-600 bg-green-50 border border-green-100 rounded-full px-3 py-1 mt-1.5 inline-block uppercase tracking-wider">
                                  Verified Member
                                </p>
                              </div>
                            </div>
                          </div>

                        </div>
                      )}

                    </div>
                  )}

                </div>
              )}

              {/* ADDRESSES TAB */}
              {activeTab === "addresses" && (
                <div className="space-y-8 animate-fadeIn">
                  
                  {/* Tab Header */}
                  <div className="border-b border-slate-100 pb-5 flex justify-between items-center">
                    <div>
                      <h3 className="text-xl font-black text-slate-800">Delivery Addresses</h3>
                      <p className="text-xs text-slate-400 mt-0.5">Manage and organize your shipping locations</p>
                    </div>
                    {!isAddingAddress && (
                      <button
                        onClick={openAddAddress}
                        className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-white bg-orange-500 hover:bg-orange-600 px-4.5 py-2.5 rounded-xl transition cursor-pointer shadow-md shadow-orange-500/15"
                      >
                        <Plus className="h-4 w-4" /> Add New Address
                      </button>
                    )}
                  </div>

                  {addressesError && (
                    <div className="text-red-500 text-xs font-bold text-center bg-red-50 border border-red-150 p-4 rounded-xl">
                      {addressesError}
                    </div>
                  )}

                  {isAddingAddress ? (
                    <form onSubmit={handleAddressSubmit} className="space-y-5 max-w-2xl bg-slate-50/20 p-6 rounded-2xl border border-slate-200/60 shadow-sm animate-fadeIn">
                      <h4 className="font-black text-sm text-slate-700 uppercase tracking-wider pb-2 border-b border-slate-100">
                        {editingAddress !== null ? "Modify Address details" : "Create New Address Location"}
                      </h4>

                      {formError && (
                        <div className="text-red-500 text-xs font-bold bg-red-50 border border-red-150 p-4 rounded-xl">
                          {formError}
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                        {/* Label */}
                        <div className="sm:col-span-2">
                          <label className={labelClass}>Address Type</label>
                          <div className="mt-2.5 flex gap-3">
                            {(["home", "office", "other"] as const).map((l) => (
                              <button
                                key={l}
                                type="button"
                                onClick={() => setFormData({ ...formData, label: l })}
                                className={`flex items-center gap-2 px-4.5 py-2.5 rounded-xl border text-xs font-black uppercase tracking-wider transition duration-200 cursor-pointer ${
                                  formData.label === l
                                    ? "bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/10"
                                    : "bg-white text-slate-500 border-slate-200 hover:border-orange-300 hover:text-orange-500"
                                }`}
                              >
                                {l === "home" && <Home className="h-3.5 w-3.5" />}
                                {l === "office" && <Briefcase className="h-3.5 w-3.5" />}
                                {l === "other" && <MapPin className="h-3.5 w-3.5" />}
                                {l}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Full Name */}
                        <div>
                          <label className={labelClass}>Receiver's Name</label>
                          <input type="text" required placeholder="e.g. John Doe" value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            className={inputClass} />
                        </div>

                        {/* Mobile */}
                        <div>
                          <label className={labelClass}>Mobile Number</label>
                          <input type="tel" required placeholder="e.g. 5555 4321" value={formData.mobile}
                            onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                            className={inputClass} />
                        </div>

                        {/* Area */}
                        <div>
                          <label className={labelClass}>Area / Zone Name</label>
                          <input type="text" required placeholder="e.g. Al Sadd" value={formData.area}
                            onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                            className={inputClass} />
                        </div>

                        {/* Street */}
                        <div>
                          <label className={labelClass}>Street Name / Number</label>
                          <input type="text" required placeholder="e.g. C-Ring Road" value={formData.street}
                            onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                            className={inputClass} />
                        </div>

                        {/* Building Number */}
                        <div>
                          <label className={labelClass}>Building Number</label>
                          <input type="text" required placeholder="e.g. 42" value={formData.building_number}
                            onChange={(e) => setFormData({ ...formData, building_number: e.target.value })}
                            className={inputClass} />
                        </div>

                        {/* Villa / Apartment */}
                        <div>
                          <label className={labelClass}>Villa / Apartment <span className="normal-case font-bold text-slate-400">(optional)</span></label>
                          <input type="text" placeholder="e.g. Flat 302 / Villa 5" value={formData.villa_apartment ?? ""}
                            onChange={(e) => setFormData({ ...formData, villa_apartment: e.target.value })}
                            className={inputClass} />
                        </div>

                        {/* Floor */}
                        <div>
                          <label className={labelClass}>Floor <span className="normal-case font-bold text-slate-400">(optional)</span></label>
                          <input type="text" placeholder="e.g. 3rd Floor" value={formData.floor ?? ""}
                            onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                            className={inputClass} />
                        </div>

                        {/* Zone */}
                        <div>
                          <label className={labelClass}>Zone <span className="normal-case font-bold text-slate-400">(optional)</span></label>
                          <input type="text" placeholder="e.g. 39" value={formData.zone ?? ""}
                            onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                            className={inputClass} />
                        </div>

                        {/* Landmark */}
                        <div className="sm:col-span-2">
                          <label className={labelClass}>Landmark / Directions <span className="normal-case font-bold text-slate-400">(optional)</span></label>
                          <input type="text" placeholder="e.g. Opposite Al Meera Supermarket" value={formData.landmark ?? ""}
                            onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                            className={inputClass} />
                        </div>

                        {/* City */}
                        <div>
                          <label className={labelClass}>City</label>
                          <input type="text" required placeholder="e.g. Doha" value={formData.city}
                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                            className={inputClass} />
                        </div>

                        {/* Country */}
                        <div>
                          <label className={labelClass}>Country</label>
                          <input type="text" readOnly value="Qatar" className={`${inputClass} bg-slate-100 cursor-not-allowed border-slate-200/50 shadow-none text-slate-450`} />
                        </div>

                        {/* Set as Default */}
                        <div className="sm:col-span-2 flex items-center gap-3 mt-2">
                          <input
                            type="checkbox"
                            id="isDefault"
                            checked={formData.isDefault ?? false}
                            onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                            className="h-4.5 w-4.5 rounded border-slate-350 text-orange-500 focus:ring-orange-500 cursor-pointer transition"
                          />
                          <label htmlFor="isDefault" className="text-xs font-bold text-slate-650 cursor-pointer select-none">
                            SET AS DEFAULT SHIPPING ADDRESS
                          </label>
                        </div>

                      </div>

                      <div className="pt-3 flex gap-3 border-t border-slate-100">
                        <button type="submit" disabled={formLoading}
                          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer shadow-md shadow-orange-500/10 disabled:opacity-60 disabled:cursor-not-allowed">
                          {formLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                          Save Address
                        </button>
                        <button type="button" onClick={closeForm} disabled={formLoading}
                          className="bg-white border border-slate-250 text-slate-600 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-slate-50 transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed">
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      {addressesLoading ? (
                        <div className="flex items-center justify-center py-20">
                          <Loader2 className="h-8 w-8 text-orange-500 animate-spin" />
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 animate-fadeIn">
                          {addresses.length === 0 ? (
                            <div className="col-span-2 text-center py-16 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/20">
                              <MapPin className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                              <p className="text-slate-400 text-xs font-black tracking-wider uppercase">No Saved Locations Yet</p>
                              <button onClick={openAddAddress}
                                className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-orange-600 transition cursor-pointer shadow-sm">
                                + Add address location
                              </button>
                            </div>
                          ) : (
                            addresses.map((addr) => {
                              const LabelIcon = labelIcons[addr.label] || MapPin;
                              return (
                                <div key={addr.id}
                                  className={`p-6 rounded-2xl border relative group transition-all duration-300 bg-white ${
                                    addr.isDefault
                                      ? "border-orange-350 bg-orange-50/5 shadow-md shadow-orange-500/[0.02]"
                                      : "border-slate-200/80 hover:border-orange-200 hover:shadow-md hover:-translate-y-0.5"
                                  }`}>

                                  {/* Badges row */}
                                  <div className="flex items-center gap-2 mb-4">
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 border text-[9px] font-black uppercase tracking-widest rounded-full capitalize ${labelColors[addr.label] || labelColors.other}`}>
                                      <LabelIcon className="h-3 w-3" />
                                      {addr.label}
                                    </span>
                                    {addr.isDefault && (
                                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-600 border border-orange-200 text-[9px] font-black uppercase tracking-widest rounded-full">
                                        Default Shipping
                                      </span>
                                    )}
                                  </div>

                                  <h5 className="font-extrabold text-slate-800 text-sm">{addr.fullName}</h5>
                                  
                                  {/* Address Details structured as tabular description */}
                                  <div className="mt-3.5 space-y-1.5 text-xs text-slate-500 font-medium">
                                    <div className="flex gap-2">
                                      <span className="text-[10px] font-black uppercase text-slate-400 w-16 shrink-0 mt-0.5">Mobile:</span>
                                      <span className="text-slate-700 font-bold">{addr.mobile}</span>
                                    </div>
                                    <div className="flex gap-2">
                                      <span className="text-[10px] font-black uppercase text-slate-400 w-16 shrink-0 mt-0.5">Address:</span>
                                      <span className="text-slate-600 leading-relaxed">
                                        Building {addr.building_number}
                                        {addr.villa_apartment && `, ${addr.villa_apartment}`}
                                        {addr.floor && `, Floor ${addr.floor}`}
                                        {`, ${addr.street}, ${addr.area}`}
                                        {addr.zone && `, Zone ${addr.zone}`}
                                      </span>
                                    </div>
                                    {addr.landmark && (
                                      <div className="flex gap-2">
                                        <span className="text-[10px] font-black uppercase text-slate-400 w-16 shrink-0 mt-0.5">Landmark:</span>
                                        <span className="text-slate-500 italic">Near {addr.landmark}</span>
                                      </div>
                                    )}
                                    <div className="flex gap-2">
                                      <span className="text-[10px] font-black uppercase text-slate-400 w-16 shrink-0 mt-0.5">Location:</span>
                                      <span className="text-slate-700 font-bold">{addr.city}, {addr.country}</span>
                                    </div>
                                  </div>

                                  {!addr.isDefault && (
                                    <div className="mt-4 pt-3.5 border-t border-slate-100">
                                      <button
                                        onClick={() => setDefaultAddress(addr.id)}
                                        className="text-xs font-black uppercase tracking-wider text-orange-500 hover:text-orange-650 transition cursor-pointer">
                                        Set as default
                                      </button>
                                    </div>
                                  )}

                                  <div className="absolute top-5 right-5 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <button onClick={() => openEditAddress(addr)}
                                      className="p-2 bg-white border border-slate-200 text-slate-500 rounded-xl hover:bg-orange-100 hover:text-orange-600 hover:border-orange-200 transition cursor-pointer shadow-sm" title="Edit Address">
                                      <Edit className="h-3.5 w-3.5" />
                                    </button>
                                    <button onClick={() => deleteAddress(addr.id)}
                                      className="p-2 bg-white border border-slate-200 text-slate-500 rounded-xl hover:bg-red-100 hover:text-red-650 hover:border-red-205 transition cursor-pointer shadow-sm" title="Delete Address">
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* ORDERS TAB */}
              {activeTab === "orders" && (
                <div className="space-y-8 animate-fadeIn">
                  
                  {/* Tab Header */}
                  <div className="border-b border-slate-100 pb-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-black text-slate-800">Order History</h3>
                      <p className="text-xs text-slate-400 mt-0.5">Track shipping details and review past purchases</p>
                    </div>

                    {/* Status Filters */}
                    <div className="flex flex-wrap gap-1.5">
                      {["all", "pending", "shipped", "completed", "cancelled"].map((st) => (
                        <button
                          key={st}
                          onClick={() => setOrderStatusFilter(st)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition border cursor-pointer ${
                            orderStatusFilter === st
                              ? "bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/10"
                              : "bg-white text-slate-500 border-slate-200 hover:border-orange-200 hover:text-orange-500"
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search orders by invoice number or product title..."
                      value={orderSearchQuery}
                      onChange={(e) => setOrderSearchQuery(e.target.value)}
                      className="pl-11 block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all duration-200 shadow-sm"
                    />
                  </div>

                  {ordersError && (
                    <div className="text-red-500 text-xs font-bold text-center bg-red-50 border border-red-100 p-4 rounded-xl">
                      {ordersError}
                    </div>
                  )}

                  {ordersLoading ? (
                    <div className="flex items-center justify-center py-24">
                      <Loader2 className="h-10 w-10 text-orange-500 animate-spin" />
                    </div>
                  ) : filteredOrders.length === 0 ? (
                    <div className="text-center py-20 border-2 border-dashed border-slate-150 rounded-3xl bg-slate-50/10">
                      <Package className="h-12 w-12 text-slate-300 mx-auto mb-2" />
                      <p className="text-slate-400 text-xs font-black tracking-wider uppercase">No matching orders found</p>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      {filteredOrders.map((order) => {
                        const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
                        const isExpanded = expandedOrderId === order.id;
                        const orderStep = getOrderStatusStep(order.status);
                        
                        return (
                          <div key={order.id} className="border border-slate-200 rounded-2xl overflow-hidden hover:border-orange-200 hover:shadow-md transition-all duration-300 bg-white">
                            
                            {/* Order Header Summary */}
                            <div
                              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 cursor-pointer hover:bg-slate-50/10 transition"
                              onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                            >
                              <div className="flex items-center gap-4">
                                <div className="h-11 w-11 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0 shadow-sm">
                                  <Package className="h-5 w-5 text-orange-550" />
                                </div>
                                <div>
                                  <p className="text-sm font-black text-slate-800">{order.order_number || `ORD-${String(order.id).padStart(4, "0")}`}</p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Calendar className="h-3 w-3 text-slate-400" />
                                    <span className="text-[10px] text-slate-400 font-bold">
                                      {new Date(order.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-4.5">
                                <span className={`inline-flex items-center gap-1.5 text-[9px] font-black px-3 py-1 rounded-full border uppercase tracking-wider ${cfg.bg} ${cfg.color} shadow-sm shadow-black/[0.01]`}>
                                  {cfg.icon}
                                  {cfg.label}
                                </span>
                                <span className="text-sm font-black text-slate-800">
                                  {order.total_price ? `QAR ${parseFloat(String(order.total_price).replace(/([$]|qar|[\s,])/gi, "") || "0").toFixed(2)}` : "—"}
                                </span>
                                <ChevronDown className={`h-4.5 w-4.5 text-slate-400 transition-transform duration-250 ${isExpanded ? "rotate-180 text-orange-500" : ""}`} />
                              </div>
                            </div>

                            {/* Stepper Progress Bar */}
                            <div className="px-6 pb-6 border-b border-slate-100 bg-slate-50/10">
                              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-slate-400 max-w-xl mx-auto relative pt-4.5">
                                <div className="absolute top-7 left-0 right-0 h-1 bg-slate-150 -z-10 rounded-full" />
                                <div
                                  className="absolute top-7 left-0 h-1 bg-gradient-to-r from-orange-500 to-green-500 -z-10 rounded-full transition-all duration-500"
                                  style={{ width: `${((orderStep - 1) / 3) * 100}%` }}
                                />

                                <div className="flex flex-col items-center gap-2">
                                  <div className={`h-6 w-6 rounded-full flex items-center justify-center border font-bold text-[9px] transition-all duration-300 ${
                                    orderStep >= 1 ? "bg-orange-500 border-orange-500 text-white shadow-md shadow-orange-500/10" : "bg-white border-slate-300 text-slate-400"
                                  }`}>
                                    {orderStep >= 1 ? <Check className="h-3.5 w-3.5" /> : "1"}
                                  </div>
                                  <span className={orderStep >= 1 ? "text-orange-500 font-black" : ""}>Placed</span>
                                </div>

                                <div className="flex flex-col items-center gap-2">
                                  <div className={`h-6 w-6 rounded-full flex items-center justify-center border font-bold text-[9px] transition-all duration-300 ${
                                    orderStep >= 2 ? "bg-orange-500 border-orange-500 text-white shadow-md shadow-orange-500/10" : "bg-white border-slate-300 text-slate-400"
                                  }`}>
                                    {orderStep >= 2 ? <Check className="h-3.5 w-3.5" /> : "2"}
                                  </div>
                                  <span className={orderStep >= 2 ? "text-orange-500 font-black" : ""}>Processing</span>
                                </div>

                                <div className="flex flex-col items-center gap-2">
                                  <div className={`h-6 w-6 rounded-full flex items-center justify-center border font-bold text-[9px] transition-all duration-300 ${
                                    orderStep >= 3 ? "bg-orange-500 border-orange-500 text-white shadow-md shadow-orange-500/10" : "bg-white border-slate-300 text-slate-400"
                                  }`}>
                                    {orderStep >= 3 ? <Check className="h-3.5 w-3.5" /> : "3"}
                                  </div>
                                  <span className={orderStep >= 3 ? "text-orange-500 font-black" : ""}>Shipped</span>
                                </div>

                                <div className="flex flex-col items-center gap-2">
                                  <div className={`h-6 w-6 rounded-full flex items-center justify-center border font-bold text-[9px] transition-all duration-300 ${
                                    orderStep >= 4 ? "bg-green-500 border-green-500 text-white shadow-md shadow-green-500/10" : "bg-white border-slate-300 text-slate-400"
                                  }`}>
                                    {orderStep >= 4 ? <Check className="h-3.5 w-3.5" /> : "4"}
                                  </div>
                                  <span className={orderStep >= 4 ? "text-green-600 font-black" : ""}>Delivered</span>
                                </div>
                              </div>
                            </div>

                            {/* Expanded Details Panel */}
                            {isExpanded && (
                              <div className="bg-slate-50/30 p-6 space-y-5 border-t border-slate-100 animate-fadeIn">
                                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Items Ordered</p>
                                <div className="space-y-3.5">
                                  {(order.items || []).map((item) => (
                                    <div key={item.id} className="flex items-center gap-4 bg-white border border-slate-150 rounded-2xl p-4.5 shadow-sm hover:shadow transition duration-250">
                                      <div className="h-16 w-16 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 shrink-0 flex items-center justify-center p-1">
                                        {item.product?.main_image_url && (
                                          <img
                                            src={item.product.main_image_url}
                                            alt={item.product?.title || "Product"}
                                            className="max-h-full max-w-full object-contain"
                                          />
                                        )}
                                      </div>
                                      
                                      <div className="min-w-0 flex-1">
                                        <h5 className="text-xs font-black text-slate-800 truncate">{item.product?.title || `Product #${item.product_id}`}</h5>
                                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1.5 text-[9px] text-slate-400 font-black tracking-wider uppercase">
                                          <span>Qty: {item.quantity}</span>
                                          {item.selected_color && <span>• Color: {item.selected_color}</span>}
                                          {item.selected_storage && <span>• Spec: {item.selected_storage}</span>}
                                        </div>
                                      </div>
                                      
                                      <div className="text-right shrink-0">
                                        <span className="text-xs font-black text-slate-900 block">
                                          QAR {(Number(String(item.price_at_purchase).replace(/([$]|qar|[\s,])/gi, "")) * item.quantity).toFixed(2)}
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                <div className="pt-4 border-t border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                                  <div className="flex flex-wrap items-center gap-3">
                                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                                      Payment Method: <span className="text-slate-700 font-black">{order.payment_method || "COD"}</span>
                                    </span>
                                    {order.status === "pending" && (
                                      <button
                                        onClick={() => handleCancelOrder(order.id)}
                                        className="text-xs font-bold text-red-500 hover:text-red-650 transition cursor-pointer"
                                      >
                                        Cancel Order
                                      </button>
                                    )}
                                  </div>
                                  <div className="text-right">
                                    <span className="text-sm font-black text-slate-900">
                                      Grand Total: QAR {order.total_price ? parseFloat(String(order.total_price).replace(/([$]|qar|[\s,])/gi, "") || "0").toFixed(2) : "—"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}

                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* NOTIFICATIONS TAB */}
              {activeTab === "notifications" && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="border-b border-slate-100 pb-5 flex justify-between items-center">
                    <div>
                      <h3 className="text-xl font-black text-slate-800">Notifications</h3>
                      <p className="text-xs text-slate-400 mt-0.5">Stay updated with shipping tracking alerts</p>
                    </div>
                    <button className="text-xs font-black uppercase tracking-wider text-orange-500 hover:text-orange-650 transition cursor-pointer">
                      Mark all as read
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="flex gap-4.5 p-5 bg-slate-50/40 border border-slate-100 rounded-2xl relative overflow-hidden hover:border-orange-200 transition duration-300">
                      <div className="h-10 w-10 rounded-xl bg-green-50 border border-green-100 flex items-center justify-center text-green-500 shrink-0 shadow-sm">
                        <CheckCircle className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                          Order Delivered Successfully
                          <span className="h-1.5 w-1.5 bg-orange-500 rounded-full animate-ping" />
                        </h4>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">Your order #GRV-2045 has been delivered to your saved address.</p>
                        <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider mt-2 inline-block">2 hours ago</span>
                      </div>
                    </div>

                    <div className="flex gap-4.5 p-5 bg-slate-50/40 border border-slate-100 rounded-2xl hover:border-orange-200 transition duration-300">
                      <div className="h-10 w-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-500 shrink-0 shadow-sm">
                        <Truck className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-800">Order Dispatched</h4>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">Your order #GRV-2041 is out for delivery with our rider.</p>
                        <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider mt-2 inline-block">1 day ago</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SUPPORT CENTER TAB */}
              {activeTab === "support" && (
                <div className="space-y-8 animate-fadeIn">
                  <div className="border-b border-slate-100 pb-5">
                    <h3 className="text-xl font-black text-slate-800">Support Center</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Need help with order status, payments or returns?</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="p-6 rounded-2xl border border-slate-100 bg-slate-50/30 flex gap-4.5 hover:border-orange-200 hover:shadow-sm transition-all duration-300">
                      <div className="h-11 w-11 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600 shrink-0 shadow-sm">
                        <MessageSquare className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold text-slate-800">Live Help Chat</h4>
                        <p className="text-xs text-slate-450 leading-relaxed mt-1">Talk with support desk agents live.</p>
                        <button className="mt-4 text-xs font-black uppercase tracking-wider text-orange-500 hover:text-orange-600 flex items-center gap-1 cursor-pointer">
                          Start Chat <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <a
                      href="https://wa.me/+97455551234"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-6 rounded-2xl border border-slate-100 bg-slate-50/30 flex gap-4.5 hover:border-green-200 hover:shadow-sm transition-all duration-300"
                    >
                      <div className="h-11 w-11 rounded-xl bg-green-50 border border-green-100 flex items-center justify-center text-green-500 shrink-0 shadow-sm">
                        <MessageCircle className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold text-slate-800">WhatsApp Helpdesk</h4>
                        <p className="text-xs text-slate-455 leading-relaxed mt-1">Instant support assistance via WhatsApp messaging.</p>
                        <span className="mt-4 text-xs font-black uppercase tracking-wider text-green-600 flex items-center gap-1">
                          Message Now <ChevronRight className="h-3.5 w-3.5" />
                        </span>
                      </div>
                    </a>

                    <div className="p-6 rounded-2xl border border-slate-100 bg-slate-50/30 flex gap-4.5 hover:border-orange-200 hover:shadow-sm transition-all duration-300">
                      <div className="h-11 w-11 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600 shrink-0 shadow-sm">
                        <HelpCircle className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold text-slate-800">Help Center FAQs</h4>
                        <p className="text-xs text-slate-450 leading-relaxed mt-1">Instant support answers on returns, delivery, and payments.</p>
                        <button onClick={() => router.push("/faq")} className="mt-4 text-xs font-black uppercase tracking-wider text-orange-500 hover:text-orange-600 flex items-center gap-1 cursor-pointer">
                          Browse FAQs <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="p-6 rounded-2xl border border-slate-100 bg-slate-50/30 flex gap-4.5 hover:border-orange-200 hover:shadow-sm transition-all duration-300">
                      <div className="h-11 w-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0 shadow-sm">
                        <Undo className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold text-slate-800">Easy Returns</h4>
                        <p className="text-xs text-slate-455 leading-relaxed mt-1">Initiate and monitor product returns queries.</p>
                        <button onClick={() => router.push("/returns")} className="mt-4 text-xs font-black uppercase tracking-wider text-orange-500 hover:text-orange-600 flex items-center gap-1 cursor-pointer">
                          Manage Returns <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}