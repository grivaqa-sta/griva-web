"use client";

import { useState, useEffect, useCallback } from "react";
import { ApiProduct } from "@/app/types/types";
import { productService } from "@/app/services/product.service";

// ─────────────────────────────────────────────────────────
// Shared return type
// ─────────────────────────────────────────────────────────
export interface UseProductsResult {
  products: ApiProduct[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export interface UseProductResult {
  product: ApiProduct | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

// ─────────────────────────────────────────────────────────
// Helper — extract data array from service response
// ─────────────────────────────────────────────────────────
function extractProducts(res: any): ApiProduct[] {
  if (!res) return [];
  // productService returns response.data from axios
  // Backend shape: { success: true, data: [...] } or { success: true, count: N, data: [...] }
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.data)) return res.data;
  return [];
}

function extractProduct(res: any): ApiProduct | null {
  if (!res) return null;
  if (res.data && !Array.isArray(res.data)) return res.data;
  return null;
}

// ─────────────────────────────────────────────────────────
// GET /api/products — all products with optional filters
// ─────────────────────────────────────────────────────────
export function useAllProducts(params?: {
  search?: string;
  minPrice?: number;
  maxPrice?: number;
}): UseProductsResult {
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await productService.getProducts(params);
      setProducts(extractProducts(res));
    } catch (err: any) {
      console.error("[useAllProducts] Error:", err);
      setError(err?.message || "Failed to load products");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { products, loading, error, refetch: fetch };
}

// ─────────────────────────────────────────────────────────
// GET /api/products/best-sellers
// ─────────────────────────────────────────────────────────
export function useBestSellerProducts(): UseProductsResult {
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await productService.getBestSellerProducts();
      setProducts(extractProducts(res));
    } catch (err: any) {
      console.error("[useBestSellerProducts] Error:", err);
      setError(err?.message || "Failed to load best sellers");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { products, loading, error, refetch: fetch };
}

// ─────────────────────────────────────────────────────────
// GET /api/products/featured
// ─────────────────────────────────────────────────────────
export function useFeaturedProducts(): UseProductsResult {
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await productService.getFeaturedProducts();
      setProducts(extractProducts(res));
    } catch (err: any) {
      console.error("[useFeaturedProducts] Error:", err);
      setError(err?.message || "Failed to load featured products");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { products, loading, error, refetch: fetch };
}

// ─────────────────────────────────────────────────────────
// GET /api/products/trending
// ─────────────────────────────────────────────────────────
export function useTrendingProducts(): UseProductsResult {
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await productService.getTrendingProducts();
      setProducts(extractProducts(res));
    } catch (err: any) {
      console.error("[useTrendingProducts] Error:", err);
      setError(err?.message || "Failed to load trending products");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { products, loading, error, refetch: fetch };
}

// ─────────────────────────────────────────────────────────
// GET /api/products/new-arrivals
// ─────────────────────────────────────────────────────────
export function useNewArrivalProducts(): UseProductsResult {
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await productService.getNewArrivalProducts();
      setProducts(extractProducts(res));
    } catch (err: any) {
      console.error("[useNewArrivalProducts] Error:", err);
      setError(err?.message || "Failed to load new arrivals");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { products, loading, error, refetch: fetch };
}

// ─────────────────────────────────────────────────────────
// GET /api/products/:id — single product
// ─────────────────────────────────────────────────────────
export function useProduct(id: number | null): UseProductResult {
  const [product, setProduct] = useState<ApiProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await productService.getProduct(id);
      setProduct(extractProduct(res));
    } catch (err: any) {
      console.error("[useProduct] Error:", err);
      setError(err?.message || "Product not found");
      setProduct(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { product, loading, error, refetch: fetch };
}
