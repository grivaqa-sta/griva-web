"use client";

import { ReactNode } from "react";
import { CartProvider } from "./CartContext";
import { WishlistProvider } from "./WishlistContext";
import { SearchProvider } from "./SearchContext";
import { UserProvider } from "./UserContext";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <UserProvider>
      <CartProvider>
        <WishlistProvider>
          <SearchProvider>
            {children}
          </SearchProvider>
        </WishlistProvider>
      </CartProvider>
    </UserProvider>
  );
}
