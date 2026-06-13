"use client";

import { motion } from "framer-motion";

const categories = [
  {
    icon: "🎮",
    label: "Gaming",
    discount: "35% off",
    badge: "Hot Deal",
    featured: false,
  },
  {
    icon: "🎧",
    label: "Audio",
    discount: "40% off",
    badge: "Best Value",
    featured: true,
  },
  {
    icon: "📱",
    label: "Accessories",
    discount: "30% off",
    badge: "New Drop",
    featured: false,
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.2 },
  },
};

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 36, scale: 0.97 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, delay: i * 0.1, ease },
  }),
};

export default function LazyFridayDeals() {
  return (
    <section className="w-full py-5">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Outer card: column on mobile, row on desktop */}
        <div className="relative overflow-hidden flex flex-col lg:flex-row lg:items-center lg:gap-8 rounded-2xl border border-gray-100 bg-white shadow-sm">

          {/* ── HERO BLOCK ── */}
          <motion.div
            className="relative shrink-0 lg:max-w-sm px-6 pt-6 pb-0 lg:py-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Eyebrow pill */}
            <motion.div
              variants={fadeUp}
              className="mb-3 lg:mb-6 inline-flex items-center rounded-full bg-orange-100 px-4 py-1.5"
            >
              <span className="text-[8px] font-bold uppercase tracking-widest text-orange-500">
                Every Friday
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={fadeUp}
              className="mb-2 lg:mb-4 text-[26px] lg:text-[32px] font-black leading-[1.0] tracking-tighter text-gray-950"
            >
              Lazy Friday Deals
            </motion.h1>

            {/* Subtext */}
            <motion.p
              variants={fadeUp}
              className="mb-4 lg:mb-8 max-w-sm text-sm leading-relaxed text-gray-400"
            >
              Kick back and save big. Every Friday we drop exclusive discounts on fan&#8209;favourite gadgets.
            </motion.p>

            {/* CTA button — hidden on mobile, visible on desktop */}
            <motion.div variants={fadeUp} className="hidden lg:block">
              <motion.a
                href="#picks"
                whileHover={{ scale: 1.03, boxShadow: "0 10px 30px rgba(249,115,22,0.4)" }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 320, damping: 22 }}
                className="inline-flex items-center gap-3 rounded-full bg-orange-500 px-7 py-3.5 text-[14px] font-bold text-white shadow-[0_4px_18px_rgba(249,115,22,0.3)] hover:bg-orange-600 transition-colors duration-200"
              >
                Browse Friday Picks
                <motion.span
                  animate={{ x: [0, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }}
                  className="inline-flex items-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </motion.span>
              </motion.a>
            </motion.div>
          </motion.div>

          {/* ── CARDS BLOCK ── */}
          <div
            id="picks"
            className="grid grid-cols-2 lg:grid-cols-3 flex-1 gap-3 px-4 pt-5 pb-3 lg:px-6 lg:py-8 lg:gap-4"
          >
            {categories.map((cat, i) => (
              <motion.div
                key={cat.label}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                whileHover={{
                  y: -6,
                  boxShadow: "0 16px 40px rgba(249,115,22,0.16)",
                  borderColor: "#f97316",
                }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 260, damping: 22 }}
                className={[
                  "relative cursor-pointer overflow-hidden rounded-2xl border pt-8 pb-5 px-4 flex flex-col items-center text-center",
                  i === 2 ? "hidden lg:flex" : "flex",
                  cat.featured
                    ? "border-orange-300 bg-orange-50 shadow-[0_4px_20px_rgba(249,115,22,0.1)]"
                    : "border-gray-150 bg-white shadow-sm",
                ].join(" ")}
                style={{ borderColor: cat.featured ? "#fdba74" : "#f3f4f6" }}
              >
                {/* Featured top glow */}
                {cat.featured && (
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -top-12 left-1/2 h-24 w-44 -translate-x-1/2"
                    style={{
                      background:
                        "radial-gradient(ellipse, rgba(249,115,22,0.18) 0%, transparent 70%)",
                    }}
                  />
                )}

                {/* Badge */}
                <motion.span
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.1, duration: 0.35, ease }}
                  className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full border border-orange-200 bg-white px-3 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-orange-500 shadow-sm whitespace-nowrap"
                >
                  {cat.badge}
                </motion.span>

                {/* Icon */}
                <motion.div
                  className="mb-3 lg:mb-4 text-4xl lg:text-5xl leading-none"
                  whileHover={{ scale: 1.2, rotate: -5 }}
                  transition={{ type: "spring", stiffness: 300, damping: 14 }}
                >
                  {cat.icon}
                </motion.div>

                {/* Label */}
                <p className="mb-1.5 lg:mb-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  {cat.label}
                </p>

                {/* Discount */}
                <p className="mb-4 lg:mb-6 text-[22px] lg:text-[clamp(30px,4vw,38px)] font-black leading-none tracking-tighter text-orange-500">
                  {cat.discount}
                </p>

                {/* Shop now */}
                <motion.button
                  whileHover={{
                    backgroundColor: "#f97316",
                    color: "#ffffff",
                    borderColor: "#f97316",
                  }}
                  whileTap={{ scale: 0.96 }}
                  transition={{ duration: 0.16 }}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 lg:px-5 lg:py-2.5 text-[11px] lg:text-[13px] font-semibold text-gray-600"
                >
                  Shop now →
                </motion.button>
              </motion.div>
            ))}
          </div>

          {/* ── MOBILE-ONLY FULL WIDTH CTA BUTTON ── */}
          <motion.div
            className="block lg:hidden px-4 pb-5"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4, ease }}
          >
            <motion.a
              href="#picks"
              whileTap={{ scale: 0.97 }}
              className="flex w-full items-center justify-center gap-3 rounded-[5px] bg-orange-500 px-7 py-3.5 text-[14px] font-bold text-white shadow-[0_4px_18px_rgba(249,115,22,0.3)] hover:bg-orange-600 transition-colors duration-200"
            >
              Browse Friday Picks
              <motion.span
                animate={{ x: [0, 5, 0] }}
                transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }}
                className="inline-flex items-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </motion.span>
            </motion.a>
          </motion.div>

        </div>
      </div>
    </section>
  );
}