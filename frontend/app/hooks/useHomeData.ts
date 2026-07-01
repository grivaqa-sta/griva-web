// FEATURE: Client-Side Caching Mechanism
// File: frontend/app/hooks/useHomeData.ts
// Do not modify without checking project docs

import { useQuery } from "../utils/cache";
import dealOfDayService from "../services/dealOfDay.service";
import productBannerService from "../services/productBanner.service";
import { productService } from "../services/product.service";
import { getSettingsApi, GlobalSettings } from "../utils/api";
import { Deal, ProductBanner, BannerProduct } from "../types/types";

// ─────────────────────────────────────────────────────────
// GET /api/deal-of-day/active — active deal of the day
// ─────────────────────────────────────────────────────────
export function useDealOfDay() {
  const { data, loading, error, refetch } = useQuery<Deal[]>(
    "deal_of_day_active",
    async () => {
      const res = await dealOfDayService.getActiveDeal();
      if (!res?.success || !res?.data) return [];
      const raw = Array.isArray(res.data) ? res.data : [res.data];
      const now = new Date();
      return raw.filter((deal: Deal) => {
        const start = new Date(deal.startDate);
        const end = new Date(deal.endDate);
        return now >= start && now <= end;
      });
    }
  );

  return { deals: data || [], loading, error, refetch };
}

// ─────────────────────────────────────────────────────────
// GET /api/product-promo-banners/active — active promo banners
// ─────────────────────────────────────────────────────────
export function useActiveProductBanners() {
  const { data, loading, error, refetch } = useQuery<ProductBanner[]>(
    "product_banners_active",
    async () => {
      const banners = await productBannerService.getActiveBanners();
      return Array.isArray(banners) ? banners : [];
    }
  );

  return { banners: data || [], loading, error, refetch };
}

// ─────────────────────────────────────────────────────────
// GET /api/products/banner — hero banner products
// ─────────────────────────────────────────────────────────
export function useBannerProducts() {
  const { data, loading, error, refetch } = useQuery<BannerProduct[]>(
    "products_banner",
    async () => {
      const res = await productService.getBannerProducts();
      if (Array.isArray(res)) return res;
      if (Array.isArray((res as any)?.data)) return (res as any).data;
      return [];
    }
  );

  return { bannerProducts: data || [], loading, error, refetch };
}

// ─────────────────────────────────────────────────────────
// GET /api/settings — global store settings
// ─────────────────────────────────────────────────────────
export function useGlobalSettings() {
  const { data, loading, error, refetch } = useQuery<GlobalSettings>(
    "global_settings",
    async () => {
      return await getSettingsApi();
    }
  );

  return { settings: data, loading, error, refetch };
}
