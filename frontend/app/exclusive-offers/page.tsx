"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Check, ArrowUpRight, MessageSquare, Send } from "lucide-react";

export default function ExclusiveDeals() {
  const channelLinks = [
    {
      name: "Telegram Channel",
      tagline: "Direct Flash Alerts",
      description: "Get real-time notifications for secret drops, limited-quantity inventory updates, and premium category launches.",
      features: [
        "Immediate flash-drop alerts",
        "Exclusive single-use promo codes",
        "Direct link to VIP collection pages"
      ],
      actionText: "Join Telegram Channel",
      href: "https://t.me/griva_qa",
      colorClass: "bg-[#229ED9] hover:bg-[#1a8bbf]",
      icon: <Send size={22} className="text-[#229ED9]" />,
      iconBg: "bg-[#229ED9]/5",
      patternOpacity: "opacity-[0.03] group-hover:opacity-[0.06]"
    },
    {
      name: "WhatsApp Community",
      tagline: "Priority Direct Access",
      description: "Interact directly with our concierge team, preview restocks before they launch, and request personalized shopping support.",
      features: [
        "Priority restock announcements",
        "Direct-to-concierge chat support",
        "Early access to seasonal sales"
      ],
      actionText: "Join WhatsApp Community",
      href: "https://wa.me/9747770123",
      colorClass: "bg-[#25D366] hover:bg-[#1dba57]",
      icon: <MessageSquare size={22} className="text-[#25D366]" />,
      iconBg: "bg-[#25D366]/5",
      patternOpacity: "opacity-[0.03] group-hover:opacity-[0.06]"
    }
  ];

  return (
    <div className="relative min-h-screen bg-[#FDFDFD] overflow-hidden pt-2 pb-16 px-4 md:pt-4 md:pb-24">
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
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[400px] bg-[radial-gradient(circle_at_top,rgba(255,106,0,0.06),transparent_60%)] pointer-events-none z-0" />

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

        {/* Title */}
        <div className="text-center space-y-3 max-w-2xl">
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-3xl sm:text-5xl font-black text-gray-900 tracking-tight leading-none"
          >
            Exclusive <span className="text-[#FF6A00]">Deals</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-sm sm:text-base text-gray-500 max-w-lg mx-auto leading-relaxed"
          >
            Connect directly with our community networks to receive confidential flash codes, pre-launch drop invitations, and order assistance.
          </motion.p>
        </div>

        {/* Channels Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mt-12">
          {channelLinks.map((channel, idx) => (
            <motion.div
              key={channel.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 + idx * 0.1 }}
              className="group relative bg-white border border-gray-100/90 rounded-3xl p-8 flex flex-col justify-between shadow-[0_8px_30px_-10px_rgba(0,0,0,0.02)] hover:shadow-[0_24px_50px_-12px_rgba(0,0,0,0.06)] hover:border-gray-200 transition-all duration-300 overflow-hidden"
            >
              {/* Corner Watermark Pattern */}
              <div 
                className={`absolute right-0 bottom-0 w-36 h-36 pointer-events-none bg-[url('/images/logo-kit/brand-pattern-white-transparent.png')] bg-contain bg-no-repeat bg-right-bottom transition-all duration-500 ${channel.patternOpacity}`} 
              />

              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className={`w-12 h-12 ${channel.iconBg} rounded-2xl flex items-center justify-center shrink-0`}>
                    {channel.icon}
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50 px-2.5 py-1 rounded-md">
                    {channel.tagline}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-2">{channel.name}</h3>
                <p className="text-xs text-gray-500 leading-relaxed mb-6">{channel.description}</p>

                {/* Features List */}
                <ul className="space-y-2.5">
                  {channel.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2.5 text-xs text-gray-600">
                      <div className="mt-0.5 w-4 h-4 rounded-full bg-[#FF6A00]/5 flex items-center justify-center text-[#FF6A00] shrink-0">
                        <Check size={10} strokeWidth={3} />
                      </div>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <a
                href={channel.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-full mt-8 py-3.5 rounded-xl text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all duration-200 shadow-sm ${channel.colorClass} active:scale-[0.995]`}
              >
                <span>{channel.actionText}</span>
                <ArrowUpRight size={14} />
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}