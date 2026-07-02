"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/app/context/UserContext";
import { useCart } from "@/app/context/CartContext";
import { addressService } from "@/app/services/address.service";
import { orderService } from "@/app/services/order.service";
import { cartService } from "@/app/services/cart.service";
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
  Tag,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { getSettingsApi, getDeliverySlotsApi } from "@/app/utils/api";
import { useToast } from "@/app/context/ToastContext";

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
  zone: string;
  street: string;
  buildingNumber: string;
  villaApartment: string;
  floor: string;
  landmark: string;
  deliveryNotes: string;
  deliverySlotId: string;
  latitude?: number;
  longitude?: number;
}

const INITIAL_FORM: CheckoutForm = {
  fullName: "",
  phone: "",
  email: "",
  area: "",
  zone: "",
  street: "",
  buildingNumber: "",
  villaApartment: "",
  floor: "",
  landmark: "",
  deliveryNotes: "",
  deliverySlotId: "",
  latitude: undefined,
  longitude: undefined,
};

const extractQatarLocalNumber = (phoneStr: string): string => {
  if (!phoneStr) return "";
  const cleaned = phoneStr.replace(/\D/g, ""); // only digits
  if (cleaned.startsWith("00974")) {
    return cleaned.slice(5).slice(0, 8);
  }
  if (cleaned.startsWith("974")) {
    return cleaned.slice(3).slice(0, 8);
  }
  return cleaned.slice(0, 8);
};

