"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { usePathname } from "next/navigation";
import { CartItem } from "@/app/types/types";
import { authService } from "../services/auth.service";

export type ProfileData = {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
};

export type Address = {
  fullName: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
};

export type User = {
  name: string;
  email: string;
  role?: string;
};

export type Order = {
  id: string;
  date: string;
  items: CartItem[];
  total: number;
  status: string;
};

interface UserState {
  isLoggedIn: boolean;
  user: User | null;
  role: string | null;
  profileData: ProfileData | null;
  addresses: Address[];
  orders: Order[];
  loading: boolean;
  token: string | null;
}

interface UserContextType {
  state: UserState;
  login: (user: User, token: string) => void;
  logout: () => void;
  getUserProfile: () => Promise<ProfileData>;
  addAddress: (address: Address) => void;
  updateAddress: (index: number, address: Address) => void;
  deleteAddress: (index: number) => void;
  saveOrder: (order: Order) => void;
  // Helpers
  user: User | null;
  role: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isCustomer: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdminPath = pathname?.startsWith("/admin") ?? false;

  const [state, setState] = useState<UserState>({
    isLoggedIn: false,
    user: null,
    role: null,
    profileData: null,
    addresses: [],
    orders: [],
    loading: true,
    token: null,
  });

  const getUserProfile = useCallback(async () => {
    try {
      const response = await authService.getProfile();
      const profile = response.user || response.data || response;
      const role = profile.role || "customer";
      
      setState((prev) => ({
        ...prev,
        profileData: profile,
        role: role,
      }));
      return profile;
    } catch (error) {
      console.error("Error fetching profile:", error);
      throw error;
    }
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem(isAdminPath ? "griva_admin_token" : "griva_user_token");
        const storedUser = localStorage.getItem(isAdminPath ? "griva_admin_user" : "griva_user");
        const storedAddresses = localStorage.getItem("griva_addresses");
        const storedOrders = localStorage.getItem("griva_orders");

        const legacyAddress = localStorage.getItem("griva_address");
        let addresses: Address[] = [];
        if (storedAddresses) {
          addresses = JSON.parse(storedAddresses);
        } else if (legacyAddress) {
          addresses = [JSON.parse(legacyAddress)];
        }

        let parsedUser = null;
        if (storedUser) {
          try {
            parsedUser = JSON.parse(storedUser);
          } catch { /* ignore */ }
        }

        if (token) {
          setState((prev) => ({
            ...prev,
            isLoggedIn: true,
            token,
            user: parsedUser,
            addresses,
            orders: storedOrders ? JSON.parse(storedOrders) : [],
          }));

          try {
            const profile = await getUserProfile();
            setState((prev) => ({
              ...prev,
              role: profile.role,
              user: prev.user || { name: profile.name, email: profile.email, role: profile.role }
            }));
          } catch (e) {
            console.error("Token valid but profile fetch failed", e);
            // If profile fails, clear token and state to prevent hanging auth states
            setState((prev) => ({ ...prev, isLoggedIn: false, token: null, user: null, role: null }));
            localStorage.removeItem(isAdminPath ? "griva_admin_token" : "griva_user_token");
            localStorage.removeItem(isAdminPath ? "griva_admin_user" : "griva_user");
          }
        } else {
          setState((prev) => ({
            ...prev,
            isLoggedIn: false,
            user: null,
            role: null,
            token: null,
            addresses,
            orders: storedOrders ? JSON.parse(storedOrders) : [],
          }));
        }
      } catch (e) {
        console.error("Failed to load user data from localStorage", e);
      } finally {
        setState((prev) => ({ ...prev, loading: false }));
      }
    };

    initializeAuth();
  }, [getUserProfile, isAdminPath]);

  const login = (user: User, token: string) => {
    const role = user.role || "customer";
    setState((prev) => ({ 
      ...prev, 
      isLoggedIn: true, 
      user, 
      role,
      token
    }));
    if (role === "admin") {
      localStorage.setItem("griva_admin_token", token);
      localStorage.setItem("griva_admin_user", JSON.stringify(user));
    } else {
      localStorage.setItem("griva_user_token", token);
      localStorage.setItem("griva_user", JSON.stringify(user));
    }
  };

  const logout = () => {
    setState((prev) => ({ 
      ...prev, 
      isLoggedIn: false, 
      user: null, 
      role: null, 
      profileData: null,
      token: null
    }));
    if (isAdminPath) {
      localStorage.removeItem("griva_admin_token");
      localStorage.removeItem("griva_admin_user");
    } else {
      localStorage.removeItem("griva_user_token");
      localStorage.removeItem("griva_user");
    }
  };

  const addAddress = (address: Address) => {
    setState((prev) => {
      const newAddresses = [...prev.addresses, address];
      localStorage.setItem("griva_addresses", JSON.stringify(newAddresses));
      return { ...prev, addresses: newAddresses };
    });
  };

  const updateAddress = (index: number, address: Address) => {
    setState((prev) => {
      const newAddresses = [...prev.addresses];
      newAddresses[index] = address;
      localStorage.setItem("griva_addresses", JSON.stringify(newAddresses));
      return { ...prev, addresses: newAddresses };
    });
  };

  const deleteAddress = (index: number) => {
    setState((prev) => {
      const newAddresses = prev.addresses.filter((_, i) => i !== index);
      localStorage.setItem("griva_addresses", JSON.stringify(newAddresses));
      return { ...prev, addresses: newAddresses };
    });
  };

  const saveOrder = (order: Order) => {
    setState((prev) => {
      const newOrders = [order, ...prev.orders];
      localStorage.setItem("griva_orders", JSON.stringify(newOrders));
      return { ...prev, orders: newOrders };
    });
  };

  const contextValue: UserContextType = {
    state,
    login,
    logout,
    getUserProfile,
    addAddress,
    updateAddress,
    deleteAddress,
    saveOrder,
    // Helpers
    user: state.user,
    role: state.role,
    loading: state.loading,
    isAuthenticated: state.isLoggedIn,
    isAdmin: state.role === "admin",
    isCustomer: state.role === "customer",
  };

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
