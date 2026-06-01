"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface SearchFilters {
  category: string;
  minPrice: number;
  maxPrice: number;
  rating: number;
  sortBy: string;
}

interface SearchContextValue {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filters: SearchFilters;
  setFilters: React.Dispatch<React.SetStateAction<SearchFilters>>;
  resetFilters: () => void;
  recentSearches: string[];
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
}

const defaultFilters: SearchFilters = {
  category: "",
  minPrice: 0,
  maxPrice: 2000,
  rating: 0,
  sortBy: "featured",
};

const SearchContext = createContext<SearchContextValue | null>(null);

export function SearchProvider({ children }: { children: ReactNode }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<SearchFilters>(defaultFilters);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("griva-recent-searches");
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  // Save recent searches to localStorage
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem("griva-recent-searches", JSON.stringify(recentSearches));
  }, [recentSearches, hydrated]);

  const addRecentSearch = (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    setRecentSearches((prev) => {
      const filtered = prev.filter((q) => q.toLowerCase() !== trimmed.toLowerCase());
      return [trimmed, ...filtered].slice(0, 5); // keep last 5 searches
    });
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
  };

  return (
    <SearchContext.Provider
      value={{
        searchQuery,
        setSearchQuery,
        filters,
        setFilters,
        resetFilters,
        recentSearches,
        addRecentSearch,
        clearRecentSearches,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const ctx = useContext(SearchContext);
  if (!ctx) throw new Error("useSearch must be used inside SearchProvider");
  return ctx;
}
