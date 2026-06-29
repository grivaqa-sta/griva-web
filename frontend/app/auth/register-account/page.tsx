"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Users,
  User,
  Headphones,
  Truck,
  BadgeCheck,
  Tag,
  Gift
} from "lucide-react";
import { useUser } from "@/app/context/UserContext";
import { authService } from "@/app/services/auth.service";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useUser();
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const data = await authService.register({ name, email, password });

      if (data.success && data.token) {
        login({ name: data.user?.name || name, email, role: data.user?.role || "customer" }, data.token);
        router.push("/account");
      } else {
        setError(data.message || "Registration failed. Please try again.");
      }
    } catch {
      setError("Unable to connect to server. Please try again.");
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
                Create Your
              </h1>
              <h2 className="text-4xl xl:text-5xl font-black text-[#F54900] tracking-tight mt-0.5">
                GRIVA Account
              </h2>
              <p className="text-gray-500 mt-4 max-w-sm text-sm leading-relaxed font-medium">
                Join thousands of satisfied customers and enjoy a premium shopping experience.
              </p>
            </div>

            {/* Features Checklist */}
            <div className="mt-8 space-y-5 max-w-[260px] relative z-20">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-orange-50 border border-orange-100">
                  <Tag size={18} className="text-[#F54900]" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                    Exclusive Deals
                  </h4>
                  <p className="text-[11px] text-gray-400 font-medium mt-0.5">
                    Access special offers & members only prices
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-orange-50 border border-orange-100">
                  <Truck size={18} className="text-[#F54900]" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                    Fast Delivery
                  </h4>
                  <p className="text-[11px] text-gray-400 font-medium mt-0.5">
                    Quick and reliable delivery across Qatar
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-orange-50 border border-orange-100">
                  <Headphones size={18} className="text-[#F54900]" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                    Premium Support
                  </h4>
                  <p className="text-[11px] text-gray-400 font-medium mt-0.5">
                    24/7 customer support whenever you need
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-orange-50 border border-orange-100">
                  <Gift size={18} className="text-[#F54900]" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                    Rewards & Benefits
                  </h4>
                  <p className="text-[11px] text-gray-400 font-medium mt-0.5">
                    Earn points and get exciting rewards
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

          {/* ── RIGHT COLUMN: Create Account Card ── */}
          <div className="flex flex-col items-center lg:items-start justify-start w-full">
            <div className="bg-white rounded-[28px] border border-gray-200/60 shadow-sm p-6 lg:p-8 max-w-[460px] w-full">
              {/* Logo and User Icon */}
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
                <div className="flex items-center justify-center h-10 w-10 bg-orange-50 border border-orange-100/50 rounded-full ml-auto md:ml-0">
                  <User size={18} className="text-[#F54900]" />
                </div>
              </div>

              {/* Header Text */}
              <div className="mt-5">
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">Create Account</h3>
                <p className="text-xs text-gray-400 font-medium mt-1">
                  Fill in the details below to get started.
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mt-4 text-red-500 text-xs font-bold text-center bg-red-50/60 border border-red-100 p-2.5 rounded-xl">
                  {error}
                </div>
              )}

              {/* Form */}
              <form className="mt-5 space-y-4" onSubmit={handleRegister}>
                {/* Full Name */}
                <div>
                  <label className="text-[10px] font-bold text-gray-700 uppercase tracking-widest block mb-1.5 ml-1">
                    Full Name
                  </label>
                  <div className="relative group">
                    <User
                      size={14}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#F54900] transition-colors"
                    />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your full name"
                      required
                      autoComplete="name"
                      className="w-full bg-[#fdfdfd] border border-gray-200 focus:bg-white focus:border-[#F54900] focus:ring-1 focus:ring-[#F54900]/20 rounded-xl pl-11 pr-4 py-3 text-xs font-semibold text-gray-800 placeholder:text-gray-400 focus:outline-none transition-all duration-300"
                    />
                  </div>
                </div>

                {/* Email Address */}
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
                      autoComplete="email"
                      className="w-full bg-[#fdfdfd] border border-gray-200 focus:bg-white focus:border-[#F54900] focus:ring-1 focus:ring-[#F54900]/20 rounded-xl pl-11 pr-4 py-3 text-xs font-semibold text-gray-800 placeholder:text-gray-400 focus:outline-none transition-all duration-300"
                    />
                  </div>
                </div>

                {/* Password */}
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
                      placeholder="Create a password (min 6 characters)"
                      required
                      autoComplete="new-password"
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
                      <span>Creating account...</span>
                    </>
                  ) : (
                    <>
                      <span>Create Account</span>
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

                {/* Already have an account? */}
                <div className="text-center text-xs text-gray-500 font-medium">
                  Already have an account?{" "}
                  <Link
                    href="/auth/login"
                    className="text-[#F54900] font-bold hover:text-[#d93e00] transition-colors"
                  >
                    Sign In
                  </Link>
                </div>
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
          </div>

        </div>
      </div>

      {/* Bottom Trust Bar */}
      <div className="border-t border-gray-200/60 bg-white/60 backdrop-blur-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-50 border border-gray-100">
                <BadgeCheck size={16} className="text-gray-600" />
              </div>
              <div>
                <h5 className="text-[11px] font-bold text-gray-800">100% Authentic Products</h5>
                <p className="text-[10px] text-gray-400 font-medium">Official warranty & genuine quality</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-50 border border-gray-100">
                <Truck size={16} className="text-gray-600" />
              </div>
              <div>
                <h5 className="text-[11px] font-bold text-gray-800">Fast Delivery Across Qatar</h5>
                <p className="text-[10px] text-gray-400 font-medium">Express delivery in 24–48 hours</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-50 border border-gray-100">
                <ShieldCheck size={16} className="text-gray-600" />
              </div>
              <div>
                <h5 className="text-[11px] font-bold text-gray-800">Secure & Safe</h5>
                <p className="text-[10px] text-gray-400 font-medium">100% secure & encrypted transactions</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-50 border border-gray-100">
                <Headphones size={16} className="text-gray-600" />
              </div>
              <div>
                <h5 className="text-[11px] font-bold text-gray-800">24/7 Customer Support</h5>
                <p className="text-[10px] text-gray-400 font-medium">We&apos;re here to help you anytime</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
