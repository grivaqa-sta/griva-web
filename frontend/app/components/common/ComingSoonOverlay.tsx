"use client";

import { useState, useEffect } from "react";
import { addSubscriberApi } from "@/app/utils/api";
import { useToast } from "@/app/context/ToastContext";
import { Mail, ShieldCheck, Truck, Sparkles } from "lucide-react";

export default function ComingSoonOverlay() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [isBypassed, setIsBypassed] = useState(true); // Default to true to prevent flash
  const [logoClicks, setLogoClicks] = useState(0);

  const revealMainSite = () => {
    const ids = ["layout-header", "layout-subnavbar", "main-store-content", "layout-footer"];
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.classList.remove("hidden");
      }
    });
  };

  useEffect(() => {
    // 1. Check if Coming Soon mode is active
    const isComingSoonActive = process.env.NEXT_PUBLIC_COMING_SOON === "true";
    
    // 2. Check query params or local storage bypass
    const urlParams = new URLSearchParams(window.location.search);
    const bypassParam = urlParams.get("bypass");
    const hasBypassStorage = localStorage.getItem("griva_coming_soon_bypass") === "true";

    let bypassEnabled = false;

    if (bypassParam === "true") {
      localStorage.setItem("griva_coming_soon_bypass", "true");
      bypassEnabled = true;
    } else if (bypassParam === "false") {
      localStorage.removeItem("griva_coming_soon_bypass");
      bypassEnabled = false;
    } else {
      bypassEnabled = !isComingSoonActive || hasBypassStorage;
    }

    if (bypassEnabled) {
      setIsBypassed(true);
      revealMainSite();
    } else {
      setIsBypassed(false);
    }
  }, []);

  // Custom developer back-door: Double click or tap logo 5 times to bypass coming soon!
  const handleLogoClick = () => {
    const newCount = logoClicks + 1;
    setLogoClicks(newCount);
    if (newCount >= 5) {
      localStorage.setItem("griva_coming_soon_bypass", "true");
      setIsBypassed(true);
      revealMainSite();
      if (toast) {
        toast.success("Coming Soon bypassed successfully (Dev Mode)!");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    try {
      await addSubscriberApi(email.trim());
      setSubscribed(true);
      setEmail("");
      if (toast) {
        toast.success("Thank you! You have been added to our VIP launch list.");
      }
    } catch (err: any) {
      const errMsg = err.message || "An error occurred. Please try again.";
      if (errMsg.toLowerCase().includes("already subscribed")) {
        setSubscribed(true);
        setEmail("");
      } else if (toast) {
        toast.error(errMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  if (isBypassed) return null;

  return (
    <div className="fixed inset-0 z-[99999] bg-[#060608] text-white flex flex-col justify-between items-center px-6 py-16 select-none font-sans overflow-hidden">
      {/* Self-contained CSS Animations for maximum reliability */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes floatBlob1 {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.95); }
        }
        @keyframes floatBlob2 {
          0%, 100% { transform: translate(0px, 0px) scale(1.1); }
          50% { transform: translate(-40px, 40px) scale(0.9); }
        }
        @keyframes solarCorona {
          0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.35; filter: blur(40px); }
          50% { transform: scale(1.25) rotate(180deg); opacity: 0.55; filter: blur(55px); }
        }
        @keyframes textShimmer {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-blob-1 {
          animation: floatBlob1 20s ease-in-out infinite;
        }
        .animate-blob-2 {
          animation: floatBlob2 25s ease-in-out infinite;
        }
        .animate-corona {
          animation: solarCorona 12s ease-in-out infinite;
        }
        .animate-shimmer {
          background: linear-gradient(
            to right,
            #ffffff 20%,
            #e2e8f0 35%,
            #f97316 50%,
            #e2e8f0 65%,
            #ffffff 80%
          );
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: textShimmer 6s linear infinite;
        }
      `}} />

      {/* Floating Curiosity Blobs */}
      <div className="absolute top-[20%] left-[10%] w-[350px] h-[350px] rounded-full bg-[#f97316]/4 blur-[100px] pointer-events-none animate-blob-1" />
      <div className="absolute bottom-[20%] right-[10%] w-[400px] h-[400px] rounded-full bg-[#ea580c]/3 blur-[120px] pointer-events-none animate-blob-2" />

      {/* Grid background overlay for texture */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808003_1px,transparent_1px),linear-gradient(to_bottom,#80808003_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      {/* Centered Main Box */}
      <div className="flex-1 flex flex-col items-center justify-center text-center gap-8 max-w-xl relative">
        
        {/* Logo Container with Solar Corona Glow */}
        <div className="relative group cursor-pointer active:scale-95 transition-transform" onClick={handleLogoClick}>
          {/* Solar Eclipse Glow behind the logo */}
          <div className="absolute inset-[-40px] rounded-full bg-gradient-to-tr from-[#f97316]/25 to-transparent pointer-events-none animate-corona" />
          
          <img src="/images/logo-light.png" alt="GRIVA Logo" className="h-12 w-auto object-contain relative z-10 filter drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]" />
        </div>
        
        {/* Shimmering Curiosity Text */}
        <h1 className="text-3xl md:text-4xl font-light tracking-[0.35em] uppercase select-none animate-shimmer">
          Coming Soon
        </h1>
      </div>

      {/* Minimal Footer */}
      <div className="w-full text-center text-[10px] md:text-xs text-gray-700 tracking-[0.25em] uppercase z-10">
        © {new Date().getFullYear()} GRIVA QATAR. ALL RIGHTS RESERVED.
      </div>
    </div>
  );
}
