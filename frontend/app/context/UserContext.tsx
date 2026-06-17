"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { CartItem } from "@/app/types/types";
import { authService } from "../services/auth.service";


export type ProfileData ={
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

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
}

interface UserContextType {
  state: UserState;
  login: (user: User) => void;
  logout: () => void;
  getUserProfile: () => Promise<ProfileData>;
  addAddress: (address: Address) => void;
  updateAddress: (index: number, address: Address) => void;
  deleteAddress: (index: number) => void;
  saveOrder: (order: Order) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<UserState>({
    isLoggedIn: false,
    user: null,
    role: null,
    profileData: null,
    addresses: [],
    orders: [],
  });

  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("griva_user");
      const storedRole = localStorage.getItem("griva_role");
      const storedAddresses = localStorage.getItem("griva_addresses");
      const storedOrders = localStorage.getItem("griva_orders");

      // Also check admin user stored by admin login
      const adminUser = localStorage.getItem("user");
      let resolvedRole = storedRole;
      let resolvedUser = storedUser ? JSON.parse(storedUser) : null;
      if (!resolvedRole && adminUser) {
        try {
          const parsed = JSON.parse(adminUser);
          resolvedRole = parsed?.role || null;
          if (!resolvedUser) resolvedUser = parsed;
        } catch { /* ignore */ }
      }

      // Fallback for previous single address storage
      const legacyAddress = localStorage.getItem("griva_address");
      let addresses: Address[] = [];
      if (storedAddresses) {
        addresses = JSON.parse(storedAddresses);
      } else if (legacyAddress) {
        addresses = [JSON.parse(legacyAddress)];
      }

      setState((prev) => ({
        ...prev,
        isLoggedIn: !!token,
        user: resolvedUser,
        role: resolvedRole,
        addresses,
        orders: storedOrders ? JSON.parse(storedOrders) : [],
      }));
    } catch (e) {
      console.error("Failed to load user data from localStorage", e);
    }
  }, []);


 const getUserProfile = async () => {
  try {
    const response = await authService.getProfile();
    setState((prev) => ({
      ...prev,
      profileData: response.data,
    }));
    return response.data;
  } catch (error) {
    console.error("Error fetching profile:", error);
    throw error;
  }
};

  const login = (user: User) => {
    const role = user.role || "customer";
    setState((prev) => ({ ...prev, isLoggedIn: true, user, role }));
    // Store user info separately — do NOT overwrite "token" (the raw JWT)
    localStorage.setItem("griva_user", JSON.stringify(user));
    localStorage.setItem("griva_role", role);
  };

  const logout = () => {
    setState((prev) => ({ ...prev, isLoggedIn: false, user: null, role: null, profileData: null }));
    localStorage.removeItem("token");
    localStorage.removeItem("griva_user");
    localStorage.removeItem("griva_role");
    localStorage.removeItem("user");
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

  return (
    <UserContext.Provider value={{ state, login, logout, addAddress, updateAddress, deleteAddress, saveOrder, getUserProfile }}>
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
