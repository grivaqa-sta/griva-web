"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { WishlistItem } from "@/app/types/types";
import { useUser } from "./UserContext";
import { wishlistService } from "../services/wishlist.service";
import { useToast } from "./ToastContext";

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
    stock?: number;
    slug?: string;
  }) => void;
  isInWishlist: (productId: number) => boolean;
  removeFromWishlist: (productId: number) => void;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const { state: userState } = useUser();
  const { toast } = useToast();

  const isLoggedIn = userState.isLoggedIn;

  // Sync wishlist from database when authentication state changes
  useEffect(() => {
    const fetchWishlist = async () => {
      if (isLoggedIn) {
        try {
          const res = await wishlistService.getWishlist();
          if (res.success && res.data) {
            const mapped = res.data.map((item) => ({
              id: item.id,
              productId: item.product_id,
              title: item.product.title,
              image: item.product.main_image_url,
              price: `QAR ${parseFloat(item.product.price).toFixed(2)}`,
              oldPrice: item.product.old_price
                ? `QAR ${parseFloat(item.product.old_price).toFixed(2)}`
                : undefined,
              rating: Number(item.product.rating || 0),
              category: item.product.brand || "Product",
              stock: item.product.stock,
              slug: item.product.slug,
            }));
            setItems(mapped);
          }
        } catch (error) {
          console.error("Failed to fetch wishlist from server:", error);
        }
      } else {
        setItems([]);
      }
    };

    fetchWishlist();
  }, [isLoggedIn]);

  const isInWishlist = (productId: number) => {
    return items.some((item) => item.productId === productId);
  };

  const toggleWishlist = async (product: {
    id: number;
    title: string;
    image: WishlistItem["image"];
    price: string;
    oldPrice?: string;
    rating: number;
    category: string;
    stock?: number;
    slug?: string;
  }) => {
    if (!isLoggedIn) {
      toast.warning("Please sign in to save items to your wishlist.");
      if (typeof window !== "undefined") {
        const currentPath = window.location.pathname + window.location.search;
        window.location.href = `/auth/login?redirect=${encodeURIComponent(currentPath)}`;
      }
      return;
    }

    if (isInWishlist(product.id)) {
      // Optimistic update
      setItems((prev) => prev.filter((item) => item.productId !== product.id));
      toast.success("Removed from Wishlist");

      try {
        await wishlistService.removeFromWishlist(product.id);
      } catch (error) {
        console.error("Failed to remove from wishlist database:", error);
      }
    } else {
      // Optimistic update
      const newItem: WishlistItem = {
        id: Date.now() + Math.random(),
        productId: product.id,
        title: product.title,
        image: product.image,
        price: product.price,
        oldPrice: product.oldPrice,
        rating: product.rating,
        category: product.category,
        stock: product.stock,
        slug: product.slug,
      };
      setItems((prev) => [...prev, newItem]);
      toast.success("Added to Wishlist ❤️");

      try {
        await wishlistService.addToWishlist(product.id);
      } catch (error) {
        console.error("Failed to add to wishlist database:", error);
      }
    }
  };

  const removeFromWishlist = async (productId: number) => {
    if (!isLoggedIn) {
      toast.warning("Please sign in to save items to your wishlist.");
      if (typeof window !== "undefined") {
        const currentPath = window.location.pathname + window.location.search;
        window.location.href = `/auth/login?redirect=${encodeURIComponent(currentPath)}`;
      }
      return;
    }

    // Optimistic update
    setItems((prev) => prev.filter((item) => item.productId !== productId));
    toast.success("Removed from Wishlist");

    try {
      await wishlistService.removeFromWishlist(productId);
    } catch (error) {
      console.error("Failed to remove from wishlist database:", error);
    }
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
