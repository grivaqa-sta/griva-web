// FEATURE: Delivery Boy System
// Created: 2026-06-18
// Do not modify without checking delivery feature docs

"use client";

import React, { useState, useEffect } from "react";
import { UserPlus, Mail, Shield, User, Key, Users, RefreshCw } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

interface DeliveryBoy {
  id: number;
  name: string;
  email: string;
  activeOrderCount: number;
  createdAt?: string;
}

export default function DeliveryTab() {
  const [drivers, setDrivers] = useState<DeliveryBoy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Create form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const fetchDrivers = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("griva_admin_token") || "";
      const res = await fetch(`${API_BASE}/orders/admin/delivery-boys`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setDrivers(data.deliveryBoys || []);
      } else {
        setError("Failed to fetch drivers.");
      }
    } catch {
      setError("Network error fetching drivers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const handleCreateDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setSubmitting(true);

    try {
      const token = localStorage.getItem("griva_admin_token") || "";
      const res = await fetch(`${API_BASE}/orders/admin/delivery-boys`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccessMsg(data.message || "Driver created successfully!");
        setName("");
        setEmail("");
        setPassword("");
        fetchDrivers(); // reload list
      } else {
        setError(data.message || "Failed to create driver.");
      }
    } catch {
      setError("Failed to connect to backend server.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in-50 duration-300">
      
      {/* Create Driver Form */}
      <div className="lg:col-span-5">
        <div className="bg-white border border-orange-500/30 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-orange-500/30">
            <UserPlus className="h-4.5 w-4.5 text-orange-500" />
            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Create New Driver</h4>
          </div>
          <p className="text-[10px] text-gray-400 leading-relaxed">
            Register a new delivery staff account. Drivers can log into the mobile dashboard using these credentials.
          </p>

          {successMsg && (
            <div className="bg-green-50 border border-green-200 text-green-600 text-xs font-bold p-3 rounded-xl">
              ✅ {successMsg}
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-xs font-bold p-3 rounded-xl">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleCreateDriver} className="space-y-4">
            <div>
              <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1.5">Driver Full Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                  <User className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  placeholder="e.g. Mohammed Al-Kuwari"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white border border-orange-500/30 rounded-xl pl-9 pr-4 py-2.5 text-xs text-gray-800 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1.5">Driver Email</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  type="email"
                  placeholder="driver@griva.qa"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border border-orange-500/30 rounded-xl pl-9 pr-4 py-2.5 text-xs text-gray-800 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1.5">Driver Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                  <Key className="h-4 w-4" />
                </span>
                <input
                  type="password"
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white border border-orange-500/30 rounded-xl pl-9 pr-4 py-2.5 text-xs text-gray-800 focus:outline-none"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white rounded-xl transition-all cursor-pointer font-bold text-xs shadow-md"
            >
              {submitting ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  Create Driver Account
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Driver List Panel */}
      <div className="lg:col-span-7 space-y-6">
        <div className="bg-white border border-orange-500/30 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-orange-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4.5 w-4.5 text-orange-500" />
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Active Drivers ({drivers.length})</h4>
            </div>
            <button
              onClick={fetchDrivers}
              disabled={loading}
              className="p-1 hover:bg-gray-200 rounded-lg active:scale-95 transition-all"
            >
              <RefreshCw className={`h-4 w-4 text-gray-500 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>

          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-orange-500/30 text-[10px] text-gray-400 font-bold uppercase tracking-wider bg-gray-50">
                <th className="p-4">Driver Name</th>
                <th className="p-4">Email</th>
                <th className="p-4 text-center">Active Orders</th>
                <th className="p-4">Created At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading && drivers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-xs text-gray-400 font-semibold">
                    <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2 text-orange-500" />
                    Loading drivers...
                  </td>
                </tr>
              ) : drivers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-xs text-gray-400 font-semibold">
                    No drivers registered yet.
                  </td>
                </tr>
              ) : (
                drivers.map((driver) => (
                  <tr key={driver.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-xs font-bold text-gray-800">👤 {driver.name}</td>
                    <td className="p-4 text-xs text-gray-500">{driver.email}</td>
                    <td className="p-4 text-xs font-black text-center text-orange-500">
                      {driver.activeOrderCount > 0 ? (
                        <span className="bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-lg">
                          {driver.activeOrderCount} orders
                        </span>
                      ) : (
                        <span className="text-gray-300">0</span>
                      )}
                    </td>
                    <td className="p-4 text-xs text-gray-400">
                      {driver.createdAt ? new Date(driver.createdAt).toLocaleDateString() : "N/A"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
