"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  User as UserIcon, MapPin, Package, LogOut,
  Edit, Trash2, Plus, Loader2, Star, Home, Briefcase,
  Clock, Truck, CheckCircle, XCircle, ChevronDown,
} from "lucide-react";
import { authService } from "@/app/services/auth.service";
import { addressService } from "@/app/services/address.service";
import { orderService, MyOrder } from "@/app/services/order.service";
import { useUser } from "@/app/context/UserContext";
import { Address, AddressRequest } from "@/app/types/types";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  pending:   { label: "Pending",   color: "text-amber-600",  bg: "bg-amber-50 border-amber-200",    icon: <Clock className="h-3 w-3" /> },
  shipped:   { label: "Shipped",   color: "text-blue-600",   bg: "bg-blue-50 border-blue-200",      icon: <Truck className="h-3 w-3" /> },
  completed: { label: "Completed", color: "text-green-600",  bg: "bg-green-50 border-green-200",    icon: <CheckCircle className="h-3 w-3" /> },
  cancelled: { label: "Cancelled", color: "text-red-500",    bg: "bg-red-50 border-red-200",        icon: <XCircle className="h-3 w-3" /> },
};

interface ProfileData {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

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
  other: "bg-gray-50 text-gray-600 border-gray-100",
};

export default function AccountPage() {
  const router = useRouter();
  const { logout, isAuthenticated, isCustomer, loading: userLoading, state } = useUser();
  const [activeTab, setActiveTab] = useState("profile");

  const profile = state.profileData;
  const profileLoading = userLoading;
  const profileError = "";

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

  // Fetch addresses when tab is active
  useEffect(() => {
    if (activeTab === "addresses") {
      fetchAddresses();
    }
  }, [activeTab]);

  // Fetch orders when tab is active
  useEffect(() => {
    if (activeTab === "orders") {
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
      fetchOrders();
    }
  }, [activeTab]);

  const fetchAddresses = async () => {
    setAddressesLoading(true);
    setAddressesError("");
    try {
      const data = await addressService.getAddresses();
      // Normalize all possible response shapes to an array
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

  const handleLogout = () => {
    logout();
    router.push("/auth/login");
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

  const tabs = [
    { id: "profile", label: "Profile", icon: UserIcon },
    { id: "addresses", label: "Addresses", icon: MapPin },
    { id: "orders", label: "Order History", icon: Package },
  ];

  const inputClass =
    "mt-1 block w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors";

  const labelClass =
    "block text-xs font-bold uppercase tracking-wide text-gray-500";

  return (
    <div className="bg-gray-50/50 min-h-[80vh] py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">My Account</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your profile, orders, and addresses</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

          {/* Sidebar */}
          <div className="md:col-span-3">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 space-y-1">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                    activeTab === id
                      ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
                      : "text-gray-600 hover:bg-orange-50 hover:text-orange-500"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {label}
                </button>
              ))}

              <div className="pt-2 border-t border-gray-100 mt-2">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-all cursor-pointer"
                >
                  <LogOut className="h-4 w-4 shrink-0" />
                  Logout
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="md:col-span-9">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">

              {/* PROFILE TAB */}
              {activeTab === "profile" && (
                <div className="space-y-6">
                  <div className="border-b border-gray-100 pb-4">
                    <h3 className="text-lg font-bold text-gray-900">Personal Profile</h3>
                    <p className="text-xs text-gray-400 mt-0.5">Your account information</p>
                  </div>

                  {profileLoading && (
                    <div className="flex items-center justify-center py-16">
                      <Loader2 className="h-8 w-8 text-orange-500 animate-spin" />
                    </div>
                  )}

                  {profileError && !profileLoading && (
                    <div className="text-red-500 text-sm text-center bg-red-50 border border-red-100 p-3 rounded-xl">
                      {profileError}
                    </div>
                  )}

                  {profile && !profileLoading && (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                      <div className="flex-1 space-y-3">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Full Name</p>
                          <p className="text-lg font-bold text-gray-900 mt-0.5">{profile.name}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Email Address</p>
                          <p className="text-sm text-gray-700 mt-0.5">{profile.email}</p>
                        </div>
                        <span className="inline-block px-3 py-1 bg-green-50 text-green-600 border border-green-100 text-xs font-bold uppercase tracking-wide rounded-full">
                          Active Member
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ADDRESSES TAB */}
              {activeTab === "addresses" && (
                <div className="space-y-6">
                  <div className="border-b border-gray-100 pb-4 flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Saved Addresses</h3>
                      <p className="text-xs text-gray-400 mt-0.5">Manage your delivery addresses</p>
                    </div>
                    {!isAddingAddress && (
                      <button
                        onClick={openAddAddress}
                        className="flex items-center gap-1.5 text-sm font-bold text-white bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-xl transition cursor-pointer shadow-sm shadow-orange-500/20"
                      >
                        <Plus className="h-4 w-4" /> Add New
                      </button>
                    )}
                  </div>

                  {addressesError && (
                    <div className="text-red-500 text-sm text-center bg-red-50 border border-red-100 p-3 rounded-xl">
                      {addressesError}
                    </div>
                  )}

                  {isAddingAddress ? (
                    <form onSubmit={handleAddressSubmit} className="space-y-4 max-w-2xl bg-gray-50 p-6 rounded-xl border border-gray-100">
                      <h4 className="font-bold text-gray-800">
                        {editingAddress !== null ? "Edit Address" : "New Address"}
                      </h4>

                      {formError && (
                        <div className="text-red-500 text-sm bg-red-50 border border-red-100 p-3 rounded-xl">
                          {formError}
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                        {/* Label */}
                        <div className="sm:col-span-2">
                          <label className={labelClass}>Address Type</label>
                          <div className="mt-2 flex gap-3">
                            {(["home", "office", "other"] as const).map((l) => (
                              <button
                                key={l}
                                type="button"
                                onClick={() => setFormData({ ...formData, label: l })}
                                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl border text-sm font-semibold capitalize transition cursor-pointer ${
                                  formData.label === l
                                    ? "bg-orange-500 text-white border-orange-500 shadow-sm shadow-orange-500/20"
                                    : "bg-white text-gray-600 border-gray-200 hover:border-orange-300"
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
                          <label className={labelClass}>Full Name</label>
                          <input type="text" required placeholder="John Doe" value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            className={inputClass} />
                        </div>

                        {/* Mobile */}
                        <div>
                          <label className={labelClass}>Mobile Number</label>
                          <input type="tel" required placeholder="9876543210" value={formData.mobile}
                            onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                            className={inputClass} />
                        </div>

                        {/* Area */}
                        <div>
                          <label className={labelClass}>Area</label>
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
                          <label className={labelClass}>Villa / Apartment <span className="normal-case font-normal text-gray-400">(optional)</span></label>
                          <input type="text" placeholder="e.g. Flat 302 / Villa 5" value={formData.villa_apartment ?? ""}
                            onChange={(e) => setFormData({ ...formData, villa_apartment: e.target.value })}
                            className={inputClass} />
                        </div>

                        {/* Floor */}
                        <div>
                          <label className={labelClass}>Floor <span className="normal-case font-normal text-gray-400">(optional)</span></label>
                          <input type="text" placeholder="e.g. 3rd Floor" value={formData.floor ?? ""}
                            onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                            className={inputClass} />
                        </div>

                        {/* Zone */}
                        <div>
                          <label className={labelClass}>Zone <span className="normal-case font-normal text-gray-400">(optional)</span></label>
                          <input type="text" placeholder="e.g. 39" value={formData.zone ?? ""}
                            onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                            className={inputClass} />
                        </div>

                        {/* Landmark */}
                        <div className="sm:col-span-2">
                          <label className={labelClass}>Landmark <span className="normal-case font-normal text-gray-400">(optional)</span></label>
                          <input type="text" placeholder="e.g. Opposite Al Meera" value={formData.landmark ?? ""}
                            onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                            className={inputClass} />
                        </div>

                        {/* City */}
                        <div>
                          <label className={labelClass}>City</label>
                          <input type="text" readOnly value="Doha" className={`${inputClass} bg-gray-100 cursor-not-allowed`} />
                        </div>

                        {/* Country */}
                        <div>
                          <label className={labelClass}>Country</label>
                          <input type="text" readOnly value="Qatar" className={`${inputClass} bg-gray-100 cursor-not-allowed`} />
                        </div>

                        {/* Set as Default */}
                        <div className="sm:col-span-2 flex items-center gap-2.5 mt-1">
                          <input
                            type="checkbox"
                            id="isDefault"
                            checked={formData.isDefault ?? false}
                            onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                            className="h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500 cursor-pointer"
                          />
                          <label htmlFor="isDefault" className="text-sm font-semibold text-gray-700 cursor-pointer">
                            Set as default address
                          </label>
                        </div>

                      </div>

                      <div className="pt-2 flex gap-3">
                        <button type="submit" disabled={formLoading}
                          className="flex items-center gap-2 bg-orange-500 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-orange-600 transition cursor-pointer shadow-sm shadow-orange-500/20 disabled:opacity-60 disabled:cursor-not-allowed">
                          {formLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                          Save Address
                        </button>
                        <button type="button" onClick={closeForm} disabled={formLoading}
                          className="bg-gray-100 text-gray-700 px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-200 transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed">
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      {addressesLoading ? (
                        <div className="flex items-center justify-center py-16">
                          <Loader2 className="h-8 w-8 text-orange-500 animate-spin" />
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {addresses.length === 0 ? (
                            <div className="col-span-2 text-center py-12">
                              <MapPin className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                              <p className="text-gray-400 text-sm font-medium">No addresses saved yet.</p>
                              <button onClick={openAddAddress}
                                className="mt-4 text-sm font-bold text-orange-500 hover:text-orange-600 transition cursor-pointer">
                                + Add your first address
                              </button>
                            </div>
                          ) : (
                            addresses.map((addr) => {
                              const LabelIcon = labelIcons[addr.label];
                              return (
                                <div key={addr.id}
                                  className={`p-5 rounded-xl border relative group transition-all ${
                                    addr.isDefault
                                      ? "border-orange-300 bg-orange-50/40 shadow-sm"
                                      : "border-gray-200 hover:border-orange-300 hover:shadow-sm"
                                  }`}>

                                  {/* Badges row */}
                                  <div className="flex items-center gap-2 mb-2.5">
                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 border text-[10px] font-bold uppercase tracking-wide rounded-full capitalize ${labelColors[addr.label]}`}>
                                      <LabelIcon className="h-2.5 w-2.5" />
                                      {addr.label}
                                    </span>
                                    {addr.isDefault && (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-100 text-orange-600 border border-orange-200 text-[10px] font-bold uppercase tracking-wide rounded-full">
                                        <Star className="h-2.5 w-2.5 fill-orange-500" /> Default
                                      </span>
                                    )}
                                  </div>

                                  <p className="font-bold text-gray-900 text-sm">{addr.fullName}</p>
                                  <p className="text-gray-500 text-xs mt-0.5">{addr.mobile}</p>
                                  <p className="text-gray-500 text-sm mt-1.5 leading-relaxed">
                                    Bldg {addr.building_number}
                                    {addr.villa_apartment && `, ${addr.villa_apartment}`}
                                    {addr.floor && `, Floor ${addr.floor}`}
                                    {`, ${addr.street}, ${addr.area}`}
                                    {addr.zone && `, Zone ${addr.zone}`}
                                    {addr.landmark && ` (Near ${addr.landmark})`}
                                  </p>
                                  <p className="text-gray-500 text-sm">
                                    {addr.city}, {addr.country}
                                  </p>

                                  {!addr.isDefault && (
                                    <button
                                      onClick={() => setDefaultAddress(addr.id)}
                                      className="mt-3 text-xs font-semibold text-orange-500 hover:text-orange-600 transition cursor-pointer">
                                      Set as default
                                    </button>
                                  )}

                                  <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => openEditAddress(addr)}
                                      className="p-1.5 bg-gray-100 text-gray-500 rounded-lg hover:bg-orange-100 hover:text-orange-500 transition cursor-pointer" title="Edit">
                                      <Edit className="h-3.5 w-3.5" />
                                    </button>
                                    <button onClick={() => deleteAddress(addr.id)}
                                      className="p-1.5 bg-gray-100 text-gray-500 rounded-lg hover:bg-red-100 hover:text-red-500 transition cursor-pointer" title="Delete">
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
                <div className="space-y-6">
                  <div className="border-b border-gray-100 pb-4">
                    <h3 className="text-lg font-bold text-gray-900">Order History</h3>
                    <p className="text-xs text-gray-400 mt-0.5">Track and review your past orders</p>
                  </div>

                  {ordersError && (
                    <div className="text-red-500 text-sm text-center bg-red-50 border border-red-100 p-3 rounded-xl">
                      {ordersError}
                    </div>
                  )}

                  {ordersLoading ? (
                    <div className="flex items-center justify-center py-16">
                      <Loader2 className="h-8 w-8 text-orange-500 animate-spin" />
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="h-16 w-16 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center mx-auto mb-4">
                        <Package className="h-8 w-8 text-gray-300" />
                      </div>
                      <p className="text-gray-500 font-medium text-sm">No orders yet</p>
                      <p className="text-gray-400 text-xs mt-1">Your completed orders will appear here</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => {
                        const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
                        const isExpanded = expandedOrderId === order.id;
                        return (
                          <div key={order.id} className="border border-gray-200 rounded-2xl overflow-hidden hover:border-orange-300 transition-all">
                            {/* Order Header */}
                            <div
                              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 cursor-pointer hover:bg-gray-50/50 transition"
                              onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                            >
                              <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0">
                                  <Package className="h-5 w-5 text-orange-500" />
                                </div>
                                <div>
                                  <p className="text-sm font-black text-gray-900">{order.order_number || `ORD-${String(order.id).padStart(4, "0")}`}</p>
                                  <p className="text-[10px] text-gray-400 font-semibold mt-0.5">
                                    {new Date(order.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-lg border ${cfg.bg} ${cfg.color}`}>
                                  {cfg.icon}
                                  {cfg.label}
                                </span>
                                <span className="text-sm font-black text-gray-900">
                                  {order.total_price ? `QAR ${parseFloat(String(order.total_price).replace(/([$]|qar|[\s,])/gi, "") || "0").toFixed(2)}` : "—"}
                                </span>
                                <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                              </div>
                            </div>

                            {/* Expanded Details */}
                            {isExpanded && (
                              <div className="border-t border-gray-100 bg-gray-50/50 p-5">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Order Items</p>
                                <div className="space-y-3">
                                  {(order.items || []).map((item) => (
                                    <div key={item.id} className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl p-3">
                                      <div className="h-12 w-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                                        {item.product?.main_image_url && (
                                          <img
                                            src={item.product.main_image_url}
                                            alt={item.product?.title || "Product"}
                                            className="h-full w-full object-cover"
                                          />
                                        )}
                                      </div>
                                      <div className="min-w-0 flex-1">
                                        <p className="text-xs font-bold text-gray-800 truncate">{item.product?.title || `Product #${item.product_id}`}</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                          <p className="text-[10px] text-gray-400">Qty: {item.quantity}</p>
                                          {item.selected_color && <p className="text-[10px] text-gray-400">• {item.selected_color}</p>}
                                          {item.selected_storage && <p className="text-[10px] text-gray-400">• {item.selected_storage}</p>}
                                        </div>
                                      </div>
                                      <span className="text-xs font-black text-gray-800 shrink-0">
                                        QAR {(Number(String(item.price_at_purchase).replace(/([$]|qar|[\s,])/gi, "")) * item.quantity).toFixed(2)}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                                <div className="mt-4 pt-3 border-t border-gray-200 flex items-center justify-between">
                                  <span className="text-xs text-gray-400 font-semibold">
                                    Payment: {order.payment_method || "COD"}
                                  </span>
                                  <span className="text-sm font-black text-gray-900">
                                    Total: {order.total_price ? `QAR ${parseFloat(String(order.total_price).replace(/([$]|qar|[\s,])/gi, "") || "0").toFixed(2)}` : "—"}
                                  </span>
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

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}