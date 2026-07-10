"use client";

import { ApiProduct } from "@/app/types/types";
import { productService } from "@/app/services/product.service";
import { useQuery } from "../utils/cache";

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
  const cacheKey = `products_all_${JSON.stringify(params || {})}`;
  const { data, loading, error, refetch } = useQuery<ApiProduct[]>(
    cacheKey,
    async () => {
      const res = await productService.getProducts(params);
      return extractProducts(res);
    },
    [JSON.stringify(params)]
  );

  return { products: data || [], loading, error, refetch };
}

// ─────────────────────────────────────────────────────────
// GET /api/products/best-sellers
// ─────────────────────────────────────────────────────────
export function useBestSellerProducts(): UseProductsResult {
  const { data, loading, error, refetch } = useQuery<ApiProduct[]>(
    "products_best_sellers",
    async () => {
      const res = await productService.getBestSellerProducts();
      return extractProducts(res);
    }
  );

  return { products: data || [], loading, error, refetch };
}

// ─────────────────────────────────────────────────────────
// GET /api/products/featured
// ─────────────────────────────────────────────────────────
export function useFeaturedProducts(): UseProductsResult {
  const { data, loading, error, refetch } = useQuery<ApiProduct[]>(
    "products_featured",
    async () => {
      const res = await productService.getFeaturedProducts();
      return extractProducts(res);
    }
  );

  return { products: data || [], loading, error, refetch };
}

// ─────────────────────────────────────────────────────────
// GET /api/products/trending
// ─────────────────────────────────────────────────────────
export function useTrendingProducts(): UseProductsResult {
  const { data, loading, error, refetch } = useQuery<ApiProduct[]>(
    "products_trending",
    async () => {
      const res = await productService.getTrendingProducts();
      return extractProducts(res);
    }
  );

  return { products: data || [], loading, error, refetch };
}

// ─────────────────────────────────────────────────────────
// GET /api/products/new-arrivals
// ─────────────────────────────────────────────────────────
export function useNewArrivalProducts(): UseProductsResult {
  const { data, loading, error, refetch } = useQuery<ApiProduct[]>(
    "products_new_arrivals",
    async () => {
      const res = await productService.getNewArrivalProducts();
      return extractProducts(res);
    }
  );

  return { products: data || [], loading, error, refetch };
}

// ─────────────────────────────────────────────────────────
// GET /api/products/:id — single product
// ─────────────────────────────────────────────────────────
export function useProduct(id: number | string | null): UseProductResult {
  const cacheKey = id ? `product_single_${id}` : "product_single_null";
  const { data, loading, error, refetch } = useQuery<ApiProduct | null>(
    cacheKey,
    async () => {
      if (!id) return null;
      const res = await productService.getProduct(id);
      return extractProduct(res);
    },
    [id]
  );

  const isActualLoading = id ? loading : false;
  return { product: data, loading: isActualLoading, error, refetch };
}
