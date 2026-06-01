// components/home/CategorySection.tsx

"use client";

import { categories } from "@/app/data/data";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";



const GAP = 16;
const VISIBLE = 5;
const INTERVAL = 1200;
const TOTAL_CARDS = categories.length;

const loopedCards = [...categories, ...categories, ...categories];

export default function CategorySection() {
  const containerRef = useRef<HTMLDivElement>(null);

  const [cardWidth, setCardWidth] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  const [transition, setTransition] = useState(true);

  const indexRef = useRef(0);

  useEffect(() => {
    const measure = () => {
      if (containerRef.current) {
        const totalWidth = containerRef.current.offsetWidth;

        const cw =
          (totalWidth - GAP * (VISIBLE - 1)) / VISIBLE;

        setCardWidth(cw);
      }
    };

    measure();

    window.addEventListener("resize", measure);

    return () => window.removeEventListener("resize", measure);
  }, []);

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
                  width={300}
                  height={300}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
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