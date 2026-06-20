"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAdminSettings } from "../../context/AdminContext";
import {
  Truck,
  Zap,
  MessageCircle,
  Moon,
  Package,
  Star,
  ChevronRight,
  Users,
} from "lucide-react";

const SHOPPER_BASE = 278;
const SHOPPER_VARIANCE = 32;
const SHOPPER_MIN = 240;
const SHOPPER_MAX = 340;

// New vibrant orange palette
const PRIMARY_ORANGE = "#FF6A00";
const DARK_ORANGE = "#E85F00";

const marqueeItems = [
  { icon: Truck, text: "FREE DELIVERY ON ORDERS OVER QAR 150" },
  { icon: Zap, text: "NEW ARRIVALS EVERY WEEK" },
  { icon: MessageCircle, text: "ORDER VIA WHATSAPP" },
  { icon: Moon, text: "BIG NIGHT SALE EVERY THURSDAY" },
  { icon: Package, text: "CASH ON DELIVERY QATAR-WIDE" },
  { icon: Star, text: "4.9 RATED BY 2,400 CUSTOMERS" },
];

// Stable outside component — no re-creation on render
function MarqueeContent() {
  return (
    <div className="flex shrink-0 flex-nowrap items-center gap-[48px] pr-[48px]">
      {marqueeItems.map((item, idx) => {
        const IconComponent = item.icon;

        return (
          <div
            key={idx}
            className="flex shrink-0 flex-nowrap items-center gap-2"
          >
            <IconComponent size={14} strokeWidth={2} className="text-white" />

            <span className="font-body whitespace-nowrap text-[8px] font-medium uppercase tracking-[1.5px] text-white">
              {item.text}
            </span>

            <span className="ml-4 font-body font-medium text-white/40">
              ·
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function AnnouncementBar() {
  const [mounted, setMounted] = useState(false);
  const [shoppersCount, setShoppersCount] = useState<number | null>(null);
  const [trend, setTrend] = useState<"up" | "down" | "neutral">("neutral");

  const { announcementBarEnabled } = useAdminSettings();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);

    const initial =
      SHOPPER_BASE + Math.floor(Math.random() * SHOPPER_VARIANCE);

    setShoppersCount(initial);

    const timer = setInterval(() => {
      const steps = [-2, -1, 0, 1, 2];
      const delta = steps[Math.floor(Math.random() * steps.length)];

      if (delta > 0) setTrend("up");
      else if (delta < 0) setTrend("down");
      else setTrend("neutral");

      setShoppersCount((prev) => {
        const current = prev ?? initial;
        const next = current + delta;

        if (next < SHOPPER_MIN) return SHOPPER_MIN + 6;
        if (next > SHOPPER_MAX) return SHOPPER_MAX - 8;

        return next;
      });
    }, 2500);

    return () => clearInterval(timer);
  }, []);

  if (!mounted) return null;

  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/delivery")
  ) {
    return null;
  }

  if (!announcementBarEnabled) return null;

  const trendClass =
    trend === "up"
      ? "text-[#4ADE80] font-bold scale-[1.03]"
      : trend === "down"
        ? "text-neutral-300"
        : "text-white";

  return (
    <div
      suppressHydrationWarning
      className="sticky top-0 z-[9999] flex h-7 w-full select-none items-center border-b border-white/10 text-white shadow-[0_1px_0_rgba(0,0,0,0.08)] md:h-10"
      style={{
        background: `linear-gradient(to right, ${PRIMARY_ORANGE}, ${PRIMARY_ORANGE}, ${DARK_ORANGE})`,
      }}
    >
      <div className="mx-auto flex h-full w-full max-w-7xl items-center justify-between">
        {/* Left Section - Infinite Marquee */}
        <div className="relative flex h-full w-full items-center overflow-hidden sm:w-[70%]">
          {/* Gradient edge masks */}
          <div
            className="pointer-events-none absolute left-0 top-0 bottom-0 z-10 w-12"
            style={{
              background: `linear-gradient(to right, ${PRIMARY_ORANGE}, transparent)`,
            }}
          />

          <div
            className="pointer-events-none absolute right-0 top-0 bottom-0 z-10 w-12"
            style={{
              background: `linear-gradient(to left, ${PRIMARY_ORANGE}, transparent)`,
            }}
          />

          <div className="flex w-full items-center overflow-hidden">
            <div className="flex shrink-0 flex-row flex-nowrap animate-[marquee_30s_linear_infinite] hover:[animation-play-state:paused]">
              <MarqueeContent />
              <MarqueeContent />
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="hidden h-full w-[30%] shrink-0 items-center border-l border-white/15 text-white sm:flex">
          {/* Zone A: Live Shoppers */}
          <div className="flex h-full w-1/2 items-center justify-center gap-2 bg-black/15 px-3 lg:px-4">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />

              <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
            </span>

            <Users size={12} className="shrink-0 text-white" />

            <span className="font-body whitespace-nowrap text-[8px] font-medium tracking-[0.5px] text-white lg:text-[10px]">
              <span
                suppressHydrationWarning
                className={`inline-block transition-all duration-300 ${trendClass}`}
              >
                {shoppersCount ?? "—"}
              </span>{" "}
              online
            </span>
          </div>

          {/* Zone B: Exclusive Deals CTA */}
          <Link
            href="/exclusive-offers"
            className="group flex h-full w-1/2 cursor-pointer items-center justify-center gap-1.5 border-l border-white/10 bg-black/25 px-3 transition-colors duration-200 hover:bg-black/40 lg:px-4"
          >
            <span className="font-body whitespace-nowrap text-[8px] font-semibold tracking-wide text-white lg:text-[10px]">
              Exclusive Deals
            </span>

            <ChevronRight
              size={14}
              strokeWidth={2.5}
              className="shrink-0 text-white transition-transform duration-200 group-hover:translate-x-1"
            />
          </Link>
        </div>
      </div>
    </div>
  );
}