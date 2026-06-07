"use client";

import { ReactNode } from "react";
import { CartProvider } from "./CartContext";
import { WishlistProvider } from "./WishlistContext";
import { SearchProvider } from "./SearchContext";
import { UserProvider } from "./UserContext";
import { AdminProvider } from "./AdminContext";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AdminProvider>
      <UserProvider>
        <CartProvider>
          <WishlistProvider>
            <SearchProvider>
              {children}
            </SearchProvider>
          </WishlistProvider>
        </CartProvider>
      </UserProvider>
    </AdminProvider>
  );
}
