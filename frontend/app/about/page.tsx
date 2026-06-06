"use client";

import ScrollReveal from "@/app/components/common/ScrollReveal";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Truck,
  Headset,
  Star,
  Zap,
  Globe,
  Award,
  ArrowRight,
  Package,
  Users,
  TrendingUp,
  Heart,
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
      whileHover={{ y: -6, scale: 1.03 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`group relative overflow-hidden rounded-3xl p-6 text-center transition-shadow duration-300
        ${
          accent
            ? "bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-xl shadow-orange-500/25"
            : "border border-gray-100 bg-white shadow-sm hover:shadow-xl"
        }`}
    >
      {/* subtle shimmer on hover */}
      <div
        className={`pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 ${
          accent
            ? "bg-gradient-to-r from-white/0 via-white/10 to-white/0"
            : "bg-gradient-to-r from-orange-500/0 via-orange-500/5 to-orange-500/0"
        }`}
      />
      <Icon
        className={`mx-auto mb-3 h-6 w-6 ${
          accent ? "text-white/80" : "text-orange-500"
        }`}
      />
      <p
        className={`text-3xl font-bold tracking-tight ${
          accent ? "text-white" : "text-gray-900"
        }`}
      >
        {value}
        {suffix}
      </p>
      <p
        className={`mt-1 text-xs font-semibold uppercase tracking-wider ${
          accent ? "text-white/70" : "text-gray-500"
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
    <ScrollReveal delay={0.1 * index}>
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="group relative h-full overflow-hidden rounded-3xl border border-gray-100 bg-white p-7 shadow-sm transition-all duration-300 hover:shadow-xl"
      >
        {/* top-right glow */}
        <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-orange-500/5 blur-2xl transition-all duration-500 group-hover:bg-orange-500/10" />

        <div className="relative z-10">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-500 transition-colors duration-300 group-hover:bg-orange-500 group-hover:text-white">
            <Icon className="h-5 w-5" />
          </div>
          <h4 className="mb-2 text-base font-semibold text-gray-900">{title}</h4>
          <p className="text-sm leading-relaxed text-gray-500">{description}</p>
        </div>
      </motion.div>
    </ScrollReveal>
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
    <ScrollReveal delay={0.12 * index}>
      <div className="group relative flex gap-6">
        {/* vertical connector */}
        <div className="relative flex flex-col items-center">
          <motion.div
            whileHover={{ scale: 1.2 }}
            className="z-10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-xs font-bold text-white shadow-lg shadow-orange-500/25"
          >
            {year}
          </motion.div>
          {index < 3 && (
            <div className="mt-1 h-full w-px bg-gradient-to-b from-orange-300 to-transparent" />
          )}
        </div>

        <div className="pb-10">
          <h4 className="text-base font-bold text-gray-900">{title}</h4>
          <p className="mt-1 text-sm leading-relaxed text-gray-500">
            {description}
          </p>
        </div>
      </div>
    </ScrollReveal>
  );
}

/* ─── page ───────────────────────────────────────────────── */
export default function AboutPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-white">
      {/* ──────── hero section ──────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 py-24 sm:py-32">
        {/* decorative blobs */}
        <div className="pointer-events-none absolute -left-40 top-20 h-[500px] w-[500px] rounded-full bg-orange-500/10 blur-[120px]" />
        <div className="pointer-events-none absolute -right-40 bottom-0 h-[400px] w-[400px] rounded-full bg-orange-600/8 blur-[100px]" />
        {/* grid pattern overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <ScrollReveal>
              <motion.span
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-orange-400"
              >
                <Zap className="h-3 w-3" />
                About GriVA
              </motion.span>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <h1 className="mt-6 text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl">
                Redefining How You
                <br />
                <span className="bg-gradient-to-r from-orange-400 to-orange-500 bg-clip-text text-transparent">
                  Experience Tech
                </span>
              </h1>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-gray-400">
                We believe technology should be accessible, reliable, and
                premium. GriVA is your trusted gateway to the world&apos;s
                finest electronics.
              </p>
            </ScrollReveal>

            <ScrollReveal delay={0.3}>
              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link
                  href="/shop"
                  className="group inline-flex w-full items-center justify-center gap-2 rounded-[10px] bg-gradient-to-r from-orange-500 to-orange-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/30 hover:-translate-y-0.5 sm:w-auto"
                >
                  Explore Catalog
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href="/contact"
                  className="group inline-flex w-full items-center justify-center gap-2 rounded-[10px] border border-white/10 bg-white/5 px-8 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/10 sm:w-auto"
                >
                  Get in Touch
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </ScrollReveal>
          </div>

          {/* Stats row */}
          <ScrollReveal delay={0.35}>
            <div className="mx-auto mt-16 grid max-w-3xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm sm:grid-cols-4">
              {[
                { value: "50K+", label: "Happy Customers" },
                { value: "100%", label: "Authentic Gear" },
                { value: "50+", label: "Countries" },
                { value: "4.9★", label: "Avg Rating" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="border-r border-b border-white/5 p-6 text-center last:border-r-0 [&:nth-child(2)]:border-r-0 sm:[&:nth-child(2)]:border-r"
                >
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="mt-1 text-[11px] font-medium uppercase tracking-wider text-gray-500">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ──────── our story ──────── */}
      <section className="relative py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            {/* left — text */}
            <div>
              <ScrollReveal>
                <span className="text-xs font-extrabold uppercase tracking-[0.25em] text-orange-500">
                  Our Story
                </span>
                <h2 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-gray-900 sm:text-4xl">
                  Born From a Passion{" "}
                  <span className="text-orange-500">for Innovation</span>
                </h2>
              </ScrollReveal>

              <ScrollReveal delay={0.15}>
                <p className="mt-6 text-sm leading-relaxed text-gray-500">
                  At GriVA, we aren&apos;t just an online retailer — we are
                  tech enthusiasts who verify the quality of every product we
                  stock. From the latest high-performance laptops to immersive
                  audiophile headphones, GriVA guarantees authenticity, speed,
                  and premium craftsmanship.
                </p>
                <p className="mt-4 text-sm leading-relaxed text-gray-500">
                  Since our inception, we have dedicated ourselves to sourcing
                  only the finest components, hi-fi speakers, laptops, and smart
                  accessories — offering them with unmatched service and care to
                  customers across 50+ countries.
                </p>
              </ScrollReveal>

              <ScrollReveal delay={0.25}>
                <div className="mt-8 flex flex-wrap gap-3">
                  {["Premium Quality", "Fast Shipping", "24/7 Support", "Easy Returns"].map(
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
              </ScrollReveal>
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
                value="50+"
                label="Countries"
                icon={Globe}
              />
              <AnimatedCounter
                value="24/7"
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
        {/* subtle top/bottom fade */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <ScrollReveal>
              <span className="text-xs font-extrabold uppercase tracking-[0.25em] text-orange-500">
                Why GriVA
              </span>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Built Different.{" "}
                <span className="text-orange-500">Built Better.</span>
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-gray-500">
                We obsess over every detail — from product curation to delivery
                experience — so you don&apos;t have to.
              </p>
            </ScrollReveal>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <ValueCard
              icon={ShieldCheck}
              title="Verified Authentic"
              description="Every product undergoes strict verification. Zero counterfeits, ever."
              index={0}
            />
            <ValueCard
              icon={Truck}
              title="Lightning Delivery"
              description="Express shipping to 50+ countries with real-time tracking on every order."
              index={1}
            />
            <ValueCard
              icon={Award}
              title="Premium Curation"
              description="We handpick only top-tier products from globally trusted brands."
              index={2}
            />
            <ValueCard
              icon={Heart}
              title="Customer First"
              description="Dedicated 24/7 support, hassle-free returns, and a satisfaction guarantee."
              index={3}
            />
          </div>
        </div>
      </section>

      {/* ──────── our journey timeline ──────── */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-16 lg:grid-cols-2">
            {/* heading */}
            <div>
              <ScrollReveal>
                <span className="text-xs font-extrabold uppercase tracking-[0.25em] text-orange-500">
                  Our Journey
                </span>
                <h2 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                  Milestones That{" "}
                  <span className="text-orange-500">Define Us</span>
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-gray-500">
                  From a small idea to a global electronics destination — here's
                  how we grew, one milestone at a time.
                </p>
              </ScrollReveal>

              {/* summary card */}
              <ScrollReveal delay={0.2}>
                <div className="mt-10 overflow-hidden rounded-3xl border border-gray-100 bg-gradient-to-br from-white to-orange-50/40 p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-700">
                      Global Fulfillment Network
                    </span>
                    <span className="text-sm font-bold text-orange-500">
                      92% Coverage
                    </span>
                  </div>
                  <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-gray-100">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: "92%" }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
                      className="h-full rounded-full bg-gradient-to-r from-orange-500 to-orange-400"
                    />
                  </div>

                  <div className="mt-5 grid grid-cols-3 divide-x divide-gray-100">
                    {[
                      { icon: Package, label: "Orders", value: "120K+" },
                      { icon: Users, label: "Users", value: "50K+" },
                      { icon: TrendingUp, label: "Growth", value: "340%" },
                    ].map(({ icon: I, label, value }) => (
                      <div key={label} className="px-3 text-center first:pl-0 last:pr-0">
                        <I className="mx-auto mb-1 h-4 w-4 text-orange-400" />
                        <p className="text-lg font-bold text-gray-900">
                          {value}
                        </p>
                        <p className="text-[10px] font-medium uppercase tracking-wider text-gray-400">
                          {label}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            </div>

            {/* timeline */}
            <div className="pt-2">
              <TimelineStep
                year="'20"
                title="The Spark"
                description="GriVA launched with a mission to make premium electronics accessible to everyone, starting with audiophile headphones and laptops."
                index={0}
              />
              <TimelineStep
                year="'21"
                title="Going Global"
                description="Expanded shipping to 20+ countries, forging partnerships with leading logistics providers for next-day delivery."
                index={1}
              />
              <TimelineStep
                year="'23"
                title="50+ Countries"
                description="Reached a major milestone — serving customers across 50+ countries with a curated catalog of 10,000+ products."
                index={2}
              />
              <TimelineStep
                year="'25"
                title="The Future"
                description="Investing in AI-powered recommendations, same-day delivery, and an ever-expanding premium product lineup."
                index={3}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ──────── vision CTA ──────── */}
      <section className="relative py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 px-8 py-16 text-center sm:px-16 sm:py-20">
              {/* decorative elements */}
              <div className="pointer-events-none absolute -left-20 -top-20 h-60 w-60 rounded-full bg-orange-500/15 blur-[80px]" />
              <div className="pointer-events-none absolute -bottom-20 -right-20 h-60 w-60 rounded-full bg-orange-600/10 blur-[80px]" />
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.04]"
                style={{
                  backgroundImage:
                    "radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)",
                  backgroundSize: "24px 24px",
                }}
              />

              <div className="relative z-10">
                <span className="inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-orange-400">
                  <Star className="h-3 w-3" />
                  Our Vision
                </span>

                <h2 className="mx-auto mt-6 max-w-2xl text-3xl font-bold leading-tight text-white sm:text-4xl">
                  Empowering Connection{" "}
                  <span className="bg-gradient-to-r from-orange-400 to-orange-500 bg-clip-text text-transparent">
                    Through Innovation
                  </span>
                </h2>

                <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-gray-400">
                  Our vision is to bridge the gap between people and world-class
                  digital innovation. We invest in expanding our catalogs,
                  logistics, and user interfaces to make purchasing
                  next-generation electronics an absolute breeze.
                </p>

                <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                  <Link
                    href="/shop"
                    className="group inline-flex w-full items-center justify-center gap-2 rounded-[10px] bg-gradient-to-r from-orange-500 to-orange-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/30 hover:-translate-y-0.5 sm:w-auto"
                  >
                    Start Shopping
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
