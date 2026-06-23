import { Product, SlideData, OfferCard, CategoryItem } from "../types/types";
import { products as mockProducts, slide as mockSlides, offers as mockOffers, categories as mockCategories } from "../data/data";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// Helper to retrieve auth headers
function getAuthHeaders(): HeadersInit {
  if (typeof window !== "undefined") {
    const pathname = window.location.pathname;
    let token = null;
    if (pathname.startsWith("/admin")) {
      const activeRole = sessionStorage.getItem("griva_active_role");
      if (activeRole === "staff") {
        token = localStorage.getItem("griva_staff_token");
      } else if (activeRole === "admin") {
        token = localStorage.getItem("griva_admin_token");
      } else {
        token = localStorage.getItem("griva_admin_token") || localStorage.getItem("griva_staff_token");
      }
    } else if (pathname.startsWith("/delivery")) {
      token = localStorage.getItem("griva_delivery_token");
    } else {
      token = localStorage.getItem("griva_user_token");
    }
    if (token) {
      return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };
    }
  }
  return {
    "Content-Type": "application/json",
  };
}

// Global safe fetch wrapper
async function safeFetch<T>(
  endpoint: string,
  options: RequestInit,
  fallbackValue: T
): Promise<T> {
  try {
    const headers: Record<string, string> = {};
    const authHeaders = getAuthHeaders();
    if (authHeaders) {
      Object.assign(headers, authHeaders);
    }
    if (options.headers) {
      Object.assign(headers, options.headers);
    }

    if (options.body && typeof options.body === "string" && !Object.keys(headers).some(k => k.toLowerCase() === "content-type")) {
      headers["Content-Type"] = "application/json";
    }

    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.warn(`[API Warning]: Request to ${endpoint} failed: ${res.status}. Using fallback.`);
      try {
        const errorJson = JSON.parse(errorText);
        throw new Error(errorJson.error || "API Request Failed");
      } catch {
        throw new Error(errorText || "API Request Failed");
      }
    }

    return (await res.json()) as T;
  } catch (error: any) {
    console.error(`🔴 [API CLIENT ERROR]: Failed reaching ${endpoint}:`, error.message);
    console.warn(`🛡️ [API CLIENT FALLBACK]: Falling back to local state mock data.`);
    return fallbackValue;
  }
}

// ─────────────────────────────────────────────────────────
// Products APIs
// ─────────────────────────────────────────────────────────
export async function getProductsApi(): Promise<Product[]> {
  const result = await safeFetch<{ success: boolean; data: any[] }>(
    "/products",
    { method: "GET" },
    { success: false, data: [] }
  );

  const productList = result?.data || [];

  if (productList.length === 0) {
    // If backend is empty or offline, return mock data
    return mockProducts;
  }

  // Format backend fields back to frontend structure
  return productList.map((p: any) => ({
    id: p.id,
    category: p.category?.title || "Gadgets",
    title: p.title,
    price: `QAR ${parseFloat(p.price.toString().replace(/([$]|qar|[\s,])/gi, "")).toFixed(2)}`,
    oldPrice: p.old_price ? `QAR ${parseFloat(p.old_price.toString().replace(/([$]|qar|[\s,])/gi, "")).toFixed(2)}` : undefined,
    badge: p.badge || undefined,
    description: p.description || "",
    stock: p.stock || 0,
    image: p.main_image_url || "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=800",
    images: p.gallery_image_urls || [],
    specs: p.specs || [],
    colors: p.colors || [],
    storageOptions: p.storage_options || [],
    buttonText: "ADD TO CART",
    rating: p.rating || 5,
  }));
}

export async function createProductApi(productData: any): Promise<Product> {
  const body = {
    category_id: 6, // Default to Gadgets Category ID from seed
    title: productData.title,
    price: parseFloat(productData.price.replace(/([$]|qar|[\s,])/gi, "")) || 0,
    old_price: productData.oldPrice ? parseFloat(productData.oldPrice.replace(/([$]|qar|[\s,])/gi, "")) : null,
    badge: productData.badge || "",
    description: productData.description || "",
    stock: productData.stock || 0,
    specs: productData.specs || [],
    colors: productData.colors || [],
    storage_options: productData.storageOptions || [],
    main_image_url: productData.image,
    gallery_image_urls: productData.images || [productData.image],
  };

  const res = await safeFetch<any>(
    "/products",
    {
      method: "POST",
      body: JSON.stringify(body),
    },
    { product: { ...productData, id: Date.now() } }
  );

  return res.product;
}

