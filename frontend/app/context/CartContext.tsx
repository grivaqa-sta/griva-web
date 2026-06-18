"use client";

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useState,
  useRef,
  ReactNode,
} from "react";
import { CartItem, CartState, CartAction } from "@/app/types/types";
import { parsePriceNumber } from "@/app/data/data";
import { useUser } from "./UserContext";
import { cartService } from "../services/cart.service";

// ─────────────────────────────────────────────────────────
// Reducer
// ─────────────────────────────────────────────────────────
function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "SET_CART": {
      return buildState(action.payload);
    }
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

  const { state: userState } = useUser();
  const isLoggedIn = userState.isLoggedIn && userState.role !== "admin";
  const prevIsLoggedInRef = useRef<boolean | null>(null);

  // Load from localStorage after hydration (if guest user)
  useEffect(() => {
    if (isLoggedIn) {
      setHydrated(true);
      return;
    }
    try {
      const stored = localStorage.getItem("griva-cart");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          dispatch({ type: "SET_CART", payload: parsed });
        }
      }
    } catch {
      // ignore
    }
    setHydrated(true);
  }, [isLoggedIn]);

  // Persist to localStorage (only if guest user)
  useEffect(() => {
    if (!hydrated || isLoggedIn) return;
    localStorage.setItem("griva-cart", JSON.stringify(state.items));
  }, [state.items, hydrated, isLoggedIn]);

  // Sync / merge cart when isLoggedIn state changes
  useEffect(() => {
    if (!hydrated) return;

    const syncCartOnAuthChange = async () => {
      if (isLoggedIn) {
        try {
          const stored = localStorage.getItem("griva-cart");
          let guestItems = [];
          if (stored) {
            try {
              guestItems = JSON.parse(stored);
            } catch { /* ignore */ }
          }

          if (Array.isArray(guestItems) && guestItems.length > 0) {
            console.log("Merging guest cart with database user cart...");
            const mergeResponse = await cartService.mergeCart(
              guestItems.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
                selectedColor: item.selectedColor,
                selectedStorage: item.selectedStorage,
              }))
            );
            if (mergeResponse.success && mergeResponse.cart) {
              dispatch({ type: "SET_CART", payload: mergeResponse.cart.items });
              localStorage.removeItem("griva-cart");
            }
          } else {
            console.log("Fetching database user cart...");
            const getResponse = await cartService.getCart();
            if (getResponse.success && getResponse.cart) {
              dispatch({ type: "SET_CART", payload: getResponse.cart.items });
            }
          }
        } catch (error) {
          console.error("Failed to sync cart:", error);
        }
      } else if (prevIsLoggedInRef.current === true) {
        // User logged out: clear memory cart
        dispatch({ type: "CLEAR" });
      }
      
      prevIsLoggedInRef.current = isLoggedIn;
    };

    syncCartOnAuthChange();
  }, [isLoggedIn, hydrated]);

  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);

  const addToCart = async (product: {
    id: number;
    title: string;
    image: CartItem["image"];
    price: string;
    category: string;
    selectedColor?: string;
    selectedStorage?: string;
    quantity?: number;
  }) => {
    const qty = product.quantity ?? 1;

    if (isLoggedIn) {
      try {
        const response = await cartService.addItem(
          product.id,
          product.selectedColor,
          product.selectedStorage,
          qty
        );
        if (response.success && response.cart) {
          dispatch({ type: "SET_CART", payload: response.cart.items });
          openDrawer();
        }
      } catch (error: any) {
        const errMsg = error.response?.data?.message || "Failed to add item to database cart.";
        alert(errMsg);
      }
    } else {
      const cartItem: CartItem = {
        id: Date.now() + Math.random(),
        productId: product.id,
        title: product.title,
        image: product.image,
        price: product.price,
        priceNumber: parsePriceNumber(product.price),
        quantity: qty,
        category: product.category,
        selectedColor: product.selectedColor,
        selectedStorage: product.selectedStorage,
      };
      dispatch({ type: "ADD", payload: cartItem });
      openDrawer();
    }
  };

  // Intercept dispatches to sync database cart when user is logged in
  const customDispatch = async (action: CartAction) => {
    if (isLoggedIn) {
      try {
        if (action.type === "UPDATE_QTY") {
          const response = await cartService.updateItemQty(action.payload.id, action.payload.quantity);
          if (response.success && response.cart) {
            dispatch({ type: "SET_CART", payload: response.cart.items });
          }
        } else if (action.type === "REMOVE") {
          const response = await cartService.removeItem(action.payload.id);
          if (response.success && response.cart) {
            dispatch({ type: "SET_CART", payload: response.cart.items });
          }
        } else if (action.type === "CLEAR") {
          const response = await cartService.clearCart();
          if (response.success && response.cart) {
            dispatch({ type: "SET_CART", payload: response.cart.items });
          }
        } else {
          dispatch(action);
        }
      } catch (error: any) {
        const errMsg = error.response?.data?.message || "Failed to sync cart update with server.";
        alert(errMsg);
      }
    } else {
      dispatch(action);
    }
  };

  return (
    <CartContext.Provider
      value={{
        state,
        dispatch: customDispatch,
        isDrawerOpen,
        openDrawer,
        closeDrawer,
        addToCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
