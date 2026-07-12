"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { categoryService } from "@/app/services/category.service";
import { subCategoryService } from "@/app/services/subCategory.service";
import { Category, SubCategory } from "@/app/types/types";
import { useToast } from "@/app/context/ToastContext";
import ProductWizard from "../../components/product-wizard/ProductWizard";
import AdminSidebar from "../../components/AdminSidebar";
import AdminHeader from "../../components/AdminHeader";
import { getAllOrdersApi } from "@/app/utils/api";
import { Loader2 } from "lucide-react";
import { useAdminTheme } from "@/app/admin/context/AdminThemeContext";

export default function NewProductPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { theme } = useAdminTheme();
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Sidebar/Header layout states
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreviewedCount, setUnreviewedCount] = useState(0);

  useEffect(() => {
    async function loadData() {
      try {
        const [catRes, subRes, ordersRes] = await Promise.all([
          categoryService.getCategories(),
          subCategoryService.getAllActiveSubCategories(),
          getAllOrdersApi().catch(() => [])
        ]);
        const cData = catRes?.data || catRes;
        const sData = subRes?.data || subRes;
        setCategories(Array.isArray(cData) ? cData : []);
        setSubCategories(Array.isArray(sData) ? sData : []);
        
        // Calculate unreviewed orders count for sidebar badge accuracy
        const ordersList = Array.isArray(ordersRes) ? ordersRes : [];
        const count = ordersList.filter((o: any) => o.status === "pending" && !o.reviewed_at).length;
        setUnreviewedCount(count);
      } catch (err) {
        console.error("Failed to load setup data", err);
        toast.error("Failed to load page setup data.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [toast]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50/50" style={{ backgroundColor: 'var(--admin-bg)' }}>
        <div className="text-center">
          <Loader2 className="h-8 w-8 text-orange-500 animate-spin mx-auto mb-2" />
          <p className="text-xs font-semibold" style={{ color: 'var(--admin-text-dim)' }}>Loading setup data...</p>
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
          <ProductWizard
            categories={categories}
            subCategories={subCategories}
            onSuccess={() => {
              toast.success("Product created successfully!");
              router.push("/admin?tab=products");
            }}
            onClose={() => {
              router.push("/admin?tab=products");
            }}
          />
        </div>
      </main>
    </div>
  );
}
