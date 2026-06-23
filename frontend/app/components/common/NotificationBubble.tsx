"use client";

import { useEffect, useState, useRef } from "react";
import { ShoppingCart, Eye, Heart, Star, Zap, MapPin } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Notification {
  id: number;
  avatarFallback: string;
  avatarColor: string;
  name: string;
  action: string;
  product: string;
  location: string;
  time: string;
  icon?: "cart" | "eye" | "heart" | "star" | "bolt";
}

interface NotificationBubbleProps {
  notifications?: Notification[];
  /** Milliseconds between bubbles (gap after one hides). Default: 2000 */
  interval?: number;
  /** Milliseconds each bubble stays visible. Default: 5000 */
  displayDuration?: number;
  position?: "bottom-left" | "bottom-right";
}

// ─── Default data ─────────────────────────────────────────────────────────────

const DEFAULT_NOTIFICATIONS: Notification[] = [
  {
    id: 1,
    avatarFallback: "AK",
    avatarColor: "#e63946",
    name: "Ahmed K.",
    action: "just purchased",
    product: "Sony WH-1000XM5",
    location: "Doha, Qatar",
    time: "2 min ago",
    icon: "cart",
  },
  {
    id: 2,
    avatarFallback: "SR",
    avatarColor: "#2a9d8f",
    name: "Sara R.",
    action: "is viewing",
    product: "iPhone 15 Pro Max",
    location: "Dubai, UAE",
    time: "Just now",
    icon: "eye",
  },
  {
    id: 3,
    avatarFallback: "MH",
    avatarColor: "#e9c46a",
    name: "Mohammed H.",
    action: "added to wishlist",
    product: "MacBook Pro M3",
    location: "Riyadh, KSA",
    time: "5 min ago",
    icon: "heart",
  },
  {
    id: 4,
    avatarFallback: "LN",
    avatarColor: "#6a4c93",
    name: "Layla N.",
    action: "rated 5★",
    product: "DJI Mini 4 Pro",
    location: "Kuwait City",
    time: "12 min ago",
    icon: "star",
  },
  {
    id: 5,
    avatarFallback: "KA",
    avatarColor: "#f4a261",
    name: "Khalid A.",
    action: "just purchased",
    product: "Samsung Galaxy S24 Ultra",
    location: "Abu Dhabi, UAE",
    time: "1 min ago",
    icon: "bolt",
  },
  {
    id: 6,
    avatarFallback: "FO",
    avatarColor: "#457b9d",
    name: "Fatima O.",
    action: "is viewing",
    product: "Apple Watch Ultra 2",
    location: "Manama, Bahrain",
    time: "Just now",
    icon: "eye",
  },
];

// ─── Icon + color maps ────────────────────────────────────────────────────────

const ICON_MAP = {
  cart: ShoppingCart,
  eye: Eye,
  heart: Heart,
  star: Star,
  bolt: Zap,
};

const ICON_COLORS: Record<string, string> = {
  cart: "#10b981",
  eye: "#3b82f6",
  heart: "#ef4444",
  star: "#f59e0b",
  bolt: "#f97316",
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function NotificationBubble({
  notifications = DEFAULT_NOTIFICATIONS,
  interval = 2000,
  displayDuration = 5000,
  position = "bottom-left",
}: NotificationBubbleProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState<"hidden" | "entering" | "visible" | "leaving">("hidden");

  // Use refs for interval/duration so changes don't restart the effect
  const intervalRef = useRef(interval);
  const displayDurationRef = useRef(displayDuration);
  const notificationsLengthRef = useRef(notifications.length);
  intervalRef.current = interval;
  displayDurationRef.current = displayDuration;
  notificationsLengthRef.current = notifications.length;

  useEffect(() => {
    let t1: ReturnType<typeof setTimeout>;
    let t2: ReturnType<typeof setTimeout>;
    let t3: ReturnType<typeof setTimeout>;
    let t4: ReturnType<typeof setTimeout>;

    function cycle() {
      // 1. slide in
      setPhase("entering");
      t1 = setTimeout(() => {
        // 2. fully visible
        setPhase("visible");
        t2 = setTimeout(() => {
          // 3. slide out
          setPhase("leaving");
          t3 = setTimeout(() => {
            // 4. hidden → advance index → wait → repeat
            setPhase("hidden");
            setCurrentIndex((prev) => (prev + 1) % notificationsLengthRef.current);
            t4 = setTimeout(cycle, intervalRef.current);
          }, 400);
        }, displayDurationRef.current);
      }, 400);
    }

    // Initial delay before first bubble
    t4 = setTimeout(cycle, 1200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // ← runs once only — no infinite re-render

  if (phase === "hidden") return null;

  const notif = notifications[currentIndex];
  const IconComponent = ICON_MAP[notif.icon ?? "cart"];
  const iconColor = ICON_COLORS[notif.icon ?? "cart"];

  const positionClass = position === "bottom-left" ? "bottom-6 left-6" : "bottom-6 right-6";

  const slideClass =
    phase === "entering" || phase === "leaving"
      ? position === "bottom-left"
        ? "-translate-x-[120%] opacity-0"
        : "translate-x-[120%] opacity-0"
      : "translate-x-0 opacity-100";

  return (
    <div
      className={`fixed z-[9999] ${positionClass} transition-all duration-[400ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] ${slideClass}`}
      role="status"
      aria-live="polite"
      aria-label={`${notif.name} ${notif.action} ${notif.product}`}
    >
      <div className="flex items-center gap-3 bg-white/95 backdrop-blur-md border border-gray-100 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.06)] px-4 py-3 max-w-[320px] min-w-[260px] relative overflow-hidden">

        {/* Left accent bar */}
        <div
          className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-2xl"
          style={{ backgroundColor: iconColor }}
        />

        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold select-none"
            style={{ backgroundColor: notif.avatarColor }}
            aria-hidden="true"
          >
            {notif.avatarFallback}
          </div>
          <div
            className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-white shadow-sm"
            style={{ backgroundColor: iconColor }}
            aria-hidden="true"
          >
            <IconComponent size={11} strokeWidth={2.5} />
          </div>
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-gray-800 leading-tight truncate">
            {notif.name}{" "}
            <span className="font-normal text-gray-500">{notif.action}</span>
          </p>
          <p className="text-[12px] font-medium text-gray-900 truncate mt-0.5">
            {notif.product}
          </p>
          <div className="flex items-center gap-1.5 mt-1">
            <MapPin size={11} className="text-gray-400 flex-shrink-0" aria-hidden="true" />
            <span className="text-[11px] text-gray-400 truncate">{notif.location}</span>
            <span className="text-[11px] text-gray-300">·</span>
            <span className="text-[11px] text-gray-400 flex-shrink-0">{notif.time}</span>
          </div>
        </div>

        {/* Ping dot */}
        <div className="relative flex-shrink-0" aria-hidden="true">
          <span className="relative flex h-2.5 w-2.5">
            <span
              className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
              style={{ backgroundColor: iconColor }}
            />
            <span
              className="relative inline-flex rounded-full h-2.5 w-2.5"
              style={{ backgroundColor: iconColor }}
            />
          </span>
        </div>
      </div>
    </div>
  );
}