"use client";

import {
  Truck,
  RotateCcw,
  Headphones,
  CreditCard,
} from "lucide-react";

interface FeatureItem {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const features: FeatureItem[] = [
  {
    icon: <Truck size={32} strokeWidth={1.8} />,
    title: "FREE DELIVERY",
    description: "Free shipping on all order",
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
    icon: <CreditCard size={32} strokeWidth={1.8} />,
    title: "PAYMENTS",
    description: "100% payment security",
  },
];

export default function FeatureSection() {
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