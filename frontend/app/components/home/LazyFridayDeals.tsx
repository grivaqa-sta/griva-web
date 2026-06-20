"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const categories = [
  {
    number: "01.",
    title: "Gaming",
    subtitle: "35% off",
    icon: "lightning",
    dark: false,
    image: "/images/logo-kit/brand-pattern-custom1.png",
  },
  {
    number: "02.",
    title: "Audio",
    subtitle: "40% off",
    icon: "headphone",
    dark: true,
    image: "/images/logo-kit/brand-pattern-custom.jpeg",
  },
  {
    number: "03.",
    title: "Accessories",
    subtitle: "30% off",
    icon: "grid",
    dark: false,
    image: "/images/logo-kit/brand-pattern-custom1.png",
  },
  {
    number: "04.",
    title: "Exclusive",
    subtitle: "Special Deals",
    icon: "bag",
    dark: false,
    image: "/images/logo-kit/brand-pattern-custom1.png",
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
    transition: { delay: i * 0.12, duration: 0.65, ease },
  }),
};

function LightningIcon({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <path d="M18 4L8 18H16L14 28L24 14H16L18 4Z" fill="#FF6A00" />
    </svg>
  );
}

function HeadphoneIcon({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <path
        d="M6 20v-4a10 10 0 0120 0v4"
        stroke="#FF6A00"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <rect x="4" y="18" width="5" height="8" rx="2.5" fill="#FF6A00" />
      <rect x="23" y="18" width="5" height="8" rx="2.5" fill="#FF6A00" />
    </svg>
  );
}

function GridIcon({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <rect x="4" y="4" width="10" height="10" rx="2" fill="#FF6A00" />
      <rect x="18" y="4" width="10" height="10" rx="2" fill="#FF6A00" />
      <rect x="4" y="18" width="10" height="10" rx="2" fill="#FF6A00" />
      <rect x="18" y="18" width="10" height="10" rx="2" fill="#FF6A00" />
    </svg>
  );
}

function BagIcon({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <path d="M10 10h12l2 16H8L10 10z" fill="#FF6A00" />
      <path
        d="M12 10V8a4 4 0 018 0v2"
        stroke="#FF6A00"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

function SmallLightning() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M8 1L3 8H7L6 13L11 6H7L8 1Z" fill="#FF6A00" />
    </svg>
  );
}

function LightSweep() {
  return (
    <motion.div
      className="absolute inset-0 pointer-events-none z-10"
      initial={{ x: "-100%" }}
      whileHover={{ x: "100%" }}
      transition={{ duration: 0.65, ease: "easeInOut" }}
      style={{
        background:
          "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.12) 50%, transparent 70%)",
        width: "100%",
      }}
    />
  );
}

function CardHoverBg({ src }: { src: string }) {
  if (!src) return null;
  return (
    <div
      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-in-out pointer-events-none"
      style={{
        backgroundImage: `url('${src}')`,
        backgroundSize: "105%",
        backgroundPosition: "right",
        backgroundRepeat: "no-repeat",
      }}
    />
  );
}

function CategoryIcon({ icon, dark, small }: { icon: string; dark: boolean; small?: boolean }) {
  const bg = dark
    ? "border-gray-600 bg-transparent"
    : "border-[#FF6A00]/20 bg-[#FF6A00]/5";
  const size = small ? 22 : 32;
  const boxSize = small ? "w-10 h-10" : "w-14 h-14";

  return (
    <motion.div
      className={`${boxSize} rounded-[10px] flex items-center justify-center border ${bg}`}
      whileHover={{ scale: 1.14, rotate: -4 }}
      transition={{ type: "spring", stiffness: 320, damping: 18 }}
    >
      {icon === "lightning" && <LightningIcon size={size} />}
      {icon === "headphone" && <HeadphoneIcon size={size} />}
      {icon === "grid" && <GridIcon size={size} />}
      {icon === "bag" && <BagIcon size={size} />}
    </motion.div>
  );
}

