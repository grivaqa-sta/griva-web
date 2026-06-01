"use client";

import { useState, useEffect } from "react";
import { CountdownTime } from "@/app/types/types";

export function useCountdown(targetHours: number): CountdownTime {
  const [time, setTime] = useState<CountdownTime>({
    hours: targetHours,
    mins: 0,
    secs: 0,
  });

  useEffect(() => {
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
  }, []);

  return time;
}
