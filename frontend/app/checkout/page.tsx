"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/app/context/UserContext";
import { useCart } from "@/app/context/CartContext";
import { addressService } from "@/app/services/address.service";
import { orderService } from "@/app/services/order.service";
import { Address, CartState } from "@/app/types/types";
import SectionHeading from "@/app/components/common/SectionHeading";
import {
  Loader2,
  MapPin,
  AlertCircle,
  User,
  Phone,
  Mail,
  Building2,
  MapPinned,
  Truck,
  CreditCard,
  ShoppingBag,
  CheckCircle,
  ChevronRight,
  Trash2,
  Clock,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// ─────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────
interface ShippingConfig {
  shippingFee: number;
  freeShippingThreshold: number;
  whatsappNumber: string;
}

interface CheckoutForm {
  fullName: string;
  phone: string;
  email: string;
  area: string;
  street: string;
  buildingNumber: string;
  villaApartment: string;
  floor: string;
  landmark: string;
  deliveryNotes: string;
  deliverySlotId: string;
}

const INITIAL_FORM: CheckoutForm = {
  fullName: "",
  phone: "+974",
  email: "",
  area: "",
  street: "",
  buildingNumber: "",
  villaApartment: "",
  floor: "",
  landmark: "",
  deliveryNotes: "",
  deliverySlotId: "",
};

// ─────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────
export default function CheckoutPage() {
  const { state: userState, isAuthenticated, isCustomer } = useUser();
  const { state: cartState, dispatch: cartDispatch } = useCart();
  const router = useRouter();

  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [stockErrors, setStockErrors] = useState<Record<number, { title: string; availableStock: number }>>({});
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof CheckoutForm, string>>>({});

  // Frozen cart state to prevent UI reset during order placement transitions
  const [frozenCart, setFrozenCart] = useState<CartState | null>(null);
  const activeCart = frozenCart || cartState;

  // Form state
  const [form, setForm] = useState<CheckoutForm>(INITIAL_FORM);
  const [deliverySlots, setDeliverySlots] = useState<any[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);

  // Saved addresses (logged-in users)
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [useNewAddress, setUseNewAddress] = useState(false);

  // Shipping config from backend
  const [shippingConfig, setShippingConfig] = useState<ShippingConfig>({
    shippingFee: 15,
    freeShippingThreshold: 150,
    whatsappNumber: "+97455551234",
  });

  const isLoggedIn = isAuthenticated && isCustomer;

  // Fetch site settings and active delivery slots
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings`);
        if (res.ok) {
          const data = await res.json();
          const s = data.settings;
          if (s) {
            setShippingConfig({
              shippingFee: parseFloat(s.shippingFee) || 15,
              freeShippingThreshold: parseFloat(s.freeShippingThreshold) || 150,
              whatsappNumber: s.whatsappNumber || "+97455551234",
            });
          }
        }
      } catch {
        // Use defaults silently
      }
    };

    const fetchSlots = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/delivery-slots`);
        if (res.ok) {
          const data = await res.json();
          const activeSlots = data.slots?.filter((s: any) => s.is_active) || [];
          setDeliverySlots(activeSlots);
        }
      } catch {
        // Fail silently
      }
    };

    fetchSettings();
    fetchSlots();
  }, []);

  // Pre-fill form for logged-in users
  useEffect(() => {
    if (isLoggedIn && userState.user) {
      setForm((prev) => ({
        ...prev,
        fullName: prev.fullName || userState.user?.name || "",
        email: prev.email || userState.user?.email || "",
      }));
    }
  }, [isLoggedIn, userState.user]);

  // Fetch saved addresses for logged-in users
  useEffect(() => {
    if (!isLoggedIn) return;
    const fetchAddresses = async () => {
      setAddressesLoading(true);
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
        const defaultAddr = result.find((a: Address) => a.isDefault);
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr.id);
        } else if (result.length > 0) {
          setSelectedAddressId(result[0].id);
        } else {
          setUseNewAddress(true);
        }
      } catch {
        setUseNewAddress(true);
      } finally {
        setAddressesLoading(false);
      }
    };
    fetchAddresses();
  }, [isLoggedIn]);

  // Redirect if cart is empty (but not while placing order)
  useEffect(() => {
    if (isPlacingOrder) return;
    if (cartState.items.length === 0) {
      router.push("/cart");
    }
  }, [cartState.items.length, router, isPlacingOrder]);

  if (!isPlacingOrder && cartState.items.length === 0) {
    return null;
  }

  // Calculate totals
  const shippingCost =
    activeCart.totalPrice >= shippingConfig.freeShippingThreshold || activeCart.totalPrice === 0
      ? 0
      : shippingConfig.shippingFee;
  const orderTotal = activeCart.totalPrice + shippingCost;

  // Selected saved address
  const selectedAddress = addresses.find((a) => a.id === selectedAddressId);

  // Form field handler
  const updateForm = (field: keyof CheckoutForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // Stock error helpers
  const activeStockErrors = Object.keys(stockErrors).filter((id) =>
    activeCart.items.some((item) => item.productId === Number(id))
  );
  const hasStockErrors = activeStockErrors.length > 0;

  const handleUpdateStockQty = (itemId: number, productId: number, availableStock: number) => {
    cartDispatch({
      type: "UPDATE_QTY",
      payload: { id: itemId, quantity: availableStock },
    });
    setStockErrors((prev) => {
      const next = { ...prev };
      delete next[productId];
      return next;
    });
    // Clear top error message if there are no more active stock errors
    const remaining = Object.keys(stockErrors).filter(
      (id) => Number(id) !== productId && activeCart.items.some((item) => item.productId === Number(id))
    );
    if (remaining.length === 0) {
      setOrderError("");
    }
  };

  const handleRemoveStockItem = (itemId: number, productId: number) => {
    cartDispatch({
      type: "REMOVE",
      payload: { id: itemId },
    });
    setStockErrors((prev) => {
      const next = { ...prev };
      delete next[productId];
      return next;
    });
    // Clear top error message if there are no more active stock errors
    const remaining = Object.keys(stockErrors).filter(
      (id) => Number(id) !== productId && activeCart.items.some((item) => item.productId === Number(id))
    );
    if (remaining.length === 0) {
      setOrderError("");
    }
  };

  // Validation
  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof CheckoutForm, string>> = {};

    // If logged in and using saved address, only validate contact info
    const needsAddressValidation = !isLoggedIn || useNewAddress || !selectedAddress;

    if (!form.fullName.trim()) errors.fullName = "Full name is required";
    if (!form.phone.trim() || form.phone.trim().length < 8) errors.phone = "Valid phone number is required";
    
    if (!form.email.trim()) {
      errors.email = "Email address is required";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(form.email.trim())) {
        errors.email = "Invalid email address format";
      }
    }

    if (needsAddressValidation) {
      if (!form.area.trim()) errors.area = "Area is required";
      if (!form.street.trim()) errors.street = "Street is required";
      if (!form.buildingNumber.trim()) errors.buildingNumber = "Building number is required";
    }

    if (!selectedSlotId) {
      errors.deliverySlotId = "Preferred delivery slot is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Build address string
  const buildShippingAddress = (): string => {
    if (isLoggedIn && !useNewAddress && selectedAddress) {
      const parts = [
        selectedAddress.building_number && `Bldg ${selectedAddress.building_number}`,
        selectedAddress.villa_apartment,
        selectedAddress.street,
        selectedAddress.area,
        selectedAddress.floor && `Floor ${selectedAddress.floor}`,
        selectedAddress.landmark && `Near ${selectedAddress.landmark}`,
        selectedAddress.zone && `Zone ${selectedAddress.zone}`,
        selectedAddress.city,
        selectedAddress.country,
      ].filter(Boolean);
      return parts.join(", ");
    }

    const parts = [
      form.buildingNumber && `Bldg ${form.buildingNumber}`,
      form.villaApartment,
      form.street,
      form.area,
      form.floor && `Floor ${form.floor}`,
      form.landmark && `Near ${form.landmark}`,
      "Doha",
      "Qatar",
    ].filter(Boolean);
    return parts.join(", ");
  };

  // Place order handler
  const handlePlaceOrder = async () => {
    if (!validateForm()) {
      setOrderError("Please fill in all required fields.");
      return;
    }

    setFrozenCart(cartState);
    setIsPlacingOrder(true);
    setOrderError("");

    try {
      const customerName =
        isLoggedIn && !useNewAddress && selectedAddress
          ? selectedAddress.fullName
          : form.fullName;
      const customerPhone =
        isLoggedIn && !useNewAddress && selectedAddress
          ? form.phone || selectedAddress.mobile
          : form.phone;
      const customerCity =
        isLoggedIn && !useNewAddress && selectedAddress
          ? selectedAddress.city
          : "Doha";

      const response = await orderService.createOrder({
        items: cartState.items.map((item) => ({
          product_id: item.productId,
          quantity: item.quantity,
          selectedColor: item.selectedColor,
          selectedStorage: item.selectedStorage,
        })),
        shipping_address: buildShippingAddress(),
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_email: form.email || userState.user?.email || "",
        payment_method: "COD",
        delivery_notes: form.deliveryNotes || undefined,
        city: customerCity,
        delivery_slot_id: selectedSlotId || undefined,
      });

      if (response.success) {
        // Save guest order reference for tracking
        try {
          const guestRef = {
            order_number: response.order.order_number,
            phone: customerPhone,
            total: response.order.total_price,
            date: new Date().toISOString(),
          };
          localStorage.setItem("griva-last-order", JSON.stringify(guestRef));

          if (!isLoggedIn) {
            const existingOrdersStr = localStorage.getItem("griva-guest-orders");
            let guestOrders = [];
            if (existingOrdersStr) {
              try {
                guestOrders = JSON.parse(existingOrdersStr);
                if (!Array.isArray(guestOrders)) guestOrders = [];
              } catch {}
            }
            guestOrders = [guestRef, ...guestOrders].filter((item: any, index: number, self: any[]) =>
              self.findIndex(t => t.order_number === item.order_number) === index
            ).slice(0, 10);
            localStorage.setItem("griva-guest-orders", JSON.stringify(guestOrders));
          }
        } catch {}

        // Clear frontend cart state
        cartDispatch({ type: "CLEAR" });

        // Navigate to success page
        const selectedSlot = deliverySlots.find((s) => s.id === selectedSlotId);
        const slotParam = selectedSlot ? encodeURIComponent(selectedSlot.name) : "";
        router.push(
          `/order-success?order=${encodeURIComponent(response.order.order_number)}&total=${encodeURIComponent(response.order.total_price)}&slot=${slotParam}`
        );
      } else {
        setOrderError(response.message || "Failed to place order. Please try again.");
        setIsPlacingOrder(false);
        setFrozenCart(null);
      }
    } catch (error: any) {
      const errMsg =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Something went wrong. Please try again.";

      const code = error.response?.data?.code;
      const details = error.response?.data?.details;

      if (code === "INSUFFICIENT_STOCK" && details) {
        setStockErrors((prev) => ({
          ...prev,
          [details.productId]: {
            title: details.title,
            availableStock: details.availableStock,
          },
        }));
      } else {
        // Fallback regex matching
        const regex = /Insufficient stock for '(.+?)'\. Only (\d+) units available\./;
        const match = errMsg.match(regex);
        if (match) {
          const title = match[1];
          const availableStock = parseInt(match[2], 10);
          const item = cartState.items.find((i) => i.title === title);
          if (item) {
            setStockErrors((prev) => ({
              ...prev,
              [item.productId]: { title, availableStock },
            }));
          }
        }
      }

      setOrderError(errMsg);
      setIsPlacingOrder(false);
      setFrozenCart(null);
    }
  };

  // ─────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────
  return (
    <div className="bg-gray-50/50 min-h-screen py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading title="Checkout" subtitle="Complete your order" />

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 mt-6 mb-8">
          {["Cart", "Checkout", "Confirmation"].map((step, idx) => (
            <div key={step} className="flex items-center gap-2">
              <div
                className={`flex items-center justify-center h-7 w-7 rounded-full text-xs font-black transition-all ${
                  idx <= 1
                    ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
                    : "bg-gray-200 text-gray-400"
                }`}
              >
                {idx < 1 ? <CheckCircle className="h-3.5 w-3.5" /> : idx + 1}
              </div>
              <span
                className={`text-xs font-semibold hidden sm:inline ${
                  idx <= 1 ? "text-gray-900" : "text-gray-400"
                }`}
              >
                {step}
              </span>
              {idx < 2 && <ChevronRight className="h-3.5 w-3.5 text-gray-300" />}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* ─── Left Column: Forms ─── */}
          <div className="lg:col-span-7 space-y-6">
            {/* Error Banner */}
            {orderError && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3 animate-in fade-in-50 slide-in-from-top-2">
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-red-800">Order Failed</p>
                  <p className="text-sm text-red-600 mt-0.5">{orderError}</p>
                </div>
              </div>
            )}

            {/* ── Section 1: Contact Information ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-5 border-b pb-3">
                <div className="h-8 w-8 rounded-full bg-orange-50 flex items-center justify-center">
                  <User className="h-4 w-4 text-orange-500" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Contact Information</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">
                    Full Name <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Enter your full name"
                      value={form.fullName}
                      onChange={(e) => updateForm("fullName", e.target.value)}
                      className={`block w-full rounded-xl border ${
                        formErrors.fullName ? "border-red-300 bg-red-50/30" : "border-gray-200"
                      } pl-10 pr-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors`}
                    />
                  </div>
                  {formErrors.fullName && (
                    <p className="text-xs text-red-500 mt-1">{formErrors.fullName}</p>
                  )}
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">
                    Phone Number <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="tel"
                      placeholder="+974 XXXX XXXX"
                      value={form.phone}
                      onChange={(e) => updateForm("phone", e.target.value)}
                      className={`block w-full rounded-xl border ${
                        formErrors.phone ? "border-red-300 bg-red-50/30" : "border-gray-200"
                      } pl-10 pr-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors`}
                    />
                  </div>
                  {formErrors.phone && (
                    <p className="text-xs text-red-500 mt-1">{formErrors.phone}</p>
                  )}
                </div>

                {/* Email */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">
                    Email Address <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="email"
                      placeholder="your@email.com"
                      value={form.email}
                      onChange={(e) => updateForm("email", e.target.value)}
                      className={`block w-full rounded-xl border ${
                        formErrors.email ? "border-red-300 bg-red-50/30" : "border-gray-200"
                      } pl-10 pr-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors`}
                    />
                  </div>
                  {formErrors.email && (
                    <p className="text-xs text-red-500 mt-1">{formErrors.email}</p>
                  )}
                </div>
              </div>
            </div>

            {/* ── Section 2: Delivery Address ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-5 border-b pb-3">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-orange-50 flex items-center justify-center">
                    <MapPin className="h-4 w-4 text-orange-500" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Delivery Address</h3>
                </div>
                {isLoggedIn && addresses.length > 0 && (
                  <button
                    onClick={() => router.push("/account")}
                    className="text-xs font-semibold text-orange-500 hover:text-orange-600 transition cursor-pointer"
                  >
                    Manage Addresses
                  </button>
                )}
              </div>

              {/* Saved Address Picker (logged-in users with saved addresses) */}
              {isLoggedIn && !addressesLoading && addresses.length > 0 && (
                <div className="mb-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                      Saved Addresses
                    </span>
                  </div>

                  <div className="space-y-2">
                    {addresses.map((addr) => (
                      <div
                        key={addr.id}
                        onClick={() => {
                          setSelectedAddressId(addr.id);
                          setUseNewAddress(false);
                          // Pre-fill contact from address
                          setForm((prev) => ({
                            ...prev,
                            fullName: prev.fullName || addr.fullName,
                            phone: prev.phone === "+974" ? addr.mobile : prev.phone,
                          }));
                        }}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                          selectedAddressId === addr.id && !useNewAddress
                            ? "border-orange-500 bg-orange-50/50 shadow-sm shadow-orange-500/5"
                            : "border-gray-200 hover:border-orange-300"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="radio"
                            checked={selectedAddressId === addr.id && !useNewAddress}
                            readOnly
                            className="mt-0.5 text-orange-500 focus:ring-orange-500"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-semibold text-gray-900 text-sm">{addr.fullName}</p>
                              {addr.isDefault && (
                                <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 bg-orange-100 text-orange-600 border border-orange-200 rounded-full">
                                  Default
                                </span>
                              )}
                              <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 bg-gray-100 text-gray-500 border border-gray-200 rounded-full capitalize">
                                {addr.label}
                              </span>
                            </div>
                            <p className="text-gray-500 text-xs mt-0.5">{addr.mobile}</p>
                            <p className="text-gray-600 text-xs mt-1">
                              {[
                                addr.building_number && `Bldg ${addr.building_number}`,
                                addr.villa_apartment,
                                addr.street,
                                addr.area,
                              ]
                                .filter(Boolean)
                                .join(", ")}
                            </p>
                            <p className="text-gray-500 text-xs">
                              {addr.city}, {addr.country}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* New Address Option */}
                    <div
                      onClick={() => setUseNewAddress(true)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                        useNewAddress
                          ? "border-orange-500 bg-orange-50/50 shadow-sm shadow-orange-500/5"
                          : "border-gray-200 hover:border-orange-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          checked={useNewAddress}
                          readOnly
                          className="text-orange-500 focus:ring-orange-500"
                        />
                        <div className="flex items-center gap-2">
                          <MapPinned className="h-4 w-4 text-orange-500" />
                          <span className="text-sm font-semibold text-gray-700">
                            Deliver to a new address
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Loading saved addresses */}
              {isLoggedIn && addressesLoading && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 text-orange-500 animate-spin" />
                  <span className="ml-2 text-sm text-gray-500">Loading saved addresses...</span>
                </div>
              )}

              {/* Inline Address Form (guests, or logged-in with "new address" selected) */}
              {(!isLoggedIn || useNewAddress || addresses.length === 0) && !addressesLoading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Area */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">
                      Area / District <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="e.g. Al Sadd, The Pearl, West Bay"
                        value={form.area}
                        onChange={(e) => updateForm("area", e.target.value)}
                        className={`block w-full rounded-xl border ${
                          formErrors.area ? "border-red-300 bg-red-50/30" : "border-gray-200"
                        } pl-10 pr-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors`}
                      />
                    </div>
                    {formErrors.area && (
                      <p className="text-xs text-red-500 mt-1">{formErrors.area}</p>
                    )}
                  </div>

                  {/* Street */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">
                      Street <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Street name or number"
                      value={form.street}
                      onChange={(e) => updateForm("street", e.target.value)}
                      className={`block w-full rounded-xl border ${
                        formErrors.street ? "border-red-300 bg-red-50/30" : "border-gray-200"
                      } px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors`}
                    />
                    {formErrors.street && (
                      <p className="text-xs text-red-500 mt-1">{formErrors.street}</p>
                    )}
                  </div>

                  {/* Building Number */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">
                      Building Number <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Building number"
                        value={form.buildingNumber}
                        onChange={(e) => updateForm("buildingNumber", e.target.value)}
                        className={`block w-full rounded-xl border ${
                          formErrors.buildingNumber ? "border-red-300 bg-red-50/30" : "border-gray-200"
                        } pl-10 pr-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors`}
                      />
                    </div>
                    {formErrors.buildingNumber && (
                      <p className="text-xs text-red-500 mt-1">{formErrors.buildingNumber}</p>
                    )}
                  </div>

                  {/* Villa / Apartment */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">
                      Villa / Apartment <span className="text-gray-400 normal-case font-normal">(optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Villa or apartment number"
                      value={form.villaApartment}
                      onChange={(e) => updateForm("villaApartment", e.target.value)}
                      className="block w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                    />
                  </div>

                  {/* Floor */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">
                      Floor <span className="text-gray-400 normal-case font-normal">(optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Floor number"
                      value={form.floor}
                      onChange={(e) => updateForm("floor", e.target.value)}
                      className="block w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                    />
                  </div>

                  {/* Landmark */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">
                      Landmark <span className="text-gray-400 normal-case font-normal">(optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Nearby landmark"
                      value={form.landmark}
                      onChange={(e) => updateForm("landmark", e.target.value)}
                      className="block w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                    />
                  </div>

                  {/* Delivery Notes */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">
                      Delivery Notes <span className="text-gray-400 normal-case font-normal">(optional)</span>
                    </label>
                    <textarea
                      placeholder="Any special instructions for delivery..."
                      value={form.deliveryNotes}
                      onChange={(e) => updateForm("deliveryNotes", e.target.value)}
                      rows={2}
                      className="block w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors resize-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* ── Section: Preferred Delivery Time ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 animate-in fade-in duration-300">
              <div className="flex items-center gap-2 mb-5 border-b pb-3">
                <div className="h-8 w-8 rounded-full bg-orange-50 flex items-center justify-center">
                  <Clock className="h-4 w-4 text-orange-500" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Preferred Delivery Time</h3>
              </div>

              {deliverySlots.length === 0 ? (
                <div className="text-center py-6 text-xs text-gray-400">
                  Loading active delivery slots...
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {deliverySlots.map((slot) => (
                    <div
                      key={slot.id}
                      onClick={() => {
                        setSelectedSlotId(slot.id);
                        if (formErrors.deliverySlotId) {
                          setFormErrors((prev) => ({ ...prev, deliverySlotId: undefined }));
                        }
                      }}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${
                        selectedSlotId === slot.id
                          ? "border-orange-500 bg-orange-50/50 shadow-sm shadow-orange-500/5"
                          : "border-gray-200 hover:border-orange-300"
                      }`}
                    >
                      <input
                        type="radio"
                        checked={selectedSlotId === slot.id}
                        readOnly
                        className="text-orange-500 focus:ring-orange-500"
                      />
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{slot.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {formErrors.deliverySlotId && (
                <p className="text-xs text-red-500 mt-2">{formErrors.deliverySlotId}</p>
              )}
            </div>

            {/* ── Section 3: Payment Method ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-5 border-b pb-3">
                <div className="h-8 w-8 rounded-full bg-orange-50 flex items-center justify-center">
                  <CreditCard className="h-4 w-4 text-orange-500" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Payment Method</h3>
              </div>

              <div className="flex items-center gap-3 p-4 border-2 border-orange-500 bg-orange-50/50 rounded-xl">
                <input
                  type="radio"
                  id="cod"
                  name="payment"
                  checked
                  readOnly
                  className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300"
                />
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-orange-600" />
                  <label htmlFor="cod" className="font-semibold text-orange-900">
                    Cash on Delivery (COD)
                  </label>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2 ml-7">
                Pay with cash upon delivery. No upfront payment required.
              </p>

              {!isLoggedIn && (
                <div className="mt-4 p-3 bg-blue-50/50 border border-blue-100 rounded-xl">
                  <p className="text-xs text-blue-700">
                    <strong>Already have an account?</strong>{" "}
                    <Link href="/auth/login" className="font-bold text-blue-600 underline hover:text-blue-700">
                      Log in
                    </Link>{" "}
                    for faster checkout with saved addresses.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ─── Right Column: Order Summary ─── */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5 sticky top-24">
              <div className="flex items-center gap-2 border-b pb-4">
                <ShoppingBag className="h-4 w-4 text-orange-500" />
                <h3 className="text-base font-bold text-gray-900">Order Summary</h3>
                <span className="ml-auto text-xs font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                  {activeCart.totalItems} item{activeCart.totalItems !== 1 ? "s" : ""}
                </span>
              </div>

              {/* Items */}
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {activeCart.items.map((item) => {
                  const stockErr = stockErrors[item.productId];
                  return (
                    <div key={item.id} className="flex items-start gap-3">
                      <div className="relative h-14 w-14 shrink-0 rounded-lg border border-gray-100 bg-gray-50 p-1 overflow-hidden mt-0.5">
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          sizes="56px"
                          className="object-contain"
                        />
                        <span className="absolute -top-1 -right-1 h-5 w-5 bg-orange-500 text-white text-[10px] font-black rounded-full flex items-center justify-center">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-900 truncate">{item.title}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {item.selectedColor && (
                            <span className="text-[9px] bg-gray-50 border px-1 py-0.5 rounded text-gray-400">
                              {item.selectedColor}
                            </span>
                          )}
                          {item.selectedStorage && (
                            <span className="text-[9px] bg-gray-50 border px-1 py-0.5 rounded text-gray-400">
                              {item.selectedStorage}
                            </span>
                          )}
                        </div>

                        {stockErr && (
                          <div className="mt-2 bg-red-50 border border-red-100 rounded-xl p-2.5 space-y-2 animate-in fade-in-50 slide-in-from-top-1">
                            <div className="flex items-center gap-1.5 text-red-600">
                              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                              <span className="text-[11px] font-bold">
                                {stockErr.availableStock === 0
                                  ? "Out of Stock"
                                  : `Only ${stockErr.availableStock} available`}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                              {stockErr.availableStock > 0 && (
                                <button
                                  onClick={() => handleUpdateStockQty(item.id, item.productId, stockErr.availableStock)}
                                  className="text-[10px] bg-red-100 hover:bg-red-200 text-red-700 font-bold px-2 py-1 rounded-md transition-colors cursor-pointer"
                                >
                                  Update to {stockErr.availableStock}
                                </button>
                              )}
                              <button
                                onClick={() => handleRemoveStockItem(item.id, item.productId)}
                                className="text-[10px] flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-2 py-1 rounded-md transition-colors cursor-pointer"
                              >
                                <Trash2 className="h-3 w-3" />
                                Remove
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                      <span className="text-xs font-bold text-gray-900 shrink-0 mt-0.5">
                        QAR {(item.priceNumber * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Totals */}
              <div className="border-t pt-4 space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-900">
                    QAR {activeCart.totalPrice.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span className="flex items-center gap-1">
                    <Truck className="h-3.5 w-3.5" />
                    Delivery
                  </span>
                  <span className="font-semibold text-gray-900">
                    {shippingCost === 0 ? (
                      <span className="text-green-600">Free</span>
                    ) : (
                      `QAR ${shippingCost.toFixed(2)}`
                    )}
                  </span>
                </div>
                {shippingCost > 0 && (
                  <p className="text-[10px] text-green-600 text-right">
                    Free delivery on orders over QAR {shippingConfig.freeShippingThreshold.toFixed(0)}
                  </p>
                )}
                <div className="border-t pt-3 flex justify-between text-base font-bold text-gray-900">
                  <span>Total</span>
                  <span className="text-orange-500 text-lg">QAR {orderTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Stock Warning Sidebar Notice Card */}
              {hasStockErrors && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-start gap-2.5 animate-in fade-in-50 slide-in-from-bottom-2">
                  <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-amber-800">Resolve Stock Issues</p>
                    <p className="text-[11px] text-amber-600 mt-0.5 font-medium leading-relaxed">
                      Some items in your cart do not have enough stock available. Please update their quantities or remove them to place your order.
                    </p>
                  </div>
                </div>
              )}

              {/* Place Order Button */}
              <button
                onClick={handlePlaceOrder}
                disabled={isPlacingOrder || hasStockErrors}
                className={`w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold text-white transition-all shadow-lg ${
                  isPlacingOrder
                    ? "bg-gray-300 cursor-not-allowed shadow-none"
                    : hasStockErrors
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none border border-gray-300/50"
                    : "bg-orange-500 hover:bg-orange-600 shadow-orange-500/20 cursor-pointer active:scale-[0.98]"
                }`}
              >
                {isPlacingOrder && <Loader2 className="h-4 w-4 animate-spin" />}
                {isPlacingOrder
                  ? "Placing Order..."
                  : hasStockErrors
                  ? "Fix Cart Items to Place Order"
                  : `Place Order — QAR ${orderTotal.toFixed(2)}`}
              </button>

              <p className="text-center text-[10px] text-gray-400">
                By placing your order, you agree to our{" "}
                <Link href="/terms" className="underline hover:text-gray-600">
                  Terms & Conditions
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
