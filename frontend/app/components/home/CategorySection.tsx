"use client";

import { categories } from "@/app/data/data";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const GAP = 16;
const INTERVAL = 1200;
const TOTAL_CARDS = categories.length;

const loopedCards = [...categories, ...categories, ...categories];

export default function CategorySection() {
  const containerRef = useRef<HTMLDivElement>(null);

  const [cardWidth, setCardWidth] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  const [transition, setTransition] = useState(true);

  // UPDATED: responsive visible cards
  const [visibleCards, setVisibleCards] = useState(5);

  const indexRef = useRef(0);

  // UPDATED: responsive card count
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setVisibleCards(2); // mobile
      } else if (window.innerWidth < 1024) {
        setVisibleCards(3); // tablet
      } else {
        setVisibleCards(5); // desktop
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () =>
      window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const measure = () => {
      if (containerRef.current) {
        const totalWidth = containerRef.current.offsetWidth;

        // UPDATED: use visibleCards instead of VISIBLE
        const cw =
          (totalWidth - GAP * (visibleCards - 1)) /
          visibleCards;

        setCardWidth(cw);
      }
    };

    measure();

    window.addEventListener("resize", measure);

    return () =>
      window.removeEventListener("resize", measure);
  }, [visibleCards]); // UPDATED

  const cardStep = cardWidth + GAP;

  useEffect(() => {
    if (!cardWidth) return;

    const interval = setInterval(() => {
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
    }, INTERVAL);

    return () => clearInterval(interval);
  }, [cardWidth, cardStep]);

  return (
    <section className="w-full py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          ref={containerRef}
          className="w-full overflow-hidden"
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
            }}
          >
            {loopedCards.map((item, i) => (
              <Link
                key={i}
                href={item.href}
                className="group relative flex-shrink-0 overflow-hidden rounded-2xl bg-zinc-100"
                style={{
                  width: cardWidth,
                  height: 120,
                }}
              >
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw" // UPDATED
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <h3 className="text-sm font-bold leading-tight text-white transition-colors duration-300 group-hover:text-orange-400">
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