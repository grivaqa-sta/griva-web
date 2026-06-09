import { Product, SlideData, OfferCard, CategoryItem } from "../types/types";
import { products as mockProducts, slide as mockSlides, offers as mockOffers, categories as mockCategories } from "../data/data";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// Helper to retrieve auth headers
function getAuthHeaders(): HeadersInit {
  // Check if running on client side
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
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
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...getAuthHeaders(),
        ...options.headers,
      },
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
  const data = await safeFetch<{ products: any[] }>(
    "/products",
    { method: "GET" },
    { products: [] }
  );

  if (data.products.length === 0) {
    // If backend is empty or offline, return mock data
    return mockProducts;
  }

  // Format backend fields back to frontend structure
  return data.products.map((p: any) => ({
    id: p.id,
    category: p.category?.title || "Gadgets",
    title: p.title,
    price: p.price.toString().startsWith("$") ? p.price : `$${p.price}`,
    oldPrice: p.old_price ? (p.old_price.toString().startsWith("$") ? p.old_price : `$${p.old_price}`) : undefined,
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
    price: parseFloat(productData.price.replace(/[$,]/g, "")) || 0,
    old_price: productData.oldPrice ? parseFloat(productData.oldPrice.replace(/[$,]/g, "")) : null,
    badge: productData.badge || "",
    description: productData.description || "",
    stock: productData.stock || 0,
    specs: productData.specs || [],
    colors: productData.colors || [],
    storage_options: productData.storageOptions || [],
    main_image_url: productData.image,
    gallery_image_urls: [productData.image],
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
}

export async function getSettingsApi(): Promise<GlobalSettings> {
  const res = await safeFetch<{ settings: GlobalSettings }>(
    "/settings",
    { method: "GET" },
    {
      settings: {
        announcementBarEnabled: true,
        fridaySaleEnabled: true,
        midnightSaleEnabled: false,
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
        ...settings,
      },
    }
  );
  return res.settings;
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

export async function addSubscriberApi(email: string): Promise<boolean> {
  const res = await safeFetch<any>(
    "/subscribers",
    {
      method: "POST",
      body: JSON.stringify({ email, country: "Qatar" }),
    },
    null
  );
  return !!res;
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
