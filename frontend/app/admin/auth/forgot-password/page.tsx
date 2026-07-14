"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Mail,
  ShieldAlert,
  ArrowLeft,
  Send,
  CheckCircle2,
  Sun,
  Moon,
} from "lucide-react";
import { authService } from "@/app/services/auth.service";
import { ForgotPasswordResponse } from "@/app/types/types";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const [theme, setTheme] = useState<"light" | "dark">("light");
  useEffect(() => {
    const saved = localStorage.getItem("griva_admin_theme") as "light" | "dark" | null;
    if (saved) setTheme(saved);
  }, []);
  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("griva_admin_theme", next);
  };
  const isDark = theme === "dark";

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response: ForgotPasswordResponse = await authService.forgotPassword(email, true);
      console.log(response.resetUrl)
      if (response.success) {
        setSuccess(response.message);
      }
    } catch (error: any) {
      setError(
        error?.response?.data?.message ||
        "Unable to process request."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      data-admin-theme={theme}
      className="min-h-screen flex items-center justify-center px-4 font-sans antialiased selection:bg-orange-500 selection:text-white"
      style={{ backgroundColor: 'var(--admin-bg)' }}
    >
      {/* Background Glow */}
      <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-orange-500/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-amber-500/5 blur-3xl pointer-events-none" />

      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        className="absolute top-6 right-6 p-2 rounded-xl transition-all cursor-pointer active:scale-95"
        style={{
          backgroundColor: 'var(--admin-surface)',
          border: '1px solid var(--admin-border)',
          color: 'var(--admin-text-dim)',
        }}
      >
        {isDark ? <Sun size={18} className="text-orange-500" /> : <Moon size={18} className="text-orange-500" />}
      </button>

      <div className="relative w-full max-w-md">
        <div
          className="rounded-2xl p-8 shadow-2xl"
          style={{
            backgroundColor: 'var(--admin-surface)',
            border: '1px solid var(--admin-border-accent)',
            boxShadow: isDark ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)' : '0 25px 50px -12px rgba(249, 115, 22, 0.05)',
          }}
        >

          {/* Header */}
          <div className="flex flex-col items-center mb-8">


            <img src={isDark ? "/images/logo-light.png" : "/images/logo-dark.png"} alt="Griva Logo" className="h-8 w-auto object-contain mb-1" />

            <p className="text-[10px] font-bold tracking-widest uppercase mt-1" style={{ color: 'var(--admin-text-faint)' }}>
              Password Recovery
            </p>
          </div>

          {/* Description */}
          <div className="mb-6 text-center">
            <p className="text-sm leading-relaxed" style={{ color: 'var(--admin-text-dim)' }}>
              Enter your email address and we'll send you
              a password reset link.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-500 font-semibold">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="flex items-center gap-2 mb-4 p-3 rounded-xl bg-green-500/10 border border-green-500/30 text-xs text-green-600 font-semibold">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              {success}
            </div>
          )}

          {/* Form */}
          <form
            onSubmit={handleForgotPassword}
            className="space-y-5"
          >
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider block mb-1.5" style={{ color: 'var(--admin-text-dim)' }}>
                Email Address
              </label>

              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'var(--admin-text-faint)' }} />

                <input
                  type="email"
                  required
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  className="w-full rounded-xl pl-10 pr-4 py-3 text-sm outline-none transition-colors focus:border-orange-500"
                  style={{
                    backgroundColor: 'var(--admin-input-bg)',
                    border: '1px solid var(--admin-border-accent)',
                    color: 'var(--admin-input-text)',
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:opacity-60 text-sm font-bold text-white rounded-xl transition-all duration-300 shadow-lg shadow-orange-500/20 cursor-pointer"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Sending Link...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Send Reset Link
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => router.push("/admin/auth/login")}
              className="w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold hover:text-orange-500 transition-colors cursor-pointer"
              style={{ color: 'var(--admin-text-dim)' }}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
