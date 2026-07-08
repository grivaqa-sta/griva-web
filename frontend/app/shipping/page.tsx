"use client";

import SectionHeading from "@/app/components/common/SectionHeading";
import ScrollReveal from "@/app/components/common/ScrollReveal";

export default function ShippingPage() {
  return (
    <div className="bg-gray-50/50 min-h-screen py-12">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <SectionHeading title="Delivery Information" subtitle="Fast same-day and next-day delivery across Qatar" />

        <ScrollReveal>
          <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm space-y-6 text-sm text-gray-600 leading-relaxed">
            <section className="space-y-3">
              <h3 className="font-bold text-gray-900 text-base">Delivery Rates &amp; Timelines</h3>
              <p>
                We offer free delivery on all orders over QAR 99. For orders under QAR 99, a flat delivery fee of QAR 15 applies to any location within Qatar.
              </p>
              <div className="overflow-x-auto pt-2">
                <table className="min-w-full divide-y divide-gray-200 border text-xs">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-bold text-gray-700 uppercase">Delivery Method</th>
                      <th className="px-4 py-3 text-left font-bold text-gray-700 uppercase">Delivery Time</th>
                      <th className="px-4 py-3 text-left font-bold text-gray-700 uppercase">Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    <tr>
                      <td className="px-4 py-3 font-semibold text-gray-900">Same Day Delivery (Doha &amp; suburbs)</td>
                      <td className="px-4 py-3 text-gray-500">Same day (orders before 4:00 PM)</td>
                      <td className="px-4 py-3 text-green-600 font-semibold">Free (over QAR 99) / QAR 15</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-semibold text-gray-900">Next Day Delivery (Other municipalities)</td>
                      <td className="px-4 py-3 text-gray-500">24–48 hours</td>
                      <td className="px-4 py-3 text-green-600 font-semibold">Free (over QAR 99) / QAR 15</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="font-bold text-gray-900 text-base">Order Processing &amp; Dispatch</h3>
              <p>
                All orders are processed and prepared for delivery immediately upon receipt. Orders placed before 4:00 PM AST from Saturday to Thursday are dispatched for same-day delivery. Orders placed after 4:00 PM AST or on Fridays will be delivered the next business day.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="font-bold text-gray-900 text-base">Cash on Delivery (COD)</h3>
              <p>
                We support Cash on Delivery (COD) for all orders in Qatar. You can pay our delivery agent in cash or via card terminal at the time of delivery. There are no additional transaction fees or service charges for choosing COD.
              </p>
            </section>

            <section className="space-y-3 border-t border-gray-100 pt-4">
              <h3 className="font-bold text-gray-900 text-base">International Shipping</h3>
              <p className="text-gray-500 italic">
                At this time, we only deliver within the State of Qatar. We do not offer international shipping or courier deliveries outside of Qatar.
              </p>
            </section>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}
