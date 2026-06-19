"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Home, Grid, Headphones, ArrowRight } from "lucide-react";


export default function NotFound() {
  return (
    <div className="relative min-h-[75vh] flex flex-col items-center justify-center bg-white overflow-hidden py-6 px-4">
      {/* Background brand pattern */}
      <div className="absolute inset-0 z-0 opacity-[0.05] pointer-events-none">
        <Image 
          src="/images/logo-kit/brand-pattern-white-transparent.png" 
          alt="Pattern" 
          fill
          className="object-cover" 
        />
      </div>

      <div className="relative z-10 w-full max-w-2xl mx-auto flex flex-col items-center text-center space-y-4">
        {/* 404 with orange glowing ring for the middle 0 */}
        <div className="flex items-center justify-center font-black text-6xl sm:text-8xl leading-none text-gray-900 tracking-tight select-none">
          <span>4</span>
          {/* Glowing Ring */}
          <div className="relative w-[50px] h-[50px] sm:w-[80px] sm:h-[80px] mx-1 flex items-center justify-center">
            {/* Multiple animated pulsing outer glows */}
            <div className="absolute inset-0 rounded-full border-[6px] sm:border-[8px] border-[#FF6A00]/20 animate-ping" />
            <div className="absolute inset-1 rounded-full border-[6px] sm:border-[8px] border-[#FF6A00]/40 blur-[2px]" />
            <div className="absolute inset-2 rounded-full border-[6px] sm:border-[8px] border-[#FF6A00] shadow-[0_0_20px_rgba(255,106,0,0.7)]" />
          </div>
          <span>4</span>
        </div>

        {/* Small GRIVA Brand Divider */}
        <div className="flex items-center gap-3">
          <div className="h-[1px] w-8 bg-gray-200" />
          <Image 
            src="/images/logo-dark.png" 
            alt="GRIVA" 
            width={60} 
            height={16} 
            className="h-4 object-contain" 
          />
          <div className="h-[1px] w-8 bg-gray-200" />
        </div>

        {/* Heading */}
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
            Destination <span className="text-[#FF6A00]">Not Found</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 max-w-sm mx-auto leading-relaxed">
            The requested page is unavailable or may have been relocated. Explore our premium collection and continue your journey.
          </p>
        </div>


        {/* Buttons */}
        <div className="flex flex-row items-center gap-3 w-full justify-center max-w-sm">
          <Link 
            href="/"
            className="flex-1 flex items-center justify-center gap-1.5 bg-[#FF6A00] hover:bg-[#E04F00] text-white font-bold py-3 px-4 rounded-xl shadow-[0_4px_12px_rgba(255,106,0,0.2)] hover:shadow-[0_6px_16px_rgba(255,106,0,0.3)] active:scale-[0.99] transition-all duration-200 text-xs sm:text-sm"
          >
            <Home size={15} />
            <span>Return Home</span>
          </Link>
          
          <Link 
            href="/shop"
            className="flex-1 flex items-center justify-center gap-1.5 bg-white hover:bg-gray-50 text-gray-900 font-bold py-3 px-4 rounded-xl border border-gray-200 hover:border-gray-300 active:scale-[0.99] transition-all duration-200 text-xs sm:text-sm"
          >
            <Grid size={15} className="text-[#FF6A00]" />
            <span>Explore Products</span>
          </Link>
        </div>

        {/* Support Help Card */}
        <div className="w-full max-w-md bg-gray-50 border border-gray-100 rounded-2xl p-4 sm:p-5 mt-4 flex flex-row items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3 text-left">
            <div className="h-10 w-10 rounded-xl bg-[#FF6A00]/5 flex items-center justify-center text-[#FF6A00] shrink-0">
              <Headphones size={20} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-900">Need help?</h4>
              <p className="text-[10px] text-gray-500 leading-normal">Our support team is here for you.</p>
            </div>
          </div>
          
          <Link 
            href="/contact"
            className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-950 font-bold px-3.5 py-2 rounded-lg transition-all duration-200 text-[10px]"
          >
            <span>Contact Support</span>
            <ArrowRight size={12} />
          </Link>
        </div>
      </div>
    </div>
  );
}
