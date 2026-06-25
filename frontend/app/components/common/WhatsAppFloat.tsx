"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

const WHATSAPP_NUMBER = "97455551234"; // Replace with real WhatsApp number (no + or spaces)
const WHATSAPP_MESSAGE = encodeURIComponent(
  "Hello GriVA! 👋 I need help with my order / have a question about a product."
);
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`;

export default function WhatsAppFloat() {
  const [showTooltip, setShowTooltip] = useState(false);
  const [pulsed, setPulsed] = useState(false);
  const pathname = usePathname();

  // Hide on admin and delivery pages
  if (pathname.startsWith("/admin") || pathname.startsWith("/delivery")) return null;

  // Pulse effect every 8 seconds to grab attention
  useEffect(() => {
    const interval = setInterval(() => {
      setPulsed(true);
      setTimeout(() => setPulsed(false), 800);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed bottom-20 right-4 sm:bottom-20 sm:right-6 z-[998] flex flex-col items-end gap-2">
      {/* Tooltip bubble (positioned above the button) */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="relative bg-white rounded-2xl shadow-xl border border-gray-100 px-4 py-2.5 text-xs font-semibold text-gray-800 max-w-[180px] leading-relaxed pointer-events-none text-right"
          >
            <p className="font-bold text-[12px] text-gray-900 mb-0.5">Chat with us 💬</p>
            <p className="text-gray-500 text-[10px]">We reply within minutes!</p>
            {/* Arrow pointer pointing down to the button */}
            <div className="absolute -bottom-1.5 right-4 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-white" />
            <div className="absolute -bottom-[7px] right-4 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-gray-100/50 z-[-1]" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* WhatsApp Button */}
      <motion.a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with GriVA on WhatsApp"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onTouchStart={() => setShowTooltip(true)}
        animate={
          pulsed
            ? { scale: [1, 1.15, 1], boxShadow: ["0 0 0 0 rgba(37,211,102,0.4)", "0 0 0 14px rgba(37,211,102,0)", "0 0 0 0 rgba(37,211,102,0)"] }
            : {}
        }
        transition={{ duration: 0.8 }}
        whileHover={{ scale: 1.08, translateY: -2 }}
        whileTap={{ scale: 0.93 }}
        className="relative flex h-11 w-11 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-green-500/30 transition-all cursor-pointer focus:outline-none"
      >
        {/* Animated ping ring */}
        <span className="absolute inline-flex h-full w-full rounded-full bg-[#25D366] opacity-25 animate-ping" />

        {/* WhatsApp SVG Icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 32 32"
          fill="white"
          className="h-5.5 w-5.5 relative z-10"
          aria-hidden="true"
        >
          <path d="M16.002 2.667C8.636 2.667 2.667 8.636 2.667 16c0 2.353.639 4.662 1.848 6.675L2.667 29.333l6.836-1.794A13.283 13.283 0 0 0 16.002 29.333c7.364 0 13.331-5.97 13.331-13.333 0-7.364-5.967-13.333-13.331-13.333Zm0 24.198a11.019 11.019 0 0 1-5.618-1.54l-.403-.24-4.057 1.065 1.083-3.945-.263-.418a10.984 10.984 0 0 1-1.686-5.787c0-6.063 4.933-10.996 10.944-10.996 6.014 0 10.944 4.933 10.944 10.996 0 6.061-4.93 10.865-10.944 10.865Zm5.994-8.214c-.326-.165-1.939-.956-2.239-1.067-.3-.11-.518-.165-.736.165-.219.33-.846 1.067-1.037 1.286-.191.22-.383.248-.71.083-.326-.165-1.377-.507-2.623-1.618-.97-.864-1.624-1.932-1.815-2.259-.191-.326-.02-.503.143-.665.147-.146.326-.382.488-.573.163-.191.218-.329.327-.547.11-.219.054-.411-.027-.576-.082-.165-.736-1.775-.1 -2.43-.27-.652-.509-.563-.709-.574-.2-.01-.437-.013-.671-.013-.234 0-.617.088-.94.41-.326.329-1.23 1.203-1.23 2.932 0 1.73 1.258 3.4 1.434 3.63.174.219 2.481 3.79 6.01 5.31.841.363 1.496.58 2.008.744.844.27 1.61.232 2.218.14.677-.1 2.083-.852 2.378-1.676.293-.822.293-1.527.204-1.676-.087-.143-.3-.228-.63-.393Z" />
        </svg>
      </motion.a>
    </div>
  );
}
