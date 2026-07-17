"use client";

import { useEffect } from "react";

// ─────────────────────────────────────────────────────────
// Replace these IDs with your actual pixel IDs from:
//   Meta Business Manager → Events Manager → Pixels
//   Snapchat Business → Snap Pixel
// ─────────────────────────────────────────────────────────
const rawMetaId = process.env.NEXT_PUBLIC_META_PIXEL_ID || "2570473940080239";
const rawSnapId = process.env.NEXT_PUBLIC_SNAP_PIXEL_ID || "YOUR_SNAP_PIXEL_ID";

const META_PIXEL_ID = rawMetaId !== "YOUR_META_PIXEL_ID" && rawMetaId !== "null" && rawMetaId !== "undefined" ? rawMetaId : null;
const SNAP_PIXEL_ID = rawSnapId !== "YOUR_SNAP_PIXEL_ID" && rawSnapId !== "null" && rawSnapId !== "undefined" ? rawSnapId : null;

declare global {
  interface Window {
    fbq: (...args: any[]) => void;
    _fbq: any;
    snaptr: (...args: any[]) => void;
    gtag?: (...args: any[]) => void;
  }
}

export default function PixelScripts() {
  useEffect(() => {
    // ─── Meta (Facebook) Pixel ──────────────────────────────
    if (META_PIXEL_ID) {
      if (!window.fbq) {
        const f = function (...args: any[]) {
          (f as any).callMethod ? (f as any).callMethod.apply(f, args) : (f as any).queue.push(args);
        };
        (f as any).push = f;
        (f as any).loaded = true;
        (f as any).version = "2.0";
        (f as any).queue = [];
        window.fbq = f;
        window._fbq = f;

        const script = document.createElement("script");
        script.async = true;
        script.src = "https://connect.facebook.net/en_US/fbevents.js";
        document.head.appendChild(script);
      }

      window.fbq("init", META_PIXEL_ID);
      window.fbq("track", "PageView");
    }

    // ─── Snap Pixel ─────────────────────────────────────────
    if (SNAP_PIXEL_ID) {
      if (!window.snaptr) {
        const s = function (...args: any[]) {
          (s as any).handleRequest ? (s as any).handleRequest.apply(s, args) : (s as any).queue.push(args);
        };
        (s as any).queue = [];
        window.snaptr = s;

        const script = document.createElement("script");
        script.async = true;
        script.src = "https://sc-static.net/scevent.min.js";
        document.head.appendChild(script);
      }

      window.snaptr("init", SNAP_PIXEL_ID, { user_email: "" });
      window.snaptr("track", "PAGE_VIEW");
    }
  }, []);

  return null; // no visible UI
}

// ─── Helper Functions for Event Tracking ────────────────
// Call these from any component for conversion events:

/**
 * Track when a product is viewed
 */
export function trackViewContent(productId: string | number, title: string, price: number) {
  if (typeof window === "undefined") return;
  if (META_PIXEL_ID) {
    window.fbq?.("track", "ViewContent", {
      content_ids: [String(productId)],
      content_name: title,
      content_type: "product",
      value: price,
      currency: "QAR",
    });
  }
  if (SNAP_PIXEL_ID) {
    window.snaptr?.("track", "VIEW_CONTENT", {
      item_ids: [String(productId)],
      item_category: "product",
      price: price,
      currency: "QAR",
    });
  }
  // ─── Google Analytics GA4 ─────────────────────────────
  window.gtag?.("event", "view_item", {
    currency: "QAR",
    value: price,
    items: [{
      item_id: String(productId),
      item_name: title,
      price: price,
      quantity: 1
    }]
  });
}

/**
 * Track when a product is added to cart
 */
export function trackAddToCart(productId: string | number, title: string, price: number) {
  if (typeof window === "undefined") return;
  if (META_PIXEL_ID) {
    window.fbq?.("track", "AddToCart", {
      content_ids: [String(productId)],
      content_name: title,
      content_type: "product",
      value: price,
      currency: "QAR",
    });
  }
  if (SNAP_PIXEL_ID) {
    window.snaptr?.("track", "ADD_CART", {
      item_ids: [String(productId)],
      price: price,
      currency: "QAR",
    });
  }
  // ─── Google Analytics GA4 ─────────────────────────────
  window.gtag?.("event", "add_to_cart", {
    currency: "QAR",
    value: price,
    items: [{
      item_id: String(productId),
      item_name: title,
      price: price,
      quantity: 1
    }]
  });
}

/**
 * Track when checkout is initiated
 */
export function trackInitiateCheckout(totalValue: number, numItems: number) {
  if (typeof window === "undefined") return;
  if (META_PIXEL_ID) {
    window.fbq?.("track", "InitiateCheckout", {
      value: totalValue,
      currency: "QAR",
      num_items: numItems,
    });
  }
  if (SNAP_PIXEL_ID) {
    window.snaptr?.("track", "START_CHECKOUT", {
      price: totalValue,
      currency: "QAR",
    });
  }
  // ─── Google Analytics GA4 ─────────────────────────────
  window.gtag?.("event", "begin_checkout", {
    currency: "QAR",
    value: totalValue
  });
}

/**
 * Track a successful purchase
 */
export function trackPurchase(orderNumber: string, totalValue: number, numItems: number) {
  if (typeof window === "undefined") return;
  if (META_PIXEL_ID) {
    window.fbq?.("track", "Purchase", {
      value: totalValue,
      currency: "QAR",
      num_items: numItems,
      order_id: orderNumber,
    });
  }
  if (SNAP_PIXEL_ID) {
    window.snaptr?.("track", "PURCHASE", {
      price: totalValue,
      currency: "QAR",
      transaction_id: orderNumber,
    });
  }
  // ─── Google Analytics GA4 ─────────────────────────────
  window.gtag?.("event", "purchase", {
    transaction_id: orderNumber,
    value: totalValue,
    currency: "QAR"
  });
}
