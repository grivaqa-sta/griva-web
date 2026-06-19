"use client";
import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Sliders,
  Users,
  ArrowUpRight,
  EyeOff,
  ShoppingBag,
  List,
  Layers,
  Truck,
} from "lucide-react";
import { useUser } from "@/app/context/UserContext";

type TabType = "overview" | "products" | "banners" | "subscribers" | "orders" | "categories" | "subcategories" | "delivery";

interface AdminSidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

const NAV = [
  { id: "overview",     label: "Overview & Analytics",  icon: <LayoutDashboard className="h-4 w-4" /> },
  { id: "categories",   label: "Categories",             icon: <List className="h-4 w-4" /> },
  { id: "subcategories",label: "Sub Categories",         icon: <Layers className="h-4 w-4" /> },
  { id: "products",     label: "Manage Products",        icon: <Package className="h-4 w-4" /> },
  { id: "orders",       label: "Orders Control Room",    icon: <ShoppingBag className="h-4 w-4" /> },
  { id: "delivery",     label: "Manage Drivers",         icon: <Truck className="h-4 w-4" /> },
  { id: "banners",      label: "Banners & Layouts",      icon: <Sliders className="h-4 w-4" /> },
  { id: "subscribers",  label: "Subscribers Hub",        icon: <Users className="h-4 w-4" /> },
] as const;

export default function AdminSidebar({ activeTab, setActiveTab }: AdminSidebarProps) {
  const router = useRouter();
  const { logout } = useUser();
  
  const handleSignOut = () => {
    logout();
    router.replace("/admin/auth/login");
  };

  return (
    <aside className="w-64 bg-white border-r border-orange-500/30 flex flex-col justify-between p-6 shrink-0 h-screen sticky top-0">
      {/* Logo */}
      <div>
        <div className="flex flex-col items-center px-6 h-16 -mt-6 -mx-6 mb-6 border-b border-orange-500/30 justify-center">
          <img src="/images/logo-dark.png" alt="Griva Logo" className="h-6 w-auto object-contain mb-0.5" />
          <span className="text-[9px] text-gray-500 font-bold tracking-widest uppercase">
            Admin Panel
          </span>
        </div>

        {/* Nav Links */}
        <nav className="space-y-1">
          {NAV.map((n) => (
            <button
              key={n.id}
              onClick={() => setActiveTab(n.id as TabType)}
              className={`w-full flex items-center text-left gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                activeTab === n.id
                  ? "bg-gradient-to-r from-orange-500/15 to-amber-500/5 text-orange-500 border-l-4 border-orange-500"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              {n.icon}
              {n.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Footer */}
      <div className="pt-4 border-t border-orange-500/30 space-y-3">
        {/* Admin Identity */}
        <div className="flex items-center gap-3 px-2">
          <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center font-black text-sm text-white">
            G
          </div>
          <div>
            <span className="text-xs font-bold block text-gray-800">Griva Admin</span>
            <span className="text-[9px] text-green-500 font-bold flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
              Store Admin
            </span>
          </div>
        </div>

        {/* View Store */}
        <Link
          href="/"
          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-orange-500/30 text-xs font-bold text-gray-600 hover:bg-orange-500/5 hover:text-gray-900 transition-all cursor-pointer"
        >
          <ArrowUpRight className="h-3.5 w-3.5 text-orange-500" />
          View Live Store
        </Link>

        {/* Sign Out */}
        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-red-500/30 text-xs font-bold text-red-400 hover:bg-red-500/5 transition-all cursor-pointer"
        >
          <EyeOff className="h-3.5 w-3.5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}