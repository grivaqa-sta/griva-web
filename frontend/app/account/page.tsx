"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User as UserIcon, MapPin, Package, LogOut,
  Edit, Trash2, Plus, Loader2, Star, Home, Briefcase,
  Clock, Truck, CheckCircle, XCircle, ChevronDown,
  Heart, Bell, HelpCircle, ChevronRight, MessageSquare,
  MessageCircle, Undo, Search, Check, ShieldCheck, Mail, Phone, Calendar, ArrowLeft, X, Upload
} from "lucide-react";
import { addressService } from "@/app/services/address.service";
import { authService } from "@/app/services/auth.service";
import { orderService, MyOrder, ReturnRequest } from "@/app/services/order.service";
import { uploadService } from "@/app/services/upload.service";
import { useUser } from "@/app/context/UserContext";
import { useWishlist } from "@/app/context/WishlistContext";
import { Address, AddressRequest } from "@/app/types/types";
import { useToast } from "@/app/context/ToastContext";
import { io } from "socket.io-client";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  pending: { label: "Pending", color: "text-amber-600", bg: "bg-amber-50 border-amber-200", icon: <Clock className="h-3 w-3" /> },
  processing: { label: "Processing", color: "text-orange-600", bg: "bg-orange-50 border-orange-200", icon: <Clock className="h-3 w-3" /> },
  shipped: { label: "Shipped", color: "text-blue-600", bg: "bg-blue-50 border-blue-200", icon: <Truck className="h-3 w-3" /> },
  completed: { label: "Completed", color: "text-green-600", bg: "bg-green-50 border-green-200", icon: <CheckCircle className="h-3 w-3" /> },
  delivered: { label: "Delivered", color: "text-green-600", bg: "bg-green-50 border-green-200", icon: <CheckCircle className="h-3 w-3" /> },
  cancelled: { label: "Cancelled", color: "text-red-500", bg: "bg-red-50 border-red-200", icon: <XCircle className="h-3 w-3" /> },
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
  latitude: undefined,
  longitude: undefined,
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
  const [locating, setLocating] = useState(false);
  const [locationSuccess, setLocationSuccess] = useState(false);

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }
    setLocating(true);
    setLocationSuccess(false);

    const options = {
      enableHighAccuracy: true,
      timeout: 8000,
      maximumAge: 0
    };

    const successCallback = async (position: GeolocationPosition) => {
      const { latitude, longitude } = position.coords;
      setFormData((prev) => ({ ...prev, latitude, longitude }));

      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
          {
            headers: {
              "Accept-Language": "en",
              "User-Agent": "GrivaEcommerce/1.0"
            }
          }
        );
        if (res.ok) {
          const data = await res.json();
          const addr = data.address || {};
          const streetName = addr.road || addr.suburb || addr.neighbourhood || "";
          const areaName = addr.quarter || addr.suburb || addr.city_district || addr.town || addr.city || "";
          const zoneNum = addr.postcode || "";

          setFormData((prev) => ({
            ...prev,
            area: areaName || prev.area,
            street: streetName || prev.street,
            zone: zoneNum.match(/^\d+$/) ? zoneNum : prev.zone,
          }));
          setLocationSuccess(true);
          toast.success("Location coordinates and address details retrieved successfully!");
        } else {
          setLocationSuccess(true);
          toast.success("Location coordinates saved!");
        }
      } catch (err) {
        console.error("Reverse geocoding error:", err);
        setLocationSuccess(true);
        toast.success("Location coordinates saved!");
      } finally {
        setLocating(false);
      }
    };

    const errorCallback = (error: GeolocationPositionError) => {
      // If high accuracy failed/timed out, try fallback with low accuracy
      if (options.enableHighAccuracy && (error.code === 3 || error.code === 2)) {
        console.log("High accuracy geolocation failed/timeout. Retrying with low accuracy...");
        options.enableHighAccuracy = false;
        options.timeout = 10000;
        navigator.geolocation.getCurrentPosition(successCallback, finalErrorCallback, options);
      } else {
        finalErrorCallback(error);
      }
    };

    const finalErrorCallback = (error: GeolocationPositionError) => {
      setLocating(false);
      console.error("Geolocation error:", error);
      if (error.code === 1) {
        toast.error(
          "Location permission is blocked! Please click the 'Not Secure' / Info icon (or Lock icon) in your browser address bar next to localhost:3000, then toggle Location access to ALLOW."
        );
      } else if (error.code === 3) {
        toast.error("Location request timed out. Please try again or type your address manually.");
      } else {
        toast.error("Unable to retrieve your location. Please check your browser/device settings or type your address manually.");
      }
    };

    navigator.geolocation.getCurrentPosition(successCallback, errorCallback, options);
  };

  // Orders state
  const [orders, setOrders] = useState<MyOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState("");
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);

  // Return & Replacement states
  const [myReturns, setMyReturns] = useState<ReturnRequest[]>([]);
  const [returnsLoading, setReturnsLoading] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [selectedReturnOrder, setSelectedReturnOrder] = useState<MyOrder | null>(null);
  
  // Return Form State
  const [returnOrderItemId, setReturnOrderItemId] = useState<number>(0);
  const [returnQuantity, setReturnQuantity] = useState<number>(1);
  const [returnType, setReturnType] = useState<"replacement" | "refund">("replacement");
  const [returnReason, setReturnReason] = useState<"damaged" | "defective" | "wrong_item" | "changed_mind" | "other">("damaged");
  const [returnDescription, setReturnDescription] = useState("");
  const [returnImages, setReturnImages] = useState<string[]>([]);
  const [isUploadingReturnPhoto, setIsUploadingReturnPhoto] = useState(false);
  const [isSubmittingReturn, setIsSubmittingReturn] = useState(false);
  const [returnFormError, setReturnFormError] = useState("");

  // Search & Filter state for Orders
  const [orderSearchQuery, setOrderSearchQuery] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");

  // Profile Edit Simulation
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profileMobile, setProfileMobile] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState("");
  const [profileMobileError, setProfileMobileError] = useState("");

  useEffect(() => {
    if (profile) {
      setProfileName(profile.name);
      let phone = profile.phone || "";
      phone = phone.replace(/^(?:\+?974)?\s?/, "").replace(/[\s-]/g, "");
      setProfileMobile(phone);
    }
  }, [profile]);

  // Fetch addresses and orders on load / authentication
  useEffect(() => {
    if (isAuthenticated) {
      fetchAddresses();
      fetchOrders();
      fetchReturns();
    }
  }, [isAuthenticated]);

  // Real-time order status updates via Socket.IO
  useEffect(() => {
    if (orders.length === 0) return;

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:8080";
    console.log(`🔌 [Socket.IO Account]: Connecting to ${socketUrl}...`);

    const socket = io(socketUrl, {
      transports: ["polling", "websocket"],
      reconnection: true,
    });

    socket.on("connect", () => {
      console.log(`🔌 [Socket.IO Account]: Connected, subscribing to ${orders.length} orders...`);
      orders.forEach((o) => {
        socket.emit("join-order-tracking", o.id);
      });
    });

    socket.on("order-status-updated", (data: { orderId: number; status: string }) => {
      console.log("🔌 [Socket.IO Account]: Status updated event received:", data);
      setOrders((prev) =>
        prev.map((o) =>
          o.id === data.orderId ? { ...o, status: data.status } : o
        )
      );
    });

    socket.on("disconnect", () => {
      console.log("🔌 [Socket.IO Account]: Disconnected.");
    });

    return () => {
      console.log("🔌 [Socket.IO Account]: Disconnecting...");
      socket.disconnect();
    };
  }, [orders.length]);

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

  const fetchReturns = async () => {
    setReturnsLoading(true);
    try {
      const data = await orderService.getMyReturns();
      if (data && data.success) {
        setMyReturns(data.returnRequests || []);
      }
    } catch (err) {
      console.error("Failed to fetch returns:", err);
    } finally {
      setReturnsLoading(false);
    }
  };

  const handleInitiateReturn = (order: MyOrder) => {
    setSelectedReturnOrder(order);
    if (order.items && order.items.length > 0) {
      setReturnOrderItemId(order.items[0].id);
      setReturnQuantity(1);
    }
    setReturnType("replacement");
    setReturnReason("damaged");
    setReturnDescription("");
    setReturnImages([]);
    setReturnFormError("");
    setIsReturnModalOpen(true);
  };

  const handleReturnPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setIsUploadingReturnPhoto(true);
    setReturnFormError("");
    try {
      const uploadedUrls: string[] = [...returnImages];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`File ${file.name} is too large. Max size is 5MB.`);
          continue;
        }
        const res = await uploadService.uploadImage(file);
        if (res && res.imageUrl) {
          uploadedUrls.push(res.imageUrl);
        }
      }
      setReturnImages(uploadedUrls);
      toast.success("Photos uploaded successfully!");
    } catch (err: any) {
      console.error("Return photo upload failed:", err);
      toast.error(err?.response?.data?.message || "Failed to upload return photos.");
    } finally {
      setIsUploadingReturnPhoto(false);
    }
  };

  const handleSubmitReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReturnOrder) return;
    
    // Photo proof check for damaged/defective items
    if (["damaged", "defective"].includes(returnReason)) {
      if (returnImages.length === 0) {
        setReturnFormError("Please upload at least one proof photo showing the damage or defect.");
        return;
      }
    }
    
    setIsSubmittingReturn(true);
    setReturnFormError("");
    try {
      const res = await orderService.submitReturnRequest({
        orderId: selectedReturnOrder.id,
        orderItemId: returnOrderItemId,
        quantity: returnQuantity,
        type: returnType,
        reason: returnReason,
        description: returnDescription,
        images: returnImages,
      });
      if (res && res.success) {
        toast.success(res.message || "Return request submitted successfully.");
        setIsReturnModalOpen(false);
        fetchReturns();
      }
    } catch (err: any) {
      console.error("Failed to submit return request:", err);
      setReturnFormError(err?.response?.data?.error || "Failed to submit return request.");
    } finally {
      setIsSubmittingReturn(false);
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
      latitude: addr.latitude,
      longitude: addr.longitude,
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

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (profileMobileError) return;

    if (profileMobile) {
      const cleanNumber = profileMobile.replace(/[\s-]/g, "");
      const regex = /^[3567]\d{7}$/;
      if (!regex.test(cleanNumber)) {
        setProfileMobileError("Please enter a valid Qatar mobile number.");
        return;
      }
    }
    setProfileMobileError("");

    setProfileSaving(true);
    setProfileSuccessMsg("");
    try {
      const fullMobile = profileMobile ? `+974 ${profileMobile.replace(/[\s-]/g, "")}` : "";
      await authService.updateProfile({ name: profileName, phone: fullMobile });
      setProfileSaving(false);
      setIsEditingProfile(false);
      setProfileSuccessMsg("Profile updated successfully!");
      if (profile) {
        profile.name = profileName;
        profile.phone = fullMobile;
      }
      setTimeout(() => setProfileSuccessMsg(""), 3000);
    } catch (error) {
      setProfileSaving(false);
      toast.error("Failed to update profile. Please try again.");
    }
  };

  // Stepper calculator helper
  const getOrderStatusStep = (status: string) => {
    const s = (status || "").toLowerCase().trim();
    switch (s) {
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
    const statusLower = (order.status || "").toLowerCase().trim();
    if (orderStatusFilter !== "all") {
      const step = getOrderStatusStep(order.status);
      if (orderStatusFilter === "pending" && step > 2) return false;
      if (orderStatusFilter === "shipped" && statusLower !== "shipped") return false;
      if (orderStatusFilter === "completed" && statusLower !== "completed" && statusLower !== "delivered") return false;
      if (orderStatusFilter === "cancelled" && statusLower !== "cancelled") return false;
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
    "block text-xs font-bold uppercase tracking-wider text-slate-400";

  return (
    <div className="bg-slate-50/50 min-h-[90vh] py-5">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Back Button */}
        <div className="mb-3 flex items-center">
          <button 
            onClick={() => router.back()} 
            className="flex items-center gap-1.5 text-sm font-bold text-orange-500 hover:text-orange-600 transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">

          {/* Left Sidebar (Flipkart Style refined) */}
          <div className="md:col-span-3 space-y-5">

            {/* User Greeting Box */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="h-14 w-14 rounded-full bg-gradient-to-tr from-orange-500 via-orange-600 to-amber-500 flex items-center justify-center text-white font-black text-xl shadow-md border-2 border-white ring-4 ring-orange-500/10">
                {(profile?.name || "C").charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Welcome back,</p>
                <h4 className="text-sm font-bold text-slate-800 truncate mt-0.5">{profileName || profile?.name || "Customer"}</h4>
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
                className={`w-full flex items-center justify-between px-6 py-4.5 text-left font-semibold text-sm transition-all cursor-pointer relative group ${activeTab === "orders" ? "text-orange-500 bg-orange-50/20" : "text-slate-700 hover:text-orange-500"
                  }`}
              >
                {activeTab === "orders" && <span className="absolute left-0 top-0 bottom-0 w-[4px] bg-orange-500 rounded-r-md" />}
                <div className="flex items-center gap-3">
                  <Package className={`h-4.5 w-4.5 transition-colors duration-250 ${activeTab === "orders" ? "text-orange-500" : "text-slate-400 group-hover:text-orange-500"}`} />
                  <span>My Orders</span>
                </div>
                <ChevronRight className={`h-4 w-4 text-slate-400 transition-transform duration-250 ${activeTab === "orders" ? "text-orange-500 translate-x-0.5" : "group-hover:translate-x-0.5"}`} />
              </button>

              {/* Account Settings */}
              <div className="px-6 py-4.5 space-y-3">
                <div className="flex items-center gap-3 text-xs font-bold text-slate-400 tracking-wider">
                  <UserIcon className="h-4.5 w-4.5" />
                  <span>Account Settings</span>
                </div>
                <div className="pl-7.5 space-y-3 flex flex-col text-[13px] font-semibold">
                  <button
                    onClick={() => {
                      setActiveTab("profile");
                      closeForm();
                    }}
                    className={`text-left transition-colors relative cursor-pointer ${activeTab === "profile" ? "text-orange-500" : "text-slate-500 hover:text-orange-500"
                      }`}
                  >
                    {activeTab === "profile" && <span className="absolute -left-3.5 top-0.5 bottom-0.5 w-[3px] bg-orange-500 rounded-r-sm" />}
                    Profile Information
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab("addresses");
                      closeForm();
                    }}
                    className={`text-left transition-colors relative cursor-pointer ${activeTab === "addresses" ? "text-orange-500" : "text-slate-500 hover:text-orange-500"
                      }`}
                  >
                    {activeTab === "addresses" && <span className="absolute -left-3.5 top-0.5 bottom-0.5 w-[3px] bg-orange-500 rounded-r-sm" />}
                    Manage Addresses
                  </button>
                </div>
              </div>

              {/* My Stuff */}
              <div className="px-6 py-4.5 space-y-3">
                <div className="flex items-center gap-3 text-xs font-bold text-slate-400 tracking-wider">
                  <Heart className="h-4.5 w-4.5" />
                  <span>My Stuff</span>
                </div>
                <div className="pl-7.5 space-y-3 flex flex-col text-[13px] font-semibold">
                  <Link href="/wishlist" className="text-left text-slate-500 hover:text-orange-500 transition-colors flex items-center justify-between">
                    <span>My Wishlist</span>
                    <span className="px-2 py-0.5 bg-orange-50 text-orange-500 rounded-full text-[9px] font-bold">{wishlistItems.length}</span>
                  </Link>
                  <button
                    onClick={() => {
                      setActiveTab("notifications");
                      closeForm();
                    }}
                    className={`text-left transition-colors relative cursor-pointer flex items-center justify-between ${activeTab === "notifications" ? "text-orange-500" : "text-slate-500 hover:text-orange-500"
                      }`}
                  >
                    {activeTab === "notifications" && <span className="absolute -left-3.5 top-0.5 bottom-0.5 w-[3px] bg-orange-500 rounded-r-sm" />}
                    <span>Notifications</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab("returns");
                      closeForm();
                    }}
                    className={`text-left transition-colors relative cursor-pointer flex items-center justify-between ${activeTab === "returns" ? "text-orange-500" : "text-slate-500 hover:text-orange-500"
                      }`}
                  >
                    {activeTab === "returns" && <span className="absolute -left-3.5 top-0.5 bottom-0.5 w-[3px] bg-orange-500 rounded-r-sm" />}
                    <span>Returns & Replacements</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab("support");
                      closeForm();
                    }}
                    className={`text-left transition-colors relative cursor-pointer ${activeTab === "support" ? "text-orange-500" : "text-slate-500 hover:text-orange-500"
                      }`}
                  >
                    {activeTab === "support" && <span className="absolute -left-3.5 top-0.5 bottom-0.5 w-[3px] bg-orange-500 rounded-r-sm" />}
                    Support Center
                  </button>
                </div>
              </div>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-6 py-4.5 text-left font-semibold text-sm text-red-500 hover:bg-red-50/20 transition-colors cursor-pointer"
              >
                <LogOut className="h-4.5 w-4.5 shrink-0 text-red-400" />
                <span>Logout</span>
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
                      <h3 className="text-xl font-bold text-slate-800">Profile Details</h3>
                      <p className="text-xs text-slate-400 mt-0.5">Manage your personal settings and contact cards</p>
                    </div>
                    {!isEditingProfile && (
                      <button
                        onClick={() => setIsEditingProfile(true)}
                        className="flex items-center gap-1.5 px-4.5 py-2 text-xs font-semibold text-orange-500 hover:bg-orange-50 border border-orange-200 rounded-xl transition cursor-pointer shadow-sm shadow-orange-500/5"
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
                        <div className="p-5 bg-gradient-to-br from-orange-5/20 to-orange-500/5 border border-orange-100 rounded-2xl flex items-center gap-4 hover:shadow-md hover:-translate-y-0.5 transition duration-300">
                          <div className="h-11 w-11 rounded-xl bg-orange-100 flex items-center justify-center text-orange-650 shadow-sm shadow-orange-500/10">
                            <Package className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-slate-800">{orders.length}</p>
                            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">Total Orders</p>
                          </div>
                        </div>

                        {/* Addresses count */}
                        <div className="p-5 bg-gradient-to-br from-blue-50/20 to-blue-500/5 border border-blue-100 rounded-2xl flex items-center gap-4 hover:shadow-md hover:-translate-y-0.5 transition duration-300">
                          <div className="h-11 w-11 rounded-xl bg-blue-100 flex items-center justify-center text-blue-650 shadow-sm shadow-blue-500/10">
                            <MapPin className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-slate-800">{addresses.length}</p>
                            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">Saved Addresses</p>
                          </div>
                        </div>

                        {/* Wishlist count */}
                        <div className="p-5 bg-gradient-to-br from-red-50/20 to-red-500/5 border border-red-100 rounded-2xl flex items-center gap-4 hover:shadow-md hover:-translate-y-0.5 transition duration-300">
                          <div className="h-11 w-11 rounded-xl bg-red-100 flex items-center justify-center text-red-650 shadow-sm shadow-red-500/10">
                            <Heart className="h-5 w-5 animate-pulse" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-slate-800">{wishlistItems.length}</p>
                            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">Wishlist Items</p>
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
                            <div className="mt-1.5 flex shadow-sm rounded-xl">
                              <span className="inline-flex items-center px-4 rounded-l-xl border border-r-0 border-slate-200 bg-slate-50 text-slate-600 sm:text-sm font-bold">
                                +974
                              </span>
                              <input
                                type="tel"
                                maxLength={8}
                                value={profileMobile}
                                onChange={(e) => {
                                  const val = e.target.value.replace(/\D/g, "").slice(0, 8);
                                  setProfileMobile(val);
                                  if (val) {
                                    const regex = /^[3567]\d{7}$/;
                                    if (!regex.test(val)) {
                                      setProfileMobileError("Please enter a valid Qatar mobile number.");
                                    } else {
                                      setProfileMobileError("");
                                    }
                                  } else {
                                    setProfileMobileError("");
                                  }
                                }}
                                className={`block w-full flex-1 rounded-none rounded-r-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all duration-200 ${profileMobileError ? "border-red-500 focus:border-red-500 focus:ring-red-500/10 z-10" : ""}`}
                              />
                            </div>
                            {profileMobileError && <p className="text-xs text-red-500 mt-1.5 font-semibold">{profileMobileError}</p>}
                          </div>

                          <div className="pt-2 flex gap-3">
                            <button
                              type="submit"
                              disabled={profileSaving || !!profileMobileError}
                              className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs uppercase tracking-wider rounded-xl shadow-md shadow-orange-500/15 transition disabled:opacity-60 flex items-center gap-1.5 cursor-pointer"
                            >
                              {profileSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                              Save Changes
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setProfileName(profile.name);
                                let phone = profile.phone || "";
                                phone = phone.replace(/^(?:\+?974)?\s?/, "").replace(/[\s-]/g, "");
                                setProfileMobile(phone);
                                setProfileMobileError("");
                                setIsEditingProfile(false);
                              }}
                              className="px-6 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer"
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
                                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Full Name</p>
                                <p className="text-sm font-semibold text-slate-800 mt-1">{profileName || profile.name}</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-3">
                              <Mail className="h-5 w-5 text-slate-400 mt-0.5" />
                              <div>
                                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Email Address</p>
                                <p className="text-sm font-semibold text-slate-800 mt-1">{profile.email}</p>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 p-6 gap-6 hover:bg-slate-50/10 transition">
                            <div className="flex items-start gap-3">
                              <Phone className="h-5 w-5 text-slate-400 mt-0.5" />
                              <div>
                                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Mobile Number</p>
                                <p className="text-sm font-semibold text-slate-800 mt-1">{profileMobile ? `+974 ${profileMobile}` : ""}</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-3">
                              <ShieldCheck className="h-5 w-5 text-slate-400 mt-0.5" />
                              <div>
                                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Account Safety</p>
                                <p className="text-xs font-semibold text-green-600 bg-green-50 border border-green-100 rounded-full px-3 py-1 mt-1.5 inline-block tracking-wider">
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
                      <h3 className="text-xl font-bold text-slate-800">Delivery Addresses</h3>
                      <p className="text-xs text-slate-400 mt-0.5">Manage and organize your shipping locations</p>
                    </div>
                    {!isAddingAddress && (
                      <button
                        onClick={openAddAddress}
                        className="flex items-center gap-1.5 text-xs font-semibold text-white bg-orange-500 hover:bg-orange-600 px-4.5 py-2.5 rounded-xl transition cursor-pointer shadow-md shadow-orange-500/15"
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
                      <h4 className="font-bold text-sm text-slate-700 uppercase tracking-wider pb-2 border-b border-slate-100">
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
                                className={`flex items-center gap-2 px-4.5 py-2.5 rounded-xl border text-xs font-semibold uppercase tracking-wider transition duration-200 cursor-pointer ${formData.label === l
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

                        {/* Use Current Location Button */}
                        <div className="sm:col-span-2">
                          <button
                            type="button"
                            onClick={handleUseMyLocation}
                            disabled={locating}
                            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-orange-500/25 bg-orange-50/30 hover:bg-orange-50 text-orange-600 font-bold text-xs uppercase tracking-wider transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                          >
                            {locating ? (
                              <Loader2 className="h-4 w-4 animate-spin text-orange-500" />
                            ) : (
                              <MapPin className="h-4 w-4 text-orange-500" />
                            )}
                            <span>
                              {locating
                                ? "Locating your GPS coordinates..."
                                : locationSuccess
                                  ? "📍 Location coordinates saved! (Click to locate again)"
                                  : "📍 Use My Location (Exact GPS)"}
                            </span>
                          </button>
                        </div>

                        {/* Full Name */}
                        <div>
                          <label className={labelClass}>Receiver's Name</label>
                          <input type="text" required placeholder="e.g. John Doe" value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
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
                          <label htmlFor="isDefault" className="text-xs font-semibold text-slate-650 cursor-pointer select-none">
                            Set as default shipping address
                          </label>
                        </div>

                      </div>

                      <div className="pt-3 flex gap-3 border-t border-slate-100">
                        <button type="submit" disabled={formLoading}
                          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition cursor-pointer shadow-md shadow-orange-500/10 disabled:opacity-60 disabled:cursor-not-allowed">
                          {formLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                          Save Address
                        </button>
                        <button type="button" onClick={closeForm} disabled={formLoading}
                          className="bg-white border border-slate-250 text-slate-600 px-6 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-slate-50 transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed">
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
                              <p className="text-slate-400 text-xs font-semibold tracking-wider uppercase">No Saved Locations Yet</p>
                              <button onClick={openAddAddress}
                                className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-orange-600 transition cursor-pointer shadow-sm">
                                + Add address location
                              </button>
                            </div>
                          ) : (
                            [...addresses]
                              .sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0))
                              .map((addr) => {
                                const LabelIcon = labelIcons[addr.label] || MapPin;
                                return (
                                  <div key={addr.id}
                                    className={`p-6 rounded-2xl border relative group transition-all duration-300 bg-white ${addr.isDefault
                                        ? "border-orange-350 bg-orange-50/5 shadow-md shadow-orange-500/[0.02]"
                                        : "border-slate-200/80 hover:border-orange-200 hover:shadow-md hover:-translate-y-0.5"
                                      }`}>

                                    {/* Badges row */}
                                    <div className="flex items-center gap-2 mb-4">
                                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 border text-[9px] font-bold uppercase tracking-wider rounded-full capitalize ${labelColors[addr.label] || labelColors.other}`}>
                                        <LabelIcon className="h-3 w-3" />
                                        {addr.label}
                                      </span>
                                      {addr.isDefault && (
                                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-600 border border-orange-200 text-[9px] font-bold uppercase tracking-wider rounded-full">
                                          Default Shipping
                                        </span>
                                      )}
                                    </div>

                                  <h5 className="font-bold text-slate-800 text-sm">{addr.fullName}</h5>

                                  {/* Address Details structured as tabular description */}
                                  <div className="mt-3.5 space-y-1.5 text-xs text-slate-500 font-medium">
                                    <div className="flex gap-2">
                                      <span className="text-[10px] font-semibold uppercase text-slate-400 w-16 shrink-0 mt-0.5">Mobile:</span>
                                      <span className="text-slate-700 font-semibold">{addr.mobile}</span>
                                    </div>
                                    <div className="flex gap-2">
                                      <span className="text-[10px] font-semibold uppercase text-slate-400 w-16 shrink-0 mt-0.5">Address:</span>
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
                                        <span className="text-[10px] font-semibold uppercase text-slate-400 w-16 shrink-0 mt-0.5">Landmark:</span>
                                        <span className="text-slate-500 italic">{addr.landmark}</span>
                                      </div>
                                    )}
                                    <div className="flex gap-2">
                                      <span className="text-[10px] font-semibold uppercase text-slate-400 w-16 shrink-0 mt-0.5">Location:</span>
                                      <span className="text-slate-700 font-semibold">{addr.city}, {addr.country}</span>
                                    </div>
                                  </div>

                                  {!addr.isDefault && (
                                    <div className="mt-4 pt-3.5 border-t border-slate-100">
                                      <button
                                        onClick={() => setDefaultAddress(addr.id)}
                                        className="text-xs font-semibold uppercase tracking-wider text-orange-500 hover:text-orange-600 transition cursor-pointer">
                                        Set as default
                                      </button>
                                    </div>
                                  )}

                                  {/* Edit / Delete buttons */}
                                  <div className="absolute top-5 right-5 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <button onClick={() => openEditAddress(addr)}
                                      className="p-2 bg-white border border-slate-200 text-slate-500 rounded-xl hover:bg-orange-100 hover:text-orange-600 hover:border-orange-200 transition cursor-pointer shadow-sm" title="Edit Address">
                                      <Edit className="h-3.5 w-3.5" />
                                    </button>
                                    <button onClick={() => deleteAddress(addr.id)}
                                      className="p-2 bg-white border border-slate-200 text-slate-500 rounded-xl hover:bg-red-100 hover:text-red-500 hover:border-red-200 transition cursor-pointer shadow-sm" title="Delete Address">
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
                      <h3 className="text-xl font-bold text-slate-800">Order History</h3>
                      <p className="text-xs text-slate-400 mt-0.5">Track shipping details and review past purchases</p>
                    </div>

                    {/* Status Filters */}
                    <div className="flex flex-wrap gap-1.5">
                      {["all", "pending", "shipped", "completed", "cancelled"].map((st) => (
                        <button
                          key={st}
                          onClick={() => setOrderStatusFilter(st)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition border cursor-pointer ${orderStatusFilter === st
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
                      <p className="text-slate-400 text-xs font-semibold tracking-wider uppercase">No matching orders found</p>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      {filteredOrders.map((order) => {
                        const statusLower = (order.status || "").toLowerCase().trim();
                        const cfg = STATUS_CONFIG[statusLower] || STATUS_CONFIG.pending;
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
                                  <p className="text-sm font-bold text-slate-800">{order.order_number || `ORD-${String(order.id).padStart(4, "0")}`}</p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Calendar className="h-3 w-3 text-slate-400" />
                                    <span className="text-[10px] text-slate-400 font-semibold">
                                      {new Date(order.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-4.5">
                                <span className={`inline-flex items-center gap-1.5 text-[9px] font-bold px-3 py-1 rounded-full border uppercase tracking-wider ${cfg.bg} ${cfg.color} shadow-sm shadow-black/[0.01]`}>
                                  {cfg.icon}
                                  {cfg.label}
                                </span>
                                <span className="text-sm font-semibold text-slate-800">
                                  {order.total_price ? `QAR ${parseFloat(String(order.total_price).replace(/([$]|qar|[\s,])/gi, "") || "0").toFixed(2)}` : "—"}
                                </span>
                                <ChevronDown className={`h-4.5 w-4.5 text-slate-400 transition-transform duration-250 ${isExpanded ? "rotate-180 text-orange-500" : ""}`} />
                              </div>
                            </div>

                            {/* Stepper Progress Bar */}
                            <div className="px-6 pb-6 border-b border-slate-100 bg-slate-50/10">
                              <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-slate-400 max-w-xl mx-auto relative pt-4.5">
                                <div className="absolute top-7 left-0 right-0 h-1 bg-slate-150 -z-10 rounded-full" />
                                <div
                                  className="absolute top-7 left-0 h-1 bg-gradient-to-r from-orange-500 to-green-500 -z-10 rounded-full transition-all duration-500"
                                  style={{ width: `${((orderStep - 1) / 3) * 100}%` }}
                                />

                                <div className="flex flex-col items-center gap-2">
                                  <div className={`h-6 w-6 rounded-full flex items-center justify-center border font-semibold text-[9px] transition-all duration-300 ${orderStep >= 1 ? "bg-orange-500 border-orange-500 text-white shadow-md shadow-orange-500/10" : "bg-white border-slate-300 text-slate-400"
                                    }`}>
                                    {orderStep >= 1 ? <Check className="h-3.5 w-3.5" /> : "1"}
                                  </div>
                                  <span className={orderStep >= 1 ? "text-orange-500 font-semibold" : ""}>Placed</span>
                                </div>

                                <div className="flex flex-col items-center gap-2">
                                  <div className={`h-6 w-6 rounded-full flex items-center justify-center border font-semibold text-[9px] transition-all duration-300 ${orderStep >= 2 ? "bg-orange-500 border-orange-500 text-white shadow-md shadow-orange-500/10" : "bg-white border-slate-300 text-slate-400"
                                    }`}>
                                    {orderStep >= 2 ? <Check className="h-3.5 w-3.5" /> : "2"}
                                  </div>
                                  <span className={orderStep >= 2 ? "text-orange-500 font-semibold" : ""}>Processing</span>
                                </div>

                                <div className="flex flex-col items-center gap-2">
                                  <div className={`h-6 w-6 rounded-full flex items-center justify-center border font-semibold text-[9px] transition-all duration-300 ${orderStep >= 3 ? "bg-orange-500 border-orange-500 text-white shadow-md shadow-orange-500/10" : "bg-white border-slate-300 text-slate-400"
                                    }`}>
                                    {orderStep >= 3 ? <Check className="h-3.5 w-3.5" /> : "3"}
                                  </div>
                                  <span className={orderStep >= 3 ? "text-orange-500 font-semibold" : ""}>Shipped</span>
                                </div>

                                <div className="flex flex-col items-center gap-2">
                                  <div className={`h-6 w-6 rounded-full flex items-center justify-center border font-semibold text-[9px] transition-all duration-300 ${orderStep >= 4 ? "bg-green-500 border-green-500 text-white shadow-md shadow-green-500/10" : "bg-white border-slate-300 text-slate-400"
                                    }`}>
                                    {orderStep >= 4 ? <Check className="h-3.5 w-3.5" /> : "4"}
                                  </div>
                                  <span className={orderStep >= 4 ? "text-green-600 font-semibold" : ""}>Delivered</span>
                                </div>
                              </div>
                            </div>

                            {/* Expanded Details Panel */}
                            {isExpanded && (
                              <div className="bg-slate-50/30 p-6 space-y-5 border-t border-slate-100 animate-fadeIn">
                                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Items Ordered</p>
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
                                        <h5 className="text-xs font-bold text-slate-800 truncate">{item.product?.title || `Product #${item.product_id}`}</h5>
                                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1.5 text-[9px] text-slate-400 font-semibold tracking-wider uppercase">
                                          <span>Qty: {item.quantity}</span>
                                          {item.selected_color && <span>• Color: {item.selected_color}</span>}
                                          {item.selected_storage && <span>• Spec: {item.selected_storage}</span>}
                                        </div>
                                      </div>

                                      <div className="text-right shrink-0">
                                        <span className="text-xs font-semibold text-slate-900 block">
                                          QAR {(Number(String(item.price_at_purchase).replace(/([$]|qar|[\s,])/gi, "")) * item.quantity).toFixed(2)}
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                <div className="pt-4 border-t border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                                  <div className="flex flex-wrap items-center gap-3">
                                    <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                                      Payment Method: <span className="text-slate-700 font-bold">{order.payment_method || "COD"}</span>
                                    </span>
                                    {statusLower === "pending" && (
                                      <button
                                        onClick={() => handleCancelOrder(order.id)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-red-650 hover:text-white bg-red-50 hover:bg-red-550 border border-red-200 hover:border-red-500 rounded-xl transition-all duration-300 cursor-pointer shadow-sm shadow-red-500/5 hover:shadow-md hover:shadow-red-500/20 hover:-translate-y-0.5 active:translate-y-0"
                                      >
                                        <XCircle className="h-3.5 w-3.5" />
                                        Cancel Order
                                      </button>
                                    )}
                                    {(() => {
                                      const isDeliveredOrCompleted = statusLower === "delivered" || statusLower === "completed" || statusLower === "returned";
                                      const deliveryTime = new Date((order as any).updatedAt || order.createdAt).getTime();
                                      const isWithin7Days = (new Date().getTime() - deliveryTime) <= 7 * 24 * 60 * 60 * 1000;
                                      const matchingReturn = myReturns.find(r => r.order_id === order.id && r.status !== "rejected");
                                      
                                      if (isDeliveredOrCompleted && isWithin7Days) {
                                        if (matchingReturn) {
                                          const statusLabel: Record<string, string> = {
                                            pending: "Return Pending Review ⏳",
                                            approved_replacement: "Replacement Sent 📦",
                                            approved_refund: "Refund Issued 💳",
                                          };
                                          return (
                                            <span className="inline-flex items-center gap-1 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 rounded-xl border border-slate-200">
                                              {statusLabel[matchingReturn.status] || "Returned"}
                                            </span>
                                          );
                                        }
                                        return (
                                          <button
                                            onClick={() => handleInitiateReturn(order)}
                                            className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-orange-650 hover:text-white bg-orange-50 hover:bg-orange-550 border border-orange-200 hover:border-orange-500 rounded-xl transition-all duration-300 cursor-pointer shadow-sm shadow-orange-500/5 hover:shadow-md hover:shadow-orange-500/20 hover:-translate-y-0.5 active:translate-y-0"
                                          >
                                            <Undo className="h-3.5 w-3.5" />
                                            Request Return / Replacement
                                          </button>
                                        );
                                      }
                                      return null;
                                    })()}
                                  </div>
                                  <div className="text-right">
                                    <span className="text-sm font-bold text-slate-900">
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
                      <h3 className="text-xl font-bold text-slate-800">Notifications</h3>
                      <p className="text-xs text-slate-400 mt-0.5">Stay updated with shipping tracking alerts</p>
                    </div>
                    <button className="text-xs font-semibold uppercase tracking-wider text-orange-500 hover:text-orange-650 transition cursor-pointer">
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
                        <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider mt-2 inline-block">2 Hours Ago</span>
                      </div>
                    </div>

                    <div className="flex gap-4.5 p-5 bg-slate-50/40 border border-slate-100 rounded-2xl hover:border-orange-200 transition duration-300">
                      <div className="h-10 w-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-500 shrink-0 shadow-sm">
                        <Truck className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-800">Order Dispatched</h4>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">Your order #GRV-2041 is out for delivery with our rider.</p>
                        <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider mt-2 inline-block">1 Day Ago</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* RETURNS & REPLACEMENTS TAB */}
              {activeTab === "returns" && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="border-b border-slate-100 pb-5">
                    <h3 className="text-xl font-bold text-slate-800">Returns & Replacements</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Track your submitted return and replacement requests</p>
                  </div>

                  {returnsLoading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                      <Loader2 className="h-8 w-8 text-orange-500 animate-spin" />
                      <p className="text-xs text-slate-400 mt-3 font-semibold uppercase tracking-wider">Loading return history...</p>
                    </div>
                  ) : myReturns.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 px-4 bg-slate-50/30 border border-dashed border-slate-200 rounded-3xl text-center">
                      <div className="h-14 w-14 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-500 mb-4 shadow-sm">
                        <Undo className="h-6 w-6" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-800">No Return Requests</h4>
                      <p className="text-xs text-slate-500 mt-1 max-w-sm leading-relaxed">
                        You have not submitted any return or replacement requests. Active requests will be listed here.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4.5">
                      {myReturns.map((req) => {
                        const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
                          pending: { label: "Pending Review", color: "text-amber-600", bg: "bg-amber-50 border-amber-200" },
                          approved_replacement: { label: "Approved - Replacement Sent", color: "text-green-600", bg: "bg-green-50 border-green-200" },
                          approved_refund: { label: "Approved - Refund Issued", color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200" },
                          rejected: { label: "Request Rejected", color: "text-red-650", bg: "bg-red-50 border-red-200" },
                        };
                        const cfg = statusConfig[req.status] || { label: req.status, color: "text-slate-600", bg: "bg-slate-50 border-slate-200" };

                        return (
                          <div key={req.id} className="bg-white border border-slate-100 hover:border-slate-200/80 rounded-2xl shadow-sm overflow-hidden transition-all duration-300">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-slate-50/20 border-b border-slate-100">
                              <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Request ID</span>
                                <span className="text-sm font-extrabold text-slate-800">#RET-{req.id}</span>
                              </div>
                              <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Associated Order</span>
                                <span className="text-xs font-bold text-slate-700">{req.order?.order_number || "—"}</span>
                              </div>
                              <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Requested Action</span>
                                <span className="inline-flex items-center text-xs font-bold text-orange-650 capitalize bg-orange-50 border border-orange-100 px-2.5 py-0.5 rounded-lg mt-0.5">
                                  {req.type}
                                </span>
                              </div>
                              <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Date Submitted</span>
                                <span className="text-xs font-bold text-slate-600">
                                  {new Date(req.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                                </span>
                              </div>
                              <div>
                                <span className={`inline-flex items-center gap-1.5 text-[9px] font-bold px-3 py-1 rounded-full border uppercase tracking-wider ${cfg.bg} ${cfg.color}`}>
                                  {cfg.label}
                                </span>
                              </div>
                            </div>

                            <div className="p-5 space-y-4">
                              <div className="flex gap-4">
                                <div className="h-16 w-16 bg-slate-50 border border-slate-100 rounded-xl overflow-hidden shrink-0 flex items-center justify-center relative">
                                  <img
                                    src={req.orderItem?.product?.main_image_url || "/images/placeholder.jpg"}
                                    alt={req.orderItem?.product?.title || "Product"}
                                    className="object-contain max-h-full max-w-full"
                                  />
                                </div>
                                <div>
                                  <h5 className="text-sm font-bold text-slate-800">{req.orderItem?.product?.title || "Product Item"}</h5>
                                  <div className="flex flex-wrap gap-2.5 mt-1.5">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                      Quantity: <span className="text-slate-700 font-bold">{req.quantity}</span>
                                    </span>
                                    {req.orderItem && (
                                      <>
                                        {req.orderItem.selected_color && (
                                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                            Color: <span className="text-slate-700 font-bold">{req.orderItem.selected_color}</span>
                                          </span>
                                        )}
                                        {req.orderItem.selected_storage && (
                                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                            Storage: <span className="text-slate-700 font-bold">{req.orderItem.selected_storage}</span>
                                          </span>
                                        )}
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="pt-3 border-t border-slate-100 flex flex-col md:flex-row md:items-start justify-between gap-4">
                                <div className="max-w-xl space-y-2">
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                    Reason: <span className="text-slate-800 font-bold text-xs capitalize">{req.reason.replace("_", " ")}</span>
                                  </span>
                                  {req.description && (
                                    <p className="text-xs text-slate-500 bg-slate-50/50 p-3 border border-slate-100 rounded-xl leading-relaxed italic">
                                      "{req.description}"
                                    </p>
                                  )}
                                </div>
                                {req.images && req.images.length > 0 && (
                                  <div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Uploaded Proof</span>
                                    <div className="flex gap-2">
                                      {req.images.map((img, idx) => (
                                        <a key={idx} href={img} target="_blank" rel="noopener noreferrer" className="h-11 w-11 bg-slate-50 border border-slate-200 hover:border-orange-500 rounded-lg overflow-hidden shrink-0 flex items-center justify-center cursor-zoom-in transition-all">
                                          <img src={img} alt="proof" className="object-cover h-full w-full" />
                                        </a>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>

                              {req.admin_notes && (
                                <div className="bg-orange-50/30 border border-orange-100 rounded-xl p-4 mt-3">
                                  <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider block mb-1">Response from Griva Support:</span>
                                  <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">{req.admin_notes}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* SUPPORT CENTER TAB */}
              {activeTab === "support" && (
                <div className="space-y-8 animate-fadeIn">
                  <div className="border-b border-slate-100 pb-5">
                    <h3 className="text-xl font-bold text-slate-800">Support Center</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Need help with order status, payments or returns?</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="p-6 rounded-2xl border border-slate-100 bg-slate-50/30 flex gap-4.5 hover:border-orange-200 hover:shadow-sm transition-all duration-300">
                      <div className="h-11 w-11 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600 shrink-0 shadow-sm">
                        <MessageSquare className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-slate-800">Live Help Chat</h4>
                        <p className="text-xs text-slate-450 leading-relaxed mt-1">Talk with support desk agents live.</p>
                        <button className="mt-4 text-xs font-semibold uppercase tracking-wider text-orange-500 hover:text-orange-650 flex items-center gap-1 cursor-pointer">
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
                        <h4 className="text-sm font-semibold text-slate-800">WhatsApp Helpdesk</h4>
                        <p className="text-xs text-slate-455 leading-relaxed mt-1">Instant support assistance via WhatsApp messaging.</p>
                        <span className="mt-4 text-xs font-semibold uppercase tracking-wider text-green-600 flex items-center gap-1">
                          Message Now <ChevronRight className="h-3.5 w-3.5" />
                        </span>
                      </div>
                    </a>

                    <div className="p-6 rounded-2xl border border-slate-100 bg-slate-50/30 flex gap-4.5 hover:border-orange-200 hover:shadow-sm transition-all duration-300">
                      <div className="h-11 w-11 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600 shrink-0 shadow-sm">
                        <HelpCircle className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-slate-800">Help Center FAQs</h4>
                        <p className="text-xs text-slate-450 leading-relaxed mt-1">Instant support answers on returns, delivery, and payments.</p>
                        <button onClick={() => router.push("/faq")} className="mt-4 text-xs font-semibold uppercase tracking-wider text-orange-500 hover:text-orange-650 flex items-center gap-1 cursor-pointer">
                          Browse FAQs <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="p-6 rounded-2xl border border-slate-100 bg-slate-50/30 flex gap-4.5 hover:border-orange-200 hover:shadow-sm transition-all duration-300">
                      <div className="h-11 w-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0 shadow-sm">
                        <Undo className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-slate-800">Easy Returns</h4>
                        <p className="text-xs text-slate-455 leading-relaxed mt-1">Initiate and monitor product returns queries.</p>
                        <button onClick={() => router.push("/returns")} className="mt-4 text-xs font-semibold uppercase tracking-wider text-orange-500 hover:text-orange-650 flex items-center gap-1 cursor-pointer">
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

        {/* RETURN & REPLACEMENT REQUEST MODAL */}
        {isReturnModalOpen && selectedReturnOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col animate-scaleUp">
              
              {/* Modal Header */}
              <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div>
                  <h3 className="text-base font-extrabold text-slate-800">Request Return / Replacement</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Order: {selectedReturnOrder.order_number}</p>
                </div>
                <button
                  onClick={() => setIsReturnModalOpen(false)}
                  className="h-8 w-8 rounded-full hover:bg-slate-200/60 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              {/* Modal Body (Scrollable form) */}
              <form onSubmit={handleSubmitReturn} className="flex-1 overflow-y-auto p-6 space-y-5">
                
                {/* 1. Item Selection */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Select Item to Return</label>
                  <div className="space-y-2.5">
                    {selectedReturnOrder.items.map((item) => {
                      const isSelected = returnOrderItemId === item.id;
                      return (
                        <div
                          key={item.id}
                          onClick={() => {
                            setReturnOrderItemId(item.id);
                            setReturnQuantity(1); // reset qty to 1
                          }}
                          className={`flex items-center gap-3.5 p-3 rounded-2xl border-2 transition-all cursor-pointer ${
                            isSelected
                              ? "border-orange-500 bg-orange-50/10 shadow-sm"
                              : "border-slate-100 hover:border-slate-200 bg-slate-50/30"
                          }`}
                        >
                          <div className="h-12 w-12 bg-white border border-slate-100 rounded-xl overflow-hidden shrink-0 flex items-center justify-center relative">
                            <img
                              src={item.product?.main_image_url || "/images/placeholder.jpg"}
                              alt={item.product?.title || "Product"}
                              className="object-contain max-h-full max-w-full"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-bold text-slate-800 truncate">{item.product?.title || "Product Item"}</h4>
                            <div className="flex gap-2 mt-1 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                              <span>Qty: {item.quantity}</span>
                              {item.selected_color && <span>• Color: {item.selected_color}</span>}
                              {item.selected_storage && <span>• Storage: {item.selected_storage}</span>}
                            </div>
                          </div>
                          <div className={`h-4.5 w-4.5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                            isSelected ? "border-orange-500 bg-orange-500 text-white" : "border-slate-350"
                          }`}>
                            {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Selected Item Quantity selection if selected item quantity > 1 */}
                {(() => {
                  const selectedItem = selectedReturnOrder.items.find(i => i.id === returnOrderItemId);
                  if (!selectedItem || selectedItem.quantity <= 1) return null;
                  return (
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Return Quantity</label>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          disabled={returnQuantity <= 1}
                          onClick={() => setReturnQuantity(prev => Math.max(1, prev - 1))}
                          className="h-9 w-9 rounded-xl border border-slate-200 flex items-center justify-center font-bold text-slate-650 hover:bg-slate-50 disabled:opacity-40 transition-colors cursor-pointer"
                        >
                          -
                        </button>
                        <span className="text-sm font-extrabold text-slate-800 w-8 text-center">{returnQuantity}</span>
                        <button
                          type="button"
                          disabled={returnQuantity >= selectedItem.quantity}
                          onClick={() => setReturnQuantity(prev => Math.min(selectedItem.quantity, prev + 1))}
                          className="h-9 w-9 rounded-xl border border-slate-200 flex items-center justify-center font-bold text-slate-650 hover:bg-slate-50 disabled:opacity-40 transition-colors cursor-pointer"
                        >
                          +
                        </button>
                        <span className="text-xs text-slate-400 font-semibold">Max: {selectedItem.quantity} units</span>
                      </div>
                    </div>
                  );
                })()}

                {/* 2. Request Action/Type (Replacement vs Refund) */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Desired Outcome</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setReturnType("replacement")}
                      className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all text-center cursor-pointer ${
                        returnType === "replacement"
                          ? "border-orange-500 bg-orange-50/10"
                          : "border-slate-100 hover:border-slate-200 bg-slate-50/30 text-slate-500"
                      }`}
                    >
                      <span className="text-xs font-bold text-slate-800">Direct Replacement</span>
                      <span className="text-[9px] text-slate-400 mt-0.5">Send a new item to my address</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setReturnType("refund")}
                      className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all text-center cursor-pointer ${
                        returnType === "refund"
                          ? "border-orange-500 bg-orange-50/10"
                          : "border-slate-100 hover:border-slate-200 bg-slate-50/30 text-slate-500"
                      }`}
                    >
                      <span className="text-xs font-bold text-slate-800">Full Refund</span>
                      <span className="text-[9px] text-slate-400 mt-0.5">Refund payment value back</span>
                    </button>
                  </div>
                </div>

                {/* 3. Reason selection */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Reason for return</label>
                  <select
                    value={returnReason}
                    onChange={(e: any) => setReturnReason(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-orange-500 transition-colors"
                  >
                    <option value="damaged" className="text-slate-900 bg-white font-medium">Damaged on arrival (Proof required)</option>
                    <option value="defective" className="text-slate-900 bg-white font-medium">Defective / Faulty Item (Proof required)</option>
                    <option value="wrong_item" className="text-slate-900 bg-white font-medium">Wrong Item Sent</option>
                    <option value="changed_mind" className="text-slate-900 bg-white font-medium">Changed Mind</option>
                    <option value="other" className="text-slate-900 bg-white font-medium">Other reason</option>
                  </select>
                </div>

                {/* 4. Description */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Provide Additional Context</label>
                  <textarea
                    rows={3}
                    value={returnDescription}
                    onChange={(e) => setReturnDescription(e.target.value)}
                    placeholder="Describe any specifics about the issue..."
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-500 transition-colors resize-none"
                  />
                </div>

                {/* 5. Photo Upload Proof */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Upload Photos / Proof
                      {["damaged", "defective"].includes(returnReason) && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    {isUploadingReturnPhoto && (
                      <span className="text-[10px] font-bold text-orange-500 flex items-center gap-1">
                        <Loader2 className="h-3 w-3 animate-spin" /> Uploading...
                      </span>
                    )}
                  </div>
                  
                  {/* Photo upload dropzone/input */}
                  <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-slate-200 hover:border-orange-300 rounded-2xl cursor-pointer hover:bg-slate-50 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-4 pb-4">
                      <Upload className="w-5 h-5 text-slate-400 mb-1" />
                      <p className="text-[10px] text-slate-400 font-semibold">Click to select files (Max 5MB)</p>
                    </div>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleReturnPhotoUpload}
                      disabled={isUploadingReturnPhoto}
                      className="hidden"
                    />
                  </label>

                  {/* Thumbnail list */}
                  {returnImages.length > 0 && (
                    <div className="flex flex-wrap gap-2.5 pt-1.5">
                      {returnImages.map((img, idx) => (
                        <div key={idx} className="h-14 w-14 rounded-xl border border-slate-200 overflow-hidden relative group">
                          <img src={img} alt="preview" className="object-cover h-full w-full" />
                          <button
                            type="button"
                            onClick={() => setReturnImages(prev => prev.filter((_, i) => i !== idx))}
                            className="absolute inset-0 bg-black/40 items-center justify-center text-white hidden group-hover:flex transition-all cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5 text-white" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Mandatory caution message */}
                  {["damaged", "defective"].includes(returnReason) && returnImages.length === 0 && (
                    <p className="text-[10px] font-bold text-red-500 bg-red-50 border border-red-100 rounded-xl p-2.5">
                      ⚠️ Proof photos showing the defect or damage are strictly required to proceed.
                    </p>
                  )}
                </div>

                {/* Form level error */}
                {returnFormError && (
                  <div className="text-[11px] font-bold text-red-650 bg-red-50 border border-red-200 rounded-xl p-3">
                    {returnFormError}
                  </div>
                )}

                {/* Footer Buttons */}
                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsReturnModalOpen(false)}
                    className="flex-1 py-3 text-xs font-bold uppercase tracking-wider text-slate-650 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer text-center"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingReturn || isUploadingReturnPhoto || (["damaged", "defective"].includes(returnReason) && returnImages.length === 0)}
                    className="flex-1 py-3 text-xs font-bold uppercase tracking-wider text-white bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all cursor-pointer text-center flex items-center justify-center gap-1.5 shadow-lg shadow-orange-500/20"
                  >
                    {isSubmittingReturn && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    Submit Request
                  </button>
                </div>

              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}