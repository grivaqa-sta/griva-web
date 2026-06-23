"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Truck,
  Headset,
  Star,
  Zap,
  ArrowRight,
  Package,
  Users,
  TrendingUp,
  MapPin,
  Wallet,
  RefreshCw,
} from "lucide-react";

/* ─── animated counter ───────────────────────────────────── */
function AnimatedCounter({
  value,
  suffix = "",
  label,
  icon: Icon,
  accent = false,
}: {
  value: string;
  suffix?: string;
  label: string;
  icon: React.ElementType;
  accent?: boolean;
}) {
  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`group relative overflow-hidden rounded-3xl p-6 text-center transition-all duration-300 border
        ${
          accent
            ? "bg-gradient-to-br from-[#121212] to-[#1a1a1a] border-zinc-800 text-white shadow-lg"
            : "border-gray-100 bg-white text-gray-900 shadow-[0_8px_30px_-15px_rgba(0,0,0,0.02)]"
        }`}
    >
      {/* brand pattern watermark */}
      <div 
        className={`absolute inset-0 bg-no-repeat bg-right-bottom bg-contain pointer-events-none transition-all duration-500 opacity-[0.02] group-hover:opacity-[0.05]
          ${accent ? "bg-[url('/images/logo-kit/brand-pattern-dark-transparent.png')]" : "bg-[url('/images/logo-kit/brand-pattern-white-transparent.png')]"}`} 
      />
      <div className={`mx-auto mb-3 w-10 h-10 rounded-xl flex items-center justify-center ${accent ? "bg-white/5 text-[#FF6A00]" : "bg-[#FF6A00]/5 text-[#FF6A00]"}`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-2xl sm:text-3xl font-black tracking-tight">
        {value}
        {suffix}
      </p>
      <p
        className={`mt-1 text-[10px] font-bold uppercase tracking-wider ${
          accent ? "text-zinc-400" : "text-gray-400"
        }`}
      >
        {label}
      </p>
    </motion.div>
  );
}

/* ─── value card ─────────────────────────────────────────── */
function ValueCard({
  icon: Icon,
  title,
  description,
  index,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: 0.1 * index }}
      whileHover={{ y: -4 }}
      className="group relative h-full overflow-hidden rounded-3xl border border-gray-100/90 bg-white p-7 shadow-[0_8px_30px_-15px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.05)] transition-all duration-300"
    >
      {/* Watermark in corner */}
      <div className="absolute right-0 bottom-0 w-28 h-28 opacity-[0.02] group-hover:opacity-[0.05] transition-all duration-500 bg-[url('/images/logo-kit/brand-pattern-white-transparent.png')] bg-contain bg-no-repeat bg-right-bottom pointer-events-none" />
      
      <div className="relative z-10">
        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FF6A00]/5 text-[#FF6A00] transition-colors duration-300 group-hover:bg-[#FF6A00] group-hover:text-white">
          <Icon className="h-5 w-5" />
        </div>
        <h4 className="mb-2 text-base font-bold text-gray-900 tracking-tight">{title}</h4>
        <p className="text-xs sm:text-sm leading-relaxed text-gray-500">{description}</p>
      </div>
    </motion.div>
  );
}

/* ─── timeline step ──────────────────────────────────────── */
function TimelineStep({
  year,
  title,
  description,
  index,
}: {
  year: string;
  title: string;
  description: string;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: 0.1 * index }}
      className="group relative flex gap-6"
    >
      <div className="relative flex flex-col items-center">
        <div className="z-10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FF6A00] to-[#e05d00] text-xs font-bold text-white shadow-md">
          {year}
        </div>
        {index < 2 && (
          <div className="mt-1 h-full w-px bg-gradient-to-b from-[#FF6A00]/30 to-transparent" />
        )}
      </div>

      <div className="pb-10">
        <h4 className="text-base font-bold text-gray-900 tracking-tight">{title}</h4>
        <p className="mt-1 text-xs sm:text-sm leading-relaxed text-gray-500">
          {description}
        </p>
      </div>
    </motion.div>
  );
}

