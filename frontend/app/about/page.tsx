"use client";

import SectionHeading from "@/app/components/common/SectionHeading";
import ScrollReveal from "@/app/components/common/ScrollReveal";
import Image from "next/image";
import Link from "next/link";
import aboutImg from "@/public/images/headphone.jpg"; // reuse existing headphones image

export default function AboutPage() {
  return (
    <div className="bg-gray-50/50 min-h-screen py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading title="About GriVA" subtitle="Our journey to delivering state-of-the-art tech" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-16">
          {/* Text content */}
          <div className="lg:col-span-7 space-y-6">
            <ScrollReveal delay={0.1}>
              <h3 className="text-xl font-bold text-gray-900 sm:text-2xl">
                Redefining the Electronics E-commerce Experience
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-gray-500">
                At GriVA, we believe technology should be accessible, reliable, and premium. Since our inception, we have dedicated ourselves to sourcing only the finest components, smartphones, laptops, and smart accessories, offering them with unmatched service and care.
              </p>
              <p className="text-sm leading-relaxed text-gray-500">
                We aren&rsquo;t just an online retailer; we are tech enthusiasts who verify the quality of every product we stock. From the latest flagship smartphones to immersive audiophile headphones, GriVA guarantees authenticity, speed, and premium craftsmanship.
              </p>
            </ScrollReveal>

            {/* Core Pillars */}
            <ScrollReveal delay={0.2} className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
              <div className="p-4 rounded-xl bg-white border border-gray-100 shadow-sm text-center">
                <span className="text-2xl font-bold text-orange-500">100%</span>
                <p className="text-xs font-semibold text-gray-700 mt-1">Authentic Gear</p>
              </div>
              <div className="p-4 rounded-xl bg-white border border-gray-100 shadow-sm text-center">
                <span className="text-2xl font-bold text-orange-500">50+</span>
                <p className="text-xs font-semibold text-gray-700 mt-1">Countries Shipped</p>
              </div>
              <div className="p-4 rounded-xl bg-white border border-gray-100 shadow-sm text-center">
                <span className="text-2xl font-bold text-orange-500">24/7</span>
                <p className="text-xs font-semibold text-gray-700 mt-1">Dedicated Help</p>
              </div>
            </ScrollReveal>
          </div>

          {/* Graphic/Image side */}
          <div className="lg:col-span-5 relative aspect-square w-full rounded-2xl overflow-hidden shadow-md border bg-white p-6 flex items-center justify-center">
            <Image
              src={aboutImg}
              alt="GriVA Premium audio headphones"
              className="object-contain max-h-[340px]"
            />
          </div>
        </div>

        {/* Brand Mission Section */}
        <ScrollReveal>
          <div className="bg-white rounded-2xl border border-gray-100 p-8 md:p-12 shadow-sm text-center max-w-4xl mx-auto space-y-6">
            <span className="text-xs font-extrabold text-orange-500 uppercase tracking-widest">
              Our Vision
            </span>
            <h3 className="text-2xl font-bold text-gray-900">
              Empowering Connection Through Innovation
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed max-w-2xl mx-auto">
              Our vision is to bridge the gap between people and world-class digital innovation. We continue to invest in expanding our catalogs, logistics, and user interfaces to make purchasing next-generation electronics an absolute breeze.
            </p>
            <div className="pt-4">
              <Link
                href="/shop"
                className="inline-flex items-center justify-center rounded-xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white hover:bg-orange-600 transition shadow-md shadow-orange-500/10"
              >
                Explore Catalog
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}
