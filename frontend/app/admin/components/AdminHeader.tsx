"use client";
import React from "react";
import { Menu } from "lucide-react";

type TabType = "overview" | "operations" | "products" | "banners" | "subscribers" | "orders" | "categories" | "subcategories" | "delivery" | "customers" | "staff" | "feedback" | "analytics" | "returns";

interface AdminHeaderProps {
  activeTab: TabType;
  onMenuClick: () => void;
}

export default function AdminHeader({ activeTab, onMenuClick }: AdminHeaderProps) {
  return (
    <header
      className="py-4 px-4 lg:px-6 flex items-center justify-between sticky top-0 z-[49]"
      style={{
        backgroundColor: 'var(--admin-header-bg)',
        borderBottom: '1px solid var(--admin-header-border)',
      }}
    >
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger menu */}
        <button
          onClick={onMenuClick}
          className="p-2 -ml-2 rounded-lg lg:hidden cursor-pointer transition-colors"
          style={{ color: 'var(--admin-text-dim)' }}
        >
          <Menu size={20} />
        </button>

        {/* Page Title */}
        <h1 className="text-sm sm:text-base lg:text-lg font-bold capitalize" style={{ color: 'var(--admin-text)' }}>
          {activeTab.replace("-", " ")} Control Room
        </h1>
      </div>

      {/* Server Status Badge */}
      <div
        className="text-[10px] sm:text-xs flex items-center gap-1.5 font-semibold px-2.5 py-1.5 rounded-full"
        style={{
          color: 'var(--admin-text-dim)',
          backgroundColor: 'var(--admin-surface)',
          border: '1px solid var(--admin-border-accent)',
        }}
      >
        <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
        <span className="hidden sm:inline">Azure Doha:</span>{" "}
        <span className="font-extrabold" style={{ color: 'var(--admin-text)' }}>Online</span>
      </div>
    </header>
  );
}