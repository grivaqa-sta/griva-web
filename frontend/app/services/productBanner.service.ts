import { api } from "../lib/axios";
import { ProductBanner, ProductBannerRequest, ProductBannerUpdateRequest } from "../types/types";

class ProductBannerService {
  async getAllBanners(): Promise<ProductBanner[]> {
    const response = await api.get("/product-promo-banners");
    return response.data.data;
  }

  async getActiveBanners(): Promise<ProductBanner[]> {
    const response = await api.get(
      "/product-promo-banners/active"
    );
    return response.data.data;
  }

  async getBannerById(
    id: number
  ): Promise<ProductBanner> {
    const response = await api.get(
      `/product-promo-banners/${id}`
    );

    return response.data.data;
  }

  async createBanner(
    payload: ProductBannerRequest
  ): Promise<ProductBanner> {
    const response = await api.post(
      "/product-promo-banners",
      payload
    );

    return response.data.data;
  }

  async updateBanner(
    id: number,
    payload: ProductBannerUpdateRequest
  ): Promise<ProductBanner> {
    const response = await api.put(
      `/product-promo-banners/${id}`,
      payload
    );

    return response.data.data;
  }

  async updateBannerStatus(
    id: number,
    isActive: boolean
  ): Promise<ProductBanner> {
    const response = await api.patch(
      `/product-promo-banners/${id}/status`,
      { isActive }
    );

    return response.data.data;
  }

  async deleteBanner(id: number): Promise<void> {
    await api.delete(
      `/product-promo-banners/${id}`
    );
  }
}

const productBannerService = new ProductBannerService();

export default productBannerService;