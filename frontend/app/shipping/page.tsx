"use client";

import SectionHeading from "@/app/components/common/SectionHeading";
import ScrollReveal from "@/app/components/common/ScrollReveal";

export default function ShippingPage() {
  return (
    <div className="bg-gray-50/50 min-h-screen py-12">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <SectionHeading title="Shipping Information" subtitle="Fast and secure shipping to 50+ countries" />

        <ScrollReveal>
          <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm space-y-6 text-sm text-gray-600 leading-relaxed">
            <section className="space-y-3">
              <h3 className="font-bold text-gray-900 text-base">Shipping Rates &amp; Delivery Estimates</h3>
              <p>
                We offer free standard shipping on all orders over QAR 50. For orders under QAR 50, a flat shipping fee of QAR 9.99 applies.
              </p>
              <div className="overflow-x-auto pt-2">
                <table className="min-w-full divide-y divide-gray-200 border text-xs">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-bold text-gray-700 uppercase">Shipping Method</th>
                      <th className="px-4 py-3 text-left font-bold text-gray-700 uppercase">Delivery Time</th>
                      <th className="px-4 py-3 text-left font-bold text-gray-700 uppercase">Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    <tr>
                      <td className="px-4 py-3 font-semibold text-gray-900">Standard Shipping</td>
                      <td className="px-4 py-3 text-gray-500">3–7 business days</td>
                      <td className="px-4 py-3 text-green-600 font-semibold">Free (over QAR 50) / QAR 9.99</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-semibold text-gray-900">Express Shipping</td>
                      <td className="px-4 py-3 text-gray-500">1–3 business days</td>
                      <td className="px-4 py-3 text-gray-900">QAR 19.99</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-semibold text-gray-900">International Shipping</td>
                      <td className="px-4 py-3 text-gray-500">7–21 business days</td>
                      <td className="px-4 py-3 text-gray-900">Calculated at checkout</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="font-bold text-gray-900 text-base">Order Processing Times</h3>
              <p>
                All orders are processed and shipped within 1–2 business days. Orders are not shipped or delivered on weekends or holidays. Once your order has shipped, you will receive a confirmation email containing tracking details.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="font-bold text-gray-900 text-base">Customs, Duties &amp; Taxes</h3>
              <p>
                GriVA is not responsible for any customs and taxes applied to your order. All fees imposed during or after shipping are the responsibility of the customer (tariffs, taxes, duties, etc.).
              </p>
            </section>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}
