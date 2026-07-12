"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaFacebookF,
  FaInstagram,
  FaWhatsapp,
} from "react-icons/fa";
import { ChevronDown, Send, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { addSubscriberApi } from "@/app/utils/api";
import { useToast } from "@/app/context/ToastContext";

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
      { label: "Blog", href: "/blog" },
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
      { label: "Perfumes & Buhoor", href: "/category/perfumes-buhoor" },
      { label: "Toys & Games", href: "/category/toys" },
      { label: "Baby Products", href: "/category/baby-products" },
      { label: "Gadgets & Electronics", href: "/category/gadgets-electronics" },
      { label: "Gaming Accessories", href: "/category/gaming-accessories" },
      { label: "Kitchen Appliances", href: "/category/kitchen-appliances-essentials" },
    ],
  },
];
export default function Footer() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  const [comingSoonVisible, setComingSoonVisible] = useState(true);

  useEffect(() => {
    const isComingSoonActive = process.env.NEXT_PUBLIC_COMING_SOON === "true";
    if (isComingSoonActive) {
      const hasBypassStorage = localStorage.getItem("griva_coming_soon_bypass") === "true";
      setComingSoonVisible(hasBypassStorage);
    } else {
      setComingSoonVisible(true);
    }

    const handleBypassEvent = () => {
      setComingSoonVisible(true);
    };
    window.addEventListener("griva_coming_soon_bypassed", handleBypassEvent);
    return () => {
      window.removeEventListener("griva_coming_soon_bypassed", handleBypassEvent);
    };
  }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || loading) return;

    setLoading(true);
    try {
      await addSubscriberApi(email.trim());
      setSubscribed(true);
      setEmail("");
    } catch (err: any) {
      const errMsg = err.message || "An error occurred. Please try again.";
      if (errMsg.toLowerCase().includes("already subscribed")) {
        setSubscribed(true);
        setEmail("");
      } else {
        toast.error(errMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleAccordion = (title: string) => {
    setOpenAccordion(openAccordion === title ? null : title);
  };

  const pathname = usePathname();
  if (!comingSoonVisible) return null;
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
              <p>Email: info@thegriva.com</p>
              <p>Support: +08 9229 8228</p>
            </div>
            {/* Social handles */}
            <div className="flex items-center gap-3 pt-2">
              {[
                { icon: <FaFacebookF size={12} />, href: "#", label: "Facebook" },
                { icon: <FaInstagram size={12} />, href: "https://www.instagram.com/griva.qa", label: "Instagram", target: "_blank" },
                { icon: <FaWhatsapp size={14} />, href: "https://wa.me/97455551234", label: "WhatsApp", target: "_blank" },
              ].map((item, idx) => (
                <a
                  key={idx}
                  href={item.href}
                  target={item.target || undefined}
                  rel={item.target === "_blank" ? "noopener noreferrer" : undefined}
                  aria-label={item.label}
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

            {subscribed ? (
              <div className=" border px-4 py-3 rounded-lg text-xs font-semibold animate-in fade-in duration-300">
                Thanks for subscribing! We'll keep you updated.              
                </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter email..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="flex-1 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs outline-none focus:border-orange-500 text-white placeholder:text-zinc-500 disabled:opacity-50"
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {loading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Send size={14} />}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom copyright section */}
        <div className="border-t border-zinc-800 py-6 flex flex-col md:flex-row items-center justify-center gap-4">
          <p className="text-[11px] text-zinc-500 font-medium">
            © {new Date().getFullYear()} GRIVA Store. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}