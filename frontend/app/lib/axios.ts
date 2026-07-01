import axios from "axios";
import { processCloudinaryUrls } from "../utils/image";

// Simple in-memory cache for public GET requests to improve performance
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache

const CACHED_ENDPOINTS = [
  "/categories",
  "/deal-of-day",
  "/products",
  "/global-settings",
  "/settings"
];

function shouldCache(url?: string): boolean {
  if (!url) return false;
  const matches = CACHED_ENDPOINTS.some(endpoint => url.includes(endpoint));
  if (!matches) return false;
  
  const isBlacklisted = 
    url.includes("/cart") ||
    url.includes("/wishlist") ||
    url.includes("/orders") ||
    url.includes("/addresses");
    
  return !isBlacklisted;
}

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
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
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  // Cache lookup for public GET requests
  const isGet = config.method?.toLowerCase() === "get";
  if (isGet && shouldCache(config.url)) {
    const cacheKey = config.url + "?" + JSON.stringify(config.params || {});
    const cached = cache.get(cacheKey);
    const now = Date.now();

    if (cached && (now - cached.timestamp < CACHE_TTL)) {
      // Short-circuit request and return cached promise
      config.adapter = () => Promise.resolve({
        data: cached.data,
        status: 200,
        statusText: "OK",
        headers: {},
        config: { ...config, fromCache: true } as any,
        request: {}
      });
    }
  }

  // Invalidate cache on mutations (POST, PUT, DELETE, PATCH)
  const isMutation = ["post", "put", "delete", "patch"].includes(config.method?.toLowerCase() || "");
  if (isMutation) {
    cache.clear();
  }

  return config;
});

api.interceptors.response.use(
  (response) => {
    if (response.data) {
      response.data = processCloudinaryUrls(response.data);
    }

    // Save successful GET response to cache if applicable
    const config = response.config;
    const isGet = config.method?.toLowerCase() === "get";
    const fromCache = (config as any).fromCache;

    if (isGet && shouldCache(config.url) && !fromCache) {
      const cacheKey = config.url + "?" + JSON.stringify(config.params || {});
      cache.set(cacheKey, {
        data: response.data,
        timestamp: Date.now()
      });
    }

    return response;
  },
  (error) => {
    if (
      error.response?.status === 403 &&
      error.response?.data?.message?.toLowerCase().includes("blocked")
    ) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("griva_user_token");
        localStorage.removeItem("griva_user");

        const event = new CustomEvent("griva-user-blocked", {
          detail: { message: error.response.data.message },
        });
        window.dispatchEvent(event);
      }
    }
    return Promise.reject(error);
  }
);