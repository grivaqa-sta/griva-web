"use client";

import { useState, useEffect } from "react";
import { getSettingsApi } from "@/app/utils/api";
import {
  Truck,
  RotateCcw,
  Headphones,
  Wallet,
} from "lucide-react";

interface FeatureItem {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export default function FeatureSection() {
  const [freeShippingThreshold, setFreeShippingThreshold] = useState<number>(99);

  useEffect(() => {
    getSettingsApi()
      .then((settings) => {
        if (settings && settings.freeShippingThreshold !== undefined) {
          setFreeShippingThreshold(Number(settings.freeShippingThreshold));
        }
      })
      .catch((err) => console.error("Failed to fetch settings in FeatureSection:", err));
  }, []);

  const features: FeatureItem[] = [
    {
      icon: <Truck size={32} strokeWidth={1.8} />,
      title: "FREE DELIVERY",
      description: `On orders over QAR ${freeShippingThreshold}`,
    },
    {
      icon: <RotateCcw size={32} strokeWidth={1.8} />,
      title: "RETURNS",
      description: "Back guarantee under 7 days",
    },
    {
      icon: <Headphones size={32} strokeWidth={1.8} />,
      title: "SUPPORT 24/7",
      description: "Support online 24 hours a day",
    },
    {
      icon: <Wallet size={32} strokeWidth={1.8} />,
      title: "CASH ON DELIVERY",
      description: "Pay upon delivery",
    },
  ];

  return (
    <section className="w-full bg-white py-8 border-b border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap justify-between items-center">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="flex items-center gap-3"
            >
              {/* Icon */}
              <div className="text-orange-500">
                {feature.icon}
              </div>

              {/* Content */}
              <div>
                <h3 className="text-xs font-black uppercase tracking-wide text-black">
                  {feature.title}
                </h3>
                <p className="mt-1 text-[11px] text-gray-600">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}