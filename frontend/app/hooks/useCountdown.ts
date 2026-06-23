"use client";

import { useState, useEffect } from "react";
import { CountdownTime } from "@/app/types/types";

export function useCountdown(target: number | string): CountdownTime {
  const [time, setTime] = useState<CountdownTime>({
    hours: typeof target === "number" ? target : 0,
    mins: 0,
    secs: 0,
  });

  useEffect(() => {
    let initialHours = typeof target === "number" ? target : 0;
    let initialMins = 0;
    let initialSecs = 0;

    if (typeof target === "string") {
      const targetDate = new Date(target).getTime();
      const now = new Date().getTime();
      const diff = Math.max(0, targetDate - now);
      
      initialHours = Math.floor(diff / (1000 * 60 * 60));
      initialMins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      initialSecs = Math.floor((diff % (1000 * 60)) / 1000);
    }

    setTime({ hours: initialHours, mins: initialMins, secs: initialSecs });

    const interval = setInterval(() => {
      setTime((prev) => {
        let { hours, mins, secs } = prev;

        if (secs > 0) {
          secs--;
        } else if (mins > 0) {
          mins--;
          secs = 59;
        } else if (hours > 0) {
          hours--;
          mins = 59;
          secs = 59;
        }

        return { hours, mins, secs };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [target]);

  return time;
}
