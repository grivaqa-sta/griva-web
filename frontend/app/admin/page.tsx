import { Suspense } from "react";
import AdminDashboard from "./components/AdminDashboard";

export default function AdminPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-sm font-bold text-gray-500 bg-white">Loading Admin Panel...</div>}>
      <AdminDashboard />
    </Suspense>
  );
}