"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
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
    <div className="flex items-center gap-[48px] pr-[48px] shrink-0 flex-nowrap">
      {marqueeItems.map((item, idx) => {
        const IconComponent = item.icon;
        return (
          <div
            key={idx}
            className="flex items-center gap-2 shrink-0 flex-nowrap"
          >
            <IconComponent size={14} strokeWidth={2} className="text-white" />
            <span className="font-body text-[8px] font-medium tracking-[1.5px] text-white uppercase whitespace-nowrap">
              {item.text}
            </span>
            <span className="text-white/40 font-body font-medium ml-4">·</span>
          </div>
        );
      })}
    </div>
  );
}

export default function AnnouncementBar() {
  // Start with null — same on server and client, no random value
  const [shoppersCount, setShoppersCount] = useState<number | null>(null);
  const [trend, setTrend] = useState<"up" | "down" | "neutral">("neutral");

  // Use ref to track previous count for trend — avoids setState in setState
  const prevCountRef = useRef<number>(SHOPPER_BASE);

  useEffect(() => {
    // Random value only set on client, after mount
    const initial = SHOPPER_BASE + Math.floor(Math.random() * SHOPPER_VARIANCE);
    setShoppersCount(initial);
    prevCountRef.current = initial;

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

  const trendClass =
    trend === "up"
      ? "text-[#4ADE80] font-bold scale-[1.03]"
      : trend === "down"
      ? "text-neutral-300"
      : "text-white";

  return (
    <div
      suppressHydrationWarning
      className="h-7 md:h-10 bg-gradient-to-r from-brand-orange via-brand-orange to-brand-orange-dark text-white flex items-center sticky top-0 z-[9999] select-none border-b border-white/10 shadow-[0_1px_0_rgba(0,0,0,0.08)] w-full"
    >
      <div className="mx-auto flex h-full w-full max-w-7xl items-center justify-between">

        {/* Left Section - Infinite Marquee */}
        <div className="w-full sm:w-[70%] h-full flex items-center relative overflow-hidden">
          {/* Gradient edge masks */}
          <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-brand-orange to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-brand-orange to-transparent z-10 pointer-events-none" />

          <div className="w-full overflow-hidden flex items-center">
            {/* Only 2 copies needed for seamless loop */}
            <div className="flex flex-row flex-nowrap shrink-0 animate-[marquee_30s_linear_infinite] hover:[animation-play-state:paused]">
              <MarqueeContent />
              <MarqueeContent />
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="hidden sm:flex w-[30%] h-full items-center text-white border-l border-white/15 shrink-0">

          {/* Zone A: Live Shoppers */}
          <div className="w-1/2 h-full flex items-center justify-center gap-2 px-3 lg:px-4 bg-black/15">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
            </span>
            <Users size={12} className="text-white shrink-0" />
            {/* suppressHydrationWarning on the count span since value differs server vs client */}
            <span className="font-body text-[8px] lg:text-[10px] font-medium tracking-[0.5px] text-white whitespace-nowrap">
              <span
                className={`inline-block transition-all duration-300 ${trendClass}`}
                suppressHydrationWarning
              >
                {shoppersCount ?? "—"}
              </span>{" "}
              online
            </span>
          </div>

          {/* Zone B: Exclusive Deals CTA */}
          <Link
            href="/exclusive-deals"
            className="group w-1/2 h-full flex items-center justify-center gap-1.5 px-3 lg:px-4 bg-black/25 hover:bg-black/40 border-l border-white/10 transition-colors duration-200 cursor-pointer whitespace-nowrap"
          >
            <span className="font-body text-[8px] lg:text-[10px] font-semibold text-white tracking-wide">
              Exclusive Deals
            </span>
            <ChevronRight
              size={14}
              className="text-white shrink-0 transition-transform duration-200 group-hover:translate-x-1"
              strokeWidth={2.5}
            />
          </Link>
        </div>

      </div>
    </div>
  );
}