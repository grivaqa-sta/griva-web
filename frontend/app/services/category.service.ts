import { api } from "../lib/axios";
import { CategoryRequest } from "../types/types";

export const categoryService = {
  createCategory: async (data: CategoryRequest) => {
    const response = await api.post("/categories", data);
    return response.data;
  },

  getCategories: async () => {
    const response = await api.get("/categories");
    return response.data.data; // API returns { success, data: [...] }
  },

  getAllActiveCategories: async () => {
    const response = await api.get("/categories/active");
    return response.data.data;
  },

  getCategory: async (id: number) => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },

  updateCategory: async (
    id: number,
    data: Partial<CategoryRequest>
  ) => {
    const response = await api.put(`/categories/${id}`, data);
    return response.data;
  },

  deleteCategory: async (id: number) => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  },

  getCategoriesWithSubcategories: async () => {
  const response = await api.get("/categories/with-subcategories");
  return response.data;
}

};