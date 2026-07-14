"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Wallet, Star, Truck } from "lucide-react";
import { AnimatePresence, motion, Variants } from "framer-motion";
import { useBannerProducts, useGlobalSettings } from "@/app/hooks/useHomeData";
import { BannerProduct, HeroSlide } from "@/app/types/types";

function getCleanBadge(p: BannerProduct): string {
    if (p.tags && p.tags.length > 0) {
        const firstTag = p.tags[0];
        if (typeof firstTag === "string" && firstTag.trim()) {
            const tagParts = firstTag.split(",").map(t => t.trim()).filter(Boolean);
            if (tagParts.length > 0) {
                const candidate = tagParts[0];
                if (candidate.length < 15) {
                    return candidate;
                }
            }
        }
    }
    if (p.is_featured) return "Featured";
    if (p.is_best_seller) return "Best Seller";
    if (p.is_trending) return "Trending";
    return "Sale";
}

function mapProductToSlide(p: BannerProduct): HeroSlide {
    return {
        title: p.title,
        subtitle: p.short_description ?? "",
        badge: getCleanBadge(p),
        image: p.main_image_url,
        price: p.price,
        old_price: p.old_price,
        href: p.href ?? `/product/${p.slug}`,
        bg: p.banner_background_color ?? "#1a1a2e",
        mobile_ad_banner: p.mobile_ad_banner,
        desktop_ad_banner: p.desktop_ad_banner,
    };
}

function formatPrice(price?: string | number): string {
    if (!price) return "";
    const value = typeof price === "string" ? Number(price) : price;
    if (Number.isNaN(value)) return String(price);
    return value.toFixed(2);
}

