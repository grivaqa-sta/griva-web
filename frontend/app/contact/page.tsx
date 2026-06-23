"use client";

import { useState } from "react";
import SectionHeading from "@/app/components/common/SectionHeading";
import ScrollReveal from "@/app/components/common/ScrollReveal";
import { Mail, Phone, MapPin, Send, CheckCircle2 } from "lucide-react";
import { useToast } from "@/app/context/ToastContext";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.warning("Please fill in all required fields.");
      return;
    }
    setSubmitted(true);
    toast.success("Thank you! Your message has been sent successfully.");
    setForm({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div className="bg-gray-50/50 min-h-screen py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading title="Contact GriVA" subtitle="We're here to answer your questions and assist with orders" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          {/* Info cards (Left) */}
          <div className="lg:col-span-5 space-y-6">
            <ScrollReveal delay={0.1}>
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-6">
                <h3 className="font-bold text-gray-900 text-lg border-b pb-4">
                  Contact Information
                </h3>

                <div className="space-y-4">
                  {/* Phone */}
                  <div className="flex gap-4 items-start">
                    <div className="h-10 w-10 bg-orange-50 text-orange-500 rounded-lg flex items-center justify-center shrink-0">
                      <Phone className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-800">Phone Support</h4>
                      <p className="text-xs text-gray-500 mt-0.5">+08 9229 8228</p>
                      <p className="text-[10px] text-gray-400">Mon - Fri, 9:00 AM - 6:00 PM EST</p>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex gap-4 items-start">
                    <div className="h-10 w-10 bg-orange-50 text-orange-500 rounded-lg flex items-center justify-center shrink-0">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-800">Email Enquiries</h4>
                      <p className="text-xs text-gray-500 mt-0.5">support@griva.com</p>
                      <p className="text-[10px] text-gray-400">Expect a response within 24 hours</p>
                    </div>
                  </div>

                  {/* Map Pin */}
                  <div className="flex gap-4 items-start">
                    <div className="h-10 w-10 bg-orange-50 text-orange-500 rounded-lg flex items-center justify-center shrink-0">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-800">Headquarters</h4>
                      <p className="text-xs text-gray-500 mt-0.5">100 Tech Plaza, Suite 400</p>
                      <p className="text-[10px] text-gray-400">Silicon Valley, CA 94025, USA</p>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* Form (Right) */}
          <div className="lg:col-span-7">
            <ScrollReveal delay={0.2}>
              <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm">
                <h3 className="font-bold text-gray-900 text-lg border-b pb-4 mb-6">
                  Send Us a Message
                </h3>

                {submitted ? (
                  <div className="py-8 text-center space-y-4">
                    <div className="h-12 w-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle2 className="h-6 w-6" />
                    </div>
                    <h4 className="font-bold text-gray-900">Message Sent Successfully!</h4>
                    <p className="text-xs text-gray-500 max-w-sm mx-auto">
                      Thank you for contacting GriVA. Our support agents have received your enquiry and will follow up shortly.
                    </p>
                    <button
                      onClick={() => setSubmitted(false)}
                      className="text-xs font-semibold text-orange-500 hover:underline cursor-pointer"
                    >
                      Send another message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          className="w-full rounded-lg border border-gray-200 p-3 text-xs outline-none focus:border-orange-500 bg-white text-black"
                          placeholder="John Doe"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          required
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          className="w-full rounded-lg border border-gray-200 p-3 text-xs outline-none focus:border-orange-500 bg-white text-black"
                          placeholder="johndoe@example.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                        Subject
                      </label>
                      <input
                        type="text"
                        value={form.subject}
                        onChange={(e) => setForm({ ...form, subject: e.target.value })}
                        className="w-full rounded-lg border border-gray-200 p-3 text-xs outline-none focus:border-orange-500 bg-white text-black"
                        placeholder="Order Enquiry / Feedback"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                        Message *
                      </label>
                      <textarea
                        required
                        rows={5}
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        className="w-full rounded-lg border border-gray-200 p-3 text-xs outline-none focus:border-orange-500 bg-white text-black"
                        placeholder="Write your message here..."
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-orange-500 py-3.5 text-sm font-semibold text-white hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/10 cursor-pointer"
                    >
                      <Send className="h-4 w-4" /> Send Message
                    </button>
                  </form>
                )}
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </div>
  );
}
