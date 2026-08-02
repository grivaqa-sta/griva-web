"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

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
    dataLayer: any[];
  }
}

export default function PixelScripts() {
  const pathname = usePathname();

  // Initialize pixels
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

  // Track SPA client-side page views in GA4 and GTM on route change
  useEffect(() => {
    if (typeof window === "undefined" || !pathname) return;

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "page_view",
      page_path: pathname,
      page_location: window.location.href,
      page_title: document.title,
    });

    window.gtag?.("event", "page_view", {
      page_path: pathname,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [pathname]);

  return null; // no visible UI
}

// ─── Helper Functions for Event Tracking ────────────────

/**
 * Track when a product is viewed
 */
export function trackViewContent(productId: string | number, title: string, price: number, category: string = "") {
  if (typeof window === "undefined") return;
  const numPrice = typeof price === "number" ? price : parseFloat(String(price).replace(/[^0-9.]/g, "")) || 0;

  if (META_PIXEL_ID) {
    window.fbq?.("track", "ViewContent", {
      content_ids: [String(productId)],
      content_name: title,
      content_type: "product",
      value: numPrice,
      currency: "QAR",
    });
  }
  if (SNAP_PIXEL_ID) {
    window.snaptr?.("track", "VIEW_CONTENT", {
      item_ids: [String(productId)],
      item_category: category || "product",
      price: numPrice,
      currency: "QAR",
    });
  }

  const itemObj = {
    item_id: String(productId),
    item_name: title,
    item_category: category,
    price: numPrice,
    quantity: 1,
  };

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: "view_item",
    ecommerce: {
      currency: "QAR",
      value: numPrice,
      items: [itemObj],
    },
  });

  window.gtag?.("event", "view_item", {
    currency: "QAR",
    value: numPrice,
    items: [itemObj],
  });
}

/**
 * Track when a product is added to cart
 */
export function trackAddToCart(
  productId: string | number,
  title: string,
  price: number | string,
  quantity: number = 1,
  category: string = ""
) {
  if (typeof window === "undefined") return;
  const numPrice = typeof price === "number" ? price : parseFloat(String(price).replace(/[^0-9.]/g, "")) || 0;
  const totalPrice = numPrice * (quantity || 1);

  if (META_PIXEL_ID) {
    window.fbq?.("track", "AddToCart", {
      content_ids: [String(productId)],
      content_name: title,
      content_type: "product",
      value: totalPrice,
      currency: "QAR",
    });
  }
  if (SNAP_PIXEL_ID) {
    window.snaptr?.("track", "ADD_CART", {
      item_ids: [String(productId)],
      price: totalPrice,
      currency: "QAR",
    });
  }

  const itemObj = {
    item_id: String(productId),
    item_name: title,
    item_category: category,
    price: numPrice,
    quantity: quantity || 1,
  };

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: "add_to_cart",
    ecommerce: {
      currency: "QAR",
      value: totalPrice,
      items: [itemObj],
    },
  });

  window.gtag?.("event", "add_to_cart", {
    currency: "QAR",
    value: totalPrice,
    items: [itemObj],
  });
}

/**
 * Track when checkout is initiated
 */
export function trackInitiateCheckout(totalValue: number, items: any[] = []) {
  if (typeof window === "undefined") return;

  const formattedItems = items.map((item) => {
    const p = typeof item.priceNumber === "number" ? item.priceNumber : parseFloat(String(item.price || 0).replace(/[^0-9.]/g, "")) || 0;
    return {
      item_id: String(item.productId || item.id || ""),
      item_name: item.title || item.name || "Product",
      price: p,
      quantity: item.quantity || 1,
    };
  });

  if (META_PIXEL_ID) {
    window.fbq?.("track", "InitiateCheckout", {
      value: totalValue,
      currency: "QAR",
      num_items: items.length || 1,
    });
  }
  if (SNAP_PIXEL_ID) {
    window.snaptr?.("track", "START_CHECKOUT", {
      price: totalValue,
      currency: "QAR",
    });
  }

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: "begin_checkout",
    ecommerce: {
      currency: "QAR",
      value: totalValue,
      items: formattedItems,
    },
  });

  window.gtag?.("event", "begin_checkout", {
    currency: "QAR",
    value: totalValue,
    items: formattedItems,
  });
}

/**
 * Track a successful purchase
 */
export function trackPurchase(orderNumber: string, totalValue: number, items: any[] = []) {
  if (typeof window === "undefined") return;

  const formattedItems = items.map((item) => {
    const p = typeof item.price === "number"
      ? item.price
      : parseFloat(String(item.price_at_purchase || item.price || 0).replace(/[^0-9.]/g, "")) || 0;
    const name = item.title || item.name || (item.product ? item.product.title : "Product");
    return {
      item_id: String(item.id || item.product_id || ""),
      item_name: name,
      price: p,
      quantity: item.quantity || 1,
    };
  });

  if (META_PIXEL_ID) {
    window.fbq?.("track", "Purchase", {
      value: totalValue,
      currency: "QAR",
      num_items: items.length || 1,
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

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: "purchase",
    ecommerce: {
      transaction_id: orderNumber,
      value: totalValue,
      currency: "QAR",
      items: formattedItems,
    },
  });

  window.gtag?.("event", "purchase", {
    transaction_id: orderNumber,
    value: totalValue,
    currency: "QAR",
    items: formattedItems,
  });
}