export default function LazyFridayDeals() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-80px" });

  return (
    <section className="w-full py-4 lg:py-6">
      <div className="lg:mx-auto lg:max-w-7xl lg:px-8 px-3">
        <div
          className="relative overflow-hidden rounded-[10px] py-8 px-4 lg:py-12 lg:px-14"
          style={{
            backgroundImage: "url('/images/logo-kit/brand-pattern-white.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            backgroundColor: "#ffffff",
          }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "rgba(255,255,255,0.82)" }}
          />

          <div className="relative" ref={sectionRef}>

            {/* ── Header row ── */}
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 lg:gap-8 mb-7 lg:mb-12">

              {/* Left: badge + headline */}
              <div className="flex-1">
                <motion.div
                  className="inline-flex items-center gap-2 px-3 py-1.5 lg:px-4 lg:py-2 rounded-[8px] font-bold uppercase tracking-[3px] text-[10px] lg:text-[11px]"
                  style={{
                    backgroundColor: "#FF6A0010",
                    border: "1px solid #FF6A0033",
                    color: "#FF6A00",
                  }}
                  variants={badgeVariant}
                  initial="hidden"
                  animate={inView ? "visible" : "hidden"}
                >
                  <SmallLightning />
                  Every Friday
                </motion.div>

                <motion.h1
                  className="mt-3 lg:mt-5 text-[38px] leading-[0.88] sm:text-[48px] lg:text-[64px] font-black tracking-tight text-black"
                  variants={headlineVariant}
                  initial="hidden"
                  animate={inView ? "visible" : "hidden"}
                >
                  Lazy Friday
                  <span className="block" style={{ color: "#FF6A00" }}>Deals.</span>
                </motion.h1>
              </div>

              {/* Right: description + CTA */}
              <div className="lg:w-[320px] flex flex-col gap-2 lg:pb-1">
                <motion.p
                  className="text-[13px] lg:text-[14px] leading-6 font-medium"
                  style={{ color: "#6E6E6E" }}
                  variants={descVariant}
                  initial="hidden"
                  animate={inView ? "visible" : "hidden"}
                >
                  Kick back and save big. Every Friday we drop exclusive
                  discounts on fan‑favourite gadgets.
                </motion.p>

                <motion.button
                  className="self-start flex items-center gap-2 lg:gap-3 rounded-[10px] px-5 py-2 lg:px-7 font-bold text-[11px] lg:text-[13px] uppercase tracking-[2px] text-white overflow-hidden relative"
                  style={{ backgroundColor: "#FF6A00" }}
                  variants={ctaVariant}
                  initial="hidden"
                  animate={inView ? "visible" : "hidden"}
                  whileHover={{ scale: 1.05, backgroundColor: "#e05a00" }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: "spring", stiffness: 340, damping: 20 }}
                >
                  Browse Friday Picks
                  <motion.span
                    className="text-base lg:text-lg"
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 18 }}
                  >
                    →
                  </motion.span>
                </motion.button>
              </div>
            </div>

            {/* ── Cards grid — 2 cols on mobile, 4 on xl ── */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 lg:gap-5">
              {categories.map((item, i) => (
                <motion.div
                  key={i}
                  custom={i}
                  variants={cardVariant}
                  initial="hidden"
                  animate={inView ? "visible" : "hidden"}
                  whileHover={{ y: -8, scale: 1.025 }}
                  whileTap={{ scale: 0.975, y: -3 }}
                  transition={{ type: "spring", stiffness: 280, damping: 22 }}
                  className={`group relative overflow-hidden rounded-[10px] h-[190px] sm:h-[240px] lg:h-[340px] border cursor-pointer ${item.dark
                      ? "bg-[#141414] border-[#1F1F1F] text-white hover:border-[#FF6A00]"
                      : "bg-white border-gray-100 shadow-sm hover:shadow-lg hover:border-[#FF6A00]/30"
                    }`}
                >
                  <CardHoverBg src={item.image} />

                  <div
                    className={`absolute inset-0 pointer-events-none transition-opacity duration-500 ${item.dark
                        ? "opacity-60 group-hover:opacity-70 bg-gradient-to-t from-black via-black/40 to-black/10"
                        : "opacity-0 group-hover:opacity-50 bg-gradient-to-t from-black"
                      }`}
                  />

                  <LightSweep />

                  <div className="relative z-10 flex flex-col h-full p-4 lg:p-7">

                    {/* Number */}
                    <div
                      className="text-[28px] sm:text-[38px] lg:text-[52px] font-black leading-none transition-colors duration-300"
                      style={{
                        color: item.dark ? "#FF6A00" : "#9E9E9E",
                      }}
                    >
                      {item.number}
                    </div>

                    <div className="flex-1" />

                    {/* Icon — smaller on mobile */}
                    <div className="lg:hidden">
                      <CategoryIcon icon={item.icon} dark={item.dark} small />
                    </div>
                    <div className="hidden lg:block">
                      <CategoryIcon icon={item.icon} dark={item.dark} />
                    </div>

                    {/* Title + Subtitle */}
                    <div className="mt-3 lg:mt-5">
                      <div
                        className="uppercase tracking-[3px] lg:tracking-[4px] text-[9px] lg:text-xs font-bold"
                        style={{ color: "#FF6A00" }}
                      >
                        {item.title}
                      </div>
                      <h3
                        className={`mt-1 lg:mt-2 text-[18px] sm:text-[22px] lg:text-[30px] font-black leading-none whitespace-nowrap transition-colors duration-300 ${item.dark
                            ? "text-white"
                            : "text-black group-hover:text-white"
                          }`}
                      >
                        {item.subtitle}
                      </h3>
                    </div>

                    {/* Shop now */}
                    <motion.button
                      className={`mt-3 lg:mt-5 flex items-center gap-1.5 lg:gap-2 font-semibold text-[11px] lg:text-sm transition-colors duration-300 ${item.dark
                          ? "text-gray-300 group-hover:text-white"
                          : "text-[#6E6E6E] group-hover:text-white"
                        }`}
                      whileHover={{ color: "#ffffff" }}
                    >
                      Shop now
                      <motion.span
                        className="text-sm lg:text-base"
                        style={{ color: "#FF6A00" }}
                        whileHover={{ x: 5 }}
                        transition={{ type: "spring", stiffness: 400, damping: 18 }}
                      >
                        →
                      </motion.span>
                    </motion.button>

                  </div>
                </motion.div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}