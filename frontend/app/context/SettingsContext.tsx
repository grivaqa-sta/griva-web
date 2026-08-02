"use client";

/**
 * SettingsContext.tsx
 *
 * Global Settings Provider — GriVA
 *
 * Loads GET /settings EXACTLY ONCE on application startup.
 * All components that previously called getSettingsApi() independently
 * now consume settings through the useSettings() hook.
 *
 * This eliminates 14–18 duplicate API calls per user session and allows
 * Neon PostgreSQL to autosuspend after 5 minutes of inactivity.
 */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
  ReactNode,
} from "react";
import { getSettingsApi, GlobalSettings } from "@/app/utils/api";

// ─────────────────────────────────────────────────────────
// Safe Fallback Defaults
// Match the exact fallbacks previously used by each component
// to guarantee zero regressions on API failure.
// ─────────────────────────────────────────────────────────
export const SETTINGS_DEFAULTS: GlobalSettings = {
  announcementBarEnabled: true,
  fridaySaleEnabled: true,
  midnightSaleEnabled: false,
  shippingFee: 10,
  freeShippingThreshold: 49,
  whatsappNumber: "+97470066559",
  supportEmail: "info@thegriva.com",
  telegramLink: "",
  whatsappCommunityLink: "",
  fridaySaleConfig: null,
};

// ─────────────────────────────────────────────────────────
// Context Shape
// ─────────────────────────────────────────────────────────
interface SettingsContextValue {
  /** The fully loaded (or fallback) settings object */
  settings: GlobalSettings;
  /** True while the initial fetch is in flight */
  loading: boolean;
  /** Non-null when the fetch failed; settings will be SETTINGS_DEFAULTS */
  error: Error | null;
  /** Manually trigger a settings refresh (e.g. after admin saves changes) */
  refresh: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextValue>({
  settings: SETTINGS_DEFAULTS,
  loading: true,
  error: null,
  refresh: async () => {},
});

// ─────────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────────
export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<GlobalSettings>(SETTINGS_DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSettings = useCallback(async () => {
    try {
      const data = await getSettingsApi();
      // Merge with defaults to ensure every field is always defined
      setSettings({ ...SETTINGS_DEFAULTS, ...data });
      setError(null);
    } catch (err) {
      // On failure, keep the safe defaults — behaviour matches the
      // individual catch blocks that previously existed in each component.
      setError(err instanceof Error ? err : new Error("Failed to load settings"));
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch ONCE on mount — no polling.
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Memoize the context value to prevent every consumer from re-rendering
  // when unrelated state changes in the provider's parent tree.
  const value = useMemo<SettingsContextValue>(
    () => ({ settings, loading, error, refresh: fetchSettings }),
    [settings, loading, error, fetchSettings]
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

// ─────────────────────────────────────────────────────────
// Public Hook
// ─────────────────────────────────────────────────────────
/**
 * useSettings()
 *
 * Returns global site settings loaded once at app startup.
 * Must be used inside <SettingsProvider>.
 *
 * @example
 * const { settings, loading } = useSettings();
 * const threshold = settings.freeShippingThreshold; // always defined — never undefined
 */
export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error("useSettings must be used within a <SettingsProvider>");
  }
  return ctx;
}
