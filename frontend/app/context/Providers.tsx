"use client";

import { ReactNode } from "react";
import { CartProvider } from "./CartContext";
import { WishlistProvider } from "./WishlistContext";
import { SearchProvider } from "./SearchContext";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <CartProvider>
      <WishlistProvider>
        <SearchProvider>
          {children}
        </SearchProvider>
      </WishlistProvider>
    </CartProvider>
  );
}
