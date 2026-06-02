"use client";

import { categories } from "@/app/data/data";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

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
    <section className="w-full py-8">
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
  );
}