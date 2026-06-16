"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminSettings } from "@/app/context/AdminContext";
import { CategoryItem, OfferCard, Product, SlideData } from "@/app/types/types";
import { addSubscriberApi, AdminOrder, AnalyticsData, broadcastNewsletterApi, deleteProductApi, getAllOrdersApi, getAnalyticsApi, getProductsApi, getSettingsApi, getSubscribersApi, SubscriberInfo, updateProductStockApi, updateSettingsApi } from "@/app/utils/api";
import { products as initialProducts, slide as initialSlides, offers as initialOffers, categories as initialCategories } from "@/app/data/data";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import OverviewTab from "./OverviewTab";
import ProductsTab from "./ProductsTab";
import OrdersTab from "./OrdersTab";
import BannersTab from "./BannersTab";
import SubscribersTab from "./SubscribersTab";
import AddProductModal from "./AddProductModal";

export type TabType = "overview" | "products" | "banners" | "subscribers" | "orders";

export default function AdminDashboard() {
  const router = useRouter();
  const {
    announcementBarEnabled, setAnnouncementBarEnabled,
    fridaySaleEnabled,     setFridaySaleEnabled,
    midnightSaleEnabled,   setMidnightSaleEnabled,
    cmsMobileBanners: mobileBannersList,
    setCmsMobileBanners: setMobileBannersList,
  } = useAdminSettings();

  // Auth guard
  useEffect(() => {
    if (!localStorage.getItem("griva_admin_auth")) router.replace("/admin/login");
  }, [router]);

  // ── State ──────────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab]       = useState<TabType>("overview");
  const [productsList, setProductsList] = useState<Product[]>(initialProducts);
  const [slidesList]                    = useState<SlideData[]>(initialSlides);
  const [offersList, setOffersList]     = useState<OfferCard[]>(initialOffers);
  const [categoriesList]                = useState<CategoryItem[]>(initialCategories);

  const [subscribersList, setSubscribersList] = useState<SubscriberInfo[]>([]);
  const [ordersList, setOrdersList]           = useState<AdminOrder[]>([]);
  const [analytics, setAnalytics]             = useState<AnalyticsData | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  const [highlightedSchemaSection, setHighlightedSchemaSection] = useState<string | null>(null);
  const [searchQuery, setSearchQuery]     = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [newSubEmail, setNewSubEmail]         = useState("");
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [broadcastStatus, setBroadcastStatus]   = useState<"idle" | "sending" | "sent">("idle");

  const categories = Array.from(new Set(productsList.map((p) => p.category)));

  // ── Data load ──────────────────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      const [dbProducts, dbSettings, dbSubs, dbOrders, dbAnalytics] = await Promise.all([
        getProductsApi(), getSettingsApi(), getSubscribersApi(), getAllOrdersApi(), getAnalyticsApi(),
      ]);
      setProductsList(dbProducts);
      setAnnouncementBarEnabled(dbSettings.announcementBarEnabled);
      setFridaySaleEnabled(dbSettings.fridaySaleEnabled);
      setMidnightSaleEnabled(dbSettings.midnightSaleEnabled);
      setSubscribersList(dbSubs);
      setOrdersList(dbOrders);
      setAnalytics(dbAnalytics);
      setAnalyticsLoading(false);
    }
    load();
  }, []);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleToggleAnnouncement = async () => {
    const v = !announcementBarEnabled; setAnnouncementBarEnabled(v);
    await updateSettingsApi({ announcementBarEnabled: v });
  };
  const handleToggleFridaySale = async () => {
    const v = !fridaySaleEnabled; setFridaySaleEnabled(v);
    await updateSettingsApi({ fridaySaleEnabled: v });
  };
  const handleToggleMidnightSale = async () => {
    const v = !midnightSaleEnabled; setMidnightSaleEnabled(v);
    await updateSettingsApi({ midnightSaleEnabled: v });
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault(); if (!broadcastMessage) return;
    setBroadcastStatus("sending");
    const res = await broadcastNewsletterApi(broadcastMessage);
    if (res) {
      setBroadcastStatus("sent");
      setTimeout(() => { setBroadcastStatus("idle"); setBroadcastMessage(""); }, 3000);
    } else setBroadcastStatus("idle");
  };

  const handleToggleOffer = (id: number) =>
    setOffersList((prev) =>
      prev.map((o) => o.id === id ? { ...o, badge: o.badge === "DISABLED" ? "ACTIVE PROMO" : "DISABLED" } : o)
    );

  const handleStockAdjustment = async (id: number, delta: number) => {
    const p = productsList.find((x) => x.id === id); if (!p) return;
    const next = Math.max(0, (p.stock || 0) + delta);
    setProductsList((prev) => prev.map((x) => x.id === id ? { ...x, stock: next } : x));
    await updateProductStockApi(id, next);
  };

  const handleDirectStockEdit = async (id: number, val: number) => {
    setProductsList((prev) => prev.map((p) => p.id === id ? { ...p, stock: val } : p));
    await updateProductStockApi(id, val);
  };

  const handleDeleteProduct = async (id: number) => {
    if (confirm("Delete this product?")) {
      setProductsList((prev) => prev.filter((p) => p.id !== id));
      await deleteProductApi(id);
    }
  };

  const handleAddSubscriber = async (e: React.FormEvent) => {
    e.preventDefault(); if (!newSubEmail) return;
    const s = await addSubscriberApi(newSubEmail);
    if (s) { setSubscribersList((prev) => [s, ...prev]); setNewSubEmail(""); }
  };

  const filteredProducts = productsList.filter((p) => {
    const ms = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
               p.category.toLowerCase().includes(searchQuery.toLowerCase());
    return ms && (filterCategory === "all" || p.category === filterCategory);
  });

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white text-gray-900 flex font-sans antialiased selection:bg-orange-500 selection:text-white">

      {/* ── Sidebar ── */}
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* ── Main ── */}
      <main className="flex-1 min-w-0 flex flex-col h-screen overflow-y-auto">

        {/* ── Header ── */}
        <AdminHeader activeTab={activeTab} />

        {/* ── Tab Content ── */}
        <div className="p-6 max-w-7xl w-full mx-auto flex-1">
          {activeTab === "overview" && (
            <OverviewTab
              analytics={analytics} analyticsLoading={analyticsLoading}
              announcementBarEnabled={announcementBarEnabled} setAnnouncementBarEnabled={handleToggleAnnouncement}
              fridaySaleEnabled={fridaySaleEnabled}           setFridaySaleEnabled={handleToggleFridaySale}
              midnightSaleEnabled={midnightSaleEnabled}       setMidnightSaleEnabled={handleToggleMidnightSale}
              highlightedSchemaSection={highlightedSchemaSection}
              setHighlightedSchemaSection={setHighlightedSchemaSection}
              setActiveTab={setActiveTab}
              slidesList={slidesList} categoriesList={categoriesList} offersList={offersList}
            />
          )}
          {activeTab === "products" && (
            <ProductsTab
              searchQuery={searchQuery}       setSearchQuery={setSearchQuery}
              filterCategory={filterCategory} setFilterCategory={setFilterCategory}
              categories={categories}         setIsAddModalOpen={setIsAddModalOpen}
              filteredProducts={filteredProducts}
              handleStockAdjustment={handleStockAdjustment}
              handleDeleteProduct={handleDeleteProduct}
              handleDirectStockEdit={handleDirectStockEdit}
              setProductsList={setProductsList}
            />
          )}
          {activeTab === "orders" && (
            <OrdersTab ordersList={ordersList} setOrdersList={setOrdersList} />
          )}
          {activeTab === "banners" && (
            <BannersTab
              slidesList={slidesList} categoriesList={categoriesList} offersList={offersList}
              handleToggleSlide={() => {}} handleToggleOffer={handleToggleOffer}
              mobileBannersList={mobileBannersList} setMobileBannersList={setMobileBannersList}
            />
          )}
          {activeTab === "subscribers" && (
            <SubscribersTab
              subscribersList={subscribersList}
              newSubEmail={newSubEmail}         setNewSubEmail={setNewSubEmail}
              broadcastMessage={broadcastMessage} setBroadcastMessage={setBroadcastMessage}
              broadcastStatus={broadcastStatus}   handleSendBroadcast={handleSendBroadcast}
              handleAddSubscriber={handleAddSubscriber}
            />
          )}
        </div>
      </main>

      {/* ── Add Product Modal ── */}
      <AddProductModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onProductAdded={(saved) => setProductsList((prev) => [saved, ...prev])}
      />
    </div>
  );
}