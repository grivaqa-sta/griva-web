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
  Tag,
  Mail,
  UserCog,
  Image,
  Activity,
  Star,
  BarChart3,
} from "lucide-react";
import { useUser } from "@/app/context/UserContext";

type TabType = "overview" | "operations" | "products" | "banners" | "subscribers" | "orders" | "categories" | "subcategories" | "delivery" | "customers" | "staff" | "feedback" | "analytics";

interface AdminSidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  unreviewedCount?: number;
  isOpen?: boolean;
  onClose?: () => void;
}

interface NavItem {
  id: TabType;
  label: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
  staffOnly?: boolean;
}

interface NavGroup {
  group: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    group: "Dashboard",
    items: [
      { id: "overview", label: "Overview & Analytics", icon: <LayoutDashboard className="h-4 w-4" />, adminOnly: true },
      { id: "analytics", label: "Business Analytics", icon: <BarChart3 className="h-4 w-4" />, adminOnly: true },
      { id: "operations", label: "Operations Dashboard", icon: <Activity className="h-4 w-4" />, staffOnly: true },
    ]
  },
  {
    group: "Sales & Operations",
    items: [
      { id: "orders", label: "Manage Orders", icon: <ShoppingBag className="h-4 w-4" /> },
      { id: "delivery", label: "Manage Drivers", icon: <Truck className="h-4 w-4" />, adminOnly: true },
      { id: "feedback", label: "Feedback & Reviews", icon: <Star className="h-4 w-4" /> },
    ]
  },
  {
    group: "Catalog Management",
    items: [
      { id: "products", label: "Manage Products", icon: <Package className="h-4 w-4" /> },
      { id: "categories", label: "Categories", icon: <Tag className="h-4 w-4" /> },
      { id: "subcategories", label: "Sub Categories", icon: <Layers className="h-4 w-4" /> },
    ]
  },
  {
    group: "Marketing & Growth",
    items: [
      { id: "banners", label: "Banners & Layouts", icon: <Image className="h-4 w-4" /> },
      { id: "subscribers", label: "Subscribers Hub", icon: <Mail className="h-4 w-4" /> },
    ]
  },
  {
    group: "User Settings",
    items: [
      { id: "customers", label: "Manage Customers", icon: <Users className="h-4 w-4" /> },
      { id: "staff", label: "Staff Management", icon: <UserCog className="h-4 w-4" />, adminOnly: true },
    ]
  }
];

export default function AdminSidebar({ activeTab, setActiveTab, unreviewedCount, isOpen, onClose }: AdminSidebarProps) {
  const router = useRouter();
  const { logout, role, user } = useUser();
  
  const handleSignOut = () => {
    logout();
    router.replace("/admin/auth/login");
  };

  const filteredGroups = NAV_GROUPS.map((g) => {
    const items = g.items.filter((item) => {
      if (role === "staff") {
        return !item.adminOnly;
      }
      return !item.staffOnly;
    });
    return { ...g, items };
  }).filter((g) => g.items.length > 0);

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`w-64 bg-white border-r border-orange-500/30 flex flex-col justify-between shrink-0 h-screen lg:sticky lg:top-0 select-none transition-transform duration-300 z-50
          fixed inset-y-0 left-0 lg:static lg:translate-x-0
          ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Logo */}
        <div className="flex flex-col items-center px-6 h-16 border-b border-orange-500/30 justify-center shrink-0">
          <img src="/images/logo-dark.png" alt="Griva Logo" className="h-6 w-auto object-contain mb-0.5" />
          <span className="text-[9px] text-gray-500 font-bold tracking-widest uppercase">
            {role === "staff" ? "Staff Control Panel" : "Admin Panel"}
          </span>
        </div>
   
        {/* Nav Links */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {filteredGroups.map((g) => (
            <div key={g.group} className="space-y-2">
              <h3 className="px-4 text-[10px] font-bold text-gray-400 tracking-wider uppercase">
                {g.group}
              </h3>
              <nav className="space-y-1">
                {g.items.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => {
                      setActiveTab(n.id);
                      onClose?.();
                    }}
                    className={`w-full flex items-center text-left gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                      activeTab === n.id
                        ? "bg-gradient-to-r from-orange-500/15 to-amber-500/5 text-orange-500 border-l-4 border-orange-500"
                        : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    {n.icon}
                    <span className="flex-1">{n.label}</span>
                    {n.id === "orders" && unreviewedCount !== undefined && unreviewedCount > 0 && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white animate-pulse shrink-0">
                        {unreviewedCount}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </div>
          ))}
        </div>

      {/* Footer */}
      <div className="p-6 border-t border-orange-500/30 space-y-3 shrink-0">
        {/* Admin Identity */}
        <div className="flex items-center gap-3 px-2">
          <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center font-black text-sm text-white uppercase">
            {role === "staff" ? "S" : "A"}
          </div>
          <div>
            <span className="text-xs font-bold block text-gray-800 truncate max-w-[120px]">
              {user?.name || (role === "staff" ? "Griva Staff" : "Griva Admin")}
            </span>
            <span className="text-[9px] text-green-500 font-bold flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
              {role === "staff" ? "Operations Staff" : "Store Admin"}
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
    </>
  );
}
