import { api } from "../lib/axios";
import { ProductRequest } from "../types/types";

export const productService = {
  createProduct: async (data: ProductRequest) => {
    const response = await api.post("/products", data);
    return response.data;
  },

  getProducts: async (params?: { search?: string; minPrice?: number; maxPrice?: number }) => {
    const response = await api.get("/products", { params });
    return response.data;
  },

  getProduct: async (id: number) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  getProductsBySubCategory: async (subcategoryId: number) => {
    const response = await api.get(`/products/subcategory/${subcategoryId}`);
    return response.data;
  },

  getFeaturedProducts: async () => {
    const response = await api.get("/products/featured");
    return response.data;
  },

  getTrendingProducts: async () => {
    const response = await api.get("/products/trending");
    return response.data;
  },

  getBestSellerProducts: async () => {
    const response = await api.get("/products/best-sellers");
    return response.data;
  },

  getNewArrivalProducts: async () => {
    const response = await api.get("/products/new-arrivals");
    return response.data;
  },

  updateProduct: async (id: number, data: Partial<ProductRequest>) => {
    const response = await api.put(`/products/${id}`, data);
    return response.data;
  },

  updateProductStock: async (id: number, stock: number) => {
    const response = await api.patch(`/products/${id}/stock`, { stock });
    return response.data;
  },

  deleteProduct: async (id: number) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },

  // Get all banner products
  getBannerProducts: async () => {
    const response = await api.get("/products/banner");
    return response.data;
  },

  // Update banner status
  updateBannerStatus: async (id: number, is_banner: boolean, href?: string,banner_background_color?: string, tags?: string[]) => {
    const response = await api.patch(`/products/${id}/banner`, { is_banner, href,banner_background_color, tags });
    return response.data;
  }

};