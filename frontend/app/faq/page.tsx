"use client";

import { useState } from "react";
import Image from "next/image";
import { faqData } from "@/app/data/data";
import { ChevronDown, HelpCircle, MessageSquare, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100 } }
  };

  return (
    <div className="relative min-h-screen bg-[#FDFDFD] overflow-hidden py-16 px-4 md:py-24">
      {/* Background Brand Pattern and Subtle Orange Lighting */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none">
        <Image 
          src="/images/logo-kit/brand-pattern-white-transparent.png" 
          alt="Brand Pattern" 
          fill
          priority
          className="object-cover" 
        />
      </div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[400px] bg-[radial-gradient(circle_at_top,rgba(255,106,0,0.05),transparent_60%)] pointer-events-none z-0" />

      <div className="relative z-10 w-full max-w-3xl mx-auto flex flex-col items-center">
        {/* GRIVA Logo First */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex justify-center mb-1"
        >
          <Image 
            src="/images/logo-dark.png" 
            alt="GRIVA" 
            width={140} 
            height={36} 
            className="h-8 w-auto object-contain" 
            priority
          />
        </motion.div>

        {/* Header Title */}
        <div className="text-center space-y-3 max-w-2xl">
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-3xl sm:text-5xl font-black text-gray-900 tracking-tight leading-none"
          >
            Frequently Asked <span className="text-[#FF6A00]">Questions</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-sm sm:text-base text-gray-500 max-w-lg mx-auto leading-relaxed"
          >
            Quick, transparent answers to our shipping rates, payment terms, and exchange policies.
          </motion.p>
        </div>

        {/* FAQ Accordion List */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="w-full mt-12 space-y-4"
        >
          {faqData.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="bg-white/80 backdrop-blur-sm border border-gray-100/90 rounded-2xl shadow-[0_8px_30px_-15px_rgba(0,0,0,0.02)] overflow-hidden transition-all duration-300 hover:shadow-[0_16px_40px_-12px_rgba(0,0,0,0.04)]"
              >
                <button
                  onClick={() => toggleFAQ(idx)}
                  className="w-full flex items-center justify-between p-6 text-left transition-colors duration-200 cursor-pointer"
                >
                  <div className="flex gap-4 items-center pr-4">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-200 ${isOpen ? "bg-[#FF6A00]/10 text-[#FF6A00]" : "bg-gray-50 text-gray-400"}`}>
                      <HelpCircle size={16} />
                    </div>
                    <span className="text-sm sm:text-base font-bold text-gray-900 tracking-tight leading-snug">
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
              </motion.div>
            );
          })}
        </motion.div>

        {/* WhatsApp Concierge Contact Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.65 }}
          className="relative w-full bg-[#0c0c0c] border border-zinc-800 text-white rounded-3xl p-8 mt-12 shadow-[0_20px_40px_rgba(0,0,0,0.06)] overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6 group"
        >
          {/* Dark Watermark Pattern */}
          <div className="absolute inset-0 bg-[url('/images/logo-kit/brand-pattern-dark-transparent.png')] bg-cover opacity-[0.06] group-hover:opacity-[0.09] transition-opacity duration-500 pointer-events-none" />
          <div className="absolute -left-16 -top-16 w-32 h-32 rounded-full bg-[#FF6A00]/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 text-center sm:text-left space-y-1.5 max-w-md">
            <span className="text-[10px] font-bold text-[#FF6A00] tracking-widest uppercase">
              Still Have Questions?
            </span>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight">
              Chat With Our Support Team
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Our direct support channel is open Sunday to Thursday for immediate assistance with orders, exchanges, or refunds.
            </p>
          </div>

          <div className="relative z-10 shrink-0 w-full sm:w-auto">
            <a
              href="https://wa.me/9747770123"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-6 py-3.5 bg-[#25D366] hover:bg-[#20c058] active:scale-[0.985] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all duration-200 shadow-md"
            >
              <MessageSquare size={15} />
              <span>Contact via WhatsApp</span>
              <ArrowRight size={14} className="ml-1 transition-transform group-hover:translate-x-1" />
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
