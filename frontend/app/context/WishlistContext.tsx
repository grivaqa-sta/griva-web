"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { WishlistItem } from "@/app/types/types";

interface WishlistContextValue {
  items: WishlistItem[];
  toggleWishlist: (product: {
    id: number;
    title: string;
    image: WishlistItem["image"];
    price: string;
    oldPrice?: string;
    rating: number;
    category: string;
  }) => void;
  isInWishlist: (productId: number) => boolean;
  removeFromWishlist: (productId: number) => void;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Load from localStorage after hydration
  useEffect(() => {
    try {
      const stored = localStorage.getItem("griva-wishlist");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      }
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  // Persist to localStorage
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem("griva-wishlist", JSON.stringify(items));
  }, [items, hydrated]);

  const isInWishlist = (productId: number) => {
    return items.some((item) => item.productId === productId);
  };

  const toggleWishlist = (product: {
    id: number;
    title: string;
    image: WishlistItem["image"];
    price: string;
    oldPrice?: string;
    rating: number;
    category: string;
  }) => {
    if (isInWishlist(product.id)) {
      setItems((prev) => prev.filter((item) => item.productId !== product.id));
    } else {
      const newItem: WishlistItem = {
        id: Date.now() + Math.random(),
        productId: product.id,
        title: product.title,
        image: product.image,
        price: product.price,
        oldPrice: product.oldPrice,
        rating: product.rating,
        category: product.category,
      };
      setItems((prev) => [...prev, newItem]);
    }
  };

  const removeFromWishlist = (productId: number) => {
    setItems((prev) => prev.filter((item) => item.productId !== productId));
  };

  return (
    <WishlistContext.Provider
      value={{ items, toggleWishlist, isInWishlist, removeFromWishlist }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used inside WishlistProvider");
  return ctx;
}
