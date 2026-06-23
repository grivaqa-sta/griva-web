"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { 
  RefreshCw, 
  Wallet, 
  AlertTriangle, 
  MessageSquare, 
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from "lucide-react";

export default function ReturnsPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
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

      <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center">
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
            Returns & <span className="text-[#FF6A00]">Exchanges</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-sm sm:text-base text-gray-500 max-w-lg mx-auto leading-relaxed"
          >
            Our simple policies ensure a transparent, secure, and stress-free shopping experience across Qatar.
          </motion.p>
        </div>

        {/* Policy Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="w-full mt-12 grid gap-6 sm:grid-cols-2"
        >
          {/* Card 1: 7-Day Return Policy */}
          <motion.div
            variants={cardVariants}
            className="bg-white/80 backdrop-blur-sm border border-gray-100/90 rounded-3xl p-8 shadow-[0_8px_30px_-15px_rgba(0,0,0,0.02)] flex flex-col justify-between group hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.04)] transition-all duration-300 relative overflow-hidden"
          >
            <div className="absolute right-0 bottom-0 w-24 h-24 opacity-[0.015] group-hover:opacity-[0.04] transition-all duration-500 bg-[url('/images/logo-kit/brand-pattern-white-transparent.png')] bg-contain bg-no-repeat bg-right-bottom pointer-events-none" />
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#FF6A00]/5 text-[#FF6A00] flex items-center justify-center">
                <RefreshCw size={22} />
              </div>
              <h3 className="text-lg font-black text-gray-900 tracking-tight">7-Day Return Policy</h3>
              <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                If you change your mind, you can return any item within 7 days of delivery. Products must be unopened, in their original packaging, and include all original manuals and accessories.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-2 text-xs font-bold text-gray-400">
              <CheckCircle2 size={14} className="text-[#FF6A00]" />
              <span>Unused & Sealed Items Only</span>
            </div>
          </motion.div>

          {/* Card 2: Wallet Credit Refunds */}
          <motion.div
            variants={cardVariants}
            className="bg-white/80 backdrop-blur-sm border border-gray-100/90 rounded-3xl p-8 shadow-[0_8px_30px_-15px_rgba(0,0,0,0.02)] flex flex-col justify-between group hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.04)] transition-all duration-300 relative overflow-hidden"
          >
            <div className="absolute right-0 bottom-0 w-24 h-24 opacity-[0.015] group-hover:opacity-[0.04] transition-all duration-500 bg-[url('/images/logo-kit/brand-pattern-white-transparent.png')] bg-contain bg-no-repeat bg-right-bottom pointer-events-none" />
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#FF6A00]/5 text-[#FF6A00] flex items-center justify-center">
                <Wallet size={22} />
              </div>
              <h3 className="text-lg font-black text-gray-900 tracking-tight">Wallet Credit Refunds</h3>
              <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                Because we operate on a Cash on Delivery (COD) model, all approved refunds are credited directly to your GriVA wallet as store credit. You can use this credit to purchase any other items from our catalog at any time.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-2 text-xs font-bold text-gray-400">
              <CheckCircle2 size={14} className="text-[#FF6A00]" />
              <span>No Cash/Bank Refunds</span>
            </div>
          </motion.div>

          {/* Card 3: Defective & Damaged Goods */}
          <motion.div
            variants={cardVariants}
            className="bg-white/80 backdrop-blur-sm border border-gray-100/90 rounded-3xl p-8 shadow-[0_8px_30px_-15px_rgba(0,0,0,0.02)] flex flex-col justify-between group hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.04)] transition-all duration-300 relative overflow-hidden"
          >
            <div className="absolute right-0 bottom-0 w-24 h-24 opacity-[0.015] group-hover:opacity-[0.04] transition-all duration-500 bg-[url('/images/logo-kit/brand-pattern-white-transparent.png')] bg-contain bg-no-repeat bg-right-bottom pointer-events-none" />
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center">
                <AlertTriangle size={22} />
              </div>
              <h3 className="text-lg font-black text-gray-900 tracking-tight">Damaged on Arrival</h3>
              <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                If your product arrives damaged or defective, you are eligible for an immediate exchange. We will collect the damaged unit and deliver a brand-new replacement of the same product completely free of charge.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-2 text-xs font-bold text-gray-400">
              <CheckCircle2 size={14} className="text-red-500" />
              <span>Report within 24 Hours of Delivery</span>
            </div>
          </motion.div>

          {/* Card 4: Return Eligibility Criteria */}
          <motion.div
            variants={cardVariants}
            className="bg-white/80 backdrop-blur-sm border border-gray-100/90 rounded-3xl p-8 shadow-[0_8px_30px_-15px_rgba(0,0,0,0.02)] flex flex-col justify-between group hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.04)] transition-all duration-300 relative overflow-hidden"
          >
            <div className="absolute right-0 bottom-0 w-24 h-24 opacity-[0.015] group-hover:opacity-[0.04] transition-all duration-500 bg-[url('/images/logo-kit/brand-pattern-white-transparent.png')] bg-contain bg-no-repeat bg-right-bottom pointer-events-none" />
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#FF6A00]/5 text-[#FF6A00] flex items-center justify-center">
                <ShieldCheck size={22} />
              </div>
              <h3 className="text-lg font-black text-gray-900 tracking-tight">Verification Check</h3>
              <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                To process your return or exchange request, we require your Order ID, proof of purchase/receipt, and a clear photo or video showing the condition of the product and its packaging.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-2 text-xs font-bold text-gray-400">
              <CheckCircle2 size={14} className="text-[#FF6A00]" />
              <span>Subject to Condition Inspection</span>
            </div>
          </motion.div>
        </motion.div>

        {/* WhatsApp Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="relative w-full bg-[#0c0c0c] border border-zinc-800 text-white rounded-3xl p-8 mt-12 shadow-[0_20px_40px_rgba(0,0,0,0.06)] overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6 group"
        >
          {/* Dark Watermark Pattern */}
          <div className="absolute inset-0 bg-[url('/images/logo-kit/brand-pattern-dark-transparent.png')] bg-cover opacity-[0.06] group-hover:opacity-[0.09] transition-opacity duration-500 pointer-events-none" />
          <div className="absolute -left-16 -top-16 w-32 h-32 rounded-full bg-[#FF6A00]/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 text-center sm:text-left space-y-1.5 max-w-md">
            <span className="text-[10px] font-bold text-[#FF6A00] tracking-widest uppercase">
              Initiate a Request
            </span>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight">
              Start Return or Exchange
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Message our support team on WhatsApp with your Order ID to initiate a return pickup or a damaged item exchange request.
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
              <span>Initiate via WhatsApp</span>
              <ArrowRight size={14} className="ml-1 transition-transform group-hover:translate-x-1" />
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
