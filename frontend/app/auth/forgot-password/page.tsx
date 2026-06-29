"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  Users,
  MessageSquare,
  Phone,
  Headphones,
  Truck,
  BadgeCheck
} from "lucide-react";
import { authService } from "@/app/services/auth.service";

type Status = "idle" | "loading" | "success" | "error";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email.trim()) {
      setStatus("error");
      setMessage("Please enter your email address.");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const response = await authService.forgotPassword(email.trim());

      if (response.success) {
        setStatus("success");
        setMessage(response.message ?? "Password reset link sent to your email.");
      } else {
        setStatus("error");
        setMessage("Something went wrong. Please try again.");
      }
    } catch (err: unknown) {
      setStatus("error");
      const errorMessage =
        err instanceof Error ? err.message : "Unable to send reset link. Please try again.";
      setMessage(errorMessage);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div className="bg-[#f5f5f7] min-h-[85vh]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">

          {/* ── LEFT COLUMN: Brand + Image ── */}
          <div className="hidden lg:flex flex-col relative min-h-[560px] overflow-visible">
            {/* Text Content */}
            <div className="relative z-20">
              <h1 className="text-4xl xl:text-5xl font-black text-gray-900 tracking-tight leading-tight">
                Forgot Your
              </h1>
              <h2 className="text-4xl xl:text-5xl font-black text-[#F54900] tracking-tight mt-0.5">
                Password?
              </h2>
              <p className="text-gray-500 mt-4 max-w-sm text-sm leading-relaxed font-medium">
                Enter your email address below, and we will send you a secure link to reset your password.
              </p>
            </div>

            {/* Features Checklist */}
            <div className="mt-8 space-y-5 max-w-[260px] relative z-20">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-orange-50 border border-orange-100">
                  <BadgeCheck size={18} className="text-[#F54900]" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                    100% Authentic Products
                  </h4>
                  <p className="text-[11px] text-gray-400 font-medium mt-0.5">
                    Official warranty & genuine quality
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-orange-50 border border-orange-100">
                  <Truck size={18} className="text-[#F54900]" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                    Fast Delivery Across Qatar
                  </h4>
                  <p className="text-[11px] text-gray-400 font-medium mt-0.5">
                    Express delivery in 24–48 hours
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-orange-50 border border-orange-100">
                  <Headphones size={18} className="text-[#F54900]" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                    Premium Customer Support
                  </h4>
                  <p className="text-[11px] text-gray-400 font-medium mt-0.5">
                    24/7 support. We are here for you
                  </p>
                </div>
              </div>
            </div>

            {/* Soft Decorative Orange Glow behind the image */}
            <div className="absolute top-[120px] right-[-90px] xl:right-[-110px] w-[460px] xl:w-[520px] h-[460px] xl:h-[520px] rounded-full bg-[radial-gradient(circle,rgba(245,73,0,0.18)_0%,rgba(245,73,0,0.03)_50%,transparent_70%)] blur-xl z-0 pointer-events-none" />

            {/* Product Cutout Image — absolute, centered in column, pushed right */}
            <Image
              src="/images/login-page-pic-cutout.png"
              alt="Griva Premium Products"
              width={520}
              height={400}
              priority
              className="absolute top-[150px] right-[-40px] xl:right-[-60px] w-[420px] xl:w-[480px] h-auto object-contain drop-shadow-2xl select-none pointer-events-none z-10"
            />
          </div>

          {/* ── RIGHT COLUMN: Reset Card ── */}
          <div className="flex flex-col items-center lg:items-start justify-start w-full">
            <div className="bg-white rounded-[28px] border border-gray-200/60 shadow-sm p-6 lg:p-8 max-w-[460px] w-full">
              {/* Logo and Auth Security Badge */}
              <div className="flex items-center justify-between w-full pb-4 border-b border-gray-100/80">
                <Link href="/" className="hidden md:block">
                  <Image
                    src="/images/logo-dark.png"
                    alt="Griva Logo"
                    width={90}
                    height={28}
                    priority
                    className="h-7 w-auto object-contain"
                  />
                </Link>
                <div className="flex items-center gap-1 bg-orange-50 border border-orange-100/50 text-orange-700 text-[10px] font-bold px-3 py-1 rounded-full ml-auto md:ml-0">
                  <Lock size={10} className="text-orange-600" />
                  <span>Secure Reset</span>
                </div>
              </div>

              {/* Header Text */}
              <div className="mt-5">
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">Forgot Password</h3>
                <p className="text-xs text-gray-400 font-medium mt-1">
                  Enter your email address to receive a password reset link.
                </p>
              </div>

              {/* Success / Error Message */}
              {status === "error" && message && (
                <div className="mt-4 text-red-500 text-xs font-bold text-center bg-red-50/60 border border-red-100 p-2.5 rounded-xl">
                  {message}
                </div>
              )}

              {status === "success" ? (
                <div className="mt-6 text-center space-y-5">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto">
                    <ShieldCheck size={24} className="text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-[#1a1a2e] font-bold text-sm">Check your inbox</p>
                    <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto leading-relaxed">{message}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setStatus("idle");
                      setEmail("");
                      setMessage("");
                    }}
                    className="text-[#F54900] text-xs font-bold hover:text-[#d93e00] transition-colors cursor-pointer"
                  >
                    Send reset link again
                  </button>
                </div>
              ) : (
                /* Form */
                <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
                  <div>
                    <label className="text-[10px] font-bold text-gray-700 uppercase tracking-widest block mb-1.5 ml-1">
                      Email Address
                    </label>
                    <div className="relative group">
                      <Mail
                        size={14}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#F54900] transition-colors"
                      />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email address"
                        required
                        onKeyDown={handleKeyDown}
                        disabled={status === "loading"}
                        className="w-full bg-[#fdfdfd] border border-gray-200 focus:bg-white focus:border-[#F54900] focus:ring-1 focus:ring-[#F54900]/20 rounded-xl pl-11 pr-4 py-3 text-xs font-semibold text-gray-800 placeholder:text-gray-400 focus:outline-none transition-all duration-300"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="w-full bg-[#F54900] hover:bg-[#d93e00] hover:shadow-md hover:shadow-orange-500/20 active:scale-[0.99] disabled:opacity-55 text-white text-xs font-bold py-3.5 rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 shadow-sm mt-2"
                  >
                    {status === "loading" ? (
                      <>
                        <span className="h-3.5 w-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin mr-1" />
                        <span>Sending reset link...</span>
                      </>
                    ) : (
                      <>
                        <span>Send Reset Link</span>
                        <ArrowRight size={14} />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Back to sign in */}
              <div className="text-center mt-6 pt-5 border-t border-gray-100">
                <Link
                  href="/auth/login"
                  className="text-xs font-bold text-[#F54900] hover:text-[#d93e00] transition-colors"
                >
                  ← Back to Sign In
                </Link>
              </div>
            </div>

            {/* Need help block */}
            <div className="mt-5 max-w-[460px] w-full bg-white rounded-[20px] border border-gray-200/60 p-4 shadow-2xs">
              <h4 className="text-[11px] font-bold text-gray-800 uppercase tracking-wider mb-3 ml-1">
                Need help?
              </h4>
              <div className="grid grid-cols-3 gap-2.5">
                <div className="flex flex-col items-center text-center p-2.5 rounded-xl bg-gray-50/50 hover:bg-orange-50/30 border border-gray-100/50 hover:border-orange-100/50 transition-all duration-300 cursor-pointer">
                  <MessageSquare size={16} className="text-[#F54900] mb-1" />
                  <span className="text-[9px] font-bold text-gray-800">Live Chat</span>
                  <span className="text-[8px] text-gray-400 mt-0.5">Chat with us</span>
                </div>
                <a
                  href="https://wa.me/YOUR_WHATSAPP_NUMBER"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center text-center p-2.5 rounded-xl bg-gray-50/50 hover:bg-orange-50/30 border border-gray-100/50 hover:border-orange-100/50 transition-all duration-300 cursor-pointer"
                >
                  <Phone size={16} className="text-[#F54900] mb-1" />
                  <span className="text-[9px] font-bold text-gray-800">WhatsApp</span>
                  <span className="text-[8px] text-gray-400 mt-0.5">Message us</span>
                </a>
                <a
                  href="mailto:support@thegriva.com"
                  className="flex flex-col items-center text-center p-2.5 rounded-xl bg-gray-50/50 hover:bg-orange-50/30 border border-gray-100/50 hover:border-orange-100/50 transition-all duration-300 cursor-pointer"
                >
                  <Headphones size={16} className="text-[#F54900] mb-1" />
                  <span className="text-[9px] font-bold text-gray-800">Contact Support</span>
                  <span className="text-[8px] text-gray-400 mt-0.5">We&apos;re here to help</span>
                </a>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
