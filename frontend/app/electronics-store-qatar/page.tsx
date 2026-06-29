"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Smartphone,
  Cpu,
  Laptop,
  CheckCircle,
  ShieldCheck,
  ChevronDown,
  HelpCircle,
  MessageSquare,
  ArrowRight,
  Gamepad,
  Volume2
} from "lucide-react";
import BreadcrumbSchema from "@/components/seo/BreadcrumbSchema";
import FAQSchema from "@/components/seo/FAQSchema";

const ELECTRONICS_FAQS = [
  {
    question: "Are all electronics sold on GRIVA 100% authentic?",
    answer: "Yes, every single product sold on GRIVA is 100% genuine, sourced directly from official brand distributors. All devices come in factory-sealed retail packaging with official serial numbers."
  },
  {
    question: "Do electronics come with warranty in Qatar?",
    answer: "Absolutely. All major electronic items and gadgets purchased from GRIVA include a standard 12-month local warranty against manufacturer defects. Some premium brands offer extended official warranty coverage."
  },
  {
    question: "What is your refund policy if the electronic device has a defect?",
    answer: "If you receive a defective device, notify our support team within 7 days. We will dispatch a rider to pick up the device, verify the issue, and provide you with an immediate replacement or full refund."
  },
  {
    question: "Do you offer technical setup assistance for smart home devices?",
    answer: "Yes! Our concierge team is happy to guide you through initial setup, app integration, or connection troubleshooting over a direct video or audio call via WhatsApp support."
  }
];

const HIGHLIGHT_CATEGORIES = [
  {
    icon: Smartphone,
    title: "PREMIUM SMARTPHONES & WEARABLES",
    description: "Sleek smartwatches, fitness trackers, and dynamic mobile devices from top brands."
  },
  {
    icon: Gamepad,
    title: "PRO-GAMING ACCESSORIES",
    description: "High-accuracy mobile gaming triggers, cooling systems, and controllers."
  },
  {
    icon: Volume2,
    title: "HIGH-FIDELITY AUDIO GEAR",
    description: "Premium wireless earbuds, active noise-cancelling headphones, and soundbars."
  },
  {
    icon: Cpu,
    title: "SMART CHARGERS & POWER HUBS",
    description: "High-speed GaN chargers, wireless power banks, and multi-port charging hubs."
  }
];

