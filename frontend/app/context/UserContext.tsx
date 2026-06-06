"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { CartItem } from "@/app/types/types";

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
  addresses: Address[];
  orders: Order[];
}

interface UserContextType {
  state: UserState;
  login: (user: User) => void;
  logout: () => void;
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
    addresses: [],
    orders: [],
  });

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("griva_user");
      const storedAddresses = localStorage.getItem("griva_addresses");
      const storedOrders = localStorage.getItem("griva_orders");
      
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
        isLoggedIn: !!storedUser,
        user: storedUser ? JSON.parse(storedUser) : null,
        addresses,
        orders: storedOrders ? JSON.parse(storedOrders) : [],
      }));
    } catch (e) {
      console.error("Failed to load user data from localStorage", e);
    }
  }, []);

  const login = (user: User) => {
    setState((prev) => ({ ...prev, isLoggedIn: true, user }));
    localStorage.setItem("griva_user", JSON.stringify(user));
  };

  const logout = () => {
    setState((prev) => ({ ...prev, isLoggedIn: false, user: null }));
    localStorage.removeItem("griva_user");
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
    <UserContext.Provider value={{ state, login, logout, addAddress, updateAddress, deleteAddress, saveOrder }}>
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
