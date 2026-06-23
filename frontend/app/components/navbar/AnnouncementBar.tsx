"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAdminSettings } from "../../context/AdminContext";
import { getSettingsApi } from "../../utils/api";
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
const PRIMARY_ORANGE = "#FF6A00";
const DARK_ORANGE = "#E85F00";

function MarqueeContent({ freeShippingThreshold }: { freeShippingThreshold: number }) {
  const marqueeItems = [
    { icon: Truck, text: `FREE DELIVERY ON ORDERS OVER QAR ${freeShippingThreshold}` },
    { icon: Zap, text: "NEW ARRIVALS EVERY WEEK" },
    { icon: MessageCircle, text: "ORDER VIA WHATSAPP" },
    { icon: Moon, text: "BIG NIGHT SALE EVERY THURSDAY" },
    { icon: Package, text: "CASH ON DELIVERY QATAR-WIDE" },
    { icon: Star, text: "4.9 RATED BY 2,400 CUSTOMERS" },
  ];

  return (
    <div className="flex shrink-0 flex-nowrap items-center gap-[48px] pr-[48px]">
      {marqueeItems.map((item, idx) => {
        const IconComponent = item.icon;
        return (
          <div key={idx} className="flex shrink-0 flex-nowrap items-center gap-2">
            <IconComponent size={14} strokeWidth={2} className="text-white" />
            <span className="font-body whitespace-nowrap text-[8px] font-medium uppercase tracking-[1.5px] text-white">
              {item.text}
            </span>
            <span className="ml-4 font-body font-medium text-white/40">·</span>
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
  const [freeShippingThreshold, setFreeShippingThreshold] = useState<number>(99);

  const { announcementBarEnabled } = useAdminSettings();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
    const initial = SHOPPER_BASE + Math.floor(Math.random() * SHOPPER_VARIANCE);
    setShoppersCount(initial);

    const fetchSettings = async () => {
      try {
        const settings = await getSettingsApi();
        if (settings && settings.freeShippingThreshold !== undefined) {
          setFreeShippingThreshold(Number(settings.freeShippingThreshold));
        }
      } catch (err) {
        console.error("Failed to fetch settings in AnnouncementBar", err);
      }
    };
    fetchSettings();

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

  if (pathname.startsWith("/admin") || pathname.startsWith("/delivery")) {
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
      className="sticky top-0 z-[9999] bg-orange-600 flex h-7 w-full select-none items-center text-white  md:h-10"
     
    >
      <div className="mx-auto flex h-full w-full  items-center justify-between">

        {/* Left Section - Infinite Marquee — 60% on mobile, 70% on sm+ */}
        <div className="relative flex h-full w-[60%] items-center overflow-hidden sm:w-[70%]">
          {/* Gradient edge masks */}
         
          <div className="flex w-full items-center overflow-hidden">
            <div className="flex shrink-0 flex-row flex-nowrap animate-[marquee_30s_linear_infinite] hover:[animation-play-state:paused]">
              <MarqueeContent freeShippingThreshold={freeShippingThreshold} />
              <MarqueeContent freeShippingThreshold={freeShippingThreshold} />
            </div>
          </div>
        </div>

        {/* Right Section — hidden on mobile originally, now flex on mobile too */}
        {/* Was: hidden sm:flex — now: flex (always visible) */}
        <div className="flex h-full w-[40%] shrink-0 items-center  text-white sm:w-[30%]">

          {/* Zone A: Live Shoppers */}
          <div className="flex h-full w-1/2 items-center justify-center gap-1.5 bg-black/8 px-1 lg:px-4">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
            </span>
            <Users size={10} className="shrink-0 text-white sm:hidden" />
            <Users size={12} className="hidden shrink-0 text-white sm:block" />
            <span className="font-body whitespace-nowrap text-[7px] font-medium tracking-[0.5px] text-white sm:text-[8px] lg:text-[10px]">
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
            className="group flex h-full w-1/2 cursor-pointer items-center justify-center gap-1  bg-black/25 px-1 transition-colors duration-200 hover:bg-black/40 lg:px-4"
          >
            <span className="font-body whitespace-nowrap text-[7px] font-semibold tracking-wide text-white sm:text-[8px] lg:text-[10px]">
              Exclusive Deals
            </span>
            <ChevronRight
              size={11}
              strokeWidth={2.5}
              className="shrink-0 text-white transition-transform duration-200 group-hover:translate-x-1 sm:hidden"
            />
            <ChevronRight
              size={14}
              strokeWidth={2.5}
              className="hidden shrink-0 text-white transition-transform duration-200 group-hover:translate-x-1 sm:block"
            />
          </Link>
        </div>

      </div>
    </div>
  );
}