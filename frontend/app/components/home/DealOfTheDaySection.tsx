"use client";

import { ChevronLeft, ChevronRight, ShoppingCart, Loader2 } from "lucide-react";
import Image, { StaticImageData } from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Rating from "../rating/Rating";
import { useCountdown } from "@/app/hooks/useCountdown";
import { useCart } from "@/app/context/CartContext";
import { motion, AnimatePresence } from "framer-motion";
import dealOfDayService from "@/app/services/dealOfDay.service";
import { Deal } from "@/app/types/types";

export default function DealOfTheDaySection() {
  const { addToCart } = useCart();
  const router = useRouter();

  const [activeDeals, setActiveDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeal = async () => {
      try {
        const res = await dealOfDayService.getActiveDeal();
        if (res?.success && res?.data) {
          const data = Array.isArray(res.data) ? res.data : [res.data];
          const now = new Date();
          const validDeals = data.filter((deal: Deal) => {
            const start = new Date(deal.startDate);
            const end = new Date(deal.endDate);
            return now >= start && now <= end;
          });
          setActiveDeals(validDeals);
        } else {
          setActiveDeals([]);
        }
      } catch (err) {
        console.error("Error fetching deal of day", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDeal();
  }, []);

  const slides = activeDeals.map(deal => {
    const p = deal.product;
    const mainImg = p?.main_image_url;
    return {
      id: p?.id || deal.id,
      dealId: deal.id,
      title: deal.title || p?.title || "Deal of the Day",
      mainImage: mainImg ? (mainImg.startsWith('http') || mainImg.startsWith('/') ? mainImg : `http://localhost:8080${mainImg}`) : "/placeholder.png",
      thumbs: Array.isArray(p?.gallery_images) ? p.gallery_images.map((img: string) => img.startsWith('http') || img.startsWith('/') ? img : `http://localhost:8080${img}`) : [],
      price: `${Number(p?.price || 0).toFixed(2)}`,
      oldPrice: p?.old_price ? `${Number(p?.old_price).toFixed(2)}` : "",
      category: p?.subcategory?.name || "Special Offer",
      rating: p?.rating || 4.5,
      description: p?.short_description || p?.description || "Incredible savings on this exclusive deal.",
      badge: "DEAL OF THE DAY",
      hot: true,
      endDate: deal.endDate
    };
  });

  const [current, setCurrent] = useState<number>(0);
  const [activeImage, setActiveImage] = useState<string | StaticImageData | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [direction, setDirection] = useState<"next" | "prev">("next");

  const slide = slides[current];
  const { hours, mins, secs } = useCountdown(slide?.endDate || new Date().toISOString());

  const prev = (): void => {
    setDirection("prev");
    setCurrent((c) => (c - 1 + slides.length) % slides.length);
  };

  const next = (): void => {
    setDirection("next");
    setCurrent((c) => (c + 1) % slides.length);
  };

  useEffect(() => {
    setActiveImage(null);
  }, [current]);

  useEffect(() => {
    if (isPaused || slides.length <= 1) return;
    const timer = setInterval(() => { next(); }, 5000);
    return () => clearInterval(timer);
  }, [isPaused, current, slides.length]);

  const displayImage = activeImage || slide?.mainImage;

  const handleAddToCart = () => {
    if (!slide) return;
    addToCart({
      id: slide.id,
      title: slide.title,
      image: slide.mainImage,
      price: slide.price,
      category: slide.category,
    });
  };

  const handleBuyNow = () => {
    if (!slide) return;
    addToCart({
      id: slide.id,
      title: slide.title,
      image: slide.mainImage,
      price: slide.price,
      category: slide.category,
    });
    router.push("/checkout");
  };

  if (loading) {
    return (
      <section className="w-full py-5">
        <div className="mx-auto grid max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-64 items-center justify-center rounded-2xl border border-gray-100 bg-white">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          </div>
        </div>
      </section>
    );
  }

  if (!slides.length) return null;

  const timerBlocks = [
    { value: hours, label: "Hrs" },
    { value: mins, label: "Min" },
    { value: secs, label: "Sec" },
  ];

  return (
    <section className="w-full py-5">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 sm:px-6 lg:grid-cols-[280px_1fr] lg:px-8">

        {/* ── LEFT TIMER CARD — desktop only ── */}
        <div className="hidden lg:flex flex-col items-center justify-center rounded-2xl border border-orange-100 bg-orange-100 px-6 py-8 text-center shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-[3px] text-red-500">
            Only For Today
          </span>
          <h2 className="mt-2 text-xl font-bold text-gray-950">Deal Of The Day</h2>
          <p className="mt-2 max-w-sm text-xs leading-5 text-gray-500">
            Awesome lightning deals on premium consumer electronics. Act fast!
          </p>
          <div className="mt-3 flex items-center gap-3">
            {timerBlocks.map(({ value, label }) => (
              <div key={label} className="flex flex-col items-center">
                <div className="flex h-11 w-12 items-center justify-center rounded-[5px] bg-orange-600 shadow-md shadow-orange-500/10">
                  <span className="text-lg font-bold text-white">{String(value).padStart(2, "0")}</span>
                </div>
                <span className="mt-1.5 text-[9px] font-medium text-gray-400">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── PRODUCT CARD ── */}
        <div
          className="relative overflow-hidden rounded-[5px] border border-gray-100 bg-white shadow-sm touch-pan-y"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >
          {/* ── MOBILE ONLY: orange timer banner ── */}
          <div className="lg:hidden bg-orange-700 px-5 py-4 flex items-center justify-between gap-4">
            <div className="flex flex-col">
              <span className="text-[8px] font-black uppercase tracking-[2.5px]" style={{ color: "#ffd0b0" }}>
                Only For Today
              </span>
              <h2 className="text-[15px] font-black text-white leading-snug">
                Deal of the Day
              </h2>
              <p className="text-[8px] mt-0.5 leading-tight" style={{ color: "#ffc49a" }}>
                Lightning deals on electronics!
              </p>
            </div>
            <div className="flex items-center gap-1">
              {timerBlocks.map(({ value, label }, i) => (
                <div key={label} className="flex items-center gap-1">
                  <div className="flex flex-col items-center">
                    <div className="flex h-[38px] w-[38px] items-center justify-center rounded-[5px] bg-white">
                      <span className="text-[17px] font-black text-black leading-none">
                        {String(value).padStart(2, "0")}
                      </span>
                    </div>
                    <span className="mt-0.5 text-[7px] font-bold uppercase" style={{ color: "#ffc49a" }}>
                      {label}
                    </span>
                  </div>
                  {i < 2 && (
                    <span className="mb-4 text-[18px] font-black text-white/50 select-none">:</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ── SLIDE CONTENT ── */}
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, x: direction === "next" ? 40 : -40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction === "next" ? -40 : 40 }}
              transition={{ duration: 0.3 }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={(e, { offset }) => {
                if (offset.x < -50) next();
                else if (offset.x > 50) prev();
              }}
              className="flex w-full flex-col gap-4 p-4 lg:flex-row lg:gap-6 lg:p-6 cursor-grab active:cursor-grabbing"
            >
              {/* ── IMAGE SECTION ── */}
              <div className="flex shrink-0 items-start gap-3">
                {/* Thumbnails */}
                <div className="flex shrink-0 flex-col gap-2">
                  {slide.thumbs && slide.thumbs.length > 0 && slide.thumbs.slice(0, 3).map((image: any, index: number) => (
                    <div
                      key={index}
                      onClick={(e) => { e.stopPropagation(); setActiveImage(image); }}
                      className="flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center rounded-lg border transition-all"
                      style={{
                        borderColor: displayImage === image ? "#FF6A00" : "#f3f4f6",
                        backgroundColor: displayImage === image ? "#FF6A0010" : "#f9fafb",
                      }}
                      onMouseEnter={(e) => {
                        if (displayImage !== image)
                          e.currentTarget.style.borderColor = "#FF6A0040";
                      }}
                      onMouseLeave={(e) => {
                        if (displayImage !== image)
                          e.currentTarget.style.borderColor = "#f3f4f6";
                      }}
                    >
                      <Image src={image} alt="thumb" width={36} height={36} className="object-contain" style={{ width: "auto", height: "auto" }} />
                    </div>
                  ))}
                </div>

                {/* Main image */}
                <div className="relative mx-auto flex h-[220px] w-[220px] shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gray-50/50 p-4 pointer-events-none lg:mx-0 lg:h-[240px] lg:w-[240px]">
                  <Image
                    src={displayImage}
                    alt={slide.title}
                    fill
                    sizes="(max-width: 768px) 220px, 300px"
                    className="object-contain p-4 transition-all duration-300"
                  />
                </div>
              </div>

              {/* ── PRODUCT CONTENT ── */}
              <div className="flex w-full min-w-0 flex-col gap-3 lg:flex-1 lg:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className="rounded px-2 py-0.5 text-[9px] font-bold uppercase text-white bg-orange-600"
                      
                    >
                      {slide.badge}
                    </span>
                    {slide.hot && (
                      <span className="animate-pulse rounded bg-red-700 px-2 py-0.5 text-[9px] font-bold uppercase text-white">
                        HOT
                      </span>
                    )}
                  </div>
                  <p className="mt-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                    {slide.category}
                  </p>
                  <h3 className="mt-1 break-words text-base font-semibold leading-6 text-gray-900 transition-colors hover:text-orange-500 line-clamp-1 lg:line-clamp-2">
                    <Link href={`/product/${slide.id}`}>{slide.title}</Link>
                  </h3>
                  <div className="mt-2">
                    <Rating rating={slide.rating} />
                  </div>
                  <div className="mt-3 flex items-end gap-2">
                    <span className="text-2xl font-bold text-black "><span className="text-[10px] font-bold text-orange-500">QAR </span>{slide.price}</span>
                    <span className="text-xs text-gray-400 line-through mb-1"><span className="text-[10px]">QAR </span>{slide.oldPrice}</span>
                  </div>
                  <p className="hidden lg:block mt-3 break-words text-xs leading-relaxed text-gray-500 line-clamp-2 min-h-[40px]">
                    {slide.description}
                  </p>
                </div>

                <div className="z-10 mt-2 flex w-full gap-2 lg:w-[360px]">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleAddToCart(); }}
                    className="flex h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-[5px] hover:bg-orange-500 text-xs font-bold uppercase text-white shadow-md shadow-orange-500/20 transition bg-orange-600"
                  >
                    <ShoppingCart size={14} /> Add To Cart
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleBuyNow(); }}
                    className="flex h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-[5px]  text-xs font-bold uppercase text-white shadow-md shadow-gray-900/20 transition bg-black hover:bg-[#222]"
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Desktop nav arrows */}
          {slides.length > 1 && (
            <div className="absolute bottom-6 right-6 hidden lg:flex items-center gap-2">
              <button onClick={prev} className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white hover:border-orange-500 hover:text-orange-500">
                <ChevronLeft size={16} />
              </button>
              <button onClick={next} className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white hover:border-orange-500 hover:text-orange-500">
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Pagination Dots */}
      {slides.length > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`cursor-pointer rounded-full transition-all ${
                i === current ? "h-1 w-5 bg-orange-500" : "h-1 w-1 bg-gray-200"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}