"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Truck,
  MapPin,
  Clock,
  ShieldCheck,
  ChevronDown,
  HelpCircle,
  MessageSquare,
  ArrowRight,
  Zap,
  CheckCircle2,
  DollarSign
} from "lucide-react";
import BreadcrumbSchema from "@/components/seo/BreadcrumbSchema";
import FAQSchema from "@/components/seo/FAQSchema";

const DELIVERY_FAQS = [
  {
    question: "What are the shipping charges for GriVA orders in Qatar?",
    answer: "Delivery is completely FREE across all municipalities in Qatar for orders above QAR 99. For orders below QAR 99, a flat delivery fee of QAR 15 applies to Doha and inner suburbs, and QAR 25-30 for remote outer zones."
  },
  {
    question: "How fast is the same-day delivery in Doha?",
    answer: "For Doha municipal areas (including Lusail, West Bay, The Pearl, and Al Waab), orders placed before 4:00 PM are delivered within 2 to 4 hours. Orders placed after 4:00 PM are dispatched first thing the following morning."
  },
  {
    question: "Do you deliver on weekends and Fridays?",
    answer: "Yes, our dedicated in-house dispatch team delivers 7 days a week. Friday deliveries run between 1:00 PM and 10:00 PM to accommodate prayer times, while other days run from 9:00 AM to 10:00 PM."
  },
  {
    question: "Can I pay using Cash on Delivery (COD)?",
    answer: "Absolutely! We accept Cash on Delivery (COD) across all areas of Qatar. Our riders also carry mobile POS terminals, so you can pay securely using credit/debit cards at your doorstep."
  },
  {
    question: "Can I schedule a specific time for my delivery?",
    answer: "Yes. Once you place an order, our logistics coordinator will contact you via WhatsApp or phone call to confirm your exact location and schedule a delivery window that is most convenient for you."
  }
];

const COVERAGE_ZONES = [
  {
    name: "DOHA MUNICIPAL & INNER SUBURBS",
    areas: "West Bay, The Pearl, Lusail, Al Waab, Abu Hamour, Al Sadd, Madinat Khalifa",
    time: "2 - 4 Hours",
    fee: "QAR 15 (Free over QAR 99)",
    highlight: true
  },
  {
    name: "RAYYAN & SUBURBS",
    areas: "Muaither, Al Wajbah, Gharrafa, Shahaniya, Umm Salal Mohammed",
    time: "4 - 6 Hours",
    fee: "QAR 20 (Free over QAR 99)",
    highlight: false
  },
  {
    name: "AL WAKRA & AL WUKAIR",
    areas: "Wakra City, Wukair, Ezdan Villages, Mesaieed Port",
    time: "4 - 6 Hours",
    fee: "QAR 20 (Free over QAR 99)",
    highlight: false
  },
  {
    name: "NORTHERN QATAR",
    areas: "Al Khor, Al Thakira, Simaisma, Ruwais, Madinat ash Shamal",
    time: "Next-Day",
    fee: "QAR 25 (Free over QAR 150)",
    highlight: false
  },
  {
    name: "WESTERN & SOUTHERN QATAR",
    areas: "Dukhan, Zekreet, Umm Bab, Abu Samra border area",
    time: "Next-Day",
    fee: "QAR 30 (Free over QAR 150)",
    highlight: false
  }
];

