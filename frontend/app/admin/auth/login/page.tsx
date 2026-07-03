"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Eye, EyeOff, Lock, Mail, ShieldAlert, Sun, Moon } from "lucide-react";
import { authService } from "@/app/services/auth.service";
import { useUser } from "@/app/context/UserContext";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useUser();

  // Theme state for auth pages (independent since ThemeContext might not be available)
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await authService.login({ email, password });
      if (result && result.token) {
        const role = result.user?.role;
        if (role === "admin" || role === "staff") {
          login({ name: result.user?.name || email.split("@")[0], email, role }, result.token);
          router.push("/admin");
          return;
        } else {
          setError("Invalid credentials. Access restricted to authorized personnel.");
          return;
        }
      }

      setError("Incorrect email or password. Please try again.");
    } catch (err: any) {
      let errMsg = err.response?.data?.message || err.response?.data?.error || "Unable to connect to server. Please try again.";
      if (errMsg.toLowerCase().includes("credentials") || errMsg.toLowerCase().includes("invalid")) {
        errMsg = "Incorrect email or password. Please check your credentials and try again.";
      }
      setError(errMsg);
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
      {/* Background glow blobs */}
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
        {/* Card */}
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
            <img
              src={isDark ? "/images/logo-light.png" : "/images/logo-dark.png"}
              alt="Griva Logo"
              className="h-8 w-auto object-contain mb-1"
            />
            <p className="text-[10px] font-bold tracking-widest uppercase mt-1" style={{ color: 'var(--admin-text-faint)' }}>
              Admin Dashboard Access
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400 font-semibold">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider block mb-1.5" style={{ color: 'var(--admin-text-dim)' }}>
                Admin Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'var(--admin-text-faint)' }} />
                <input
                  type="email"
                  required
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl pl-10 pr-4 py-3 text-sm outline-none transition-colors focus:border-orange-500"
                  style={{
                    backgroundColor: 'var(--admin-input-bg)',
                    border: '1px solid var(--admin-border-accent)',
                    color: 'var(--admin-input-text)',
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider block mb-1.5" style={{ color: 'var(--admin-text-dim)' }}>
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'var(--admin-text-faint)' }} />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl pl-10 pr-11 py-3 text-sm outline-none transition-colors focus:border-orange-500"
                  style={{
                    backgroundColor: 'var(--admin-input-bg)',
                    border: '1px solid var(--admin-border-accent)',
                    color: 'var(--admin-input-text)',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors cursor-pointer"
                  style={{ color: 'var(--admin-text-faint)' }}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:opacity-60 text-sm font-bold text-white rounded-xl transition-all duration-300 cursor-pointer shadow-lg shadow-orange-500/20"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" />
                  Sign In to Dashboard
                </>
              )}
            </button>

            {/* Forgot Password */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => router.push("/admin/auth/forgot-password")}
                className="text-xs font-medium text-orange-500 hover:text-orange-600 transition-colors cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}