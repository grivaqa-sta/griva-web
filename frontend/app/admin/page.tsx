"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminSettings } from "../context/AdminContext";
import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  Sliders,
  Users,
  Search,
  Bell,
  Plus,
  Trash2,
  RefreshCw,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Percent,
  ChevronRight,
  Edit,
  ArrowUpRight,
  Mail,
  Send,
  Eye,
  AlertTriangle,
  X,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Image as ImageIcon,
  CheckCircle,
  EyeOff,
} from "lucide-react";

// Seed data
import { products as initialProducts, slide as initialSlides, offers as initialOffers, categories as initialCategories } from "../data/data";
import { Product, SlideData, OfferCard, CategoryItem } from "../types/types";
import OverviewTab from './components/OverviewTab';
import ProductsTab from './components/ProductsTab';
import BannersTab from './components/BannersTab';
import SubscribersTab from './components/SubscribersTab';


export default function AdminDashboard() {
  const router = useRouter();

  // Auth guard — redirect to admin login if not authenticated
  useEffect(() => {
    const isAuth = localStorage.getItem("griva_admin_auth");
    if (!isAuth) {
      router.replace("/admin/login");
    }
  }, [router]);

  // Navigation State
  const [activeTab, setActiveTab] = useState<"overview" | "products" | "banners" | "subscribers">("overview");

  // Dynamic Content States
  const [productsList, setProductsList] = useState<Product[]>(initialProducts);
  const [slidesList, setSlidesList] = useState<SlideData[]>(initialSlides);
  const [offersList, setOffersList] = useState<OfferCard[]>(initialOffers);
  const [categoriesList, setCategoriesList] = useState<CategoryItem[]>(initialCategories);

  // Global Campaign Toggles — driven by AdminContext (persisted to localStorage)
  const {
    announcementBarEnabled,
    setAnnouncementBarEnabled,
    fridaySaleEnabled,
    setFridaySaleEnabled,
    midnightSaleEnabled,
    setMidnightSaleEnabled,
    cmsMobileBanners: mobileBannersList,
    setCmsMobileBanners: setMobileBannersList,
  } = useAdminSettings();

  // Layout Hover State (Highlights corresponding admin section when hovering the homepage schema)
  const [highlightedSchemaSection, setHighlightedSchemaSection] = useState<string | null>(null);

  // Interactive Product States
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form States
  const [newTitle, setNewTitle] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newOldPrice, setNewOldPrice] = useState("");
  const [newStock, setNewStock] = useState(10);
  const [newCategory, setNewCategory] = useState("Gadgets");
  const [newDesc, setNewDesc] = useState("");
  const [newBadge, setNewBadge] = useState("");
  const [newMainImage, setNewMainImage] = useState("https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=800&auto=format&fit=crop");
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [newGalleryImage, setNewGalleryImage] = useState("");

  // Specs and Colors
  const [specsList, setSpecsList] = useState<{ label: string; value: string }[]>([]);
  const [newSpecLabel, setNewSpecLabel] = useState("");
  const [newSpecValue, setNewSpecValue] = useState("");
  const [colorsList, setColorsList] = useState<{ name: string; hex: string }[]>([]);
  const [newColorName, setNewColorName] = useState("");
  const [newColorHex, setNewColorHex] = useState("#000000");

  // Subscribers States
  const [subscribersList, setSubscribersList] = useState([
    { email: "jassim.althani@gmail.com", joinedDate: "June 01, 2026", country: "Qatar" },
    { email: "fatima.almansouri@yahoo.com", joinedDate: "May 29, 2026", country: "Qatar" },
    { email: "john.doe@verizon.com", joinedDate: "May 25, 2026", country: "United States" },
  ]);
  const [newSubEmail, setNewSubEmail] = useState("");
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [broadcastStatus, setBroadcastStatus] = useState<"idle" | "sending" | "sent">("idle");

  // Categories helper
  const categories = Array.from(new Set(productsList.map((p) => p.category)));

  // Add Spec Tag Helper
  const handleAddSpec = () => {
    if (newSpecLabel && newSpecValue) {
      setSpecsList((prev) => [...prev, { label: newSpecLabel, value: newSpecValue }]);
      setNewSpecLabel("");
      setNewSpecValue("");
    }
  };

  // Add Color Tag Helper
  const handleAddColor = () => {
    if (newColorName) {
      setColorsList((prev) => [...prev, { name: newColorName, hex: newColorHex }]);
      setNewColorName("");
      setNewColorHex("#000000");
    }
  };

  // Add Gallery Image Helper
  const handleAddGalleryImage = () => {
    if (newGalleryImage) {
      setGalleryImages((prev) => [...prev, newGalleryImage]);
      setNewGalleryImage("");
    }
  };

  // Handle Dispatching Broadcast Campaigns
  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMessage) return;
    setBroadcastStatus("sending");
    setTimeout(() => {
      setBroadcastStatus("sent");
      setTimeout(() => {
        setBroadcastStatus("idle");
        setBroadcastMessage("");
      }, 3000);
    }, 1500);
  };

  // Add New Product Submission Handler
  const handleAddProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newPrice) return;

    const newProductItem: Product = {
      id: Date.now(),
      title: newTitle,
      category: newCategory,
      image: newMainImage as any,
      images: [newMainImage, ...galleryImages] as any,
      price: `$${parseFloat(newPrice).toFixed(2)}`,
      oldPrice: newOldPrice ? `$${parseFloat(newOldPrice).toFixed(2)}` : undefined,
      badge: newBadge || undefined,
      badgeColor: newBadge ? "bg-blue-600" : undefined,
      buttonText: "ADD TO CART",
      rating: 5,
      reviewCount: 0,
      stock: newStock,
      description: newDesc,
      specs: specsList,
      colors: colorsList,
      storageOptions: [{ label: "256GB", value: "256gb" }],
    };

    setProductsList((prev) => [newProductItem, ...prev]);

    // Reset Form fields
    setNewTitle("");
    setNewPrice("");
    setNewOldPrice("");
    setNewStock(10);
    setNewDesc("");
    setNewBadge("");
    setSpecsList([]);
    setColorsList([]);
    setGalleryImages([]);
    setIsAddModalOpen(false);
  };

  // Filter products list
  const filteredProducts = productsList.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === "all" || p.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Toggle active slide state
  const handleToggleSlide = (index: number) => {
    setSlidesList((prev) =>
      prev.map((s, idx) => {
        if (idx === index) {
          // In real-world, we toggle a visible flag. Here we toggle values to simulate deactivation.
          return { ...s, badge: s.badge === "DISABLED" ? "ACTIVE DEAL" : "DISABLED" };
        }
        return s;
      })
    );
  };

  // Toggle active promo offer state
  const handleToggleOffer = (id: number) => {
    setOffersList((prev) =>
      prev.map((o) => {
        if (o.id === id) {
          return { ...o, badge: o.badge === "DISABLED" ? "ACTIVE PROMO" : "DISABLED" };
        }
        return o;
      })
    );
  };

  // Adjust stock count inline
  const handleStockAdjustment = (productId: number, delta: number) => {
    setProductsList((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          const nextStock = (p.stock || 0) + delta;
          return { ...p, stock: nextStock < 0 ? 0 : nextStock };
        }
        return p;
      })
    );
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 flex font-sans antialiased selection:bg-orange-500 selection:text-white">

      {/* Sidebar Panel */}
      <aside className="w-64 bg-white border-r border-orange-500/30 backdrop-blur-xl flex flex-col justify-between p-6 shrink-0 h-screen sticky top-0">
        <div>
          <div className="flex flex-col justify-center items-center place-items-center px-6 h-20 -mt-6 -mx-6 mb-6 border-b border-orange-500/30">
              <span className="font-black text-lg tracking-wider bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent">GRIVA</span>
              <span className="text-[9px] block text-gray-500 font-bold tracking-widest uppercase">Admin Panel</span>
          </div>

          <nav className="space-y-1.5">
            <button
              onClick={() => setActiveTab("overview")}
              className={`w-full flex items-center text-left gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${activeTab === "overview"
                ? "bg-gradient-to-r from-orange-500/20 to-amber-500/10 text-orange-400 border-l-4 border-orange-500"
                : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                }`}
            >
              <LayoutDashboard className="h-4.5 w-4.5" />
              Overview & Campaigns
            </button>

            <button
              onClick={() => setActiveTab("products")}
              className={`w-full flex items-center text-left gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${activeTab === "products"
                ? "bg-gradient-to-r from-orange-500/20 to-amber-500/10 text-orange-400 border-l-4 border-orange-500"
                : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                }`}
            >
              <Package className="h-4.5 w-4.5" />
              Manage Products
            </button>

            <button
              onClick={() => setActiveTab("banners")}
              className={`w-full flex items-center text-left gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${activeTab === "banners"
                ? "bg-gradient-to-r from-orange-500/20 to-amber-500/10 text-orange-400 border-l-4 border-orange-500"
                : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                }`}
            >
              <Sliders className="h-4.5 w-4.5" />
              Banners & Layouts
            </button>

            <button
              onClick={() => setActiveTab("subscribers")}
              className={`w-full flex items-center text-left gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${activeTab === "subscribers"
                ? "bg-gradient-to-r from-orange-500/20 to-amber-500/10 text-orange-400 border-l-4 border-orange-500"
                : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                }`}
            >
              <Users className="h-4.5 w-4.5" />
              Subscribers Hub
            </button>
          </nav>
        </div>

        <div className="pt-4 border-t border-orange-500/30 space-y-4">
          <div className="flex items-center gap-3 px-2">
            <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center font-bold text-sm text-white">
              JD
            </div>
            <div>
              <span className="text-xs font-bold block text-gray-800">John Doe</span>
              <span className="text-[9px] text-green-400 font-bold tracking-wider flex items-center gap-1 uppercase">
                <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse inline-block" />
                Store Admin
              </span>
            </div>
          </div>
          <Link
            href="/"
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-orange-500/30 text-xs font-bold text-gray-700 hover:bg-orange-500/10 hover:text-gray-900 transition-all duration-300 cursor-pointer"
          >
            <ArrowUpRight className="h-3.5 w-3.5 text-orange-500" />
            View Live Store
          </Link>
          <button
            onClick={() => {
              localStorage.removeItem("griva_admin_auth");
              router.replace("/admin/login");
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-red-500/30 text-xs font-bold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-300 cursor-pointer"
          >
            <EyeOff className="h-3.5 w-3.5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Panel Workspace */}
      <main className="flex-1 min-w-0 flex flex-col h-screen overflow-y-auto">
        <header className="h-20 border-b border-orange-500/30 bg-white backdrop-blur-md px-12 flex items-center justify-between sticky top-0 z-40">
          <h1 className="text-xl font-bold py-10 text-gray-900 capitalize">{activeTab} Control Room</h1>
          <div className="text-xs text-gray-500 flex items-center gap-1.5 font-semibold bg-white px-3 py-1.5 rounded-full border border-orange-500/30">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            Azure Doha: <span className="text-gray-900 font-extrabold">Online</span>
          </div>
        </header>

        <div className="p-12 max-w-7xl w-full mx-auto flex-1">
          {/* ─────────────────────────────────────────────────────────
              TAB 1: OVERVIEW & CAMPAIGNS (Friday/Midnight Sale controls)
              ───────────────────────────────────────────────────────── */}

          {activeTab === 'overview' && (
            <OverviewTab 
              announcementBarEnabled={announcementBarEnabled}
              setAnnouncementBarEnabled={setAnnouncementBarEnabled}
              fridaySaleEnabled={fridaySaleEnabled}
              setFridaySaleEnabled={setFridaySaleEnabled}
              midnightSaleEnabled={midnightSaleEnabled}
              setMidnightSaleEnabled={setMidnightSaleEnabled}
              highlightedSchemaSection={highlightedSchemaSection}
              setHighlightedSchemaSection={setHighlightedSchemaSection}
              setActiveTab={setActiveTab}
              slidesList={slidesList}
              categoriesList={categoriesList}
              offersList={offersList}
            />
          )}

          {activeTab === 'products' && (
            <ProductsTab
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              filterCategory={filterCategory}
              setFilterCategory={setFilterCategory}
              categories={categories}
              setIsAddModalOpen={setIsAddModalOpen}
              filteredProducts={filteredProducts}
              handleStockAdjustment={handleStockAdjustment}
              setProductsList={setProductsList}
            />
          )}

          {activeTab === 'banners' && (
            <BannersTab
              slidesList={slidesList}
              categoriesList={categoriesList}
              offersList={offersList}
              handleToggleSlide={handleToggleSlide}
              handleToggleOffer={handleToggleOffer}
              mobileBannersList={mobileBannersList}
              setMobileBannersList={setMobileBannersList}
            />
          )}

          {activeTab === 'subscribers' && (
            <SubscribersTab
              subscribersList={subscribersList}
              setSubscribersList={setSubscribersList}
              newSubEmail={newSubEmail}
              setNewSubEmail={setNewSubEmail}
              broadcastMessage={broadcastMessage}
              setBroadcastMessage={setBroadcastMessage}
              broadcastStatus={broadcastStatus}
              handleSendBroadcast={handleSendBroadcast}
            />
          )}

</div>
      </main>

      {/* "ADD NEW PRODUCT" MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in-20 duration-300">
          <div className="bg-white border border-orange-500/30 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-orange-500" />
                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Add Catalog Product</h4>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 hover:bg-orange-500/10 rounded-lg text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddProductSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1.5">Product Title</label>
                  <input
                    type="text"
                    required
                    placeholder="Samsung Galaxy S23 Ultra..."
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full bg-white border border-orange-500/30 rounded-xl px-4 py-2.5 text-xs text-gray-800 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1.5">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-white border border-orange-500/30 rounded-xl px-4 py-2.5 text-xs text-gray-500 focus:outline-none cursor-pointer"
                  >
                    <option value="Gadgets">Gadgets</option>
                    <option value="Laptops">Laptops</option>
                    <option value="Television">Television</option>
                    <option value="Speakers">Speakers</option>
                    <option value="Headphones">Headphones</option>
                    <option value="Gaming">Gaming</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1.5">Main Image URL</label>
                  <input
                    type="url"
                    placeholder="https://example.com/image.jpg or /images/product.png"
                    value={newMainImage}
                    onChange={(e) => setNewMainImage(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-gray-800 focus:outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1.5">Additional Gallery Images</label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="Add another image URL..."
                      value={newGalleryImage}
                      onChange={(e) => setNewGalleryImage(e.target.value)}
                      className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-800 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddGalleryImage}
                      className="px-3 bg-orange-500/10 hover:bg-gray-50 text-xs font-bold text-gray-900 rounded-xl transition-colors cursor-pointer"
                    >
                      Add Image
                    </button>
                  </div>
                  {galleryImages.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2 bg-gray-50 p-2 rounded-xl border border-gray-200">
                      {galleryImages.map((img, idx) => (
                        <span key={idx} className="text-[9px] font-bold text-gray-500 bg-white border border-gray-200 px-2.5 py-1 rounded-lg flex items-center gap-1.5 max-w-xs truncate">
                          {img}
                          <X className="h-3 w-3 text-red-500 hover:text-red-400 cursor-pointer shrink-0" onClick={() => setGalleryImages(prev => prev.filter((_, i) => i !== idx))} />
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1.5">Sale Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="699.99"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full bg-white border border-orange-500/30 rounded-xl px-4 py-2.5 text-xs text-gray-800 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1.5">Original Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="949.99"
                    value={newOldPrice}
                    onChange={(e) => setNewOldPrice(e.target.value)}
                    className="w-full bg-white border border-orange-500/30 rounded-xl px-4 py-2.5 text-xs text-gray-800 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1.5">Initial Stock</label>
                  <input
                    type="number"
                    required
                    placeholder="12"
                    value={newStock}
                    onChange={(e) => setNewStock(parseInt(e.target.value))}
                    className="w-full bg-white border border-orange-500/30 rounded-xl px-4 py-2.5 text-xs text-gray-800 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1.5">Description</label>
                  <textarea
                    rows={3}
                    placeholder="High power mobile device..."
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    className="w-full bg-white border border-orange-500/30 rounded-xl px-4 py-2 text-xs text-gray-800 focus:outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1.5">Promo Badge Text (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. -26% or HOT"
                    value={newBadge}
                    onChange={(e) => setNewBadge(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-gray-800 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1.5">Add Technical Specs</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Label: Display"
                    value={newSpecLabel}
                    onChange={(e) => setNewSpecLabel(e.target.value)}
                    className="flex-1 bg-white border border-orange-500/30 rounded-xl px-3 py-2 text-xs text-gray-800 focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Value: 6.8 inch screen"
                    value={newSpecValue}
                    onChange={(e) => setNewSpecValue(e.target.value)}
                    className="flex-1 bg-white border border-orange-500/30 rounded-xl px-3 py-2 text-xs text-gray-800 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddSpec}
                    className="px-3 bg-orange-500/10 hover:bg-orange-500/20 text-xs font-bold text-orange-500 rounded-xl transition-colors cursor-pointer"
                  >
                    Add Spec
                  </button>
                </div>
                {specsList.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2 bg-gray-50 p-2 rounded-xl border border-orange-500/20">
                    {specsList.map((spec, idx) => (
                      <span key={idx} className="text-[9px] font-bold text-gray-500 bg-white border border-orange-500/30 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                        {spec.label}: {spec.value}
                        <X className="h-3 w-3 text-red-500 hover:text-red-400 cursor-pointer" onClick={() => setSpecsList(prev => prev.filter((_, i) => i !== idx))} />
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1.5">Add Colors</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Color Name: Cream"
                    value={newColorName}
                    onChange={(e) => setNewColorName(e.target.value)}
                    className="flex-1 bg-white border border-orange-500/30 rounded-xl px-3 py-2 text-xs text-gray-800 focus:outline-none"
                  />
                  <input
                    type="color"
                    value={newColorHex}
                    onChange={(e) => setNewColorHex(e.target.value)}
                    className="h-8 w-12 bg-transparent border-0 cursor-pointer p-0 shrink-0"
                  />
                  <button
                    type="button"
                    onClick={handleAddColor}
                    className="px-3 bg-orange-500/10 hover:bg-orange-500/20 text-xs font-bold text-orange-500 rounded-xl transition-colors cursor-pointer"
                  >
                    Add Color
                  </button>
                </div>
                {colorsList.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2 bg-gray-50 p-2 rounded-xl border border-gray-200">
                    {colorsList.map((color, idx) => (
                      <span key={idx} className="text-[9px] font-bold text-gray-500 bg-white border border-orange-500/30 px-2.5 py-1 rounded-lg flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full inline-block" style={{ backgroundColor: color.hex }} />
                        {color.name}
                        <X className="h-3 w-3 text-red-500 hover:text-red-400 cursor-pointer" onClick={() => setColorsList(prev => prev.filter((_, i) => i !== idx))} />
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1.5">Product Image Cover URL</label>
                <input
                  type="text"
                  required
                  placeholder="https://pub-xxxxxx.r2.dev/iphone15.png"
                  value={newMainImage}
                  onChange={(e) => setNewMainImage(e.target.value)}
                  className="w-full bg-white border border-orange-500/30 rounded-xl px-4 py-2.5 text-xs text-gray-800 focus:outline-none"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-3 bg-white border border-gray-200 hover:bg-gray-50 text-xs font-bold text-gray-500 hover:text-gray-900 rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-xs font-bold text-white rounded-xl transition-all cursor-pointer shadow-lg shadow-orange-500/10"
                >
                  Save to Catalog
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}