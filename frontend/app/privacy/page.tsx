"use client";

import SectionHeading from "@/app/components/common/SectionHeading";
import ScrollReveal from "@/app/components/common/ScrollReveal";

export default function PrivacyPage() {
  return (
    <div className="bg-gray-50/50 min-h-screen py-12">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <SectionHeading title="Privacy Policy" subtitle="Last Updated: May 2026" />

        <ScrollReveal>
          <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm space-y-6 text-sm text-gray-600 leading-relaxed">
            <section className="space-y-3">
              <h3 className="font-bold text-gray-900 text-base">1. Information We Collect</h3>
              <p>
                We collect information you provide directly to us when you create an account, place an order, sign up for our newsletter, or communicate with us. This information may include your name, email address, shipping address, billing address, phone number, and payment details.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="font-bold text-gray-900 text-base">2. How We Use Your Information</h3>
              <p>
                We use the information we collect to process and fulfill your orders, manage your account, send transaction notifications, respond to support requests, send marketing communications (if you have opted in), and analyze and improve our services.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="font-bold text-gray-900 text-base">3. Information Sharing &amp; Security</h3>
              <p>
                We do not sell, rent, or trade your personal information to third parties. We share information with trusted third-party service providers who assist us in operating our website, conducting our business, or shipping orders, provided they agree to keep this information confidential. We implement industry-standard security measures to safeguard your information.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="font-bold text-gray-900 text-base">4. Cookies and Tracking</h3>
              <p>
                We use cookies and similar technologies to enhance your browsing experience, analyze site traffic, personalize content, and understand user preferences. You can manage your cookie preferences in your browser settings at any time.
              </p>
            </section>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}
