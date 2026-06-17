"use client";
import React from "react";

type TabType = "overview" | "products" | "banners" | "subscribers" | "orders";

interface AdminHeaderProps {
  activeTab: TabType;
}

export default function AdminHeader({ activeTab }: AdminHeaderProps) {
  return (
    <header className=" py-[17px] border-b border-orange-500/30 bg-white px-6 flex items-center justify-between sticky top-0 z-40">
      {/* Page Title */}
      <h1 className="text-lg font-bold text-gray-900 capitalize">
        {activeTab.replace("-", " ")} Control Room
      </h1>

      {/* Server Status Badge */}
      <div className="text-xs text-gray-500 flex items-center gap-1.5 font-semibold bg-white px-3 py-1.5 rounded-full border border-orange-500/30">
        <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
        Azure Doha:{" "}
        <span className="text-gray-900 font-extrabold">Online</span>
      </div>
    </header>
  );
}