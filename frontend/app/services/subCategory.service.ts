import { api } from "../lib/axios";
import { SubCategoryRequest } from "../types/types";
import { queryClient } from "../utils/cache";

export const subCategoryService = {
  createSubCategory: async (data: SubCategoryRequest) => {
    const response = await api.post("/subcategories", data);
    queryClient.invalidate("subcategories");
    queryClient.invalidate("categories");
    queryClient.invalidate("products");
    return response.data;
  },

  getSubCategories: async () => {
    const response = await api.get("/subcategories");
    return response.data;
  },

  getAllActiveSubCategories: async () => {
    const response = await api.get("/subcategories/active");
    return response.data;
  },

  getSubCategory: async (id: number) => {
    const response = await api.get(`/subcategories/${id}`);
    return response.data;
  },

  getSubCategoriesByCategory: async (categoryId: number) => {
    const response = await api.get(`/subcategories/category/${categoryId}`);
    return response.data;
  },

  updateSubCategory: async (id: number,data: Partial<SubCategoryRequest>) => {
    const response = await api.put(`/subcategories/${id}`,data);
    queryClient.invalidate("subcategories");
    queryClient.invalidate("categories");
    queryClient.invalidate("products");
    return response.data;
  },

  deleteSubCategory: async (id: number) => {
    const response = await api.delete(`/subcategories/${id}`);
    queryClient.invalidate("subcategories");
    queryClient.invalidate("categories");
    queryClient.invalidate("products");
    return response.data;
  },
};