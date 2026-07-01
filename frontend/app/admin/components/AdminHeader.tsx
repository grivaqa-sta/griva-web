"use client";
import React from "react";
import { Menu } from "lucide-react";

type TabType = "overview" | "operations" | "products" | "banners" | "subscribers" | "orders" | "categories" | "subcategories" | "delivery" | "customers" | "staff" | "feedback" | "analytics";

interface AdminHeaderProps {
  activeTab: TabType;
  onMenuClick: () => void;
}

export default function AdminHeader({ activeTab, onMenuClick }: AdminHeaderProps) {
  return (
    <header className="py-4 border-b border-orange-500/30 bg-white px-4 lg:px-6 flex items-center justify-between sticky top-0 z-[49]">
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger menu */}
        <button
          onClick={onMenuClick}
          className="p-2 -ml-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg lg:hidden cursor-pointer"
        >
          <Menu size={20} />
        </button>

        {/* Page Title */}
        <h1 className="text-sm sm:text-base lg:text-lg font-bold text-gray-900 capitalize">
          {activeTab.replace("-", " ")} Control Room
        </h1>
      </div>

      {/* Server Status Badge */}
      <div className="text-[10px] sm:text-xs text-gray-500 flex items-center gap-1.5 font-semibold bg-white px-2.5 py-1.5 rounded-full border border-orange-500/30">
        <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
        <span className="hidden sm:inline">Azure Doha:</span>{" "}
        <span className="text-gray-900 font-extrabold">Online</span>
      </div>
    </header>
  );
}