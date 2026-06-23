"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Category } from "@/app/types/types";
import { categoryService } from "@/app/services/category.service";
// import { categoryService } from "@/services/categoryService"; // adjust path as needed
// import { Category } from "@/types/types"; // adjust path as needed

const isValidImageSrc = (src?: string | null) => {
  if (!src || typeof src !== 'string') return false;
  const trimmed = src.trim();
  if (trimmed === '') return false;
  return trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('/') || trimmed.startsWith('data:');
};


const GAP = 16;
const INTERVAL = 1200;

function getVisibleCards(width: number): number {
  if (width < 640) return 3;
  if (width < 1024) return 3;
  return 5;
}

export default function CategorySection() {
  // ── API state ──────────────────────────────────────────────────────────────
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    categoryService
      .getCategories()
      .then((data: Category[]) =>
        // filter out inactive categories before rendering
        setCategories(data.filter((c) => c.is_active))
      )
      .catch((err: unknown) => console.error("Failed to fetch categories:", err))
      .finally(() => setIsLoading(false));
  }, []);

  console.log("categories", categories)
  // ──────────────────────────────────────────────────────────────────────────

  const TOTAL_CARDS = categories.length;
  const loopedCards = [...categories, ...categories, ...categories];

  const containerRef = useRef<HTMLDivElement>(null);
  const indexRef = useRef(0);
  const cardWidthRef = useRef(0);

  const [cardWidth, setCardWidth] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  const [transition, setTransition] = useState(true);
  const [visibleCards, setVisibleCards] = useState(5);
  const [isMounted, setIsMounted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const [dragStart, setDragStart] = useState<number | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsCollapsed(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleResize = useCallback(() => {
    const vw = window.innerWidth;
    const newVisibleCards = getVisibleCards(vw);
    setVisibleCards(newVisibleCards);

    if (containerRef.current) {
      const totalWidth = containerRef.current.offsetWidth;
      const cw = (totalWidth - GAP * (newVisibleCards - 1)) / newVisibleCards;
      setCardWidth(cw);
      cardWidthRef.current = cw;
    }
  }, []);

  useEffect(() => {
    setIsMounted(true);
    const timeout = setTimeout(() => { handleResize(); }, 50);
    window.addEventListener("resize", handleResize);
    return () => {
      clearTimeout(timeout);
      window.removeEventListener("resize", handleResize);
    };
  }, [handleResize]);

  // Re-run resize once categories have loaded so cardWidth is computed correctly
  useEffect(() => {
    if (!isLoading && categories.length > 0) {
      setTimeout(handleResize, 50);
    }
  }, [isLoading, categories.length, handleResize]);

  useEffect(() => {
    if (!cardWidth || isPaused || TOTAL_CARDS === 0) return;

    const interval = setInterval(() => {
      indexRef.current += 1;
      const cardStep = cardWidthRef.current + GAP;

      setTransition(true);
      setTranslateX(indexRef.current * cardStep);

      if (indexRef.current >= TOTAL_CARDS) {
        setTimeout(() => {
          setTransition(false);
          indexRef.current = 0;
          setTranslateX(0);
        }, 500);
      }
    }, INTERVAL);

    return () => clearInterval(interval);
  }, [cardWidth, isPaused, TOTAL_CARDS]);

  const handleSwipe = (diff: number) => {
    const cardStep = cardWidthRef.current + GAP;

    if (diff > 50) {
      indexRef.current = Math.max(0, indexRef.current - 1);
      setTransition(true);
      setTranslateX(indexRef.current * cardStep);
    }

    if (diff < -50) {
      indexRef.current += 1;
      setTransition(true);
      setTranslateX(indexRef.current * cardStep);

      if (indexRef.current >= TOTAL_CARDS) {
        setTimeout(() => {
          setTransition(false);
          indexRef.current = 0;
          setTranslateX(0);
        }, 500);
      }
    }
  };

  if (isLoading || categories.length === 0) return null;

  return (
    <div>
      {/* Mobile — sticky categories */}
      <div
        id="categories-section"
        className={`${isCollapsed ? "fixed" : "sticky"} top-[92px] z-30   bg-white block sm:hidden w-full overflow-x-auto no-scrollbar [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] transition-all duration-300 ease-in-out px-2 py-3`}
      >
        <div className="flex gap-3 min-w-max justify-around items-center">
          {categories.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="flex flex-col items-center  text-center shrink-0 group transition-all duration-300 ease-in-out"
             
            >
              <div
                className="relative overflow-hidden border-none  transition-all duration-300 ease-in-out flex-shrink-0 flex items-center justify-center"
                style={{
                  width: isCollapsed ? 0 : 36,
                  height: isCollapsed ? 0 : 36,
                  opacity: isCollapsed ? 0 : 1,
                  marginBottom: isCollapsed ? 0 : 6,
                  borderWidth: isCollapsed ? 0 : 1,
                }}
              >
                {isValidImageSrc(item.mobile_image_url) && (
                  <Image
                    src={item.mobile_image_url!.trim()}
                    alt={item.title}
                    fill
                    sizes="36px"
                    className="object-fit"
                  />
                )}
              </div>
              <span className="text-[11px] font-semibold text-gray-700 tracking-tight transition-colors duration-300 group-hover:text-orange-500 max-w-[72px] truncate block text-center">
                {item.title}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Desktop/Tablet — carousel */}
      <section className="hidden sm:block w-full py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div
            ref={containerRef}
            className="w-full overflow-hidden"
            style={{
              visibility: isMounted && cardWidth > 0 ? "visible" : "hidden",
              height: 120,
            }}
          >
            <div
              style={{
                display: "flex",
                gap: GAP,
                transform: `translateX(-${translateX}px)`,
                transition: transition ? "transform 0.5s ease-in-out" : "none",
                willChange: "transform",
                cursor: "grab",
                touchAction: "pan-y",
              }}
              onPointerDown={(e) => {
                setDragStart(e.clientX);
                setIsPaused(true);
              }}
              onPointerUp={(e) => {
                if (dragStart === null) return;
                handleSwipe(e.clientX - dragStart);
                setDragStart(null);
                setIsPaused(false);
              }}
            >
              {loopedCards.map((item, i) => (
                <Link
                  key={`${item.id}-${i}`}
                  href={item.href}
                  className="group relative flex-shrink-0 overflow-hidden rounded-2xl bg-zinc-100"
                  style={{ width: cardWidth || "auto", height: 120 }}
                  onMouseEnter={() => setIsPaused(true)}
                  onMouseLeave={() => setIsPaused(false)}
                >
                  {isValidImageSrc(item.image_url) && (
                    <Image
                      src={item.image_url!.trim()}           // ✅ image_url from API type
                      alt={item.title}
                      fill
                      sizes={visibleCards === 3 ? "33vw" : "20vw"}
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <h3 className="text-sm text-center font-bold leading-tight text-white transition-colors duration-300 group-hover:text-orange-400">
                      {item.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}