// FEATURE: Delivery Boy System
// Created: 2026-06-18
// Do not modify without checking delivery feature docs

"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

export default function DeliveryLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // If already logged in as delivery, redirect
  useEffect(() => {
    try {
      const token = localStorage.getItem("griva_delivery_token");
      if (token) {
        const payload = JSON.parse(atob(token.split(".")[1]));
        if (payload.role === "delivery") {
          router.replace("/delivery/dashboard");
        }
      }
    } catch {}
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          setError("Invalid email or password.");
        } else if (res.status >= 500) {
          setError("Something went wrong, try again.");
        } else {
          const data = await res.json();
          setError(data.message || "Login failed.");
        }
        setLoading(false);
        return;
      }

      const data = await res.json();

      // Check role is delivery
      if (data.user?.role !== "delivery") {
        setError("Not authorized as delivery staff.");
        setLoading(false);
        return;
      }

      // Save token
      localStorage.setItem("griva_delivery_token", data.token);
      router.replace("/delivery/dashboard");
    } catch {
      setError("Check your internet connection.");
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      {/* Logo */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-black text-orange-500 tracking-tight">
          GR<span className="text-gray-900">i</span>VA
        </h1>
        <p className="text-sm font-bold text-gray-400 mt-1">
          Delivery Portal
        </p>
      </div>

      {/* Login Card */}
      <div className="w-full bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
        <div className="text-center">
          <h2 className="text-lg font-black text-gray-900">Driver Login</h2>
          <p className="text-xs text-gray-400 mt-1">Griva Delivery Staff</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-xs font-bold p-3 rounded-xl text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-600 block mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="driver@griva.qa"
              required
              className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-base font-semibold text-gray-800 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-600 block mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-base font-semibold text-gray-800 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 active:bg-orange-700 disabled:opacity-60 text-white text-base font-bold py-4 rounded-xl transition-colors cursor-pointer"
            style={{ minHeight: "52px" }}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>

      <p className="text-[10px] text-gray-300 mt-6 text-center">
        For delivery staff only. Contact admin for access.
      </p>
    </div>
  );
}
