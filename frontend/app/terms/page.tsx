"use client";

import SectionHeading from "@/app/components/common/SectionHeading";
import ScrollReveal from "@/app/components/common/ScrollReveal";

export default function TermsPage() {
  return (
    <div className="bg-gray-50/50 min-h-screen py-12">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <SectionHeading title="Terms of Service" subtitle="Last Updated: May 2026" />

        <ScrollReveal>
          <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm space-y-6 text-sm text-gray-600 leading-relaxed">
            <section className="space-y-3">
              <h3 className="font-bold text-gray-900 text-base">1. Agreement to Terms</h3>
              <p>
                By accessing and placing an order with GriVA, you confirm that you are in agreement with and bound by the terms of service contained in the Terms &amp; Conditions outlined below. These terms apply to the entire website and any email or other type of communication between you and GriVA.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="font-bold text-gray-900 text-base">2. Product Availability &amp; Pricing</h3>
              <p>
                Prices for our products are subject to change without notice. We reserve the right at any time to modify or discontinue any product (or part thereof) without notice at any time. We shall not be liable to you or to any third-party for any modification, price change, suspension, or discontinuance of the service.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="font-bold text-gray-900 text-base">3. Order Acceptance &amp; Payments</h3>
              <p>
                We reserve the right to refuse any order you place with us. We may, in our sole discretion, limit or cancel quantities purchased per person, per household, or per order. In the event that we make a change to or cancel an order, we may attempt to notify you by contacting the email and/or billing address/phone number provided at the time the order was made.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="font-bold text-gray-900 text-base">4. Limitation of Liability</h3>
              <p>
                In no case shall GriVA, our directors, officers, employees, affiliates, agents, contractors, interns, suppliers, service providers, or licensors be liable for any injury, loss, claim, or any direct, indirect, incidental, punitive, special, or consequential damages of any kind, including, without limitation lost profits, lost revenue, lost savings, loss of data, replacement costs, or any similar damages.
              </p>
            </section>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}
