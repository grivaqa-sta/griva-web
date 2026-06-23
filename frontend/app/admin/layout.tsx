"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useUser } from "@/app/context/UserContext";

interface AdminLayoutProps {
  children: ReactNode;
}

type AuthState = "loading" | "authorized" | "denied";

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isAdmin, isStaff, loading, logout } = useUser();
  const [authState, setAuthState] = useState<AuthState>("loading");

  useEffect(() => {
    if (pathname?.startsWith("/admin/auth")) {
      setAuthState("authorized");
      return;
    }

    if (loading) {
      setAuthState("loading");
      return;
    }

    if (!isAuthenticated) {
      router.replace("/admin/auth/login");
      return;
    }

    if (!isAdmin && !isStaff) {
      logout();
      setAuthState("denied");
      return;
    }

    setAuthState("authorized");
  }, [router, pathname, isAuthenticated, isAdmin, loading, logout]);

  if (authState === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-500 text-sm animate-pulse">Loading...</p>
      </div>
    );
  }

  if (authState === "denied") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="bg-white border border-red-200 rounded-xl shadow-sm p-8 max-w-sm w-full text-center">
          <div className="text-4xl mb-4">🚫</div>
          <h1 className="text-xl font-semibold text-red-600 mb-2">Access Denied</h1>
          <p className="text-gray-500 text-sm mb-6">
            You don't have permission to view this page. Admin credentials are required.
          </p>
          <button
            onClick={() => router.replace("/admin/auth/login")}
            className="w-full bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}