export async function updateProductStockApi(id: number, stock: number): Promise<boolean> {
  const res = await safeFetch<any>(
    `/products/${id}/stock`,
    {
      method: "PATCH",
      body: JSON.stringify({ stock }),
    },
    { success: true }
  );
  return !!res;
}

export async function updateProductApi(id: number, productData: any): Promise<boolean> {
  const body = {
    title: productData.title,
    price: typeof productData.price === "string" ? parseFloat(productData.price.replace(/[$,]/g, "")) : productData.price,
    old_price: productData.oldPrice ? (typeof productData.oldPrice === "string" ? parseFloat(productData.oldPrice.replace(/[$,]/g, "")) : productData.oldPrice) : null,
    badge: productData.badge,
    description: productData.description,
    stock: productData.stock,
    specs: productData.specs,
    colors: productData.colors,
    main_image_url: productData.image,
  };

  const res = await safeFetch<any>(
    `/products/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(body),
    },
    { success: true }
  );
  return !!res;
}

export async function deleteProductApi(id: number): Promise<boolean> {
  const res = await safeFetch<any>(
    `/products/${id}`,
    {
      method: "DELETE",
    },
    { success: true }
  );
  return !!res;
}

// ─────────────────────────────────────────────────────────
// Settings / Campaigns APIs
// ─────────────────────────────────────────────────────────
export interface GlobalSettings {
  announcementBarEnabled: boolean;
  fridaySaleEnabled: boolean;
  midnightSaleEnabled: boolean;
  shippingFee?: number;
  freeShippingThreshold?: number;
  whatsappNumber?: string;
  supportEmail?: string;
}

export async function getSettingsApi(): Promise<GlobalSettings> {
  const res = await safeFetch<{ settings: GlobalSettings }>(
    "/settings",
    { 
      method: "GET",
      cache: "no-store"
    },
    {
      settings: {
        announcementBarEnabled: true,
        fridaySaleEnabled: true,
        midnightSaleEnabled: false,
        shippingFee: 10,
        freeShippingThreshold: 99,
      },
    }
  );
  return res.settings;
}

export async function updateSettingsApi(settings: Partial<GlobalSettings>): Promise<GlobalSettings> {
  const res = await safeFetch<{ settings: GlobalSettings }>(
    "/settings",
    {
      method: "PATCH",
      body: JSON.stringify(settings),
    },
    {
      settings: {
        announcementBarEnabled: true,
        fridaySaleEnabled: true,
        midnightSaleEnabled: false,
        shippingFee: 10,
        freeShippingThreshold: 99,
        ...settings,
      },
    }
  );
  return res.settings;
}

// ─────────────────────────────────────────────────────────
// Delivery Slots APIs
// ─────────────────────────────────────────────────────────
export interface DeliverySlot {
  id: number;
  name: string;
  start_time?: string;
  end_time?: string;
  is_active: boolean;
  sort_order: number;
}

export async function getDeliverySlotsApi(): Promise<DeliverySlot[]> {
  const res = await safeFetch<{ slots: DeliverySlot[] }>(
    "/delivery-slots",
    { method: "GET" },
    { slots: [] }
  );
  return res.slots || [];
}

export async function createDeliverySlotApi(slotData: Partial<DeliverySlot>): Promise<DeliverySlot> {
  const res = await safeFetch<{ slot: DeliverySlot }>(
    "/delivery-slots",
    {
      method: "POST",
      body: JSON.stringify(slotData),
    },
    { slot: { id: Date.now(), name: slotData.name || "", is_active: true, sort_order: 0 } }
  );
  return res.slot;
}

export async function updateDeliverySlotApi(id: number, slotData: Partial<DeliverySlot>): Promise<DeliverySlot> {
  const res = await safeFetch<{ slot: DeliverySlot }>(
    `/delivery-slots/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(slotData),
    },
    { slot: { id, name: "", is_active: true, sort_order: 0, ...slotData } }
  );
  return res.slot;
}

export async function deleteDeliverySlotApi(id: number): Promise<boolean> {
  const res = await safeFetch<any>(
    `/delivery-slots/${id}`,
    {
      method: "DELETE",
    },
    { success: true }
  );
  return !!res;
}

// ─────────────────────────────────────────────────────────
// Newsletter Subscribers APIs
// ─────────────────────────────────────────────────────────
export interface SubscriberInfo {
  email: string;
  joinedDate: string;
  country: string;
}

