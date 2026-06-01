"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaPinterestP,
} from "react-icons/fa";
import { ChevronDown, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FooterLink {
  label: string;
  href: string;
}

interface FooterLinkGroup {
  title: string;
  links: FooterLink[];
}

const footerLinks: FooterLinkGroup[] = [
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Careers", href: "/about" },
      { label: "Contact Us", href: "/contact" },
      { label: "FAQ", href: "/faq" },
    ],
  },
  {
    title: "Customer Policies",
    links: [
      { label: "Terms of Service", href: "/terms" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Return Policy", href: "/returns" },
      { label: "Shipping Information", href: "/shipping" },
    ],
  },
  {
    title: "Popular Categories",
    links: [
      { label: "Electronics", href: "/shop?category=electronics" },
      { label: "Mobiles", href: "/shop?category=mobiles" },
      { label: "Accessories", href: "/shop?category=accessories" },
      { label: "Gaming Zone", href: "/shop?category=gaming" },
    ],
  },
];

const tags: string[] = [
  "Accessories",
  "Apple iphone",
  "Camera & Video",
  "Cellphone",
  "Desktop Computers",
  "Electronic",
  "Game",
  "Gaming Headsets",
  "Headphone",
  "iwatch",
  "Kids' Electronics",
  "Laptop",
  "Mobile & Tablet",
  "Panasonic",
  "PC Gaming",
  "Smartwatches",
  "Speaker",
  "Tech Accessories",
  "Television",
];

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
    setEmail("");
    setTimeout(() => setSubscribed(false), 5000);
  };

  const toggleAccordion = (title: string) => {
    setOpenAccordion(openAccordion === title ? null : title);
  };

  return (
    <footer className="w-full bg-white pt-12 border-t border-gray-100">
      {/* Top Section */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 mb-10">
          {/* Brand and Description (lg:col-span-4) */}
          <div className="lg:col-span-4 space-y-4">
            <Link href="/" className="flex items-center gap-1">
              <h2 className="text-xl font-bold tracking-tight text-black">
                GR<span className="text-orange-500 font-extrabold">i</span>VA
              </h2>
            </Link>
            <p className="max-w-[280px] text-xs leading-relaxed text-gray-500">
              Your go-to store for authenticated, high-quality flagship electronics, audio gear, and gadgets.
            </p>
            <div className="space-y-1.5 text-xs text-gray-600 font-semibold">
              <p>Email: support@griva.com</p>
              <p>Support: +08 9229 8228</p>
            </div>
            {/* Social handles */}
            <div className="flex items-center gap-3 pt-2">
              {[
                { icon: <FaFacebookF size={12} />, href: "#" },
                { icon: <FaTwitter size={12} />, href: "#" },
                { icon: <FaInstagram size={12} />, href: "#" },
                { icon: <FaPinterestP size={12} />, href: "#" },
              ].map((item, idx) => (
                <a
                  key={idx}
                  href={item.href}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-55 border border-gray-100 text-gray-600 hover:bg-orange-500 hover:text-white transition-all duration-200"
                >
                  {item.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Links Sections - Responsive Accordion on Mobile (lg:col-span-5) */}
          <div className="lg:col-span-5 grid grid-cols-1 md:grid-cols-3 gap-6">
            {footerLinks.map((group) => {
              const isOpen = openAccordion === group.title;
              return (
                <div key={group.title} className="border-b md:border-b-0 pb-3 md:pb-0">
                  {/* Header (Accordion trigger for mobile) */}
                  <button
                    onClick={() => toggleAccordion(group.title)}
                    className="flex w-full items-center justify-between text-left md:pointer-events-none text-xs font-bold text-gray-900 uppercase tracking-wider md:mb-4 py-2 md:py-0 cursor-pointer"
                  >
                    <span>{group.title}</span>
                    <ChevronDown
                      size={14}
                      className={`text-gray-400 md:hidden transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Links List */}
                  <div className="hidden md:flex flex-col gap-2.5">
                    {group.links.map((link) => (
                      <Link
                        key={link.label}
                        href={link.href}
                        className="text-xs text-gray-500 hover:text-orange-500 transition-colors font-medium"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>

                  {/* Accordion panel for mobile */}
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "auto" }}
                        exit={{ height: 0 }}
                        className="overflow-hidden md:hidden"
                      >
                        <div className="flex flex-col gap-2 pt-2 pb-1 pl-1">
                          {group.links.map((link) => (
                            <Link
                              key={link.label}
                              href={link.href}
                              className="text-xs text-gray-500 hover:text-orange-500 transition-colors py-1 block"
                            >
                              {link.label}
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          {/* Newsletter Box (lg:col-span-3) */}
          <div className="lg:col-span-3 space-y-4">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
              Newsletter Signup
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.
            </p>

            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input
                type="email"
                placeholder="Enter email..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-xs outline-none focus:border-orange-500 bg-white text-black"
                required
              />
              <button
                type="submit"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition-colors cursor-pointer"
              >
                <Send size={14} />
              </button>
            </form>

            <AnimatePresence>
              {subscribed && (
                <motion.p
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-[10px] font-semibold text-green-600"
                >
                  Thanks for subscribing to GriVA!
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Bottom copyright section */}
        <div className="border-t border-gray-100 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[11px] text-gray-400 font-medium">
            © {new Date().getFullYear()} GriVA Store. All Rights Reserved.
          </p>

          <div className="flex flex-wrap items-center gap-2">
            {["MasterCard", "PayPal", "American Express", "Bitcoin", "Visa"].map((card) => (
              <div
                key={card}
                className="rounded border border-gray-200 bg-gray-50 px-2 py-0.5 text-[9px] font-semibold text-gray-500"
              >
                {card}
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
