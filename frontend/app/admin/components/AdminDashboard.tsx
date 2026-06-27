"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAdminSettings } from "@/app/context/AdminContext";
import { useUser } from "@/app/context/UserContext";
import { useSocket } from "@/app/context/SocketContext";
import { useToast } from "@/app/context/ToastContext";
import { CategoryItem, OfferCard, Product, SlideData } from "@/app/types/types";
import { addSubscriberApi, AdminOrder, AnalyticsData, broadcastNewsletterApi, getAllOrdersApi, getAnalyticsApi, getSettingsApi, getSubscribersApi, SubscriberInfo, updateSettingsApi } from "@/app/utils/api";
import { products as initialProducts, slide as initialSlides, offers as initialOffers, categories as initialCategories } from "@/app/data/data";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import OverviewTab from "./OverviewTab";
import OperationsTab from "./OperationsTab";
import ProductsTab from "./ProductsTab";
import OrdersTab from "./OrdersTab";
import BannersTab from "./BannersTab";
import SubscribersTab from "./SubscribersTab";
import CategoriesTab from "./CategoriesTab";
import SubCategoriesTab from "./SubCategoriesTab";
import AddProductModal from "./AddProductModal";
import DeliveryTab from "./DeliveryTab";
import CustomersTab from "./CustomersTab";
import StaffTab from "./StaffTab";
import ReviewsTab from "./ReviewsTab";

