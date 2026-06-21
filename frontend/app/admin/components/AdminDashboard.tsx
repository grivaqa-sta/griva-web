"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAdminSettings } from "@/app/context/AdminContext";
import { CategoryItem, OfferCard, Product, SlideData } from "@/app/types/types";
import { addSubscriberApi, AdminOrder, AnalyticsData, broadcastNewsletterApi, getAllOrdersApi, getAnalyticsApi, getSettingsApi, getSubscribersApi, SubscriberInfo, updateSettingsApi } from "@/app/utils/api";
import { products as initialProducts, slide as initialSlides, offers as initialOffers, categories as initialCategories } from "@/app/data/data";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import OverviewTab from "./OverviewTab";
import ProductsTab from "./ProductsTab";
import OrdersTab from "./OrdersTab";
import BannersTab from "./BannersTab";
import SubscribersTab from "./SubscribersTab";
import CategoriesTab from "./CategoriesTab";
import SubCategoriesTab from "./SubCategoriesTab";
import AddProductModal from "./AddProductModal";
import DeliveryTab from "./DeliveryTab";
import CustomersTab from "./CustomersTab";

export type TabType = "overview" | "products" | "banners" | "subscribers" | "orders" | "categories" | "subcategories" | "delivery" | "customers";

export default function AdminDashboard() {
  const router = useRouter();
  const {
    announcementBarEnabled, setAnnouncementBarEnabled,
    fridaySaleEnabled, setFridaySaleEnabled,
    midnightSaleEnabled, setMidnightSaleEnabled,
    cmsMobileBanners: mobileBannersList,
    setCmsMobileBanners: setMobileBannersList,
  } = useAdminSettings();

  // Auth guard
  // useEffect(() => {
  //   if (!localStorage.getItem("griva_admin_auth")) router.replace("/admin/login");
  // }, [router]);

  const searchParams = useSearchParams();
  const tabParam = searchParams?.get("tab") as TabType | null;

  const validTabs: TabType[] = ["overview", "products", "banners", "subscribers", "orders", "categories", "subcategories", "delivery", "customers"];
  const activeTab = tabParam && validTabs.includes(tabParam) ? tabParam : "overview";

  const handleSetActiveTab = (tab: TabType) => {
    router.push(`/admin?tab=${tab}`);
  };

  const [slidesList] = useState<SlideData[]>(initialSlides);
  const [offersList, setOffersList] = useState<OfferCard[]>(initialOffers);
  const [categoriesList] = useState<CategoryItem[]>(initialCategories);

  const [subscribersList, setSubscribersList] = useState<SubscriberInfo[]>([]);
  const [ordersList, setOrdersList] = useState<AdminOrder[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [shippingFee, setShippingFee] = useState<number>(10);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState<number>(99);

  const [highlightedSchemaSection, setHighlightedSchemaSection] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [newSubEmail, setNewSubEmail] = useState("");
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [broadcastStatus, setBroadcastStatus] = useState<"idle" | "sending" | "sent">("idle");



  // ── Data load ──────────────────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      const [dbSettings, dbSubs, dbOrders, dbAnalytics] = await Promise.all([
        getSettingsApi(), getSubscribersApi(), getAllOrdersApi(), getAnalyticsApi(),
      ]);
      setAnnouncementBarEnabled(dbSettings.announcementBarEnabled);
      setFridaySaleEnabled(dbSettings.fridaySaleEnabled);
      setMidnightSaleEnabled(dbSettings.midnightSaleEnabled);
      setShippingFee(dbSettings.shippingFee !== undefined ? Number(dbSettings.shippingFee) : 10);
      setFreeShippingThreshold(dbSettings.freeShippingThreshold !== undefined ? Number(dbSettings.freeShippingThreshold) : 99);
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
  const handleSaveShippingConfig = async (fee: number, threshold: number) => {
    setShippingFee(fee);
    setFreeShippingThreshold(threshold);
    await updateSettingsApi({ shippingFee: fee, freeShippingThreshold: threshold });
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



  const handleAddSubscriber = async (e: React.FormEvent) => {
    e.preventDefault(); if (!newSubEmail) return;
    const s = await addSubscriberApi(newSubEmail);
    if (s) { setSubscribersList((prev) => [s, ...prev]); setNewSubEmail(""); }
  };



  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white text-gray-900 flex font-sans antialiased selection:bg-orange-500 selection:text-white">

      {/* ── Sidebar ── */}
      <AdminSidebar activeTab={activeTab} setActiveTab={handleSetActiveTab} />

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
              fridaySaleEnabled={fridaySaleEnabled} setFridaySaleEnabled={handleToggleFridaySale}
              midnightSaleEnabled={midnightSaleEnabled} setMidnightSaleEnabled={handleToggleMidnightSale}
              highlightedSchemaSection={highlightedSchemaSection}
              setHighlightedSchemaSection={setHighlightedSchemaSection}
              setActiveTab={handleSetActiveTab}
              slidesList={slidesList} categoriesList={categoriesList} offersList={offersList}
              shippingFee={shippingFee}
              freeShippingThreshold={freeShippingThreshold}
              onSaveShippingConfig={handleSaveShippingConfig}
            />
          )}
          {activeTab === "products" && (
            <ProductsTab />
          )}
          {activeTab === "orders" && (
            <OrdersTab ordersList={ordersList} setOrdersList={setOrdersList} />
          )}
          {activeTab === "banners" && (
            <BannersTab
              slidesList={slidesList} categoriesList={categoriesList} offersList={offersList}
              handleToggleSlide={() => { }} handleToggleOffer={handleToggleOffer}
              mobileBannersList={mobileBannersList} setMobileBannersList={setMobileBannersList}
            />
          )}
          {activeTab === "subscribers" && (
            <SubscribersTab
              subscribersList={subscribersList}
              newSubEmail={newSubEmail} setNewSubEmail={setNewSubEmail}
              broadcastMessage={broadcastMessage} setBroadcastMessage={setBroadcastMessage}
              broadcastStatus={broadcastStatus} handleSendBroadcast={handleSendBroadcast}
              handleAddSubscriber={handleAddSubscriber}
            />
          )}
          {activeTab === "categories" && (
            <CategoriesTab />
          )}
          {activeTab === "subcategories" && (
            <SubCategoriesTab />
          )}
          {activeTab === "delivery" && (
            <DeliveryTab />
          )}
          {activeTab === "customers" && (
            <CustomersTab />
          )}
        </div>
      </main>


    </div>
  );
}