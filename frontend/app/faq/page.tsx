"use client";

import { useState } from "react";
import SectionHeading from "@/app/components/common/SectionHeading";
import ScrollReveal from "@/app/components/common/ScrollReveal";
import { faqData } from "@/app/data/data";
import { ChevronDown, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="bg-gray-50/50 min-h-screen py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <SectionHeading title="Frequently Asked Questions" subtitle="Quick answers to common questions about orders, shipping, and services" />

        <ScrollReveal>
          <div className="space-y-4">
            {faqData.map((faq, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
                >
                  <button
                    onClick={() => toggleFAQ(idx)}
                    className="w-full flex items-center justify-between p-5 text-left transition hover:bg-orange-50/30 cursor-pointer"
                  >
                    <div className="flex gap-3 items-center">
                      <HelpCircle className={`h-4. w-4. shrink-0 ${isOpen ? "text-orange-500" : "text-gray-400"}`} />
                      <span className="text-sm font-bold text-gray-900">{faq.question}</span>
                    </div>
                    <ChevronDown
                      className={`h-4. w-4. text-gray-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-orange-500" : ""
                      }`}
                    />
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "auto" }}
                        exit={{ height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-gray-50 p-5 text-xs text-gray-500 leading-relaxed bg-gray-50/30">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}