export type TabType = "overview" | "operations" | "products" | "banners" | "subscribers" | "orders" | "categories" | "subcategories" | "delivery" | "customers" | "staff" | "feedback";

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
  const { role } = useUser();
  const { socket } = useSocket();
  const { toast } = useToast();

  const validTabs: TabType[] = ["overview", "operations", "products", "banners", "subscribers", "orders", "categories", "subcategories", "delivery", "customers", "staff", "feedback"];
  const defaultTab = role === "staff" ? "operations" : "overview";
  const activeTab = tabParam && validTabs.includes(tabParam) ? tabParam : defaultTab;

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

  const [dateRangeOption, setDateRangeOption] = useState<string>("7days");
  const [customStartDate, setCustomStartDate] = useState<string>("");
  const [customEndDate, setCustomEndDate] = useState<string>("");

  const getRangeDates = (option: string, startVal?: string, endVal?: string) => {
    const now = new Date();
    let start: Date | null = null;
    let end: Date | null = now;

    if (option === "today") {
      start = new Date();
    } else if (option === "yesterday") {
      start = new Date();
      start.setDate(start.getDate() - 1);
      end = new Date();
      end.setDate(end.getDate() - 1);
    } else if (option === "7days") {
      start = new Date();
      start.setDate(start.getDate() - 6);
    } else if (option === "30days") {
      start = new Date();
      start.setDate(start.getDate() - 29);
    } else if (option === "month") {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (option === "custom") {
      return {
        startDate: startVal || undefined,
        endDate: endVal || undefined,
      };
    } else {
      return { startDate: undefined, endDate: undefined };
    }

    const formatLocalDate = (d: Date) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    return {
      startDate: start ? formatLocalDate(start) : undefined,
      endDate: end ? formatLocalDate(end) : undefined,
    };
  };

  const [highlightedSchemaSection, setHighlightedSchemaSection] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [newSubEmail, setNewSubEmail] = useState("");
  const [broadcastSubject, setBroadcastSubject] = useState("");
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [broadcastTarget, setBroadcastTarget] = useState("all");
  const [broadcastTargetEmail, setBroadcastTargetEmail] = useState("");
  const [broadcastStatus, setBroadcastStatus] = useState<"idle" | "sending" | "sent">("idle");

  // ── Centralized Data fetch/reload helpers ──────────────────────────────
  const loadInitialData = useCallback(async () => {
    try {
      const [dbSettings, dbSubs, dbOrders] = await Promise.all([
        getSettingsApi(), getSubscribersApi(), getAllOrdersApi(),
      ]);
      setAnnouncementBarEnabled(dbSettings.announcementBarEnabled);
      setFridaySaleEnabled(dbSettings.fridaySaleEnabled);
      setMidnightSaleEnabled(dbSettings.midnightSaleEnabled);
      setShippingFee(dbSettings.shippingFee !== undefined ? Number(dbSettings.shippingFee) : 10);
      setFreeShippingThreshold(dbSettings.freeShippingThreshold !== undefined ? Number(dbSettings.freeShippingThreshold) : 99);
      setSubscribersList(dbSubs);
      setOrdersList(dbOrders);
    } catch (err) {
      console.error("Failed to load initial dashboard data:", err);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadAnalytics = useCallback(async () => {
    if (dateRangeOption === "custom" && (!customStartDate || !customEndDate)) {
      return;
    }
    setAnalyticsLoading(true);
    try {
      const { startDate, endDate } = getRangeDates(dateRangeOption, customStartDate, customEndDate);
      const dbAnalytics = await getAnalyticsApi(startDate, endDate);
      setAnalytics(dbAnalytics);
    } catch (err) {
      console.error("Failed to load analytics dynamic metrics:", err);
    } finally {
      setAnalyticsLoading(false);
    }
  }, [dateRangeOption, customStartDate, customEndDate]);

  // ── Data load (Static Settings, Subs, Orders) ──────────────────────────────
  useEffect(() => {
    loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Dynamic Analytics load (triggers on date changes) ──────────────────────
  useEffect(() => {
    loadAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRangeOption, customStartDate, customEndDate]);

  // ── Socket.IO Real-time Events Listener ────────────────────────────────────
  useEffect(() => {
    if (!socket) return;

    const handleNewOrder = () => {
      console.log("🔌 [Socket.IO Event]: new-order received. Refetching...");
      toast.success("🔔 New order placed! Refreshing dashboard...");
      loadInitialData();
      loadAnalytics();
    };

    const handleOrderStatusUpdated = (data: { orderId: number, status: string } | null) => {
      console.log("🔌 [Socket.IO Event]: order-status-updated received. Refetching...", data);
      if (data) {
        toast.info(`📦 Order #${data.orderId} status updated to: ${data.status.replace(/_/g, ' ').toUpperCase()}`);
      } else {
        toast.info("📦 Order status updated!");
      }
      loadInitialData();
      loadAnalytics();
    };

    const handleOrderUpdated = (data: { orderId: number } | null) => {
      console.log("🔌 [Socket.IO Event]: order-updated received. Refetching...", data);
      loadInitialData();
      loadAnalytics();
    };

    const handleDriverAssigned = (data: { orderId: number } | null) => {
      console.log("🔌 [Socket.IO Event]: driver-assigned received. Refetching...", data);
      if (data) {
        toast.success(`🚚 Driver assigned to order #${data.orderId}`);
      }
      loadInitialData();
      loadAnalytics();
    };

    const handlePrintStatusUpdated = (data: { orderIds: number[] } | null) => {
      console.log("🔌 [Socket.IO Event]: print-status-updated received. Refetching...", data);
      toast.success("🖨️ Order print status updated!");
      loadInitialData();
    };

    const handleDashboardMetricsUpdated = () => {
      console.log("🔌 [Socket.IO Event]: dashboard-metrics-updated received. Refetching...");
      loadAnalytics();
    };

    const handleNewSubscriber = (data: { email: string, country: string } | null) => {
      console.log("🔌 [Socket.IO Event]: new-subscriber received. Refetching...", data);
      if (data) {
        toast.success(`🔔 New subscriber joined: ${data.email} (${data.country})`);
      } else {
        toast.success("🔔 New subscriber registered!");
      }
      loadInitialData();
    };

    socket.on("new-order", handleNewOrder);
    socket.on("order-status-updated", handleOrderStatusUpdated);
    socket.on("order-updated", handleOrderUpdated);
    socket.on("driver-assigned", handleDriverAssigned);
    socket.on("print-status-updated", handlePrintStatusUpdated);
    socket.on("dashboard-metrics-updated", handleDashboardMetricsUpdated);
    socket.on("new-subscriber", handleNewSubscriber);

    return () => {
      socket.off("new-order", handleNewOrder);
      socket.off("order-status-updated", handleOrderStatusUpdated);
      socket.off("order-updated", handleOrderUpdated);
      socket.off("driver-assigned", handleDriverAssigned);
      socket.off("print-status-updated", handlePrintStatusUpdated);
      socket.off("dashboard-metrics-updated", handleDashboardMetricsUpdated);
      socket.off("new-subscriber", handleNewSubscriber);
    };
  }, [socket, loadInitialData, loadAnalytics, toast]);

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
    e.preventDefault(); if (!broadcastSubject || !broadcastMessage) return;
    if (broadcastTarget === "individual" && !broadcastTargetEmail) return;
    setBroadcastStatus("sending");
    const res = await broadcastNewsletterApi(broadcastSubject, broadcastMessage, broadcastTarget, broadcastTargetEmail);
    if (res) {
      setBroadcastStatus("sent");
      setTimeout(() => {
        setBroadcastStatus("idle");
        setBroadcastSubject("");
        setBroadcastMessage("");
        setBroadcastTarget("all");
        setBroadcastTargetEmail("");
      }, 3000);
    } else setBroadcastStatus("idle");
  };

  const handleToggleOffer = (id: number) =>
    setOffersList((prev) =>
      prev.map((o) => o.id === id ? { ...o, badge: o.badge === "DISABLED" ? "ACTIVE PROMO" : "DISABLED" } : o)
    );



  const handleAddSubscriber = async (e: React.FormEvent) => {
    e.preventDefault(); if (!newSubEmail) return;
    try {
      const s = await addSubscriberApi(newSubEmail);
      setSubscribersList((prev) => [s, ...prev]);
      setNewSubEmail("");
      toast.success("Subscriber added successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to add subscriber.");
    }
  };



  // ── Render ─────────────────────────────────────────────────────────────────
  const unreviewedCount = ordersList.filter(o => o.status === "pending" && !(o as any).reviewed_at).length;

  return (
    <div className="min-h-screen bg-white text-gray-900 flex font-sans antialiased selection:bg-orange-500 selection:text-white">

      {/* ── Sidebar ── */}
      <AdminSidebar activeTab={activeTab} setActiveTab={handleSetActiveTab} unreviewedCount={unreviewedCount} />

      {/* ── Main ── */}
      <main className="flex-1 min-w-0 flex flex-col h-screen overflow-y-auto">

        {/* ── Header ── */}
        <AdminHeader activeTab={activeTab} />

        {/* ── Tab Content ── */}
        <div className="p-6 max-w-7xl w-full mx-auto flex-1">
          {activeTab === "operations" && (
            <OperationsTab ordersList={ordersList} setOrdersList={setOrdersList} setActiveTab={handleSetActiveTab} />
          )}
          {activeTab === "staff" && (
            <StaffTab />
          )}
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
              dateRangeOption={dateRangeOption}
              setDateRangeOption={setDateRangeOption}
              customStartDate={customStartDate}
              setCustomStartDate={setCustomStartDate}
              customEndDate={customEndDate}
              setCustomEndDate={setCustomEndDate}
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
              slidesList={slidesList}
              handleToggleSlide={() => { }}
              mobileBannersList={mobileBannersList} setMobileBannersList={setMobileBannersList}
            />
          )}
          {activeTab === "subscribers" && (
            <SubscribersTab
              subscribersList={subscribersList}
              newSubEmail={newSubEmail} setNewSubEmail={setNewSubEmail}
              broadcastSubject={broadcastSubject} setBroadcastSubject={setBroadcastSubject}
              broadcastMessage={broadcastMessage} setBroadcastMessage={setBroadcastMessage}
              broadcastTarget={broadcastTarget} setBroadcastTarget={setBroadcastTarget}
              broadcastTargetEmail={broadcastTargetEmail} setBroadcastTargetEmail={setBroadcastTargetEmail}
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
          {activeTab === "feedback" && (
            <ReviewsTab />
          )}
        </div>
      </main>


    </div>
  );
}