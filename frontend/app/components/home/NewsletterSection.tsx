"use client";

import { useAdminSettings } from "@/app/context/AdminContext";

export default function NewsletterSection() {
  const { cmsNewsletter } = useAdminSettings();
  return (
    <section className="w-full md:py-10 px-4 sm:px-6 lg:px-0">
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
          <div className="flex w-full max-w-lg overflow-hidden rounded-xl shadow-lg lg:w-auto">
            <input
              type="email"
              placeholder="Enter your email address..."
              className="flex-1 bg-white px-6 py-4 text-sm text-black outline-none placeholder:text-gray-400 min-w-0"
            />
            <button
              type="submit"
              className="bg-black px-7 py-4 text-xs font-black uppercase tracking-widest text-white transition duration-300 hover:bg-gray-800 whitespace-nowrap"
            >
              {cmsNewsletter.buttonText}
            </button>
          </div>

        </div>
      </div>
    </section>
  );
}