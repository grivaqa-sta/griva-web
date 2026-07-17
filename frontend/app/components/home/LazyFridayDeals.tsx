"use client";

import { motion } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { getSettingsApi } from "@/app/utils/api";
import { useCategories, useSubCategories } from "@/app/hooks/useCategories";
import { Clock } from "lucide-react";
import { useAllProducts } from "@/app/hooks/useProducts";

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
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  const { categories: apiCategories } = useCategories();
  const { subCategories: apiSubCategories } = useSubCategories();
  const { products } = useAllProducts();

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

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      // End of today (midnight 23:59:59)
      const target = new Date();
      target.setHours(23, 59, 59, 999);
      
      const difference = target.getTime() - now.getTime();
      if (difference <= 0) {
        return { hours: 0, minutes: 0, seconds: 0 };
      }
      
      return {
        hours: Math.floor(difference / (1000 * 60 * 60)),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const isPreview = typeof window !== "undefined" && window.location.search.includes("preview=friday");
  const showSection = isFriday || isPreview;

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
          discount: item.discount,
        };
      })
    : categories.map(c => ({ ...c, discount: 35 }));

  return (
    <section className="w-full py-6 lg:py-10 bg-white">
      <div className="lg:mx-auto lg:max-w-7xl lg:px-8 px-3">
        <div className="relative overflow-hidden rounded-3xl border border-orange-100 bg-gradient-to-br from-white via-orange-50/15 to-zinc-50/30 flex flex-col shadow-sm">
          
          {/* Faint large brand name watermark in the center background */}
          <div className="absolute top-[28%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[90px] sm:text-[160px] lg:text-[230px] font-black text-orange-950/[0.01] tracking-[15px] sm:tracking-[25px] uppercase select-none pointer-events-none z-0">
            GRIVA
          </div>

          {/* Subtle brand pattern watermark overlay covering the entire container */}
          <div
            className="absolute inset-0 opacity-[0.012] pointer-events-none z-0"
            style={{
              backgroundImage: "url('/images/logo-kit/brand-pattern-white-transparent.png')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          />

          {/* Elegant ambient orange glowing blobs */}
          <div className="absolute top-[-50px] right-[-50px] w-96 h-96 bg-gradient-to-b from-orange-500/[0.04] to-transparent rounded-full blur-3xl pointer-events-none z-0" />
          <div className="absolute bottom-[-100px] left-[-50px] w-96 h-96 bg-gradient-to-t from-orange-400/[0.04] to-transparent rounded-full blur-3xl pointer-events-none z-0" />

          {/* Top Half: Header Section */}
          <div className="relative z-10 overflow-hidden px-6 py-12 lg:px-16 lg:py-16 flex flex-col items-center border-b border-orange-100/50" ref={sectionRef}>
            
            {/* Badge */}
            <motion.div
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full font-black uppercase tracking-[2px] text-[10px] lg:text-[11px] border border-orange-500/20 bg-orange-50 text-orange-600 shadow-sm shadow-orange-500/5"
              variants={badgeVariant}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <SmallLightning />
              FRIDAY ONLY
            </motion.div>

            {/* Title: Italicized bold uppercase FRIDAY FLASH DEALS */}
            <motion.h2
              className="mt-4 text-[30px] xs:text-[38px] sm:text-[54px] lg:text-[66px] font-black tracking-tight text-zinc-900 uppercase italic leading-none"
              variants={headlineVariant}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              FRIDAY <span className="text-[#FF6A00]">FLASH DEALS</span>
            </motion.h2>

            {/* Subtitle with decorative lines */}
            <motion.div 
              className="flex items-center justify-center gap-4 mt-3"
              variants={descVariant}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <div className="h-[1px] w-8 sm:w-16 bg-gradient-to-r from-transparent to-orange-500/40" />
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-[3.5px] text-orange-600">UP TO 40% OFF</span>
              <div className="h-[1px] w-8 sm:w-16 bg-gradient-to-l from-transparent to-orange-500/40" />
            </motion.div>

            {/* Real Countdown timer */}
            <motion.div
              className="mt-7 flex flex-col xs:flex-row items-center gap-3.5 xs:gap-4 bg-white/80 backdrop-blur-md border border-orange-100 rounded-2xl px-5 py-3 shadow-sm"
              variants={ctaVariant}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <span className="flex items-center gap-1.5 text-[10px] font-black tracking-wider uppercase text-zinc-400 xs:border-r xs:border-zinc-100 xs:pr-4">
                <Clock className="w-3.5 h-3.5 text-orange-500 animate-pulse" /> ENDS IN
              </span>
              <div className="flex items-center gap-3.5">
                <div className="flex flex-col items-center min-w-[28px]">
                  <span className="text-lg font-black text-zinc-800 leading-none tracking-tight">{String(timeLeft.hours).padStart(2, '0')}</span>
                  <span className="text-[8px] font-black text-zinc-400 uppercase mt-0.5 tracking-wider">HRS</span>
                </div>
                <span className="text-orange-500 font-black animate-pulse leading-none mb-3">:</span>
                <div className="flex flex-col items-center min-w-[28px]">
                  <span className="text-lg font-black text-zinc-800 leading-none tracking-tight">{String(timeLeft.minutes).padStart(2, '0')}</span>
                  <span className="text-[8px] font-black text-zinc-400 uppercase mt-0.5 tracking-wider">MINS</span>
                </div>
                <span className="text-orange-500 font-black animate-pulse leading-none mb-3">:</span>
                <div className="flex flex-col items-center min-w-[28px]">
                  <span className="text-lg font-black text-zinc-800 leading-none tracking-tight">{String(timeLeft.seconds).padStart(2, '0')}</span>
                  <span className="text-[8px] font-black text-zinc-400 uppercase mt-0.5 tracking-wider">SECS</span>
                </div>
              </div>
            </motion.div>

            {/* Button */}
            <Link href="/shop" className="mt-6">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="px-8 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs uppercase tracking-[2px] rounded-xl shadow-lg shadow-orange-500/25 flex items-center gap-2 transition-all cursor-pointer border-none"
              >
                SHOP ALL DEALS →
              </motion.button>
            </Link>
          </div>

          {/* Bottom Half: Unified Premium Cards Grid */}
          <div className="relative z-10 p-5 sm:p-6 lg:p-10">
            {/* ── Cards grid — 2 cols on mobile, 4 on xl ── */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-3.5 lg:gap-6">
              {activeCategories.map((item, i) => {
                const discountVal = item.discount || 35;

                return (
                  <Link href={item.href} key={i} className="block group">
                    <motion.div
                      custom={i}
                      variants={cardVariant}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true }}
                      whileHover={{ y: -6 }}
                      transition={{ type: "spring", stiffness: 300, damping: 24 }}
                      className="relative overflow-hidden rounded-2xl h-[240px] xs:h-[260px] sm:h-[290px] lg:h-[340px] border border-zinc-200/60 bg-white transition-all duration-300 shadow-sm group-hover:shadow-md group-hover:border-orange-500/25 flex flex-col justify-between p-3.5 sm:p-5 lg:p-6"
                    >
                      {/* Soft ambient gradient overlay on hover */}
                      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/[0.01] to-amber-500/[0.01] group-hover:from-orange-500/[0.03] group-hover:to-amber-500/[0.03] transition-colors duration-300 z-0" />

                      {/* Top: Number & Deal Tag */}
                      <div className="relative z-10 flex items-center justify-between">
                        <span className="text-[20px] sm:text-[28px] lg:text-[36px] font-black text-zinc-100 group-hover:text-orange-500/10 transition-colors duration-300 leading-none">
                          {item.number}
                        </span>
                        <span className="text-[7.5px] sm:text-[8px] lg:text-[9px] font-extrabold uppercase tracking-wider text-orange-600 bg-orange-50 px-2 py-0.5 rounded border border-orange-100 shadow-sm">
                          {discountVal}% OFF
                        </span>
                      </div>

                      {/* Center: Premium Product Image */}
                      <div className="relative z-10 my-auto mt-4 flex items-center justify-center h-[90px] sm:h-[110px] lg:h-[150px] w-full">
                        <motion.div
                          className="relative h-full w-full max-w-[75%] z-10"
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
                            className="object-contain drop-shadow-sm"
                          />
                        </motion.div>
                      </div>

                      {/* Bottom details */}
                      <div className="relative z-10 mt-auto flex items-end justify-between gap-1.5">
                        <div className="flex-1 min-w-0">
                          <div className="text-[7.5px] sm:text-[9px] font-black uppercase tracking-wider text-zinc-400 truncate">
                            {item.title}
                          </div>
                          <h3 className="mt-0.5 text-[11px] sm:text-[13px] lg:text-sm font-extrabold leading-tight text-zinc-900 group-hover:text-orange-600 transition-colors duration-300 truncate">
                            {item.subtitle}
                          </h3>
                          <div className="mt-1 text-[8.5px] sm:text-[9px] lg:text-[10px] font-bold uppercase tracking-wider text-orange-600 flex items-center gap-1">
                            <span>Shop now</span>
                            <span>→</span>
                          </div>
                        </div>
                        
                        {/* Circle Arrow on bottom right */}
                        <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-zinc-50 border border-zinc-150 flex items-center justify-center text-zinc-400 group-hover:bg-orange-500 group-hover:text-white group-hover:border-orange-500 transition-all duration-300 shadow-sm cursor-pointer">
                          <span className="text-xs sm:text-sm font-bold">→</span>
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                );
              })}
            </div>

            {/* Footer line details */}
            <div className="flex items-center justify-center gap-4 mt-8 lg:mt-10">
              <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-zinc-200" />
              <Link href="/shop" className="text-[9px] sm:text-[11px] font-black uppercase tracking-[2px] text-zinc-500 hover:text-orange-600 flex items-center gap-1.5 transition-colors">
                BROWSE ALL FRIDAY DEALS <span>→</span>
              </Link>
              <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-zinc-200" />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}