export async function getSubscribersApi(): Promise<SubscriberInfo[]> {
  const res = await safeFetch<{ subscribers: SubscriberInfo[] }>(
    "/subscribers",
    { method: "GET" },
    {
      subscribers: [
        { email: "jassim.althani@gmail.com", joinedDate: "June 01, 2026", country: "Qatar" },
        { email: "fatima.almansouri@yahoo.com", joinedDate: "May 29, 2026", country: "Qatar" },
        { email: "john.doe@verizon.com", joinedDate: "May 25, 2026", country: "United States" },
      ],
    }
  );
  return res.subscribers;
}

export async function addSubscriberApi(email: string): Promise<SubscriberInfo | null> {
  const res = await safeFetch<any>(
    "/subscribers",
    {
      method: "POST",
      body: JSON.stringify({ email, country: "Qatar" }),
    },
    null
  );

  if (res && res.subscriber) {
    const s = res.subscriber;
    return {
      email: s.email,
      joinedDate: new Date(s.createdAt || Date.now()).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric"
      }),
      country: s.country || "Qatar",
    };
  }
  return null;
}

export async function broadcastNewsletterApi(message: string): Promise<{ recipientCount: number }> {
  return await safeFetch<{ recipientCount: number }>(
    "/subscribers/broadcast",
    {
      method: "POST",
      body: JSON.stringify({ message }),
    },
    { recipientCount: 3 }
  );
}

// ─────────────────────────────────────────────────────────
// Auth APIs
// ─────────────────────────────────────────────────────────
export async function loginApi(email: string, password: string): Promise<{ token: string; user: any } | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────────────
// Analytics & Orders APIs
// ─────────────────────────────────────────────────────────
export interface AnalyticsData {
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
  totalCustomers: number;
  salesByCategory: { category: string; sales: number }[];
  orderStatusCounts: { pending: number; shipped: number; completed: number; cancelled: number };
  salesOverTime: { date: string; sales: number }[];
}

export async function getAnalyticsApi(startDate?: string, endDate?: string): Promise<AnalyticsData> {
  const mockAnalytics: AnalyticsData = {
    totalSales: 14897.50,
    totalOrders: 12,
    averageOrderValue: 1241.46,
    totalCustomers: 4,
    salesByCategory: [
      { category: "Gadgets", sales: 5842.00 },
      { category: "Laptops", sales: 2998.00 },
      { category: "Headphones", sales: 696.00 },
      { category: "Gaming", sales: 998.00 },
      { category: "Speakers", sales: 399.98 },
    ],
    orderStatusCounts: { pending: 1, shipped: 3, completed: 7, cancelled: 1 },
    salesOverTime: [
      { date: "Jun 01", sales: 759.99 },
      { date: "Jun 02", sales: 1997.00 },
      { date: "Jun 03", sales: 696.00 },
      { date: "Jun 04", sales: 1498.00 },
      { date: "Jun 05", sales: 799.00 },
      { date: "Jun 06", sales: 2699.00 },
      { date: "Jun 07", sales: 1198.00 },
      { date: "Jun 08", sales: 2551.00 },
    ],
  };

  const query = new URLSearchParams();
  if (startDate) query.append("startDate", startDate);
  if (endDate) query.append("endDate", endDate);
  const queryString = query.toString() ? `?${query.toString()}` : "";

  const res = await safeFetch<{ analytics: AnalyticsData }>(
    `/orders/analytics${queryString}`,
    { method: "GET" },
    { analytics: mockAnalytics }
  );
  return res.analytics;
}

export interface OrderItem {
  id: number;
  product_id: number;
  quantity: number;
  price_at_purchase: number;
  product?: { id: number; title: string; main_image_url: string };
}

export interface AdminOrder {
  id: number;
  order_number?: string;
  user_id: number;
  status: string;
  total_price: string;
  shipping_address: string;
  createdAt: string;
  reviewed_at?: string;
  user?: { id: number; email: string };
  items?: OrderItem[];
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
  delivery_notes?: string;
  delivery_slot_id?: number;
  is_printed?: boolean;
  printed_at?: string;
}