// ─────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────
export default function CheckoutPage() {
  const { state: userState, isAuthenticated, isCustomer } = useUser();
  const { state: cartState, dispatch: cartDispatch } = useCart();
  const router = useRouter();
  const { toast } = useToast();

  const [mounted, setMounted] = useState(false);
  const [isBuyNow, setIsBuyNow] = useState(false);
  const [buyNowItem, setBuyNowItem] = useState<any | null>(null);
  const [selectedItemIds, setSelectedItemIds] = useState<Set<number>>(new Set());

  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const isSubmitRef = useRef(false);
  const [orderError, setOrderError] = useState("");
  const [stockErrors, setStockErrors] = useState<Record<string | number, { title: string; availableStock: number }>>({});
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof CheckoutForm, string>>>({});
  const hasShownStockToastRef = useRef(false);

  useEffect(() => {
    setMounted(true);
    const params = new URLSearchParams(window.location.search);
    const buyNowParam = params.get("buyNow") === "true";
    if (buyNowParam) {
      setIsBuyNow(true);
      const stored = sessionStorage.getItem("griva-buynow-item");
      if (stored) {
        try {
          const item = JSON.parse(stored);
          const fullItem = {
            id: Date.now(),
            productId: item.productId,
            title: item.title,
            image: item.image,
            price: item.price,
            priceNumber: item.priceNumber,
            oldPriceNumber: item.oldPriceNumber || item.priceNumber,
            quantity: item.quantity,
            category: item.category,
            selectedColor: item.selectedColor,
            selectedStorage: item.selectedStorage,
            slug: item.slug,
          };
          setBuyNowItem(fullItem);
          setSelectedItemIds(new Set([fullItem.id]));
        } catch (err) {
          console.error("Failed to parse buyNowItem:", err);
        }
      }
    }
  }, []);

  // Initialize selectedItemIds with all cart items (only if not Buy Now mode)
  useEffect(() => {
    if (!isBuyNow && cartState.items.length > 0) {
      setSelectedItemIds((prev) => {
        const next = new Set(prev);
        cartState.items.forEach((item) => {
          next.add(item.id);
        });
        return next;
      });
    }
  }, [cartState.items, isBuyNow]);

  const toggleItemSelection = (id: number) => {
    if (isBuyNow) return;
    setSelectedItemIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectedItems = useMemo(() => {
    return isBuyNow && buyNowItem
      ? [buyNowItem]
      : cartState.items.filter((item) => selectedItemIds.has(item.id));
  }, [isBuyNow, buyNowItem, cartState.items, selectedItemIds]);

  const selectedTotalPrice = useMemo(() => {
    return selectedItems.reduce(
      (sum, item) => sum + item.priceNumber * item.quantity,
      0
    );
  }, [selectedItems]);

  const selectedTotalOldPrice = useMemo(() => {
    return selectedItems.reduce(
      (sum, item) => sum + (item.oldPriceNumber || item.priceNumber) * item.quantity,
      0
    );
  }, [selectedItems]);

  const selectedTotalItems = useMemo(() => {
    return selectedItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [selectedItems]);

  const effectiveCartState = useMemo(() => {
    return {
      items: selectedItems,
      totalItems: selectedTotalItems,
      totalPrice: selectedTotalPrice,
      totalOldPrice: selectedTotalOldPrice,
    };
  }, [selectedItems, selectedTotalItems, selectedTotalPrice, selectedTotalOldPrice]);

  // Frozen cart state to prevent UI reset during order placement transitions
  const [frozenCart, setFrozenCart] = useState<CartState | null>(null);
  const activeCart: CartState = frozenCart || {
    items: isBuyNow && buyNowItem ? [buyNowItem] : cartState.items,
    totalItems: selectedTotalItems,
    totalPrice: selectedTotalPrice,
    totalOldPrice: selectedTotalOldPrice,
  };

  // Form state
  const [form, setForm] = useState<CheckoutForm>(INITIAL_FORM);
  const [deliverySlots, setDeliverySlots] = useState<any[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);

  // Saved addresses (logged-in users)
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [useNewAddress, setUseNewAddress] = useState(false);
  const selectedAddress = addresses.find((a) => a.id === selectedAddressId);
  const [checkoutToken, setCheckoutToken] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
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
      setForm((prev) => ({ ...prev, latitude, longitude }));
      
      try {
        // Fetch reverse geocoding from OpenStreetMap Nominatim with an explicit User-Agent as required by their policy
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
          
          setForm((prev) => ({
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

  useEffect(() => {
    // Generate checkout token on cart change
    const token = typeof window !== "undefined" && window.crypto?.randomUUID 
      ? window.crypto.randomUUID() 
      : Math.random().toString(36).substring(2) + Date.now().toString(36);
    setCheckoutToken(token);
  }, [effectiveCartState.items]);
  // Shipping config from backend
  const [shippingConfig, setShippingConfig] = useState<ShippingConfig>({
    shippingFee: 10,
    freeShippingThreshold: 99,
    whatsappNumber: "+97455551234",
  });

  const isLoggedIn = isAuthenticated && isCustomer;

  // Fetch site settings and active delivery slots
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings = await getSettingsApi();
        if (settings) {
          setShippingConfig({
            shippingFee: settings.shippingFee !== undefined ? Number(settings.shippingFee) : 10,
            freeShippingThreshold: settings.freeShippingThreshold !== undefined ? Number(settings.freeShippingThreshold) : 99,
            whatsappNumber: settings.whatsappNumber || "+97455551234",
          });
        }
      } catch {
        // Use defaults silently
      }
    };

    const fetchSlots = async () => {
      try {
        const slots = await getDeliverySlotsApi();
        const activeSlots = slots?.filter((s: any) => s.is_active) || [];
        setDeliverySlots(activeSlots);
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
      const profilePhone = extractQatarLocalNumber(userState.profileData?.phone || "");
      setForm((prev) => ({
        ...prev,
        fullName: prev.fullName || userState.user?.name || "",
        email: prev.email || userState.user?.email || "",
        phone: profilePhone || prev.phone,
      }));
    }
  }, [isLoggedIn, userState.user, userState.profileData]);

  // Sync form contact details when selected address changes
  useEffect(() => {
    if (isLoggedIn && !useNewAddress && selectedAddress) {
      const profilePhone = extractQatarLocalNumber(userState.profileData?.phone || "");
      setForm((prev) => ({
        ...prev,
        fullName: selectedAddress.fullName || prev.fullName,
        phone: profilePhone || extractQatarLocalNumber(selectedAddress.mobile) || prev.phone,
      }));
    }
  }, [selectedAddress, isLoggedIn, useNewAddress, userState.profileData]);

  // Validate inventory in real-time
  useEffect(() => {
    let active = true;
    const validateCartInventory = async () => {
      if (effectiveCartState.items.length === 0) return;
      
      const newStockErrors: Record<number, { title: string; availableStock: number }> = {};
      let hasErrors = false;
      
      try {
        await Promise.all(
          effectiveCartState.items.map(async (item) => {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${item.productId}`);
            if (res.ok && active) {
              const data = await res.json();
              const serverProd = data.data;
              if (serverProd && active) {
                if (!serverProd.is_active || serverProd.stock < item.quantity) {
                  newStockErrors[item.productId] = {
                    title: item.title,
                    availableStock: serverProd.is_active ? serverProd.stock : 0,
                  };
                  hasErrors = true;
                }
              }
            }
          })
        );
        
        if (!active) return;
        setStockErrors(newStockErrors);
        if (hasErrors) {
          setOrderError("Some items in your cart are no longer available.");
          if (!hasShownStockToastRef.current) {
            toast.error("Some items in your cart are no longer available.");
            hasShownStockToastRef.current = true;
          }
        } else {
          hasShownStockToastRef.current = false;
        }
      } catch (err) {
        if (active) {
          console.error("Failed to pre-validate inventory:", err);
        }
      }
    };

    validateCartInventory();
    return () => {
      active = false;
    };
  }, [effectiveCartState.items, toast]);

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
    if (!mounted || isPlacingOrder) return;
    if (isBuyNow) {
      const stored = sessionStorage.getItem("griva-buynow-item");
      if (!stored) {
        router.push("/cart");
      }
    } else if (cartState.items.length === 0) {
      router.push("/cart");
    }
  }, [mounted, cartState.items.length, isBuyNow, router, isPlacingOrder]);

  if (!mounted) {
    return null;
  }

  if (!isPlacingOrder) {
    if (isBuyNow) {
      if (!buyNowItem) return null;
    } else if (cartState.items.length === 0) {
      return null;
    }
  }

  // Calculate totals
  const shippingCost =
    activeCart.totalPrice >= shippingConfig.freeShippingThreshold || activeCart.totalPrice === 0
      ? 0
      : shippingConfig.shippingFee;
  const orderTotal = activeCart.totalPrice + shippingCost;

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

  const handleUpdateStockQty = (itemId: number, errorKey: string, availableStock: number) => {
    cartDispatch({
      type: "UPDATE_QTY",
      payload: { id: itemId, quantity: availableStock },
    });
    setStockErrors((prev) => {
      const next = { ...prev };
      delete next[errorKey];
      return next;
    });
    // Clear top error message if there are no more active stock errors
    const remaining = Object.keys(stockErrors).filter(
      (key) => String(key) !== String(errorKey) && activeCart.items.some((item) => {
        const itemKey = item.variantId ? `${item.productId}-${item.variantId}` : String(item.productId);
        return itemKey === key;
      })
    );
    if (remaining.length === 0) {
      setOrderError("");
    }
  };

  const handleRemoveStockItem = (itemId: number, errorKey: string) => {
    cartDispatch({
      type: "REMOVE",
      payload: { id: itemId },
    });
    setStockErrors((prev) => {
      const next = { ...prev };
      delete next[errorKey];
      return next;
    });
    // Clear top error message if there are no more active stock errors
    const remaining = Object.keys(stockErrors).filter(
      (key) => String(key) !== String(errorKey) && activeCart.items.some((item) => {
        const itemKey = item.variantId ? `${item.productId}-${item.variantId}` : String(item.productId);
        return itemKey === key;
      })
    );
    if (remaining.length === 0) {
      setOrderError("");
    }
  };

  // Validation
  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof CheckoutForm, string>> = {};
    const needsAddressValidation = !isLoggedIn || useNewAddress || !selectedAddress;
    let hasRequiredMissing = false;
    let firstErrorMsg = "";

    // Full Name validation: Min 3, Max 80
    const nameVal = form.fullName.trim();
    if (!nameVal) {
      errors.fullName = "Full name is required";
      if (!firstErrorMsg) firstErrorMsg = "Please enter your full name.";
      hasRequiredMissing = true;
    } else if (nameVal.length < 3 || nameVal.length > 80) {
      errors.fullName = "Full name must be between 3 and 80 characters";
      if (!firstErrorMsg) firstErrorMsg = "Full name must be between 3 and 80 characters.";
    }

    // Phone validation: exactly 8 digits starting with 3, 5, 6, 7
    const phoneVal = form.phone.trim();
    if (!phoneVal) {
      errors.phone = "Phone number is required";
      if (!firstErrorMsg) firstErrorMsg = "Please enter a valid Qatar phone number.";
      hasRequiredMissing = true;
    } else {
      const qatarLocalRegex = /^[3567]\d{7}$/;
      if (!qatarLocalRegex.test(phoneVal)) {
        errors.phone = "Please enter an 8-digit Qatar phone number starting with 3, 5, 6, or 7.";
        if (!firstErrorMsg) firstErrorMsg = "Please enter a valid Qatar phone number.";
      }
    }

    // Email validation: Max 120
    const emailVal = form.email.trim();
    if (!emailVal) {
      errors.email = "Email address is required";
      if (!firstErrorMsg) firstErrorMsg = "Please enter your email address.";
      hasRequiredMissing = true;
    } else if (emailVal.length > 120) {
      errors.email = "Email must not exceed 120 characters";
      if (!firstErrorMsg) firstErrorMsg = "Email must not exceed 120 characters.";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailVal)) {
        errors.email = "Invalid email address format";
        if (!firstErrorMsg) firstErrorMsg = "Please enter a valid email address.";
      }
    }

    if (needsAddressValidation) {
      // Area: Max 100
      const areaVal = form.area.trim();
      if (!areaVal) {
        errors.area = "Area is required";
        if (!firstErrorMsg) firstErrorMsg = "Please enter your area or district.";
        hasRequiredMissing = true;
      } else if (areaVal.length > 100) {
        errors.area = "Area must not exceed 100 characters";
        if (!firstErrorMsg) firstErrorMsg = "Area / District must not exceed 100 characters.";
      }

      // Zone Number: Required, numeric only, max 3 digits
      const zoneVal = form.zone.trim();
      if (!zoneVal) {
        errors.zone = "Zone number is required";
        if (!firstErrorMsg) firstErrorMsg = "Please enter your zone number.";
        hasRequiredMissing = true;
      } else if (!/^\d{1,3}$/.test(zoneVal)) {
        errors.zone = "Zone number must be numeric (max 3 digits)";
        if (!firstErrorMsg) firstErrorMsg = "Zone number must be numeric (max 3 digits).";
      }

      // Street: Max 120
      const streetVal = form.street.trim();
      if (!streetVal) {
        errors.street = "Street is required";
        if (!firstErrorMsg) firstErrorMsg = "Please enter your street name.";
        hasRequiredMissing = true;
      } else if (streetVal.length > 120) {
        errors.street = "Street must not exceed 120 characters";
        if (!firstErrorMsg) firstErrorMsg = "Street must not exceed 120 characters.";
      }

      // Building Number: Max 30
      const bldgVal = form.buildingNumber.trim();
      if (!bldgVal) {
        errors.buildingNumber = "Building number is required";
        if (!firstErrorMsg) firstErrorMsg = "Please enter your building number.";
        hasRequiredMissing = true;
      } else if (bldgVal.length > 30) {
        errors.buildingNumber = "Building number must not exceed 30 characters";
        if (!firstErrorMsg) firstErrorMsg = "Building number must not exceed 30 characters.";
      }

      // Villa / Apartment: Max 50
      if (form.villaApartment.trim().length > 50) {
        errors.villaApartment = "Villa / Apartment must not exceed 50 characters";
        if (!firstErrorMsg) firstErrorMsg = "Villa / Apartment must not exceed 50 characters.";
      }

      // Floor: Max 20
      if (form.floor.trim().length > 20) {
        errors.floor = "Floor must not exceed 20 characters";
        if (!firstErrorMsg) firstErrorMsg = "Floor must not exceed 20 characters.";
      }

      // Landmark: Max 150
      if (form.landmark.trim().length > 150) {
        errors.landmark = "Landmark must not exceed 150 characters";
        if (!firstErrorMsg) firstErrorMsg = "Landmark must not exceed 150 characters.";
      }
    }

    // Delivery Notes: Max 300
    if (form.deliveryNotes.trim().length > 300) {
      errors.deliveryNotes = "Delivery notes must not exceed 300 characters";
      if (!firstErrorMsg) firstErrorMsg = "Delivery notes must not exceed 300 characters.";
    }

    // Show only the first error message toast
    if (firstErrorMsg) {
      toast.error(firstErrorMsg);
    } else if (hasRequiredMissing) {
      toast.error("Please complete all required fields.");
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
      form.zone && `Zone ${form.zone}`,
      form.floor && `Floor ${form.floor}`,
      form.landmark && `Near ${form.landmark}`,
      "Doha",
      "Qatar",
    ].filter(Boolean);
    return parts.join(", ");
  };

  // Place order handler
  const handlePlaceOrder = async () => {
    if (isPlacingOrder || isSubmitRef.current) return;
    if (!validateForm()) {
      setOrderError("Please fill in all required fields.");
      return;
    }

    setFrozenCart(effectiveCartState);
    setIsPlacingOrder(true);
    isSubmitRef.current = true;
    setOrderError("");

    try {
      const customerName =
        isLoggedIn && !useNewAddress && selectedAddress
          ? selectedAddress.fullName
          : form.fullName;
      const rawPhone =
        isLoggedIn && !useNewAddress && selectedAddress
          ? form.phone || selectedAddress.mobile
          : form.phone;
      
      const normalizedPhone = rawPhone.startsWith("+974") || rawPhone.startsWith("00974")
        ? rawPhone
        : `+974${rawPhone}`;

      const customerPhone = normalizedPhone;
      const customerCity =
        isLoggedIn && !useNewAddress && selectedAddress
          ? selectedAddress.city
          : "Doha";

      const response = await orderService.createOrder({
        items: effectiveCartState.items.map((item) => ({
          product_id: item.productId,
          quantity: item.quantity,
          selectedColor: item.selectedColor,
          selectedStorage: item.selectedStorage,
          variantId: item.variantId,
          variant_id: item.variantId,
          selectedAttributes: item.selectedAttributes,
          selected_attributes: item.selectedAttributes,
          sku: item.sku,
        })),
        shipping_address: buildShippingAddress(),
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_email: form.email || userState.user?.email || "",
        payment_method: "COD",
        delivery_notes: form.deliveryNotes || undefined,
        city: customerCity,
        delivery_slot_id: selectedSlotId || undefined,
        checkout_token: checkoutToken, // Pass checkout token for idempotency
        latitude: isLoggedIn && !useNewAddress && selectedAddress ? selectedAddress.latitude : form.latitude,
        longitude: isLoggedIn && !useNewAddress && selectedAddress ? selectedAddress.longitude : form.longitude,
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

        // Clear ordered items from the cart (sequentially to avoid race conditions/lockups)
        if (isBuyNow) {
          sessionStorage.removeItem("griva-buynow-item");
        } else {
          for (const item of effectiveCartState.items) {
            if (isLoggedIn) {
              await cartService.removeItem(item.id).catch((err) => {
                console.error(`Failed to remove item ${item.id} from DB cart:`, err);
              });
            } else {
              cartDispatch({ type: "REMOVE", payload: { id: item.id } });
            }
          }

          // For logged-in users, sync the context cart state once at the end
          if (isLoggedIn) {
            try {
              const res = await cartService.getCart();
              if (res.success && res.cart) {
                cartDispatch({ type: "SET_CART", payload: res.cart.items });
              }
            } catch (err) {
              console.error("Failed to sync cart after removal:", err);
            }
          }
        }

        // Navigate to success page (exposing order number & slot only, omitting total price URL param)
        const selectedSlot = deliverySlots.find((s) => s.id === selectedSlotId);
        const slotParam = selectedSlot ? encodeURIComponent(selectedSlot.name) : "";
        router.push(
          `/order-success?order=${encodeURIComponent(response.order.order_number)}&slot=${slotParam}`
        );
      } else {
        setOrderError(response.message || "Failed to place order. Please try again.");
        setIsPlacingOrder(false);
        isSubmitRef.current = false;
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
        const errorKey = details.variantId ? `${details.productId}-${details.variantId}` : details.productId;
        setStockErrors((prev) => ({
          ...prev,
          [errorKey]: {
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
          const item = effectiveCartState.items.find((i) => i.title === title);
          if (item) {
            const errorKey = item.variantId ? `${item.productId}-${item.variantId}` : item.productId;
            setStockErrors((prev) => ({
              ...prev,
              [errorKey]: { title, availableStock },
            }));
          }
        }
      }

      setOrderError(errMsg);
      setIsPlacingOrder(false);
      isSubmitRef.current = false;
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
                      maxLength={80}
                      value={form.fullName}
                      onChange={(e) => updateForm("fullName", e.target.value)}
                      className={`block w-full rounded-xl border ${
                        formErrors.fullName ? "border-red-300 bg-red-50/30" : "border-gray-200"
                      } pl-10 pr-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-300`}
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
                  <div className={`flex rounded-xl border ${
                    formErrors.phone ? "border-red-300 bg-red-50/30" : "border-gray-200"
                  } focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-500/20 overflow-hidden transition-all duration-300`}>
                    <span className="bg-gray-50 border-r border-gray-200 px-3 py-2.5 text-sm text-gray-550 select-none flex items-center gap-1.5 font-bold shrink-0">
                      <Phone className="h-4 w-4 text-gray-450" />
                      <span>+974</span>
                    </span>
                    <input
                      type="tel"
                      placeholder="e.g. 51234567"
                      maxLength={8}
                      value={form.phone}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "").slice(0, 8);
                        updateForm("phone", val);
                      }}
                      className="block w-full px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none bg-transparent"
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
                      maxLength={120}
                      value={form.email}
                      onChange={(e) => updateForm("email", e.target.value)}
                      className={`block w-full rounded-xl border ${
                        formErrors.email ? "border-red-300 bg-red-50/30" : "border-gray-200"
                      } pl-10 pr-3 py-2.5 text-sm text-gray-900 placeholder-gray-450 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-300`}
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
                            phone: prev.phone === "" ? extractQatarLocalNumber(addr.mobile) : prev.phone,
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
                  {/* Use Current Location Button */}
                  <div className="sm:col-span-2 mb-2">
                    <button
                      type="button"
                      onClick={handleUseMyLocation}
                      disabled={locating}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-orange-500/25 bg-orange-50/30 hover:bg-orange-50 text-orange-600 font-bold text-sm transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
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
                          ? "Location coordinates saved! (Click to locate again)"
                          : "Use My Location (Exact GPS)"}
                      </span>
                    </button>
                  </div>

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
                        maxLength={100}
                        value={form.area}
                        onChange={(e) => updateForm("area", e.target.value)}
                        className={`block w-full rounded-xl border ${
                          formErrors.area ? "border-red-300 bg-red-50/30" : "border-gray-200"
                        } pl-10 pr-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-300`}
                      />
                    </div>
                    {formErrors.area && (
                      <p className="text-xs text-red-500 mt-1">{formErrors.area}</p>
                    )}
                  </div>

                  {/* Zone Number */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">
                      Zone Number <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 66"
                      maxLength={3}
                      value={form.zone}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "").slice(0, 3);
                        updateForm("zone", val);
                      }}
                      className={`block w-full rounded-xl border ${
                        formErrors.zone ? "border-red-300 bg-red-50/30" : "border-gray-200"
                      } px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-300`}
                    />
                    {formErrors.zone && (
                      <p className="text-xs text-red-500 mt-1">{formErrors.zone}</p>
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
                      maxLength={120}
                      value={form.street}
                      onChange={(e) => updateForm("street", e.target.value)}
                      className={`block w-full rounded-xl border ${
                        formErrors.street ? "border-red-300 bg-red-50/30" : "border-gray-200"
                      } px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-300`}
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
                        maxLength={30}
                        value={form.buildingNumber}
                        onChange={(e) => updateForm("buildingNumber", e.target.value)}
                        className={`block w-full rounded-xl border ${
                          formErrors.buildingNumber ? "border-red-300 bg-red-50/30" : "border-gray-200"
                        } pl-10 pr-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-300`}
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
                      maxLength={50}
                      value={form.villaApartment}
                      onChange={(e) => updateForm("villaApartment", e.target.value)}
                      className="block w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-300"
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
                      maxLength={20}
                      value={form.floor}
                      onChange={(e) => updateForm("floor", e.target.value)}
                      className="block w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-300"
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
                      maxLength={150}
                      value={form.landmark}
                      onChange={(e) => updateForm("landmark", e.target.value)}
                      className="block w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-300"
                    />
                  </div>

                  {/* Delivery Notes */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">
                      Delivery Notes <span className="text-gray-400 normal-case font-normal">(optional)</span>
                    </label>
                    <textarea
                      placeholder="Any special instructions for delivery..."
                      maxLength={300}
                      value={form.deliveryNotes}
                      onChange={(e) => updateForm("deliveryNotes", e.target.value)}
                      rows={2}
                      className="block w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-300 resize-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* ── Section: Preferred Delivery Time ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 transition-all duration-200">
              <div className="flex items-center gap-2 mb-5 border-b pb-3">
                <div className="h-8 w-8 rounded-full bg-orange-50 flex items-center justify-center">
                  <Clock className="h-4 w-4 text-orange-500" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Preferred Delivery Time <span className="text-sm font-normal text-gray-400 ml-1">(Optional)</span></h3>
              </div>

              {deliverySlots.length === 0 ? (
                <div className="text-center py-6 text-xs text-gray-400">
                  Loading active delivery slots...
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-1 rounded-xl">
                  {deliverySlots.map((slot) => (
                    <div
                      key={slot.id}
                      onClick={() => {
                        setSelectedSlotId((prev) => (prev === slot.id ? null : slot.id));
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
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5 sticky top-[130px]">
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
                  const isSelected = selectedItemIds.has(item.id);
                  const errorKey = item.variantId ? `${item.productId}-${item.variantId}` : String(item.productId);
                  const stockErr = stockErrors[errorKey];
                  return (
                    <div key={item.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                      {/* Checkbox (Left Side) */}
                      {!isBuyNow ? (
                        <input
                          type="checkbox"
                          checked={isSelected}
                          disabled={isPlacingOrder}
                          onChange={() => toggleItemSelection(item.id)}
                          className="h-4 w-4 rounded border-gray-200 text-orange-500 focus:ring-orange-500 cursor-pointer disabled:opacity-55 disabled:cursor-not-allowed shrink-0"
                        />
                      ) : (
                        <div className="h-4 w-4 shrink-0 flex items-center justify-center">
                          <CheckCircle className="h-4 w-4 text-orange-500" />
                        </div>
                      )}
                      <div className={`flex-1 flex items-center gap-3 min-w-0 ${!isSelected ? "opacity-55 select-none" : ""}`}>
                        <div className="relative h-16 w-16 shrink-0 rounded-xl border border-gray-150 bg-gray-50 p-1 overflow-hidden">
                          <Image
                            src={item.image}
                            alt={item.title}
                            fill
                            sizes="64px"
                            className="object-contain"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-900 truncate">{item.title}</p>
                          <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                            {item.selectedAttributes && Object.keys(item.selectedAttributes).length > 0 ? (
                              Object.entries(item.selectedAttributes).map(([key, val]) => (
                                <span key={key} className="text-[9px] bg-gray-50 border px-1 py-0.5 rounded text-gray-400">
                                  {key}: {val}
                                </span>
                              ))
                            ) : (
                              <>
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
                              </>
                            )}
                          </div>

                          <p className="text-xs text-gray-550 mt-1 font-medium">Qty &times; {item.quantity}</p>

                          {stockErr && isSelected && (
                            <div className="mt-2 bg-red-55/65 border border-red-100 rounded-xl p-2.5 space-y-2 animate-in fade-in-50 slide-in-from-top-1">
                              <div className="flex items-center gap-1.5 text-red-600 font-bold text-[11px]">
                                <AlertCircle className="h-3.5 w-3.5 text-red-500 shrink-0" />
                                <span>
                                  {stockErr.availableStock === 0
                                    ? "Out Of Stock"
                                    : `Only ${stockErr.availableStock} available`}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <button
                                  onClick={() => handleRemoveStockItem(item.id, errorKey)}
                                  className="text-[10px] bg-red-600 hover:bg-red-700 text-white font-bold px-2 py-1 rounded-md transition-colors cursor-pointer"
                                >
                                  Remove Item
                                </button>
                                {stockErr.availableStock > 0 && (
                                  <button
                                    onClick={() => handleUpdateStockQty(item.id, errorKey, stockErr.availableStock)}
                                    className="text-[10px] bg-gray-100 hover:bg-gray-200 text-gray-705 font-bold px-2 py-1 rounded-md transition-colors cursor-pointer"
                                  >
                                    Update to {stockErr.availableStock}
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <span className={`text-xs font-bold text-gray-900 shrink-0 mt-0.5 ${!isSelected ? "opacity-55 line-through decoration-gray-400" : ""}`}>
                        QAR {(item.priceNumber * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Totals */}
              <div className="border-t pt-4 space-y-3.5 text-sm">
                {/* Price (count of items) */}
                <div className="flex justify-between text-gray-655">
                  <span>Price ({activeCart.totalItems} item{activeCart.totalItems !== 1 ? "s" : ""})</span>
                  <span className="font-semibold text-gray-900">
                    QAR {activeCart.totalOldPrice.toFixed(2)}
                  </span>
                </div>

                {/* Discount */}
                <div className="flex justify-between text-gray-655 items-center">
                  <span className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 bg-orange-100 text-orange-600 border border-orange-200/50 rounded-md flex items-center gap-1">
                      <Tag className="h-3 w-3" />
                      Discount
                    </span>
                  </span>
                  <span className="font-bold text-green-600">
                    &minus; QAR {(activeCart.totalOldPrice - activeCart.totalPrice).toFixed(2)}
                  </span>
                </div>

                {/* Shipping Charge */}
                <div className="flex justify-between text-gray-655 items-center">
                  <span className="flex items-center gap-1.5">
                    <Truck className="h-4 w-4 text-gray-400" />
                    <span>Shipping Charge</span>
                  </span>
                  <span className="font-semibold">
                    {shippingCost === 0 ? (
                      <span className="text-green-600 bg-green-50 border border-green-200/60 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        Free
                      </span>
                    ) : (
                      <span className="text-gray-900 font-bold">QAR {shippingCost.toFixed(2)}</span>
                    )}
                  </span>
                </div>
                {shippingCost > 0 && (
                  <p className="text-[10px] text-green-600 text-right font-semibold">
                    Free delivery on orders over QAR {shippingConfig.freeShippingThreshold.toFixed(0)}
                  </p>
                )}

                {/* Total Amount */}
                <div className="border-t pt-4.5 flex justify-between items-center text-base font-bold text-gray-900">
                  <span>Total Amount</span>
                  <span className="text-gray-900 text-xl font-black">QAR {orderTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Savings message */}
              {activeCart.totalOldPrice - activeCart.totalPrice > 0 && (
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-250/50 rounded-2xl px-4 py-3 text-center shadow-sm shadow-emerald-500/5 animate-in fade-in duration-300">
                  <p className="text-xs font-bold text-emerald-700 flex items-center justify-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <span>You save <strong className="font-extrabold">QAR {(activeCart.totalOldPrice - activeCart.totalPrice).toFixed(2)}</strong> on this order!</span>
                  </p>
                </div>
              )}

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
                onClick={() => {
                  if (validateForm()) {
                    setShowConfirmModal(true);
                  } else {
                    setOrderError("Please fill in all required fields.");
                  }
                }}
                disabled={isPlacingOrder || hasStockErrors || activeCart.totalItems === 0}
                className={`w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold text-white transition-all shadow-lg ${
                  isPlacingOrder
                    ? "bg-gray-300 cursor-not-allowed shadow-none"
                    : (hasStockErrors || activeCart.totalItems === 0)
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none border border-gray-300/50"
                    : "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-orange-500/25 hover:shadow-orange-600/35 cursor-pointer active:scale-[0.985]"
                }`}
              >
                {isPlacingOrder && <Loader2 className="h-4 w-4 animate-spin" />}
                {isPlacingOrder
                  ? "Placing Order..."
                  : activeCart.totalItems === 0
                  ? "Select Items to Place Order"
                  : hasStockErrors
                  ? "Fix Selected Items to Place Order"
                  : `Place Order for ${activeCart.totalItems} item${activeCart.totalItems !== 1 ? "s" : ""} — QAR ${orderTotal.toFixed(2)}`}
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
        {/* HIGH-8: Confirmation Modal Overlay */}
        {showConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in-50 duration-200">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full mx-4 shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-200">
              <h3 className="text-xl font-black text-gray-900 mb-2">Confirm Your Order</h3>
              <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                Are you sure you want to place this Cash on Delivery (COD) order?
              </p>
              
              <div className="bg-gray-50 rounded-2xl p-4 mb-6 border border-gray-100 space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Delivery Address</span>
                  <span className="font-semibold text-gray-800 text-right max-w-[200px] truncate">{buildShippingAddress()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Delivery Slot</span>
                  <span className="font-semibold text-gray-800">
                    {deliverySlots.find((s) => s.id === selectedSlotId)?.name || "Not Selected"}
                  </span>
                </div>
                <div className="border-t pt-2.5 flex justify-between font-bold text-base">
                  <span className="text-gray-900">Total Amount</span>
                  <span className="text-gray-900">QAR {orderTotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowConfirmModal(false);
                    handlePlaceOrder();
                  }}
                  disabled={isPlacingOrder}
                  className="flex-1 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 py-3 text-sm font-bold text-white transition-all cursor-pointer shadow-md shadow-orange-500/10"
                >
                  {isPlacingOrder ? "Placing Order..." : "Confirm & Place"}
                </button>
                <button
                  onClick={() => setShowConfirmModal(false)}
                  disabled={isPlacingOrder}
                  className="flex-1 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-707 py-3 text-sm font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
