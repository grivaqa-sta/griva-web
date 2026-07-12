"use client";

import { motion } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { getSettingsApi } from "@/app/utils/api";
import { useCategories, useSubCategories } from "@/app/hooks/useCategories";

const categories = [
  {
    number: "01",
    title: "Gaming Gear",
    subtitle: "Up to 35% OFF",
    image: "/images/gamejoysticnew.png",
    bgGradient: "from-purple-500/5 to-indigo-500/5",
    href: "/gaming-store-qatar",
  },
  {
    number: "02",
    title: "Premium Audio",
    subtitle: "Up to 40% OFF",
    image: "/images/headphonenew.png",
    bgGradient: "from-blue-500/5 to-cyan-500/5",
    href: "/exclusive-offers",
  },
  {
    number: "03",
    title: "Smartwatches",
    subtitle: "Up to 30% OFF",
    image: "/images/iwatch.png",
    bgGradient: "from-emerald-500/5 to-teal-500/5",
    href: "/shop",
  },
  {
    number: "04",
    title: "Speakers & More",
    subtitle: "Special Drops",
    image: "/images/bspeaker.png",
    bgGradient: "from-rose-500/5 to-orange-500/5",
    href: "/electronics-store-qatar",
  },
];

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

const badgeVariant = {
  hidden: { opacity: 0, y: -10, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease } },
};

const headlineVariant = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, delay: 0.1, ease } },
};

const descVariant = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.2, ease } },
};

const ctaVariant = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.3, ease } },
};

const cardVariant = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease },
  }),
};

function SmallLightning() {
  return (
    <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
      <path d="M8 1L3 8H7L6 13L11 6H7L8 1Z" fill="#FF6A00" />
    </svg>
  );
}

