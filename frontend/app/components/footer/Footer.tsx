"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
      { label: "Contact Us", href: "/contact" },
      { label: "FAQ", href: "/faq" },
    ],
  },
  {
    title: "Customer Policies",
    links: [
      { label: "Track Order", href: "/track-order" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Return Policy", href: "/returns" },
      { label: "Shipping Information", href: "/shipping" },
    ],
  },
  {
    title: "Popular Categories",
    links: [
      { label: "Laptops", href: "/category/laptops" },
      { label: "Television", href: "/category/television" },
      { label: "Headphones", href: "/category/headphones" },
      { label: "Smart Gadgets", href: "/category/gadgets" },
    ],
  },
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

  const pathname = usePathname();
  if (pathname.startsWith("/admin") || pathname.startsWith("/delivery")) return null;

  return (
    <footer className="w-full bg-black pt-12 border-t border-zinc-800 text-white">
      {/* Top Section */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 mb-10">
          {/* Brand and Description (lg:col-span-4) */}
          <div className="lg:col-span-4 space-y-4">
            <Link href="/" className="flex items-center gap-1 shrink-0">
              <img src="/images/logo-light.png" alt="Griva Logo" className="h-7 w-auto object-contain" />
            </Link>
            <p className="max-w-[280px] text-xs leading-relaxed text-zinc-400">
              Your go-to store for authenticated, high-quality flagship electronics, audio gear, and gadgets.
            </p>
            <div className="space-y-1.5 text-xs text-zinc-300 font-semibold">
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
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:bg-orange-500 hover:text-white transition-all duration-200"
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
                <div key={group.title} className="border-b border-zinc-800 md:border-b-0 pb-3 md:pb-0">
                  {/* Header (Accordion trigger for mobile) */}
                  <button
                    onClick={() => toggleAccordion(group.title)}
                    className="flex w-full items-center justify-between text-left md:pointer-events-none text-xs font-bold text-white uppercase tracking-wider md:mb-4 py-2 md:py-0 cursor-pointer"
                  >
                    <span>{group.title}</span>
                    <ChevronDown
                      size={14}
                      className={`text-zinc-500 md:hidden transition-transform duration-200 ${isOpen ? "rotate-180" : ""
                        }`}
                    />
                  </button>

                  {/* Links List */}
                  <div className="hidden md:flex flex-col gap-2.5">
                    {group.links.map((link) => (
                      <Link
                        key={link.label}
                        href={link.href}
                        className="text-xs text-zinc-400 hover:text-orange-500 transition-colors font-medium"
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
                              className="text-xs text-zinc-400 hover:text-orange-500 transition-colors py-1 block"
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
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Newsletter Signup
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.
            </p>

            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input
                type="email"
                placeholder="Enter email..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs outline-none focus:border-orange-500 text-white placeholder:text-zinc-500"
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
                  className="text-[10px] font-semibold text-green-500"
                >
                  Thanks for subscribing to GriVA!
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Bottom copyright section */}
        <div className="border-t border-zinc-800 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[11px] text-zinc-500 font-medium">
            © {new Date().getFullYear()} GriVA Store. All Rights Reserved.
          </p>

          <div className="flex flex-wrap items-center gap-2">
            {["MasterCard", "PayPal", "American Express", "Bitcoin", "Visa"].map((card) => (
              <div
                key={card}
                className="rounded border border-zinc-800 bg-zinc-900 px-2 py-0.5 text-[9px] font-semibold text-zinc-400"
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