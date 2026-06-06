"use client";

import { categories } from "@/app/data/data";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Gamepad2, Tv, Speaker, Headphones, Smartphone, Laptop } from "lucide-react";

function getCategoryIcon(title: string, isCollapsed: boolean) {
  const iconClass = "text-gray-600 group-hover:text-orange-500 transition-colors duration-300 flex-shrink-0";
  const style = {
    width: isCollapsed ? 0 : 20,
    height: isCollapsed ? 0 : 20,
    opacity: isCollapsed ? 0 : 1,
    transition: "all 0.3s ease-in-out",
  };

  switch (title.toLowerCase()) {
    case "gaming":
      return <Gamepad2 style={style} className={iconClass} />;
    case "television":
      return <Tv style={style} className={iconClass} />;
    case "speakers":
      return <Speaker style={style} className={iconClass} />;
    case "headphones":
      return <Headphones style={style} className={iconClass} />;
    case "gadgets":
      return <Smartphone style={style} className={iconClass} />;
    case "laptops":
      return <Laptop style={style} className={iconClass} />;
    default:
      return null;
  }
}

const GAP = 16;
const INTERVAL = 1200;
const TOTAL_CARDS = categories.length;

const loopedCards = [...categories, ...categories, ...categories];

function getVisibleCards(width: number): number {
  if (width < 640) return 3;
  if (width < 1024) return 3;
  return 5;
}

export default function CategorySection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const indexRef = useRef(0);
  const cardWidthRef = useRef(0);

  const [cardWidth, setCardWidth] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  const [transition, setTransition] = useState(true);
  const [visibleCards, setVisibleCards] = useState(5);
  const [isMounted, setIsMounted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Drag state
  const [dragStart, setDragStart] = useState<number | null>(null);

  // Collapse state for sticky mobile category section on scroll
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsCollapsed(true);
      } else {
        setIsCollapsed(false);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleResize = useCallback(() => {
    const vw = window.innerWidth;
    const newVisibleCards = getVisibleCards(vw);
    setVisibleCards(newVisibleCards);

    if (containerRef.current) {
      const totalWidth = containerRef.current.offsetWidth;

      const cw =
        (totalWidth - GAP * (newVisibleCards - 1)) /
        newVisibleCards;

      setCardWidth(cw);
      cardWidthRef.current = cw;
    }
  }, []);

  useEffect(() => {
    setIsMounted(true);

    const timeout = setTimeout(() => {
      handleResize();
    }, 50);

    window.addEventListener("resize", handleResize);

    return () => {
      clearTimeout(timeout);
      window.removeEventListener("resize", handleResize);
    };
  }, [handleResize]);

  // Auto slider
  useEffect(() => {
    if (!cardWidth || isPaused) return;

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
  }, [cardWidth, isPaused]);

  // Swipe handler
  const handleSwipe = (diff: number) => {
    const cardStep = cardWidthRef.current + GAP;

    // Right = previous
    if (diff > 50) {
      indexRef.current = Math.max(
        0,
        indexRef.current - 1
      );

      setTransition(true);
      setTranslateX(indexRef.current * cardStep);
    }

    // Left = next
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

  return (
    <div>
      {/* Mobile Flipkart-style Categories (Mobile Only, Sticky at top below header) */}
      <div
        id="categories-section"
        className={`${isCollapsed ? "fixed" : "sticky"} top-[92px] z-30 bg-white/95 backdrop-blur-md block sm:hidden w-full overflow-x-auto no-scrollbar border-b border-gray-100/80 shadow-xs [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] transition-all duration-300 ease-in-out`}
        style={{
          paddingTop: isCollapsed ? "12px" : "12px",
          paddingBottom: isCollapsed ? "12px" : "12px",
        }}
      >
        <div className="flex gap-4 px-2 min-w-max justify-around items-center">
          {categories.map((item, i) => (
            <Link
              key={i}
              href={item.href}
              className="flex flex-col items-center text-center shrink-0 group transition-all duration-300 ease-in-out"
              style={{
                paddingLeft: isCollapsed ? "10px" : "0px",
                paddingRight: isCollapsed ? "10px" : "0px",
              }}
            >
              <div
                className="relative overflow-hidden rounded-full border border-gray-100 shadow-xs transition-all duration-300 ease-in-out bg-zinc-50 flex-shrink-0 flex items-center justify-center"
                style={{
                  width: isCollapsed ? 0 : 36,
                  height: isCollapsed ? 0 : 36,
                  opacity: isCollapsed ? 0 : 1,
                  marginBottom: isCollapsed ? 0 : 6,
                  borderWidth: isCollapsed ? 0 : 1,
                }}
              >
                {getCategoryIcon(item.title, isCollapsed)}
              </div>
              <span className="text-[11px] font-semibold text-gray-700 tracking-tight transition-colors duration-300 group-hover:text-orange-500">
                {item.title}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Desktop/Tablet View (Original Slider Carousel, non-sticky) */}
      <section className="hidden sm:block w-full py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div
            ref={containerRef}
            className="w-full overflow-hidden"
            style={{
              visibility:
                isMounted && cardWidth > 0
                  ? "visible"
                  : "hidden",
              height: 120,
            }}
          >
            <div
              style={{
                display: "flex",
                gap: GAP,
                transform: `translateX(-${translateX}px)`,
                transition: transition
                  ? "transform 0.5s ease-in-out"
                  : "none",
                willChange: "transform",
                cursor: "grab",
                touchAction: "pan-y",
              }}
              // ✅ Works on laptop + mobile + emulator
              onPointerDown={(e) => {
                setDragStart(e.clientX);
                setIsPaused(true);
              }}
              onPointerUp={(e) => {
                if (dragStart === null) return;

                const diff = e.clientX - dragStart;

                handleSwipe(diff);

                setDragStart(null);
                setIsPaused(false);
              }}
            >
              {loopedCards.map((item, i) => (
                <Link
                  key={i}
                  href={item.href}
                  className="group relative flex-shrink-0 overflow-hidden rounded-2xl bg-zinc-100"
                  style={{
                    width: cardWidth || "auto",
                    height: 120,
                  }}
                  onMouseEnter={() => setIsPaused(true)}
                  onMouseLeave={() => setIsPaused(false)}
                >
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes={
                      visibleCards === 3
                        ? "33vw"
                        : "20vw"
                    }
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />

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