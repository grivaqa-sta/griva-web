"use client";

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { CartItem, CartState, CartAction } from "@/app/types/types";
import { parsePriceNumber } from "@/app/data/data";

// ─────────────────────────────────────────────────────────
// Reducer
// ─────────────────────────────────────────────────────────
function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD": {
      const existing = state.items.find(
        (item) =>
          item.productId === action.payload.productId &&
          item.selectedColor === action.payload.selectedColor &&
          item.selectedStorage === action.payload.selectedStorage
      );
      let newItems: CartItem[];
      if (existing) {
        newItems = state.items.map((item) =>
          item.id === existing.id
            ? { ...item, quantity: item.quantity + action.payload.quantity }
            : item
        );
      } else {
        newItems = [...state.items, action.payload];
      }
      return buildState(newItems);
    }
    case "REMOVE": {
      const newItems = state.items.filter(
        (item) => item.id !== action.payload.id
      );
      return buildState(newItems);
    }
    case "UPDATE_QTY": {
      const newItems = state.items
        .map((item) =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        )
        .filter((item) => item.quantity > 0);
      return buildState(newItems);
    }
    case "CLEAR":
      return buildState([]);
    default:
      return state;
  }
}

function buildState(items: CartItem[]): CartState {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + item.priceNumber * item.quantity,
    0
  );
  return { items, totalItems, totalPrice };
}

// ─────────────────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────────────────
interface CartContextValue {
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  addToCart: (product: {
    id: number;
    title: string;
    image: CartItem["image"];
    price: string;
    category: string;
    selectedColor?: string;
    selectedStorage?: string;
    quantity?: number;
  }) => void;
}

const CartContext = createContext<CartContextValue | null>(null);

// ─────────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────────
export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    totalItems: 0,
    totalPrice: 0,
  });
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Load from localStorage after hydration
  useEffect(() => {
    try {
      const stored = localStorage.getItem("griva-cart");
      if (stored) {
        const items: CartItem[] = JSON.parse(stored);
        items.forEach((item) => dispatch({ type: "ADD", payload: item }));
      }
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  // Persist to localStorage
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem("griva-cart", JSON.stringify(state.items));
  }, [state.items, hydrated]);

  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);

  const addToCart = (product: {
    id: number;
    title: string;
    image: CartItem["image"];
    price: string;
    category: string;
    selectedColor?: string;
    selectedStorage?: string;
    quantity?: number;
  }) => {
    const cartItem: CartItem = {
      id: Date.now() + Math.random(),
      productId: product.id,
      title: product.title,
      image: product.image,
      price: product.price,
      priceNumber: parsePriceNumber(product.price),
      quantity: product.quantity ?? 1,
      category: product.category,
      selectedColor: product.selectedColor,
      selectedStorage: product.selectedStorage,
    };
    dispatch({ type: "ADD", payload: cartItem });
    openDrawer();
  };

  return (
    <CartContext.Provider
      value={{ state, dispatch, isDrawerOpen, openDrawer, closeDrawer, addToCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

// ─────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────
export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
