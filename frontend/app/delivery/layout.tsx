"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function DeliveryLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (pathname === "/delivery/login") {
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("griva_delivery_token");
      if (!token) {
        router.replace("/delivery/login");
        return;
      }

      const payload = JSON.parse(atob(token.split(".")[1]));
      if (payload.role !== "delivery") {
        localStorage.removeItem("griva_delivery_token");
        router.replace("/delivery/login");
        return;
      }

      setLoading(false);
    } catch {
      localStorage.removeItem("griva_delivery_token");
      router.replace("/delivery/login");
    }
  }, [pathname, router]);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("griva_delivery_token");
    }
    router.push("/delivery/login");
  };

  if (loading && pathname !== "/delivery/login") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-gray-400 font-semibold animate-pulse">Checking credentials...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" style={{ maxWidth: "480px", margin: "0 auto" }}>
      {/* Simple Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg font-black text-orange-500 tracking-tight">GR<span className="text-gray-900">i</span>VA</span>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-l border-gray-200 pl-2">Delivery</span>
        </div>
        {pathname !== "/delivery/login" && (
          <button
            onClick={handleLogout}
            className="text-xs font-bold text-red-500 bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg active:bg-red-100 cursor-pointer"
          >
            Logout
          </button>
        )}
      </header>

      {/* Page Content */}
      <main className="p-4">
        {children}
      </main>
    </div>
  );
}
