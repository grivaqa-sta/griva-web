"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Mail,
  ShieldAlert,
  ArrowLeft,
  Send,
  CheckCircle2,
} from "lucide-react";
import { authService } from "@/app/services/auth.service";
import { ForgotPasswordResponse } from "@/app/types/types";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response:ForgotPasswordResponse = await authService.forgotPassword(email);
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
    <div className="min-h-screen bg-white flex items-center justify-center px-4 font-sans antialiased selection:bg-orange-500 selection:text-white">
      {/* Background Glow */}
      <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-orange-500/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-amber-500/5 blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md">
        <div className="bg-white border border-orange-500/30 rounded-2xl p-8 shadow-2xl shadow-orange-500/5">

          {/* Header */}
          <div className="flex flex-col items-center mb-8">
            <div className="h-12 w-12 rounded-xl bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/40 mb-4">
              <Sparkles className="h-6 w-6 text-gray-900" />
            </div>

            <img src="/images/logo-dark.png" alt="Griva Logo" className="h-8 w-auto object-contain mb-1" />

            <p className="text-[10px] text-gray-400 font-bold tracking-widest uppercase mt-1">
              Password Recovery
            </p>
          </div>

          {/* Description */}
          <div className="mb-6 text-center">
            <p className="text-sm text-gray-500 leading-relaxed">
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
              <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1.5">
                Email Address
              </label>

              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />

                <input
                  type="email"
                  required
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  className="w-full bg-white border border-orange-500/30 rounded-xl pl-10 pr-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-orange-500 transition-colors"
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
              className="w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold text-gray-500 hover:text-orange-500 transition-colors cursor-pointer"
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
