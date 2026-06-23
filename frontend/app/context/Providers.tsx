"use client";

import { ReactNode } from "react";
import { CartProvider } from "./CartContext";
import { WishlistProvider } from "./WishlistContext";
import { SearchProvider } from "./SearchContext";
import { UserProvider } from "./UserContext";
import { AdminProvider } from "./AdminContext";
import { ToastProvider } from "./ToastContext";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
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
    </ToastProvider>
  );
}

