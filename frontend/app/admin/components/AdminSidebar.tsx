"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Sliders,
  Users,
  ArrowUpRight,
  LogOut,
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
  Undo,
  Sun,
  Moon,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useUser } from "@/app/context/UserContext";
import { useAdminTheme } from "@/app/admin/context/AdminThemeContext";

type TabType = "overview" | "operations" | "products" | "banners" | "subscribers" | "orders" | "categories" | "subcategories" | "delivery" | "customers" | "staff" | "feedback" | "analytics" | "returns";

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
      { id: "returns", label: "Returns & Refunds", icon: <Undo className="h-4 w-4" /> },
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
  const { theme, toggleTheme, isDark } = useAdminTheme();
  
  // Track collapsed state of groups (default expanded)
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (groupName: string) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [groupName]: !prev[groupName],
    }));
  };

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
          className="fixed inset-0 z-50 backdrop-blur-xs lg:hidden"
          style={{ backgroundColor: 'var(--admin-modal-overlay)' }}
          onClick={onClose}
        />
      )}

      <aside
        className={`w-64 flex flex-col justify-between shrink-0 h-screen lg:sticky lg:top-0 select-none transition-transform duration-300 z-50
          fixed inset-y-0 left-0 lg:static lg:translate-x-0
          ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
        style={{
          backgroundColor: 'var(--admin-sidebar-bg)',
          borderRight: '1px solid var(--admin-sidebar-border)',
        }}
      >
        {/* Logo */}
        <div
          className="flex flex-col items-center px-6 h-16 justify-center shrink-0"
          style={{ borderBottom: '1px solid var(--admin-sidebar-border)' }}
        >
          <img
            src={isDark ? "/images/logo-light.png" : "/images/logo-dark.png"}
            alt="Griva Logo"
            className="h-6 w-auto object-contain mb-0.5"
          />
          <span className="text-[9px] font-bold tracking-widest uppercase" style={{ color: 'var(--admin-text-dim)' }}>
            {role === "staff" ? "Staff Control Panel" : "Admin Panel"}
          </span>
        </div>
   
        {/* Nav Links */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {filteredGroups.map((g) => {
            const isCollapsed = collapsedGroups[g.group];
            return (
              <div key={g.group} className="space-y-1">
                <button
                  onClick={() => toggleGroup(g.group)}
                  className="w-full flex items-center justify-between px-4 py-1.5 text-[10px] font-bold tracking-wider uppercase text-left cursor-pointer select-none rounded-lg hover:text-orange-500 transition-colors"
                  style={{ color: 'var(--admin-text-faint)' }}
                >
                  <span>{g.group}</span>
                  {isCollapsed ? (
                    <ChevronRight className="h-3 w-3 shrink-0" />
                  ) : (
                    <ChevronDown className="h-3 w-3 shrink-0" />
                  )}
                </button>
                {!isCollapsed && (
                  <nav className="space-y-0.5">
                    {g.items.map((n) => (
                      <button
                        key={n.id}
                        onClick={() => {
                          setActiveTab(n.id);
                          onClose?.();
                        }}
                        className={`w-full flex items-center text-left gap-3 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                          activeTab === n.id
                            ? "text-orange-500 border-l-4 border-orange-500"
                            : ""
                        }`}
                        style={
                          activeTab === n.id
                            ? { background: 'var(--admin-sidebar-active-bg)' }
                            : { color: 'var(--admin-text-dim)' }
                        }
                        onMouseEnter={(e) => {
                          if (activeTab !== n.id) {
                            e.currentTarget.style.backgroundColor = 'var(--admin-surface-hover)';
                            e.currentTarget.style.color = 'var(--admin-text)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (activeTab !== n.id) {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = 'var(--admin-text-dim)';
                          }
                        }}
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
                )}
              </div>
            );
          })}
        </div>

      {/* Compact Footer (Saves 80% vertical space, fits small laptops perfectly) */}
      <div className="p-4 shrink-0" style={{ borderTop: '1px solid var(--admin-sidebar-border)' }}>
        <div className="flex items-center justify-between px-1">
          {/* Identity */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center font-black text-xs text-white uppercase shrink-0">
              {role === "staff" ? "S" : "A"}
            </div>
            <div className="min-w-0 leading-tight">
              <span className="text-xs font-bold block truncate max-w-[85px]" style={{ color: 'var(--admin-text-secondary)' }}>
                {user?.name || (role === "staff" ? "Staff" : "Admin")}
              </span>
              <span className="text-[8px] text-green-500 font-bold flex items-center gap-0.5">
                <span className="h-1 w-1 rounded-full bg-green-500 animate-pulse shrink-0" />
                {role === "staff" ? "Operations" : "Store Admin"}
              </span>
            </div>
          </div>

          {/* Compact Action Icons */}
          <div className="flex items-center gap-0.5 shrink-0">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition cursor-pointer active:scale-95"
              title={isDark ? "Light Mode" : "Dark Mode"}
            >
              {isDark ? <Sun className="h-3.5 w-3.5 text-orange-500" /> : <Moon className="h-3.5 w-3.5 text-orange-500" />}
            </button>

            {/* View Live Store */}
            <Link
              href="/"
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition cursor-pointer"
              title="View Live Store"
            >
              <ArrowUpRight className="h-3.5 w-3.5 text-orange-500" />
            </Link>

            {/* Sign Out */}
            <button
              onClick={handleSignOut}
              className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-red-400 hover:text-red-500 transition cursor-pointer active:scale-95"
              title="Sign Out"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </aside>
    </>
  );
}