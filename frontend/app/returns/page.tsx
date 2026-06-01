"use client";

import SectionHeading from "@/app/components/common/SectionHeading";
import ScrollReveal from "@/app/components/common/ScrollReveal";

export default function ReturnsPage() {
  return (
    <div className="bg-gray-50/50 min-h-screen py-12">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <SectionHeading title="Returns &amp; Refund Policy" subtitle="Hassle-free 30-day returns on all electronic products" />

        <ScrollReveal>
          <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm space-y-6 text-sm text-gray-600 leading-relaxed">
            <section className="space-y-3">
              <h3 className="font-bold text-gray-900 text-base">30-Day Money Back Guarantee</h3>
              <p>
                We want you to be completely satisfied with your purchase. If you are not satisfied with your item, you can return it within 30 days of delivery for a full refund, exchange, or store credit.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="font-bold text-gray-900 text-base">Return Conditions</h3>
              <p>
                To be eligible for a return, the product must meet the following criteria:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>The item must be in its original packaging.</li>
                <li>All original manuals, accessories, and promotional materials must be included.</li>
                <li>The item must be free of physical damage, scratches, or wear.</li>
                <li>You must provide the receipt or proof of purchase.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h3 className="font-bold text-gray-900 text-base">How to Initiate a Return</h3>
              <p>
                To start a return, please contact our support team at <span className="font-bold text-orange-500">support@griva.com</span> with your order number. Once approved, we will send you a pre-paid shipping label and instructions on how and where to send your package.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="font-bold text-gray-900 text-base">Refund Process</h3>
              <p>
                Once we receive and inspect your returned item, we will notify you of the approval or rejection of your refund. Approved refunds will be processed and credited automatically to your original payment method within 5–7 business days.
              </p>
            </section>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}
