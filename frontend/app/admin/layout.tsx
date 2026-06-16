"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({children}: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Skip auth check if we are on an auth page (login, forgot-password, reset-password)
    if (pathname.startsWith("/admin/auth/")) {
      setLoading(false);
      return;
    }

    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (!token || !user) {
      router.replace("/admin/auth/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(user);

      if (parsedUser.role !== "admin") {
        router.replace("/admin");
        return;
      }

      setLoading(false);
    } catch {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      router.replace("/admin/auth/login");
    }
  }, [router, pathname]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  return <>{children}</>;
}