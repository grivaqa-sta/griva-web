"use client";

import { useState } from "react";
import { useAdminSettings } from "@/app/context/AdminContext";
import { addSubscriberApi } from "@/app/utils/api";
import { useToast } from "@/app/context/ToastContext";

export default function NewsletterSection() {
  const { cmsNewsletter } = useAdminSettings();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    try {
      await addSubscriberApi(email.trim());
      setSubscribed(true);
      setEmail("");
    } catch (err: any) {
      const errMsg = err.message || "An error occurred. Please try again.";
      if (errMsg.toLowerCase().includes("already subscribed")) {
        setSubscribed(true);
        setEmail("");
      } else {
        toast.error(errMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="hidden sm:block w-full md:py-10 px-4 sm:px-6 lg:px-0">
      <div className="mx-auto max-w-7xl relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#0c0c0c] via-[#121212] to-[#0c0c0c] p-8 sm:p-10 lg:p-12 group shadow-xl">
        {/* dark brand pattern watermark */}
        <div className="absolute inset-0 bg-[url('/images/logo-kit/brand-pattern-dark-transparent.png')] bg-cover opacity-[0.06] group-hover:opacity-[0.09] transition-opacity duration-500 pointer-events-none z-0" />
        
        {/* decorative elements */}
        <div className="pointer-events-none absolute -left-20 -top-20 h-60 w-60 rounded-full bg-[#FF6A00]/10 blur-[80px]" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-60 w-60 rounded-full bg-[#FF6A00]/10 blur-[80px]" />

        <div className="relative z-10 flex flex-col items-center gap-6 text-center lg:flex-row lg:justify-between lg:text-left">

          {/* Left Content */}
          <div className="space-y-1">
            <p className="text-sm font-semibold uppercase tracking-widest text-white/80">
              {cmsNewsletter.label}
            </p>
            <h2 className="text-3xl font-black text-white whitespace-pre-line">
              {cmsNewsletter.heading}
            </h2>
            <p className="text-sm text-white/70">
              {cmsNewsletter.description}
            </p>
          </div>

          {/* Right Form */}
          {subscribed ? (
            <div className="text-white border  px-6 py-4 rounded-xl text-sm font-bold animate-in fade-in duration-300">
             Thanks for subscribing! We'll keep you updated.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex w-full max-w-lg overflow-hidden rounded-xl shadow-lg lg:w-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address..."
                required
                disabled={loading}
                className="flex-1 bg-white px-6 py-4 text-sm text-black outline-none placeholder:text-gray-400 min-w-0 disabled:bg-gray-100"
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-black px-7 py-4 text-xs font-black uppercase tracking-widest text-white transition duration-300 hover:bg-gray-800 whitespace-nowrap disabled:bg-gray-700 cursor-pointer"
              >
                {loading ? "Subscribing..." : cmsNewsletter.buttonText}
              </button>
            </form>
          )}

        </div>
      </div>
    </section>
  );
}
