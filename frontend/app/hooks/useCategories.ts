// FEATURE: Client-Side Caching Mechanism
// File: frontend/app/hooks/useCategories.ts
// Do not modify without checking project docs

import { useQuery } from "../utils/cache";
import { categoryService } from "../services/category.service";
import { subCategoryService } from "../services/subCategory.service";
import { Category, SubCategory } from "../types/types";

interface CategoryWithSubcategories extends Category {
  subcategories: SubCategory[];
}

export function useCategories() {
  const { data, loading, error, refetch } = useQuery<Category[]>(
    "categories_all",
    async () => {
      const res = await categoryService.getCategories();
      return Array.isArray(res) ? res : [];
    }
  );
  return { categories: data || [], loading, error, refetch };
}

export function useAllActiveCategories() {
  const { data, loading, error, refetch } = useQuery<Category[]>(
    "categories_active",
    async () => {
      const res = await categoryService.getAllActiveCategories();
      return Array.isArray(res) ? res : [];
    }
  );
  return { categories: data || [], loading, error, refetch };
}

export function useCategoriesWithSubcategories() {
  const { data, loading, error, refetch } = useQuery<CategoryWithSubcategories[]>(
    "categories_with_subcategories",
    async () => {
      const res = await categoryService.getCategoriesWithSubcategories();
      const raw = Array.isArray(res) ? res :
                  Array.isArray(res?.data) ? res.data :
                  Array.isArray(res?.categories) ? res.categories : [];
      return raw;
    }
  );
  return { categories: data || [], loading, error, refetch };
}

export function useSubCategories() {
  const { data, loading, error, refetch } = useQuery<SubCategory[]>(
    "subcategories_all",
    async () => {
      const res = await subCategoryService.getSubCategories();
      const raw = Array.isArray(res) ? res :
                  Array.isArray(res?.data) ? res.data : [];
      return raw;
    }
  );
  return { subCategories: data || [], loading, error, refetch };
}
