"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DeliveryIndexPage() {
  const router = useRouter();

  useEffect(() => {
    try {
      const token = localStorage.getItem("griva_delivery_token");
      if (token) {
        const payload = JSON.parse(atob(token.split(".")[1]));
        if (payload.role === "delivery") {
          router.replace("/delivery/dashboard");
          return;
        }
      }
    } catch {}
    router.replace("/delivery/login");
  }, [router]);

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <div className="h-8 w-8 border-2 border-[#FF6A00] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