export default function SameDayDeliveryPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-white apple-font">
      <title>Same Day Delivery Doha & Qatar Express Shipping | GriVA</title>
      <meta name="description" content="Enjoy lightning fast same-day delivery across Doha, Lusail, West Bay, Pearl-Qatar, and all major Qatar regions. Free delivery on orders above QAR 99." />
      <link rel="canonical" href="https://thegriva.com/same-day-delivery-doha" />
      <BreadcrumbSchema items={[
        { name: "Home", path: "/" },
        { name: "Same Day Delivery Doha", path: "/same-day-delivery-doha" }
      ]} />
      <FAQSchema faqs={DELIVERY_FAQS} />

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
                Express Logistics
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-6 text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl uppercase"
            >
              SAME DAY DELIVERY
              <br />
              <span className="bg-gradient-to-r from-[#FF6A00] to-[#ff8432] bg-clip-text text-transparent">
                ACROSS ALL QATAR AREAS
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mx-auto mt-6 max-w-xl text-xs sm:text-sm leading-relaxed text-zinc-400"
            >
              Order before 4 PM to get your premium electronics, audio gear, and lifestyle products delivered right to your doorstep within 2-4 hours in Doha. Free shipping on orders over QAR 99.
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
                Shop Now & Get It Today
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </motion.div>
          </div>

          {/* Core Values Row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mx-auto mt-16 grid max-w-4xl grid-cols-1 gap-px overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/40 backdrop-blur-sm sm:grid-cols-3"
          >
            <div className="p-6 text-center border-b border-zinc-800/40 sm:border-b-0 sm:border-r">
              <div className="mx-auto mb-3 w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500">
                <Clock className="h-4 w-4" />
              </div>
              <p className="text-lg font-bold text-white">2-4 Hour Delivery</p>
              <p className="mt-1 text-[10px] text-zinc-500 uppercase tracking-wider">Fastest in Doha</p>
            </div>
            <div className="p-6 text-center border-b border-zinc-800/40 sm:border-b-0 sm:border-r">
              <div className="mx-auto mb-3 w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500">
                <Zap className="h-4 w-4" />
              </div>
              <p className="text-lg font-bold text-white">Free Over QAR 99</p>
              <p className="mt-1 text-[10px] text-zinc-500 uppercase tracking-wider">Across All Cities</p>
            </div>
            <div className="p-6 text-center">
              <div className="mx-auto mb-3 w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500">
                <DollarSign className="h-4 w-4" />
              </div>
              <p className="text-lg font-bold text-white">COD + Doorstep Card</p>
              <p className="mt-1 text-[10px] text-zinc-500 uppercase tracking-wider">Pay Securely on Arrival</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ──────── Coverage Zones Section ──────── */}
      <section className="relative py-20 sm:py-28">
        <div className="absolute inset-0 bg-[url('/images/logo-kit/brand-pattern-white-transparent.png')] bg-cover opacity-[0.02] pointer-events-none z-0" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <span className="text-xs font-extrabold uppercase tracking-[0.25em] text-[#FF6A00]">
              Qatar Coverage Map
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl uppercase">
              DELIVERY RATES & COVERAGE ZONES
            </h2>
            <p className="mt-4 text-xs sm:text-sm leading-relaxed text-gray-500">
              We deliver direct from our warehouse in Doha to all major municipalities in Qatar. Check your area and transit times below.
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-4">
            {COVERAGE_ZONES.map((zone, idx) => (
              <div
                key={idx}
                className={`p-6 rounded-2xl border transition-all duration-300 ${
                  zone.highlight
                    ? "bg-gradient-to-br from-orange-50/50 to-amber-50/20 border-orange-200 shadow-md"
                    : "bg-white border-gray-100 shadow-sm"
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${zone.highlight ? "bg-orange-500" : "bg-gray-400"}`} />
                      <h3 className="font-bold text-gray-900 text-sm md:text-base">{zone.name}</h3>
                    </div>
                    <p className="text-xs text-gray-500 pl-4">{zone.areas}</p>
                  </div>
                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center border-t md:border-t-0 pt-3 md:pt-0 border-gray-100 shrink-0">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900">
                      <Clock className="h-3.5 w-3.5 text-orange-500" />
                      <span>{zone.time}</span>
                    </div>
                    <span className="text-xs font-bold text-orange-600 mt-0.5">{zone.fee}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────── FAQ Section ──────── */}
      <section className="relative bg-gray-50/70 py-20 sm:py-28">
        <div className="absolute inset-0 bg-[url('/images/logo-kit/brand-pattern-white-transparent.png')] bg-cover opacity-[0.02] pointer-events-none z-0" />

        <div className="relative z-10 mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-extrabold uppercase tracking-[0.25em] text-[#FF6A00]">
              Logistics Questions
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 uppercase">
              DELIVERY FAQS
            </h2>
          </div>

          <div className="space-y-4">
            {DELIVERY_FAQS.map((faq, idx) => {
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

      {/* ──────── Contact WhatsApp Banner ──────── */}
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
                Need Help with Delivery?
              </span>

              <h2 className="mt-6 text-3xl font-bold leading-tight text-white sm:text-4xl uppercase">
                CHAT DIRECTLY WITH OUR
                <br />
                <span className="bg-gradient-to-r from-[#FF6A00] to-[#ff8432] bg-clip-text text-transparent">
                  LOGISTICS COORDINATOR
                </span>
              </h2>

              <p className="mt-5 text-xs sm:text-sm leading-relaxed text-zinc-400">
                Want to track your driver, request a specific time slot, or change your delivery address? Speak directly with our dispatch team on WhatsApp.
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
