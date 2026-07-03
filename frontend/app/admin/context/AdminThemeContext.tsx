"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

type AdminTheme = "light" | "dark";

interface AdminThemeContextType {
  theme: AdminTheme;
  toggleTheme: () => void;
  isDark: boolean;
}

const AdminThemeContext = createContext<AdminThemeContextType>({
  theme: "light",
  toggleTheme: () => {},
  isDark: false,
});

const STORAGE_KEY = "griva_admin_theme";

export function AdminThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<AdminTheme>("light");
  const [mounted, setMounted] = useState(false);

  // Load saved theme from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as AdminTheme | null;
    if (saved === "dark" || saved === "light") {
      setTheme(saved);
    }
    setMounted(true);
  }, []);

  // Persist theme changes
  useEffect(() => {
    if (mounted) {
      localStorage.setItem(STORAGE_KEY, theme);
    }
  }, [theme, mounted]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <AdminThemeContext.Provider value={{ theme, toggleTheme, isDark: theme === "dark" }}>
      {children}
    </AdminThemeContext.Provider>
  );
}

export function useAdminTheme() {
  return useContext(AdminThemeContext);
}