export default function ElectronicsStorePage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-white apple-font">
      <title>Premium Electronics Store Qatar | GRIVA Doha</title>
      <meta name="description" content="Browse the finest electronics boutique in Qatar. Authentic Apple products, smart chargers, gaming gear, and tech accessories with 2-4 hour Doha delivery." />
      <link rel="canonical" href="https://thegriva.com/electronics-store-qatar" />
      <BreadcrumbSchema items={[
        { name: "Home", path: "/" },
        { name: "Electronics Store Qatar", path: "/electronics-store-qatar" }
      ]} />
      <FAQSchema faqs={ELECTRONICS_FAQS} />

      {/* ──────── Hero Section (Premium Dark) ──────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0c0c0c] via-[#121212] to-[#0c0c0c] py-20 sm:py-28">
        {/* Brand pattern watermark */}
        <div className="absolute inset-0 bg-[url('/images/logo-kit/brand-pattern-dark-transparent.png')] bg-cover opacity-[0.06] pointer-events-none z-0" />
        
        {/* Decorative glows */}
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
              <span className="mb-4 inline-flex items-center rounded-full border border-[#FF6A00]/25 bg-[#FF6A00]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-[#FF6A00]">
                Premium Tech Hub
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-6 text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl uppercase"
            >
              THE PREMIER ONLINE
              <br />
              <span className="bg-gradient-to-r from-[#FF6A00] to-[#ff8432] bg-clip-text text-transparent">
                ELECTRONICS STORE IN QATAR
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mx-auto mt-6 max-w-xl text-xs sm:text-sm leading-relaxed text-zinc-400"
            >
              Step into the future with GRIVA. Discover our curated catalog of elite chargers, high-grade audio gear, gaming triggers, and cutting-edge lifestyle gadgets. Built for local tech enthusiasts.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row"
            >
              <Link
                href="/shop?category=gadgets-electronics"
                className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF6A00] to-[#e05d00] px-8 py-3.5 text-xs font-bold text-white shadow-md transition-all duration-300 hover:shadow-lg active:scale-[0.98] sm:w-auto"
              >
                Explore Tech Catalog
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ──────── Categories Section ──────── */}
      <section className="relative py-20 sm:py-28">
        <div className="absolute inset-0 bg-[url('/images/logo-kit/brand-pattern-white-transparent.png')] bg-cover opacity-[0.02] pointer-events-none z-0" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <span className="text-xs font-extrabold uppercase tracking-[0.25em] text-[#FF6A00]">
              Curated Selection
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl uppercase">
              ENGINEERED FOR ULTIMATE PERFORMANCE
            </h2>
            <p className="mt-4 text-xs sm:text-sm leading-relaxed text-gray-500">
              We skip the low-grade generics. Every item in our store undergoes severe functionality testing.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 max-w-5xl mx-auto">
            {HIGHLIGHT_CATEGORIES.map((cat, idx) => {
              const Icon = cat.icon;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col items-center text-center space-y-4"
                >
                  <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm md:text-base">{cat.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{cat.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ──────── Electronics FAQ Section ──────── */}
      <section className="relative bg-gray-50/70 py-20 sm:py-28">
        <div className="absolute inset-0 bg-[url('/images/logo-kit/brand-pattern-white-transparent.png')] bg-cover opacity-[0.02] pointer-events-none z-0" />

        <div className="relative z-10 mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-extrabold uppercase tracking-[0.25em] text-[#FF6A00]">
              Store Policies
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 uppercase">
              WARRANTY & VERIFICATION FAQS
            </h2>
          </div>

          <div className="space-y-4">
            {ELECTRONICS_FAQS.map((faq, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div
                  key={idx}
                  className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden transition-all duration-300"
                >
                  <button
                    onClick={() => toggleFAQ(idx)}
                    className="w-full flex items-center justify-between p-6 text-left cursor-pointer"
                  >
                    <div className="flex gap-4 items-center pr-4">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-200 ${isOpen ? "bg-[#FF6A00]/10 text-[#FF6A00]" : "bg-gray-50 text-gray-400"}`}>
                        <HelpCircle size={16} />
                      </div>
                      <span className="text-xs sm:text-sm font-bold text-gray-900 tracking-tight leading-snug">
                        {faq.question}
                      </span>
                    </div>
                    <ChevronDown
                      size={18}
                      className={`text-gray-400 shrink-0 transition-transform duration-300 ease-out ${
                        isOpen ? "rotate-180 text-[#FF6A00]" : ""
                      }`}
                    />
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: [0.04, 0.62, 0.23, 0.98] }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-gray-50 px-6 pb-6 pt-3 text-xs sm:text-sm text-gray-500 leading-relaxed">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ──────── CTA WhatsApp Banner ──────── */}
      <section className="relative py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#0c0c0c] via-[#121212] to-[#0c0c0c] px-8 py-16 text-center sm:px-16 sm:py-20 group shadow-2xl">
            {/* dark brand pattern watermark */}
            <div className="absolute inset-0 bg-[url('/images/logo-kit/brand-pattern-dark-transparent.png')] bg-cover opacity-[0.06] group-hover:opacity-[0.09] transition-opacity duration-500 pointer-events-none z-0" />
            
            {/* decorative elements */}
            <div className="pointer-events-none absolute -left-20 -top-20 h-60 w-60 rounded-full bg-[#FF6A00]/10 blur-[80px]" />
            <div className="pointer-events-none absolute -bottom-20 -right-20 h-60 w-60 rounded-full bg-[#FF6A00]/10 blur-[80px]" />

            <div className="relative z-10 max-w-2xl mx-auto">
              <span className="inline-flex items-center rounded-full border border-[#FF6A00]/25 bg-[#FF6A00]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-[#FF6A00] mb-2">
                Have Device Questions?
              </span>

              <h2 className="mt-6 text-3xl font-bold leading-tight text-white sm:text-4xl uppercase">
                CHAT DIRECTLY WITH OUR
                <br />
                <span className="bg-gradient-to-r from-[#FF6A00] to-[#ff8432] bg-clip-text text-transparent">
                  TECHNICAL SUPPORT
                </span>
              </h2>

              <p className="mt-5 text-xs sm:text-sm leading-relaxed text-zinc-400">
                Not sure about compatibility, charger speeds, or warranty specifics? Get dynamic technical guidance via WhatsApp support.
              </p>

              <div className="mt-8 flex justify-center">
                <a
                  href="https://wa.me/9747770123"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center justify-center gap-2.5 rounded-xl bg-[#25D366] hover:bg-[#20c058] px-8 py-4 text-xs font-bold text-white shadow-lg transition-all duration-300 hover:shadow-emerald-500/20 active:scale-[0.98]"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>Chat on WhatsApp (+974 7770 123)</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
