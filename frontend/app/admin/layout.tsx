"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    // Skip auth check for admin auth pages (login, forgot-password, reset-password)
    if (pathname && pathname.startsWith("/admin/auth")) {
      setLoading(false);
      return;
    }

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const user = typeof window !== "undefined" ? localStorage.getItem("user") : null;

    if (!token || !user) {
      router.replace("/admin/auth/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(user);
      if (!parsedUser || parsedUser.role !== "admin") {
        // Clear any invalid or non-admin credentials and redirect away
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setErrorMsg("Access denied. Admin credentials required.");

        return;
      }

      setLoading(false);
    } catch (e) {
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