export default function LazyFridayDeals() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [fridaySaleEnabled, setFridaySaleEnabled] = useState<boolean | null>(null);
  const [fridaySaleConfig, setFridaySaleConfig] = useState<any[] | null>(null);
  const [isFriday, setIsFriday] = useState(false);

  const { categories: apiCategories } = useCategories();
  const { subCategories: apiSubCategories } = useSubCategories();

  useEffect(() => {
    const checkFriday = () => {
      const QATAR_OFFSET_MS = 3 * 60 * 60 * 1000;
      const utc = Date.now() + new Date().getTimezoneOffset() * 60 * 1000;
      const qt = new Date(utc + QATAR_OFFSET_MS);
      setIsFriday(qt.getDay() === 5); // 5 is Friday
    };
    checkFriday();
    const interval = setInterval(checkFriday, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings = await getSettingsApi();
        setFridaySaleEnabled(settings.fridaySaleEnabled);
        setFridaySaleConfig(settings.fridaySaleConfig || null);
      } catch (err) {
        console.error("Failed to load settings for Friday Deals:", err);
        setFridaySaleEnabled(false);
      }
    };
    fetchSettings();
  }, []);

  const isPreview = typeof window !== "undefined" && window.location.search.includes("preview=friday");
  const showSection = fridaySaleEnabled === true && (isFriday || isPreview);

  if (fridaySaleEnabled === null) {
    return null;
  }

  if (!showSection) {
    return null;
  }

  const activeCategories = (fridaySaleConfig && Array.isArray(fridaySaleConfig) && fridaySaleConfig.length === 4)
    ? fridaySaleConfig.map((item, idx) => {
        let href = "/shop";
        if (item.type === "subcategory" && item.slug) {
          href = `/shop?sub=${item.slug}`;
        } else if (item.slug) {
          href = `/shop?category=${item.slug}`;
        }
        if (item.discount > 0) {
          href += `${href.includes("?") ? "&" : "?"}minDiscount=${item.discount}`;
        }

        // Live Category Name fallback: if Category or Subcategory changes name, reflect it!
        let resolvedTitle = item.title;
        if (item.type === "subcategory" && item.slug) {
          const sub = apiSubCategories.find((s) => s.slug === item.slug);
          if (sub) resolvedTitle = sub.title;
        } else if (item.slug) {
          const cat = apiCategories.find((c) => c.slug === item.slug);
          if (cat) resolvedTitle = cat.title;
        }

        const gradients = [
          "from-purple-500/5 to-indigo-500/5",
          "from-blue-500/5 to-cyan-500/5",
          "from-emerald-500/5 to-teal-500/5",
          "from-rose-500/5 to-orange-500/5",
        ];

        return {
          number: item.number || `0${idx + 1}`,
          title: resolvedTitle,
          subtitle: item.subtitle,
          image: item.image || "/images/gamejoysticnew.png",
          bgGradient: gradients[idx % gradients.length],
          href,
        };
      })
    : categories;

  return (
    <section className="w-full py-6 lg:py-10 bg-white">
      <div className="lg:mx-auto lg:max-w-7xl lg:px-8 px-3">
        <div
          className="relative overflow-hidden rounded-2xl py-10 px-6 lg:py-14 lg:px-16 border border-zinc-100/80 shadow-sm"
          style={{
            background: "linear-gradient(to bottom right, #ffffff, #fafafa)",
          }}
        >
          {/* Extremely subtle transparent brand pattern overlay */}
          <div
            className="absolute inset-0 opacity-[0.015] pointer-events-none z-0"
            style={{
              backgroundImage: "url('/images/logo-kit/brand-pattern-white-transparent.png')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          />

          <div className="relative z-10" ref={sectionRef}>

            {/* ── Header row ── */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 lg:gap-12 mb-10 lg:mb-14">

              {/* Left: badge + headline */}
              <div className="flex-1">
                <motion.div
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full font-black uppercase tracking-[3px] text-[10px] lg:text-[11px] border border-orange-500/20 bg-orange-50 text-orange-600 shadow-sm shadow-orange-500/5"
                  variants={badgeVariant}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                >
                  
                  Every Friday
                </motion.div>

                <motion.h2
                  className="mt-4 text-[36px] leading-[0.9] sm:text-[44px] lg:text-[52px] font-black tracking-tight text-zinc-900 uppercase"
                  variants={headlineVariant}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                >
                  Lazy Friday
                  <span className="block mt-1 text-[#FF6A00]">Deals.</span>
                </motion.h2>
              </div>

              {/* Right: description + CTA */}
              <div className="lg:w-[360px] flex flex-col gap-4">
                <motion.p
                  className="text-[13px] lg:text-[14px] leading-relaxed font-semibold text-zinc-500"
                  variants={descVariant}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                >
                  Kick back and save big. Every Friday we drop exclusive, high-value discounts on fan-favourite gadgets.
                </motion.p>

                <Link href="/shop" className="self-start">
                  <motion.button
                    className="flex items-center gap-2 lg:gap-3 rounded-xl px-6 py-3 font-bold text-xs uppercase tracking-[2px] text-white bg-[#FF6A00] hover:bg-[#e05a00] transition-all duration-300 shadow-md shadow-orange-600/10"
                    variants={ctaVariant}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Browse Friday Picks
                    <span>→</span>
                  </motion.button>
                </Link>
              </div>
            </div>

            {/* ── Cards grid — 2 cols on mobile, 4 on xl ── */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
              {activeCategories.map((item, i) => (
                <Link href={item.href} key={i} className="block group">
                  <motion.div
                    custom={i}
                    variants={cardVariant}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    whileHover={{ y: -6 }}
                    transition={{ type: "spring", stiffness: 300, damping: 24 }}
                    className="relative overflow-hidden rounded-2xl h-[220px] sm:h-[260px] lg:h-[340px] border border-zinc-100 bg-white transition-all duration-300 shadow-sm group-hover:shadow-xl flex flex-col justify-between p-5 lg:p-7"
                  >
                    {/* Soft ambient background gradient */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${item.bgGradient} opacity-60 group-hover:opacity-80 transition-opacity duration-300 z-0`} />

                    {/* Top: Number & Deal Tag */}
                    <div className="relative z-10 flex items-center justify-between">
                      <span className="text-[24px] sm:text-[28px] lg:text-[36px] font-black text-zinc-100 group-hover:text-orange-500/20 transition-colors duration-300 leading-none">
                        {item.number}
                      </span>
                      <span className="text-[8px] lg:text-[9px] font-extrabold uppercase tracking-wider text-orange-600 bg-orange-50 px-2 py-0.5 rounded border border-orange-100">
                        Friday Deal
                      </span>
                    </div>

                    {/* Center: Premium Transparent Product Image */}
                    <div className="relative z-10 my-auto flex items-center justify-center h-[90px] sm:h-[110px] lg:h-[160px] w-full">
                      <motion.div
                        className="relative h-full w-full max-w-[85%]"
                        whileHover={{ scale: 1.08, y: -4 }}
                        transition={{ type: "spring", stiffness: 260, damping: 20 }}
                      >
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          sizes="(max-width: 640px) 110px, (max-width: 1024px) 130px, 180px"
                          priority
                          unoptimized={typeof item.image === 'string' && (item.image.startsWith('http://') || item.image.startsWith('https://'))}
                          className="object-contain drop-shadow-md"
                        />
                      </motion.div>
                    </div>

                    {/* Bottom details */}
                    <div className="relative z-10 mt-auto">
                      <div className="text-[9px] lg:text-[10px] font-extrabold uppercase tracking-widest text-zinc-400">
                        {item.title}
                      </div>
                      <h3 className="mt-0.5 text-xs sm:text-sm lg:text-[17px] font-black leading-tight text-zinc-900 group-hover:text-orange-600 transition-colors duration-300">
                        {item.subtitle}
                      </h3>
                      <div className="mt-2.5 flex items-center gap-1 text-[9px] lg:text-[10px] font-bold uppercase tracking-wider text-orange-600">
                        <span>Shop now</span>
                        <span className="transform group-hover:translate-x-1 transition-transform duration-300">→</span>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}