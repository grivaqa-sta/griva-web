// FEATURE: Delivery Boy System - Luxury Login UI
// Inspired by Apple, Nothing, and Porsche luxury dark design systems

"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldAlert, Sun, Moon } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

export default function DeliveryLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState("");
  const [forgotError, setForgotError] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError("");
    setForgotSuccess("");
    setForgotLoading(true);

    try {
      const res = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });

      if (!res.ok) {
        const data = await res.json();
        setForgotError(data.message || "Failed to generate link.");
        setForgotLoading(false);
        return;
      }

      const data = await res.json();
      setForgotSuccess(data.resetUrl || "Reset link generated.");
    } catch {
      setForgotError("Check your internet connection.");
    } finally {
      setForgotLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("griva_delivery_theme") as "dark" | "light";
      if (savedTheme) setTheme(savedTheme);
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("griva_delivery_theme", nextTheme);
    window.dispatchEvent(new CustomEvent("griva-delivery-theme-toggle", { detail: nextTheme }));
  };

  // Redirect if already logged in
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

      if (data.user?.role !== "delivery") {
        setError("Not authorized as delivery staff.");
        setLoading(false);
        return;
      }

      localStorage.setItem("griva_delivery_token", data.token);
      router.replace("/delivery/dashboard");
    } catch {
      setError("Check your internet connection.");
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen justify-between bg-[#050505] px-6 py-8 relative overflow-hidden">
      {/* Theme Toggle Button */}
      <div className="absolute top-4 right-4 z-50">
        <button
          onClick={toggleTheme}
          className="h-9 w-9 rounded-xl bg-zinc-950 border border-zinc-900 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer active:scale-95 shadow-md"
          aria-label="Toggle Theme"
          type="button"
        >
          {theme === "dark" ? <Sun size={16} className="text-[#FF6A00]" /> : <Moon size={16} className="text-[#FF6A00]" />}
        </button>
      </div>

      {/* Top light beam animation */}
      <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-[#FF6A00]/50 to-transparent blur-[1px]" />
      
      {/* Logo & Portal Info */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-center mt-12 mb-6 shrink-0"
      >
        <div className="inline-block relative">
          <img 
            src={theme === "dark" ? "/images/logo-light.png" : "/images/logo-dark.png"} 
            alt="Griva Logo" 
            className="h-9 w-auto object-contain mx-auto" 
          />
        </div>
      </motion.div>

      {/* Glassmorphism Welcome & Form Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
        className="w-full bg-[#0a0a0a]/80 backdrop-blur-xl rounded-3xl border border-zinc-900 p-6 space-y-6 shadow-2xl relative z-10 before:absolute before:inset-0 before:rounded-3xl before:bg-gradient-to-b before:from-white/[0.03] before:to-transparent before:pointer-events-none"
      >
        {!showForgot ? (
          <>
            <div className="text-center space-y-1">
              <h2 className="text-xl font-bold tracking-tight text-white">Welcome Back</h2>
              <div className="flex items-center justify-center gap-1.5 text-xs">
                <span className="text-[#FF6A00] font-bold">Driver Login</span>
                <span className="h-1 w-1 rounded-full bg-zinc-700" />
                <span className="text-zinc-500 font-semibold">Griva Delivery Staff</span>
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-950/40 border border-red-900/60 text-red-400 text-xs font-bold px-4 py-3 rounded-2xl flex items-center gap-2 justify-center"
              >
                <ShieldAlert size={14} className="shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email input field */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold tracking-wider text-zinc-400 uppercase ml-1">
                  Email Address
                </label>
                <div className="relative group">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-[#FF6A00] transition-colors" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="driver@griva.qa"
                    required
                    className="w-full bg-zinc-950 border border-zinc-900 hover:border-zinc-800 focus:border-[#FF6A00]/80 rounded-2xl pl-11 pr-4 py-3.5 text-sm font-semibold text-white placeholder:text-zinc-600 focus:outline-none transition-all duration-300 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]"
                  />
                </div>
              </div>

              {/* Password input field */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold tracking-wider text-zinc-400 uppercase ml-1">
                  Password
                </label>
                <div className="relative group">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-[#FF6A00] transition-colors" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full bg-zinc-950 border border-zinc-900 hover:border-zinc-800 focus:border-[#FF6A00]/80 rounded-2xl pl-11 pr-12 py-3.5 text-sm font-semibold text-white placeholder:text-zinc-600 focus:outline-none transition-all duration-300 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white cursor-pointer"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Checkbox and Link */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="accent-[#FF6A00] rounded bg-zinc-950 border-zinc-800"
                  />
                  <span className="text-zinc-400 font-semibold">Remember me</span>
                </label>
                <button 
                  type="button"
                  onClick={() => {
                    setShowForgot(true);
                    setError("");
                  }}
                  className="text-[#FF6A00] hover:underline font-bold transition-all bg-transparent border-none cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>

              {/* Login button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#FF6A00] to-[#E04F00] hover:brightness-110 active:scale-[0.99] disabled:opacity-50 text-white text-sm font-bold py-4 rounded-2xl transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(255,106,0,0.25)]"
                style={{ minHeight: "48px" }}
              >
                <span>{loading ? "Verifying..." : "Login"}</span>
                {!loading && <ArrowRight size={16} />}
              </button>
            </form>
          </>
        ) : (
          <>
            <div className="text-center space-y-1">
              <h2 className="text-xl font-bold tracking-tight text-white">Reset Password</h2>
              <p className="text-xs text-zinc-500 font-semibold">
                Enter your email to receive a password reset link
              </p>
            </div>

            {forgotError && (
              <div className="bg-red-950/40 border border-red-900/60 text-red-400 text-xs font-bold px-4 py-3 rounded-2xl flex items-center gap-2 justify-center">
                <ShieldAlert size={14} className="shrink-0" />
                <span>{forgotError}</span>
              </div>
            )}

            {forgotSuccess && (
              <div className="bg-green-950/40 border border-green-900/60 text-green-400 text-xs font-bold px-4 py-3 rounded-2xl space-y-2">
                <p>✅ Password reset link generated:</p>
                <a 
                  href={forgotSuccess} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="block underline break-all text-xs text-[#FF6A00] hover:brightness-110"
                >
                  {forgotSuccess}
                </a>
              </div>
            )}

            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold tracking-wider text-zinc-400 uppercase ml-1">
                  Email Address
                </label>
                <div className="relative group">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-[#FF6A00] transition-colors" />
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="driver@griva.qa"
                    required
                    className="w-full bg-zinc-950 border border-zinc-900 hover:border-zinc-800 focus:border-[#FF6A00]/80 rounded-2xl pl-11 pr-4 py-3.5 text-sm font-semibold text-white placeholder:text-zinc-600 focus:outline-none transition-all duration-300 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={forgotLoading}
                className="w-full bg-gradient-to-r from-[#FF6A00] to-[#E04F00] hover:brightness-110 active:scale-[0.99] disabled:opacity-50 text-white text-sm font-bold py-4 rounded-2xl transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(255,106,0,0.25)]"
                style={{ minHeight: "48px" }}
              >
                <span>{forgotLoading ? "Requesting..." : "Send Reset Link"}</span>
                {!forgotLoading && <ArrowRight size={16} />}
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowForgot(false);
                  setForgotSuccess("");
                  setForgotError("");
                  setForgotEmail("");
                }}
                className="w-full bg-transparent text-zinc-400 hover:text-white text-xs font-bold py-2 cursor-pointer transition-colors"
              >
                Back to Login
              </button>
            </form>
          </>
        )}
      </motion.div>

      {/* Skyline vector illustration with orange light trails */}
      <div className="relative w-full h-32 shrink-0 overflow-hidden select-none pointer-events-none mt-4">
        {/* Animated Light Trails */}
        <div className="absolute inset-0 z-0">
          <svg className="w-full h-full opacity-60" viewBox="0 0 400 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Trail 1 */}
            <motion.path 
              d="M-50,90 Q100,70 200,105 T450,110" 
              stroke="url(#glow1)" 
              strokeWidth="2"
              fill="none"
              initial={{ strokeDasharray: "10 150", strokeDashoffset: 0 }}
              animate={{ strokeDashoffset: -320 }}
              transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
            />
            {/* Trail 2 */}
            <motion.path 
              d="M-20,115 Q150,100 250,112 T420,100" 
              stroke="url(#glow2)" 
              strokeWidth="1.5"
              fill="none"
              initial={{ strokeDasharray: "20 180", strokeDashoffset: 50 }}
              animate={{ strokeDashoffset: -400 }}
              transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
            />
            <defs>
              <linearGradient id="glow1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FF6A00" stopOpacity="0" />
                <stop offset="50%" stopColor="#FF6A00" stopOpacity="1" />
                <stop offset="100%" stopColor="#FF6A00" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="glow2" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FF8C00" stopOpacity="0" />
                <stop offset="50%" stopColor="#FF6A00" stopOpacity="1" />
                <stop offset="100%" stopColor="#FF3300" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Minimal skyline silhouette */}
        <svg className="absolute bottom-0 w-full h-16 opacity-[0.08] text-white" viewBox="0 0 400 64" fill="currentColor" preserveAspectRatio="none">
          <path d="M0,64 L0,48 L15,48 L15,32 L20,32 L20,44 L32,44 L32,24 L40,24 L40,40 L55,40 L55,16 L65,16 L65,48 L80,48 L80,36 L92,36 L92,44 L110,44 L110,8 L122,8 L122,38 L135,38 L135,28 L142,28 L142,48 L160,48 L160,32 L172,32 L172,42 L185,42 L185,12 L198,12 L198,40 L210,40 L210,24 L222,24 L222,46 L235,46 L235,16 L248,16 L248,36 L265,36 L265,30 L275,30 L275,44 L290,44 L290,20 L302,20 L302,38 L320,38 L320,8 L330,8 L330,44 L345,44 L345,28 L355,28 L355,36 L370,36 L370,14 L385,14 L385,48 L400,48 L400,64 Z" />
        </svg>
      </div>

      {/* Footer Disclaimer */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="w-full text-center space-y-2 pb-2"
      >
        <div className="flex items-center justify-center gap-1.5 text-[10px] text-zinc-400 font-semibold">
          <ShieldAlert size={12} className="text-[#FF6A00]" />
          <span>For authorized delivery staff only.</span>
        </div>
        <p className="text-[9px] text-zinc-500">Contact store administrator for account access.</p>
      </motion.div>
    </div>
  );
}