function DesktopHeroBannerSkeleton() {
    return (
        <div className="hidden lg:block">
            <div className="lg:mx-auto lg:max-w-7xl lg:px-8 px-4">
                <div className="relative overflow-hidden lg:rounded-[10px] rounded-[10px] bg-gray-50/50 animate-pulse border border-gray-100/50">
                    <div className="relative z-10 flex flex-col lg:flex-row lg:h-[400px]">
                        {/* CONTENT */}
                        <div className="order-2 lg:order-1 flex w-full flex-col items-center lg:items-start justify-center px-6 py-8 sm:px-10 lg:w-1/2 lg:px-20 lg:py-10 text-center lg:text-left space-y-4">
                            <div className="h-5.5 w-24 bg-gray-200/80 rounded-[5px]" />
                            <div className="h-8 w-4/5 bg-gray-200/80 rounded" />
                            <div className="h-8 w-2/3 bg-gray-200/80 rounded" />
                            <div className="h-4 w-3/5 bg-gray-200/80 rounded mt-2" />
                            <div className="h-10 w-32 bg-gray-200/80 rounded mt-2" />
                            <div className="h-12 w-36 bg-gray-200/80 rounded-xl mt-4" />
                        </div>
                        {/* IMAGE */}
                        <div className="order-1 lg:order-2 relative flex flex-1 items-center justify-center pt-20 pb-6 lg:py-0">
                            <div className="relative h-[280px] w-[280px] lg:h-[320px] lg:w-[320px] bg-gray-200/80 rounded-2xl" />
                        </div>
                    </div>
                    {/* Extra Info */}
                    <div className="relative z-10 hidden lg:grid grid-cols-3 place-items-center gap-5 border-t border-gray-150 px-6 pb-8 pt-6 sm:px-10 lg:px-20">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className="h-5 w-5 bg-gray-200/80 rounded" />
                                <div className="space-y-1">
                                    <div className="h-3 w-20 bg-gray-200/80 rounded" />
                                    <div className="h-2.5 w-28 bg-gray-200/80 rounded" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

interface DesktopHeroBannerProps {
    bannerProducts?: any[];
    loading?: boolean;
}

export default function DesktopHeroBanner({ bannerProducts: propProducts, loading: propLoading }: DesktopHeroBannerProps = {}) {
    const hookResult = useBannerProducts();
    const loading = propLoading !== undefined ? propLoading : hookResult.loading;
    const bannerProducts = propProducts !== undefined ? propProducts : hookResult.bannerProducts;
    const { settings } = useGlobalSettings();
    const slides: HeroSlide[] = bannerProducts.map(mapProductToSlide);
    const [current, setCurrent] = useState(0);
    const freeShippingThreshold = settings?.freeShippingThreshold ?? 99;
    const busyRef = useRef(false);

    useEffect(() => {
        if (slides.length === 0) return;
        const timer = setInterval(() => {
            if (busyRef.current) return;
            setCurrent((prev) => (prev + 1) % slides.length);
        }, 4000);
        return () => clearInterval(timer);
    }, [slides.length]);

    if (loading || slides.length === 0) {
        return <DesktopHeroBannerSkeleton />;
    }

    const currentSlide = slides[current];

    const contentVariants: Variants = {
        initial: { opacity: 0, y: -20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 },
    };

    const imageVariants: Variants = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: 20 },
    };

    const priceShake: Variants = {
        shake: {
            scale: [1, 1.15, 1.2, 1.15, 1.1, 1.05, 1],
            rotate: [0, -3, 3, -2, 2, -1, 0],
            transition: { duration: 0.6, ease: "easeOut" },
        },
    };

    return (
        <div className="hidden lg:block">
            <div className="lg:mx-auto lg:max-w-7xl lg:px-8 px-4">
                <motion.div
                    animate={{ backgroundColor: currentSlide.bg }}
                    transition={{ duration: 0.7 }}
                    className="relative overflow-hidden lg:rounded-[10px] rounded-[10px]"
                >
                    <div className="absolute -left-20 top-0 h-72 w-72 rounded-full bg-orange-500/10 blur-3xl" />
                    <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />

                    <div className="relative z-10 flex flex-col lg:flex-row lg:h-[400px]">
                        <AnimatePresence mode="wait">
                            {currentSlide.desktop_ad_banner ? (
                                <motion.div
                                    key={`desktop-banner-${current}`}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.5 }}
                                    className="relative w-full h-[400px] cursor-pointer overflow-hidden lg:rounded-[10px]"
                                >
                                    <Link href={currentSlide.href} className="absolute inset-0">
                                        <Image
                                            src={currentSlide.desktop_ad_banner.startsWith('http') || currentSlide.desktop_ad_banner.startsWith('/') ? currentSlide.desktop_ad_banner : `http://localhost:8080${currentSlide.desktop_ad_banner}`}
                                            alt={currentSlide.title}
                                            fill
                                            priority
                                            className="object-cover lg:rounded-[10px]"
                                        />
                                    </Link>
                                </motion.div>
                            ) : (
                                <div key={current} className="contents">

                                    {/* IMAGE */}
                                    <motion.div
                                        variants={imageVariants}
                                        initial="initial"
                                        animate="animate"
                                        exit="exit"
                                        transition={{ duration: 0.5 }}
                                        className="order-1 lg:order-2 relative flex flex-1 items-center justify-center pt-20 pb-6 lg:py-0"
                                    >
                                        <div className="absolute h-52 w-52 lg:h-72 lg:w-72 rounded-full bg-orange-500/20 blur-3xl" />
                                        <div className="relative h-[220px] w-[220px] sm:h-[280px] sm:w-[280px] lg:h-[380px] lg:w-[380px] flex-shrink-0">
                                            <Image
                                                src={currentSlide.image}
                                                alt={currentSlide.title}
                                                fill
                                                sizes="(max-width: 640px) 220px, (max-width: 1024px) 280px, 380px"
                                                priority
                                                className="object-contain drop-shadow-2xl"
                                            />
                                        </div>
                                    </motion.div>

                                    {/* CONTENT */}
                                    <motion.div
                                        variants={contentVariants}
                                        initial="initial"
                                        animate="animate"
                                        exit="exit"
                                        transition={{ duration: 0.5 }}
                                        className="order-2 lg:order-1 flex w-full flex-col items-center lg:items-start justify-center px-6 py-8 sm:px-10 lg:w-1/2 lg:px-20 lg:py-10 text-center lg:text-left"
                                    >
                                        {/* BADGE */}
                                        <div className="mb-3 inline-flex rounded-[5px] bg-red-700 px-4 py-1">
                                            <span className="text-[10px] font-bold uppercase tracking-[2px] text-white">
                                                {currentSlide.badge}
                                            </span>
                                        </div>

                                        <h1 className="max-w-xl text-2xl font-black text-white sm:text-2xl lg:text-3xl tracking-wide">
                                            {currentSlide.title}
                                        </h1>
                                        <p className="max-w-lg text-sm text-gray-300 mt-2 lg:mt-3 line-clamp-2 leading-relaxed">
                                            {currentSlide.subtitle}
                                        </p>
                                        <div className="flex items-baseline gap-2 lg:gap-3 justify-center lg:justify-start">
                                            <span className="text-sm font-medium text-gray-300 lg:text-lg mr-1">From</span>
                                            <motion.span
                                                variants={priceShake}
                                                animate="shake"
                                                className="inline-block text-2xl font-black text-orange-400 lg:text-4xl"
                                            >
                                                <span className="text-[15px] font-bold mr-1">QAR</span>
                                                {formatPrice(currentSlide.price)}
                                            </motion.span>
                                            {currentSlide.old_price && Number(currentSlide.old_price) > 0 && Number(currentSlide.old_price) > Number(currentSlide.price) && (
                                                <span className="text-sm text-gray-400 line-through lg:text-lg ml-2">
                                                    QAR {formatPrice(currentSlide.old_price)}
                                                </span>
                                            )}
                                        </div>
                                        <div className="mt-8 w-full lg:w-fit">
                                            <Link
                                                href={currentSlide.href}
                                                className="flex h-12 w-full lg:w-fit items-center justify-center gap-2 rounded-xl bg-orange-500 px-7 text-[12px] font-bold uppercase tracking-wide text-white transition-all duration-300 hover:bg-orange-600"
                                            >
                                                Shop Now
                                                <ArrowRight size={16} />
                                            </Link>
                                        </div>
                                    </motion.div>

                                </div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Extra Info — Desktop only */}
                    <div className="relative z-10 hidden lg:grid grid-cols-3 place-items-center gap-5 border-t border-white/10 px-6 pb-8 pt-6 sm:px-10 lg:px-20">
                        <div className="flex items-center gap-3">
                            <Truck className="text-orange-400" size={20} />
                            <div>
                                <h4 className="text-sm font-bold text-white">Free Shipping</h4>
                                <p className="text-xs text-gray-400">On orders over QAR {freeShippingThreshold}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Wallet className="text-orange-400" size={20} />
                            <div>
                                <h4 className="text-sm font-bold text-white">Cash on Delivery</h4>
                                <p className="text-xs text-gray-400">Pay upon delivery</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Star className="text-orange-400" size={20} />
                            <div>
                                <h4 className="text-sm font-bold text-white">Top Rating</h4>
                                <p className="text-xs text-gray-400">Trusted quality</p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}