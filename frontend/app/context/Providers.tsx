"use client";

import { ReactNode } from "react";
import { CartProvider } from "./CartContext";
import { WishlistProvider } from "./WishlistContext";
import { SearchProvider } from "./SearchContext";
import { UserProvider } from "./UserContext";
import { AdminProvider } from "./AdminContext";
import { ToastProvider } from "./ToastContext";
import { SocketProvider } from "./SocketContext";
import { SettingsProvider } from "./SettingsContext";
import { MidnightSaleProvider } from "./MidnightSaleContext";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      {/* SettingsProvider must be outermost data provider — fetches GET /settings ONCE */}
      <SettingsProvider>
        {/* MidnightSaleProvider is nested here so it can consume settings via useSettings() */}
        <MidnightSaleProvider>
          <AdminProvider>
            <UserProvider>
              <SocketProvider>
                <CartProvider>
                  <WishlistProvider>
                    <SearchProvider>
                      {children}
                    </SearchProvider>
                  </WishlistProvider>
                </CartProvider>
              </SocketProvider>
            </UserProvider>
          </AdminProvider>
        </MidnightSaleProvider>
      </SettingsProvider>
    </ToastProvider>
  );
}