/* ─── page ───────────────────────────────────────────────── */
export default function AboutPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-white">
      {/* ──────── hero section ──────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0c0c0c] via-[#121212] to-[#0c0c0c] py-20 sm:py-28">
        {/* brand pattern watermark */}
        <div className="absolute inset-0 bg-[url('/images/logo-kit/brand-pattern-dark-transparent.png')] bg-cover opacity-[0.06] pointer-events-none z-0" />
        
        {/* decorative glow */}
        <div className="pointer-events-none absolute -left-40 top-20 h-[500px] w-[500px] rounded-full bg-[#FF6A00]/5 blur-[120px]" />
        <div className="pointer-events-none absolute -right-40 bottom-0 h-[400px] w-[400px] rounded-full bg-[#FF6A00]/5 blur-[100px]" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            {/* GRIVA Logo First */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="flex justify-center mb-6"
            >
              <Image 
                src="/images/logo-light.png" 
                alt="GRIVA" 
                width={150} 
                height={38} 
                className="h-9 w-auto object-contain" 
                priority
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <span className="mb-4 inline-flex items-center rounded-full border border-[#FF6A00]/20 bg-[#FF6A00]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-[#FF6A00]">
                About Us
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-6 text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl"
            >
              Redefining Premium
              <br />
              <span className="bg-gradient-to-r from-[#FF6A00] to-[#ff8432] bg-clip-text text-transparent">
                Electronics in Qatar
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mx-auto mt-6 max-w-xl text-xs sm:text-sm leading-relaxed text-zinc-400"
            >
              We believe in offering only the finest gadgets and accessories with absolute authenticity, direct concierge support, and swift cash on delivery across Qatar.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row"
            >
              <Link
                href="/shop"
                className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF6A00] to-[#e05d00] px-8 py-3.5 text-xs font-bold text-white shadow-md transition-all duration-300 hover:shadow-lg active:scale-[0.98] sm:w-auto"
              >
                Explore Catalog
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/contact"
                className="group inline-flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/50 px-8 py-3.5 text-xs font-bold text-white backdrop-blur-sm transition-all duration-300 hover:bg-zinc-800 sm:w-auto"
              >
                Get in Touch
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </motion.div>
          </div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mx-auto mt-16 grid max-w-3xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/40 backdrop-blur-sm sm:grid-cols-4"
          >
            {[
              { value: "10K+", label: "Happy Customers" },
              { value: "100%", label: "Authentic Gear" },
              { value: "Qatar", label: "Wide Delivery" },
              { value: "4.9★", label: "Avg Rating" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="border-r border-b border-zinc-800/40 p-6 text-center last:border-r-0 [&:nth-child(2)]:border-r-0 sm:[&:nth-child(2)]:border-r"
              >
                <p className="text-xl sm:text-2xl font-black text-white">{stat.value}</p>
                <p className="mt-1 text-[9px] font-bold uppercase tracking-wider text-zinc-500">
                  {stat.label}
                </p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ──────── our story ──────── */}
      <section className="relative py-20 sm:py-28">
        <div className="absolute inset-0 bg-[url('/images/logo-kit/brand-pattern-white-transparent.png')] bg-cover opacity-[0.02] pointer-events-none z-0" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            {/* left — text */}
            <div>
              <span className="text-xs font-extrabold uppercase tracking-[0.25em] text-[#FF6A00]">
                Our Story
              </span>
              <h2 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-gray-900 sm:text-4xl">
                Born From a Passion{" "}
                <span className="text-[#FF6A00]">for Innovation</span>
              </h2>

              <p className="mt-6 text-xs sm:text-sm leading-relaxed text-gray-500">
                Founded in Doha, Qatar, GriVA began with a simple vision: to bridge the gap between premium global electronics and the local Qatari community. We curate high-fidelity audio equipment, gaming accessories, and smart devices, verifying the authenticity and build quality of every single item.
              </p>
              <p className="mt-4 text-xs sm:text-sm leading-relaxed text-gray-500">
                By eliminating long overseas shipping times and offering direct Cash on Delivery with local support, we provide Qatar&apos;s tech enthusiasts with a reliable local shopping destination.
              </p>

              <div className="mt-8 flex flex-wrap gap-2.5">
                {["100% Authentic", "Qatar Delivery", "WhatsApp Support", "7-Day Returns"].map(
                  (tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-orange-100 bg-orange-50 px-4 py-1.5 text-xs font-semibold text-orange-600"
                    >
                      {tag}
                    </span>
                  )
                )}
              </div>
            </div>

            {/* right — stat cards */}
            <div className="grid grid-cols-2 gap-4">
              <AnimatedCounter
                value="100"
                suffix="%"
                label="Authentic"
                icon={ShieldCheck}
              />
              <AnimatedCounter
                value="Qatar"
                label="Fulfillment"
                icon={MapPin}
              />
              <AnimatedCounter
                value="Direct"
                label="Support"
                icon={Headset}
              />
              <AnimatedCounter
                value="4.9"
                suffix="★"
                label="Rating"
                icon={Star}
                accent
              />
            </div>
          </div>
        </div>
      </section>

      {/* ──────── why choose us ──────── */}
      <section className="relative bg-gray-50/70 py-20 sm:py-28">
        <div className="absolute inset-0 bg-[url('/images/logo-kit/brand-pattern-white-transparent.png')] bg-cover opacity-[0.02] pointer-events-none z-0" />
        
        {/* subtle top/bottom fade */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <span className="text-xs font-extrabold uppercase tracking-[0.25em] text-[#FF6A00]">
              Why GriVA
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Built for Qatar.{" "}
              <span className="text-[#FF6A00]">Built for Quality.</span>
            </h2>
            <p className="mt-4 text-xs sm:text-sm leading-relaxed text-gray-500">
              We obsess over every detail — from product verification to delivery experience — so you can shop with complete confidence.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <ValueCard
              icon={ShieldCheck}
              title="Verified Authentic"
              description="Every item is verified. No counterfeits, guaranteed."
              index={0}
            />
            <ValueCard
              icon={Truck}
              title="1-2 Day Delivery"
              description="Fast local dispatch across all municipalities in Qatar."
              index={1}
            />
            <ValueCard
              icon={Wallet}
              title="Cash on Delivery"
              description="Pay safely at your doorstep only after receiving your package."
              index={2}
            />
            <ValueCard
              icon={RefreshCw}
              title="7-Day Returns"
              description="Exchange damaged goods, or get direct store credit to your wallet."
              index={3}
            />
          </div>
        </div>
      </section>

      {/* ──────── our journey timeline ──────── */}
      <section className="relative py-20 sm:py-28">
        <div className="absolute inset-0 bg-[url('/images/logo-kit/brand-pattern-white-transparent.png')] bg-cover opacity-[0.02] pointer-events-none z-0" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-16 lg:grid-cols-2">
            {/* heading */}
            <div>
              <span className="text-xs font-extrabold uppercase tracking-[0.25em] text-[#FF6A00]">
                Our Journey
              </span>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Milestones That{" "}
                <span className="text-[#FF6A00]">Define Us</span>
              </h2>
              <p className="mt-4 text-xs sm:text-sm leading-relaxed text-gray-500">
                From a local tech distributor to Qatar&apos;s leading curated premium electronics portal.
              </p>

              {/* summary card */}
              <div className="mt-10 overflow-hidden rounded-3xl border border-gray-100 bg-gradient-to-br from-white to-orange-50/40 p-6 shadow-sm relative group">
                <div className="absolute inset-0 bg-[url('/images/logo-kit/brand-pattern-white-transparent.png')] bg-cover opacity-[0.02] pointer-events-none" />
                
                <div className="relative z-10 flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-semibold text-gray-700">
                    Qatar Delivery Network Coverage
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-[#FF6A00]">
                    100% Coverage
                  </span>
                </div>
                <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-gray-100 relative z-10">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: "100%" }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
                    className="h-full rounded-full bg-gradient-to-r from-[#FF6A00] to-[#ff8432]"
                  />
                </div>

                <div className="relative z-10 mt-5 grid grid-cols-3 divide-x divide-gray-100">
                  {[
                    { icon: Package, label: "Orders", value: "25K+" },
                    { icon: Users, label: "Users", value: "10K+" },
                    { icon: TrendingUp, label: "Growth", value: "310%" },
                  ].map(({ icon: I, label, value }) => (
                    <div key={label} className="px-3 text-center first:pl-0 last:pr-0">
                      <I className="mx-auto mb-1 h-4 w-4 text-orange-400" />
                      <p className="text-base sm:text-lg font-bold text-gray-900">
                        {value}
                      </p>
                      <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400">
                        {label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* timeline */}
            <div className="pt-2 space-y-2">
              <TimelineStep
                year="'24"
                title="The Spark"
                description="GriVA was founded in Doha with the mission of establishing a reliable, direct source of premium authentic gadgets for Qatar's local market."
                index={0}
              />
              <TimelineStep
                year="'25"
                title="Digital Launch"
                description="Launched our online portal, introducing Cash on Delivery only, instant WhatsApp concierge help, and direct wallet refunds."
                index={1}
              />
              <TimelineStep
                year="'26"
                title="100% Coverage"
                description="Expanded our dedicated delivery fleet to cover all municipalities in Qatar within 24-48 hours, serving over 10,000 customers."
                index={2}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ──────── vision CTA ──────── */}
      <section className="relative py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#0c0c0c] via-[#121212] to-[#0c0c0c] px-8 py-16 text-center sm:px-16 sm:py-20 group">
            {/* dark brand pattern watermark */}
            <div className="absolute inset-0 bg-[url('/images/logo-kit/brand-pattern-dark-transparent.png')] bg-cover opacity-[0.06] group-hover:opacity-[0.09] transition-opacity duration-500 pointer-events-none z-0" />
            
            {/* decorative elements */}
            <div className="pointer-events-none absolute -left-20 -top-20 h-60 w-60 rounded-full bg-[#FF6A00]/10 blur-[80px]" />
            <div className="pointer-events-none absolute -bottom-20 -right-20 h-60 w-60 rounded-full bg-[#FF6A00]/10 blur-[80px]" />

            <div className="relative z-10">
              {/* GRIVA Logo First */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="flex justify-center mb-6"
              >
                <Image 
                  src="/images/logo-light.png" 
                  alt="GRIVA" 
                  width={150} 
                  height={38} 
                  className="h-9 w-auto object-contain" 
                />
              </motion.div>

              <span className="inline-flex items-center rounded-full border border-[#FF6A00]/20 bg-[#FF6A00]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-[#FF6A00] mb-2">
                Our Vision
              </span>

              <h2 className="mx-auto mt-6 max-w-2xl text-3xl font-bold leading-tight text-white sm:text-4xl">
                Empowering Connection{" "}
                <span className="bg-gradient-to-r from-[#FF6A00] to-[#ff8432] bg-clip-text text-transparent">
                  Through Quality
                </span>
              </h2>

              <p className="mx-auto mt-5 max-w-xl text-xs sm:text-sm leading-relaxed text-zinc-400">
                Our vision is to continue expanding our premium curated collections and direct delivery infrastructure to make shopping for top-tier electronics a seamless experience.
              </p>

              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link
                  href="/shop"
                  className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF6A00] to-[#e05d00] px-8 py-3.5 text-xs font-bold text-white shadow-md transition-all duration-300 hover:shadow-lg active:scale-[0.98] sm:w-auto"
                >
                  Start Shopping
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