const MOCK_ORDERS: AdminOrder[] = [
  { id: 1, user_id: 2, status: "completed", total_price: "QAR 759.99", shipping_address: "Al Sadd District, Doha, Qatar", createdAt: new Date(Date.now() - 9*86400000).toISOString(), user: { id: 2, email: "jassim.althani@gmail.com" }, items: [{ id: 1, product_id: 1, quantity: 1, price_at_purchase: 759.99, product: { id: 1, title: "DJI Mini 4 Pro Drone", main_image_url: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?q=80&w=800" } }] },
  { id: 2, user_id: 3, status: "shipped", total_price: "QAR 499.00", shipping_address: "West Bay Tower 12, Doha, Qatar", createdAt: new Date(Date.now() - 8*86400000).toISOString(), user: { id: 3, email: "fatima.almansouri@yahoo.com" }, items: [{ id: 2, product_id: 2, quantity: 1, price_at_purchase: 499.00, product: { id: 2, title: "Meta Quest 3 VR Headset", main_image_url: "https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?q=80&w=800" } }] },
  { id: 3, user_id: 4, status: "completed", total_price: "QAR 1499.00", shipping_address: "Al Wakra City Center, Al Wakra, Qatar", createdAt: new Date(Date.now() - 8*86400000).toISOString(), user: { id: 4, email: "john.doe@verizon.com" }, items: [{ id: 3, product_id: 6, quantity: 1, price_at_purchase: 1499.00, product: { id: 6, title: "MacBook Air 15-inch M3", main_image_url: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=800" } }] },
  { id: 4, user_id: 5, status: "pending", total_price: "QAR 696.00", shipping_address: "The Pearl - Qatar, Porto Arabia, Doha", createdAt: new Date(Date.now() - 2*86400000).toISOString(), user: { id: 5, email: "sara.alkhanji@hotmail.com" }, items: [{ id: 4, product_id: 4, quantity: 2, price_at_purchase: 348.00, product: { id: 4, title: "Sony WH-1000XM5 Headphones", main_image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800" } }] },
];

export async function getAllOrdersApi(): Promise<AdminOrder[]> {
  const res = await safeFetch<{ orders: AdminOrder[] }>(
    "/orders",
    { method: "GET" },
    { orders: MOCK_ORDERS }
  );
  return res.orders || MOCK_ORDERS;
}

export async function updateOrderStatusApi(id: number, status: string): Promise<boolean> {
  const res = await safeFetch<any>(
    `/orders/${id}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({ status }),
    },
    { success: true }
  );
  return !!res;
}

// ─────────────────────────────────────────────────────────
// Customer Management APIs
// ─────────────────────────────────────────────────────────
export interface CustomerInfo {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: string;
  totalOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  returnedOrders: number;
  successRate: number;
  totalSpent: number;
  lastOrderDate: string | null;
  riskLevel: string;
  registrationDate: string;
}

export interface CustomerDetailInfo {
  id: number;
  name: string;
  email: string;
  phone: string;
  registrationDate: string;
  status: string;
  addresses: {
    home: any | null;
    office: any | null;
  };
  stats: {
    totalOrders: number;
    deliveredOrders: number;
    cancelledOrders: number;
    returnedOrders: number;
    totalSpent: number;
    averageOrderValue: number;
    lastOrderDate: string | null;
  };
  metrics: {
    successRate: number;
    riskLevel: string;
    customerSegment: string;
  };
  recentOrders: {
    id: number;
    orderNumber: string;
    date: string;
    amount: string;
    status: string;
  }[];
}

export interface CustomerAnalyticsData {
  totalCustomers: number;
  activeCustomers: number;
  blockedCustomers: number;
  newCustomersThisMonth: number;
  repeatCustomers: number;
  vipCustomers: number;
  highRiskCustomers: number;
  averageCustomerValue: number;
}

export async function getCustomersApi(params: {
  page?: number;
  limit?: number;
  search?: string;
  filter?: string;
  sort?: string;
}): Promise<{ customers: CustomerInfo[]; pagination: { page: number; limit: number; totalItems: number; totalPages: number } }> {
  const query = new URLSearchParams();
  if (params.page) query.append("page", params.page.toString());
  if (params.limit) query.append("limit", params.limit.toString());
  if (params.search) query.append("search", params.search);
  if (params.filter) query.append("filter", params.filter);
  if (params.sort) query.append("sort", params.sort);

  const res = await safeFetch<{ success: boolean; customers: CustomerInfo[]; pagination: any }>(
    `/admin/customers?${query.toString()}`,
    { method: "GET" },
    {
      success: true,
      customers: [],
      pagination: { page: 1, limit: 10, totalItems: 0, totalPages: 0 },
    }
  );
  return { customers: res.customers || [], pagination: res.pagination };
}

export async function getCustomerByIdApi(id: number): Promise<CustomerDetailInfo | null> {
  const res = await safeFetch<{ success: boolean; customer: CustomerDetailInfo }>(
    `/admin/customers/${id}`,
    { method: "GET" },
    { success: false, customer: null as any }
  );
  return res.customer || null;
}

export async function getCustomerOrdersApi(
  id: number,
  params: { page?: number; limit?: number; status?: string }
): Promise<{ orders: any[]; pagination: { page: number; limit: number; totalItems: number; totalPages: number } }> {
  const query = new URLSearchParams();
  if (params.page) query.append("page", params.page.toString());
  if (params.limit) query.append("limit", params.limit.toString());
  if (params.status) query.append("status", params.status);

  const res = await safeFetch<{ success: boolean; orders: any[]; pagination: any }>(
    `/admin/customers/${id}/orders?${query.toString()}`,
    { method: "GET" },
    { success: true, orders: [], pagination: { page: 1, limit: 10, totalItems: 0, totalPages: 0 } }
  );
  return { orders: res.orders || [], pagination: res.pagination };
}

export async function getCustomerAnalyticsApi(): Promise<CustomerAnalyticsData> {
  const defaultAnalytics: CustomerAnalyticsData = {
    totalCustomers: 0,
    activeCustomers: 0,
    blockedCustomers: 0,
    newCustomersThisMonth: 0,
    repeatCustomers: 0,
    vipCustomers: 0,
    highRiskCustomers: 0,
    averageCustomerValue: 0,
  };

  const res = await safeFetch<{ success: boolean; analytics: CustomerAnalyticsData }>(
    "/admin/customers/analytics",
    { method: "GET" },
    { success: true, analytics: defaultAnalytics }
  );
  return res.analytics || defaultAnalytics;
}

export async function updateCustomerStatusApi(id: number, status: "ACTIVE" | "BLOCKED"): Promise<boolean> {
  const res = await safeFetch<any>(
    `/admin/customers/${id}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({ status }),
    },
    { success: true }
  );
  return !!res;
}

//authentication

export async function downloadOrdersExportApi(params: {
  startDate?: string;
  endDate?: string;
  status?: string;
  printStatus?: string;
  format: "csv" | "xlsx";
}): Promise<void> {
  const query = new URLSearchParams();
  if (params.startDate) query.append("startDate", params.startDate);
  if (params.endDate) query.append("endDate", params.endDate);
  if (params.status) query.append("status", params.status);
  if (params.printStatus) query.append("printStatus", params.printStatus);
  query.append("format", params.format);

  const pathname = window.location.pathname;
  let token = null;
  if (pathname.startsWith("/admin")) {
    const activeRole = sessionStorage.getItem("griva_active_role");
    if (activeRole === "staff") {
      token = localStorage.getItem("griva_staff_token");
    } else if (activeRole === "admin") {
      token = localStorage.getItem("griva_admin_token");
    } else {
      token = localStorage.getItem("griva_admin_token") || localStorage.getItem("griva_staff_token");
    }
  } else {
    token = localStorage.getItem("griva_user_token");
  }

  const headers: HeadersInit = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}/orders/export?${query.toString()}`, {
    method: "GET",
    headers,
  });

  if (!res.ok) {
    throw new Error("Failed to export orders");
  }

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `orders_export_${Date.now()}.${params.format}`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

export async function downloadCustomersExportApi(params: {
  segment?: string;
  startDate?: string;
  endDate?: string;
  format: "csv" | "xlsx";
}): Promise<void> {
  const query = new URLSearchParams();
  if (params.segment) query.append("segment", params.segment);
  if (params.startDate) query.append("startDate", params.startDate);
  if (params.endDate) query.append("endDate", params.endDate);
  query.append("format", params.format);

  const pathname = window.location.pathname;
  let token = null;
  if (pathname.startsWith("/admin")) {
    const activeRole = sessionStorage.getItem("griva_active_role");
    if (activeRole === "staff") {
      token = localStorage.getItem("griva_staff_token");
    } else if (activeRole === "admin") {
      token = localStorage.getItem("griva_admin_token");
    } else {
      token = localStorage.getItem("griva_admin_token") || localStorage.getItem("griva_staff_token");
    }
  } else {
    token = localStorage.getItem("griva_user_token");
  }

  const headers: HeadersInit = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}/admin/customers/export?${query.toString()}`, {
    method: "GET",
    headers,
  });

  if (!res.ok) {
    throw new Error("Failed to export customers");
  }

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `customers_export_${Date.now()}.${params.format}`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

export async function bulkPrintOrdersApi(orderIds: number[]): Promise<boolean> {
  const res = await safeFetch<any>(
    "/orders/bulk-print",
    {
      method: "PATCH",
      body: JSON.stringify({ orderIds }),
    },
    { success: true }
  );
  return !!res;
}


