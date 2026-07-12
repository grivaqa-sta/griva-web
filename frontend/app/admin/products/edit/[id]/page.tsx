"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { productService } from "@/app/services/product.service";
import { categoryService } from "@/app/services/category.service";
import { subCategoryService } from "@/app/services/subCategory.service";
import { Category, SubCategory } from "@/app/types/types";
import { useToast } from "@/app/context/ToastContext";
import ProductWizard from "../../../components/product-wizard/ProductWizard";
import AdminSidebar from "../../../components/AdminSidebar";
import AdminHeader from "../../../components/AdminHeader";
import { getAllOrdersApi } from "@/app/utils/api";
import { Loader2 } from "lucide-react";
import { useAdminTheme } from "@/app/admin/context/AdminThemeContext";

interface EditProductPageProps {
  params: Promise<{ id: string }> | { id: string };
}

export default function EditProductPage({ params }: EditProductPageProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { theme } = useAdminTheme();
  
  const [productId, setProductId] = useState<string | null>(null);
  const [product, setProduct] = useState<any>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Sidebar/Header layout states
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreviewedCount, setUnreviewedCount] = useState(0);

  // Unpack params safely
  useEffect(() => {
    if (params) {
      if (params instanceof Promise) {
        params.then((p) => setProductId(p.id)).catch(() => {});
      } else {
        setProductId(params.id);
      }
    }
  }, [params]);

  // Load product, categories, subcategories and orders
  useEffect(() => {
    if (!productId) return;

    async function loadData() {
      try {
        const [prodRes, catRes, subRes, ordersRes] = await Promise.all([
          productService.getProduct(productId!),
          categoryService.getCategories(),
          subCategoryService.getAllActiveSubCategories(),
          getAllOrdersApi().catch(() => [])
        ]);
        
        const pData = prodRes?.data || prodRes;
        const cData = catRes?.data || catRes;
        const sData = subRes?.data || subRes;

        setProduct(pData);
        setCategories(Array.isArray(cData) ? cData : []);
        setSubCategories(Array.isArray(sData) ? sData : []);
        
        // Calculate unreviewed orders count for sidebar badge accuracy
        const ordersList = Array.isArray(ordersRes) ? ordersRes : [];
        const count = ordersList.filter((o: any) => o.status === "pending" && !o.reviewed_at).length;
        setUnreviewedCount(count);
      } catch (err) {
        console.error("Failed to load edit setup data", err);
        toast.error("Failed to load product or categories details.");
        router.push("/admin?tab=products");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [productId, toast, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50/50" style={{ backgroundColor: 'var(--admin-bg)' }}>
        <div className="text-center">
          <Loader2 className="h-8 w-8 text-orange-500 animate-spin mx-auto mb-2" />
          <p className="text-xs font-semibold" style={{ color: 'var(--admin-text-dim)' }}>Loading product details...</p>
        </div>
      </div>
    );
  }

  const handleSetActiveTab = (tab: string) => {
    router.push(`/admin?tab=${tab}`);
  };

  return (
    <div data-admin-theme={theme} className="min-h-screen flex font-sans antialiased selection:bg-orange-500 selection:text-white" style={{ backgroundColor: 'var(--admin-bg)', color: 'var(--admin-text)' }}>
      
      {/* Sidebar */}
      <AdminSidebar
        activeTab="products"
        setActiveTab={handleSetActiveTab}
        unreviewedCount={unreviewedCount}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 flex flex-col h-screen overflow-y-auto">
        {/* Header */}
        <AdminHeader activeTab="products" onMenuClick={() => setSidebarOpen(true)} />

        {/* Wizard Wrapper */}
        <div className="p-4 md:p-6 max-w-5xl w-full mx-auto flex-1">
          {product && (
            <ProductWizard
              productToEdit={product}
              categories={categories}
              subCategories={subCategories}
              onSuccess={() => {
                toast.success("Product updated successfully!");
                router.push("/admin?tab=products");
              }}
              onClose={() => {
                router.push("/admin?tab=products");
              }}
            />
          )}
        </div>
      </main>
    </div>
  );
}
