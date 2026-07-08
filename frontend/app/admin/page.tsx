import { Suspense } from "react";
import AdminDashboard from "./components/AdminDashboard";

export default function AdminPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-sm font-bold animate-pulse" style={{ backgroundColor: 'var(--admin-bg, #ffffff)', color: 'var(--admin-text-dim, #6b7280)' }}>Loading Admin Panel...</div>}>
      <AdminDashboard />
    </Suspense>
  );
}