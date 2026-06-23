// FEATURE: Delivery Boy System
// File: frontend/app/delivery/layout.tsx
// Luxury mobile-first design system wrapper with Light/Dark Theme toggle support

"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function DeliveryLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  // Read theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("griva_delivery_theme");
    if (savedTheme === "light" || savedTheme === "dark") {
      setTheme(savedTheme);
    }
  }, []);

  // Listen to theme change events from pages
  useEffect(() => {
    const handleThemeChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail === "light" || customEvent.detail === "dark") {
        setTheme(customEvent.detail);
      }
    };
    window.addEventListener("griva-delivery-theme-toggle", handleThemeChange);
    return () => {
      window.removeEventListener("griva-delivery-theme-toggle", handleThemeChange);
    };
  }, []);

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

  if (loading && pathname !== "/delivery/login") {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 border-2 border-[#FF6A00] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-zinc-400 font-semibold tracking-wider animate-pulse">VERIFYING DRIVER CREDENTIALS...</p>
        </div>
      </div>
    );
  }

  const isLightTheme = theme === "light";

  return (
    <div 
      className={`min-h-screen flex flex-col max-w-[480px] mx-auto relative border-x shadow-2xl overflow-x-hidden transition-colors duration-300 ${
        isLightTheme 
          ? "bg-[#f5f5f7] text-[#121212] border-zinc-200 delivery-light-theme" 
          : "bg-[#050505] text-white border-zinc-900"
      }`}
    >
      {/* Dynamic light theme CSS overrides */}
      {isLightTheme && (
        <style jsx global>{`
          .delivery-light-theme {
            background-color: #f5f5f7 !important;
            color: #121212 !important;
          }
          
          /* Main page background overrides (pitch black to light gray) */
          .delivery-light-theme .bg-\[\#050505\],
          .delivery-light-theme .bg-black,
          .delivery-light-theme .bg-\[\#020202\] {
            background-color: #f5f5f7 !important;
          }

          /* Card/Panel backgrounds (solid white) */
          .delivery-light-theme .bg-zinc-950,
          .delivery-light-theme .bg-zinc-950\/40,
          .delivery-light-theme .bg-zinc-950\/50,
          .delivery-light-theme .bg-zinc-950\/60,
          .delivery-light-theme .bg-zinc-950\/30,
          .delivery-light-theme .bg-zinc-950\/85,
          .delivery-light-theme .bg-zinc-900,
          .delivery-light-theme .bg-zinc-900\/10,
          .delivery-light-theme .bg-zinc-900\/30,
          .delivery-light-theme .bg-zinc-900\/60,
          .delivery-light-theme .bg-\[\#070707\],
          .delivery-light-theme .bg-\[\#070707\]\/90,
          .delivery-light-theme .bg-\[\#070707\]\/95,
          .delivery-light-theme .bg-\[\#0b0b0b\]\/80,
          .delivery-light-theme .bg-\[\#0c0c0c\]\/80,
          .delivery-light-theme .bg-\[\#0c0c0c\],
          .delivery-light-theme .bg-\[\#0a0a0a\]\/80,
          .delivery-light-theme .bg-\[\#0a0a0a\],
          .delivery-light-theme .bg-\[\#080808\],
          .delivery-light-theme .bg-zinc-950\/80,
          .delivery-light-theme .bg-black\/40,
          .delivery-light-theme .bg-black\/80 {
            background-color: #ffffff !important;
            border-color: #e4e4e7 !important;
          }

          /* Primary text color overrides (white to dark gray/black) */
          .delivery-light-theme .text-white,
          .delivery-light-theme .text-zinc-100,
          .delivery-light-theme .text-zinc-200,
          .delivery-light-theme .text-zinc-300 {
            color: #18181b !important;
          }
          
          /* Secondary/muted text and icons (zinc gray to steel gray) */
          .delivery-light-theme .text-zinc-400,
          .delivery-light-theme .text-zinc-500,
          .delivery-light-theme .text-zinc-600 {
            color: #71717a !important;
          }

          /* Border overrides to soft gray */
          .delivery-light-theme .border-zinc-900,
          .delivery-light-theme .border-zinc-800,
          .delivery-light-theme .border-zinc-900\/40,
          .delivery-light-theme .border-zinc-900\/50,
          .delivery-light-theme .border-zinc-900\/60,
          .delivery-light-theme .border-zinc-900\/80,
          .delivery-light-theme .border-zinc-800\/80,
          .delivery-light-theme .border-zinc-800\/50,
          .delivery-light-theme .border-x,
          .delivery-light-theme .border-t,
          .delivery-light-theme .border-b {
            border-color: #e4e4e7 !important;
          }

          .delivery-light-theme .divide-zinc-900 > * + *,
          .delivery-light-theme .divide-zinc-900\/60 > * + * {
            border-color: #e4e4e7 !important;
          }

          /* Headers, footers and fixed bars */
          .delivery-light-theme header {
            background-color: #ffffff !important;
            border-bottom-color: #e4e4e7 !important;
          }

          .delivery-light-theme .fixed.bottom-0,
          .delivery-light-theme .sticky.bottom-0 {
            background-color: #ffffff !important;
            border-top-color: #e4e4e7 !important;
          }

          /* Form inputs */
          .delivery-light-theme input,
          .delivery-light-theme select,
          .delivery-light-theme textarea {
            background-color: #ffffff !important;
            color: #18181b !important;
            border-color: #e4e4e7 !important;
          }

          .delivery-light-theme input::placeholder,
          .delivery-light-theme textarea::placeholder {
            color: #a1a1aa !important;
          }

          /* Focus state */
          .delivery-light-theme input:focus,
          .delivery-light-theme select:focus,
          .delivery-light-theme textarea:focus {
            border-color: #FF6A00 !important;
            outline: none;
          }

          /* Details panel background overrides */
          .delivery-light-theme .bg-zinc-900\/10,
          .delivery-light-theme .bg-zinc-950\/10,
          .delivery-light-theme .bg-\[\#0c0c0c\]\/80,
          .delivery-light-theme .bg-\[\#0b0b0b\]\/80 {
            background-color: #f4f4f5 !important;
          }

          /* Skyline and other SVGs */
          .delivery-light-theme svg.text-zinc-800 {
            color: #d4d4d8 !important;
          }
        `}</style>
      )}

      {/* Background soft glow effects (hidden/muted in light theme for readability) */}
      {!isLightTheme && (
        <>
          <div className="absolute top-[-10%] left-[-20%] w-[80%] h-[40%] rounded-full bg-[#FF6A00]/5 blur-[120px] pointer-events-none" />
          <div className="absolute bottom-[-10%] right-[-20%] w-[80%] h-[40%] rounded-full bg-[#FF6A00]/5 blur-[120px] pointer-events-none" />
          
          {/* Hide scrollbar in dark theme for better UX */}
          <style jsx global>{`
            /* Hide scrollbar for Chrome, Safari and Opera */
            ::-webkit-scrollbar {
              display: none !important;
              width: 0 !important;
              height: 0 !important;
            }
            /* Hide scrollbar for IE, Edge and Firefox */
            html, body {
              -ms-overflow-style: none !important;
              scrollbar-width: none !important;
            }
          `}</style>
        </>
      )}

      {/* Main Page Container */}
      <main className="flex-1 flex flex-col z-10">
        {children}
      </main>
    </div>
  );
}
