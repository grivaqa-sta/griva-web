"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { getSettingsApi } from "@/app/utils/api";

interface MidnightSaleContextValue {
  isActive: boolean;             // true = admin ON + within Friday 8PM–Sat 2AM window
  adminEnabled: boolean;         // what admin set
  withinWindow: boolean;         // is current time inside the Friday window?
  countdown: string;             // "HH:MM:SS" countdown to end of sale (or to next start)
  countingToEnd: boolean;        // true = counting to sale end, false = counting to next sale start
}

const MidnightSaleContext = createContext<MidnightSaleContextValue>({
  isActive: false,
  adminEnabled: false,
  withinWindow: false,
  countdown: "00:00:00",
  countingToEnd: false,
});

export function useMidnightSale() {
  return useContext(MidnightSaleContext);
}

// Qatar is UTC+3 (no DST)
const QATAR_OFFSET_MS = 3 * 60 * 60 * 1000;

function getQatarTime(): Date {
  const utc = Date.now() + new Date().getTimezoneOffset() * 60 * 1000;
  return new Date(utc + QATAR_OFFSET_MS);
}

/**
 * Returns whether a given Qatar Date object falls inside the
 * Friday 8PM (20:00) → Saturday 2AM (02:00) window.
 */
function isInSaleWindow(qt: Date): boolean {
  const day = qt.getDay();   // 0=Sun,1=Mon,…,5=Fri,6=Sat
  const hour = qt.getHours();
  const min = qt.getMinutes();

  if (day === 5) {
    // Friday: 20:00 onwards
    return hour >= 20;
  }
  if (day === 6) {
    // Saturday: until 02:00 (strictly before 02:00)
    return hour < 2 || (hour === 2 && min === 0);
  }
  return false;
}

/**
 * Returns the next Friday 8PM Qatar time as a Date (UTC-based).
 */
function getNextSaleStart(): Date {
  const qt = getQatarTime();
  const d = new Date(qt);
  // Advance to next Friday
  const daysUntilFriday = (5 - d.getDay() + 7) % 7 || 7;
  d.setDate(d.getDate() + daysUntilFriday);
  d.setHours(20, 0, 0, 0);
  // Convert back from Qatar time to UTC
  return new Date(d.getTime() - QATAR_OFFSET_MS);
}

/**
 * Returns next Saturday 2AM Qatar time as a Date (UTC-based).
 */
function getSaleEnd(): Date {
  const qt = getQatarTime();
  const d = new Date(qt);
  const day = d.getDay();

  if (day === 5 && d.getHours() >= 20) {
    // Currently Friday after 8PM → end is tomorrow (Saturday) 2AM
    d.setDate(d.getDate() + 1);
  } else if (day === 6 && d.getHours() < 2) {
    // Currently Saturday before 2AM → end is today 2AM
  } else {
    // Not in window
    return getNextSaleStart();
  }
  d.setHours(2, 0, 0, 0);
  return new Date(d.getTime() - QATAR_OFFSET_MS);
}

function formatCountdown(ms: number): string {
  if (ms <= 0) return "00:00:00";
  const totalSecs = Math.floor(ms / 1000);
  const h = Math.floor(totalSecs / 3600);
  const m = Math.floor((totalSecs % 3600) / 60);
  const s = totalSecs % 60;
  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
}

export function MidnightSaleProvider({ children }: { children: ReactNode }) {
  const [adminEnabled, setAdminEnabled] = useState(false);
  const [withinWindow, setWithinWindow] = useState(false);
  const [countdown, setCountdown] = useState("00:00:00");
  const [countingToEnd, setCountingToEnd] = useState(false);

  const computeState = useCallback(() => {
    const qt = getQatarTime();
    const inWindow = isInSaleWindow(qt);
    setWithinWindow(inWindow);

    if (inWindow) {
      // Count down to end of sale
      const endUtc = getSaleEnd();
      const remaining = endUtc.getTime() - Date.now();
      setCountdown(formatCountdown(remaining));
      setCountingToEnd(true);
    } else {
      // Count down to start of next sale
      const startUtc = getNextSaleStart();
      const remaining = startUtc.getTime() - Date.now();
      setCountdown(formatCountdown(remaining));
      setCountingToEnd(false);
    }
  }, []);

  // Poll settings every 60 seconds
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings = await getSettingsApi();
        setAdminEnabled(!!settings.midnightSaleEnabled);
      } catch {
        setAdminEnabled(false);
      }
    };
    fetchSettings();
    const settingsInterval = setInterval(fetchSettings, 60_000);
    return () => clearInterval(settingsInterval);
  }, []);

  // Tick every second
  useEffect(() => {
    computeState();
    const tick = setInterval(computeState, 1000);
    return () => clearInterval(tick);
  }, [computeState]);

  const isActive = adminEnabled && withinWindow;

  // Inject / remove "midnight-sale" class on <html>
  useEffect(() => {
    if (isActive) {
      document.documentElement.classList.add("midnight-sale");
    } else {
      document.documentElement.classList.remove("midnight-sale");
    }
    return () => {
      document.documentElement.classList.remove("midnight-sale");
    };
  }, [isActive]);

  return (
    <MidnightSaleContext.Provider value={{ isActive, adminEnabled, withinWindow, countdown, countingToEnd }}>
      {children}
    </MidnightSaleContext.Provider>
  );
}
