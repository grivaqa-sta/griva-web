"use client";

import { useState, Suspense, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Users,
  MessageSquare,
  Phone,
  Headphones,
  Truck,
  BadgeCheck
} from "lucide-react";
import { useUser } from "@/app/context/UserContext";
import { authService } from "@/app/services/auth.service";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated, loading: isUserLoading } = useUser();
  const router = useRouter();
  const isRedirecting = useRef(false);

  useEffect(() => {
    if (!isUserLoading && isAuthenticated && !isRedirecting.current) {
      router.push("/");
    }
  }, [isAuthenticated, isUserLoading, router]);
  const searchParams = useSearchParams();

  const redirectPath = searchParams.get("redirect") || "/";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await authService.login({ email, password });
      if (response && response.token) {
        if (response.user?.role === "customer") {
          isRedirecting.current = true;
          login(
            { name: response.user?.name || email.split("@")[0], email, role: "customer" },
            response.token
          );
          router.push(redirectPath);
        } else if (response.user?.role === "admin") {
          setError("Admin accounts cannot use this login page.");
        } else {
          isRedirecting.current = true;
          login(
            { name: response.user?.name || email.split("@")[0], email, role: "customer" },
            response.token
          );
          router.push(redirectPath);
        }
      } else {
        setError("Invalid credentials");
      }
    } catch {
      setError("Login failed. Please check your credentials and try again.");
    } finally {
      setLoading(false);
    }
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
                Welcome Back!
              </h1>
              <h2 className="text-4xl xl:text-5xl font-black text-[#F54900] tracking-tight mt-0.5">
                to GRIVA
              </h2>
              <p className="text-gray-500 mt-4 max-w-sm text-sm leading-relaxed font-medium">
                Sign in to access your orders, wishlist, exclusive deals and premium services.
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

          {/* ── RIGHT COLUMN: Sign In Card ── */}
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
                  <span>Secure Authentication</span>
                </div>
              </div>

              {/* Header Text */}
              <div className="mt-5">
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">Sign In</h3>
                <p className="text-xs text-gray-400 font-medium mt-1">
                  Welcome back! Please sign in to continue.
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mt-4 text-red-500 text-xs font-bold text-center bg-red-50/60 border border-red-100 p-2.5 rounded-xl">
                  {error}
                </div>
              )}

              {/* Form */}
              <form className="mt-5 space-y-4" onSubmit={handleLogin}>
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
                      className="w-full bg-[#fdfdfd] border border-gray-200 focus:bg-white focus:border-[#F54900] focus:ring-1 focus:ring-[#F54900]/20 rounded-xl pl-11 pr-4 py-3 text-xs font-semibold text-gray-800 placeholder:text-gray-400 focus:outline-none transition-all duration-300"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-700 uppercase tracking-widest block mb-1.5 ml-1">
                    Password
                  </label>
                  <div className="relative group">
                    <Lock
                      size={14}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#F54900] transition-colors"
                    />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                      className="w-full bg-[#fdfdfd] border border-gray-200 focus:bg-white focus:border-[#F54900] focus:ring-1 focus:ring-[#F54900]/20 rounded-xl pl-11 pr-12 py-3 text-xs font-semibold text-gray-800 placeholder:text-gray-400 focus:outline-none transition-all duration-300"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => router.push("/auth/forgot-password")}
                    className="text-xs font-bold text-[#F54900] hover:text-[#d93e00] transition-colors block ml-auto mt-2 cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#F54900] hover:bg-[#d93e00] hover:shadow-md hover:shadow-orange-500/20 active:scale-[0.99] disabled:opacity-55 text-white text-xs font-bold py-3.5 rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 shadow-sm mt-2"
                >
                  {loading ? (
                    <>
                      <span className="h-3.5 w-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin mr-1" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>

                {/* Divider */}
                <div className="flex items-center my-4">
                  <span className="flex-grow h-[1px] bg-gray-100" />
                  <span className="px-3.5 text-[10px] text-gray-300 font-bold uppercase tracking-widest">
                    or
                  </span>
                  <span className="flex-grow h-[1px] bg-gray-100" />
                </div>

                {/* Create Account Button */}
                <Link
                  href="/auth/register-account"
                  className="w-full bg-white hover:bg-gray-50/60 text-gray-800 border border-gray-200 hover:border-gray-300 text-xs font-bold py-3.5 rounded-xl transition-all duration-200 flex items-center justify-between px-5"
                >
                  <div className="flex items-center gap-2.5">
                    <Users size={14} className="text-[#F54900]" />
                    <span>Create New Account</span>
                  </div>
                  <ArrowRight size={14} className="text-gray-400" />
                </Link>
              </form>

              {/* Trust Badges Footer */}
              <div className="flex items-center justify-between text-[10px] text-gray-400/90 font-semibold pt-5 border-t border-gray-100 mt-5 gap-2">
                <div className="flex items-center gap-1">
                  <ShieldCheck size={12} className="text-emerald-500" />
                  <span>Secure Login</span>
                </div>
                <div className="flex items-center gap-1">
                  <Lock size={12} className="text-[#F54900]/80" />
                  <span>Encrypted Data</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users size={12} className="text-blue-500/80" />
                  <span>Trusted by 2,400+ Customers</span>
                </div>
              </div>
            </div>

            {/* Need help signing in? */}
            <div className="mt-5 max-w-[460px] w-full bg-white rounded-[20px] border border-gray-200/60 p-4 shadow-2xs">
              <h4 className="text-[11px] font-bold text-gray-800 uppercase tracking-wider mb-3 ml-1">
                Need help signing in?
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

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[85vh] flex items-center justify-center bg-[#f5f5f7]">
        <div className="h-8 w-8 border-4 border-[#F54900]/30 border-t-[#F54900] rounded-full animate-spin" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
