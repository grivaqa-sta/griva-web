"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { useCategoriesWithSubcategories } from "@/app/hooks/useCategories";
import { useAdminSettings } from "@/app/context/AdminContext";
import { SubCategory } from "@/app/types/types";

export default function SubNavbar() {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [dropdownPos, setDropdownPos] = useState<{ left: number; right: number; top: number; alignRight: boolean } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const { categories: rawCategories } = useCategoriesWithSubcategories();
  const [comingSoonVisible, setComingSoonVisible] = useState(true);
  const [visible, setVisible] = useState(true);
  const { announcementBarEnabled } = useAdminSettings();

  // Memoize active categories to avoid filtering rawCategories on every scroll render
  const navLinks = useMemo(() => {
    return rawCategories.filter((cat) => cat.is_active);
  }, [rawCategories]);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Keep visible at the top of the page
      if (currentScrollY <= 50) {
        setVisible(true);
        lastScrollY = currentScrollY;
        return;
      }

      // Avoid bouncing effect at the bottom of the page on iOS
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (currentScrollY >= maxScroll) {
        lastScrollY = currentScrollY;
        return;
      }

      if (currentScrollY > lastScrollY) {
        // Scrolling down
        setVisible(false);
      } else if (currentScrollY < lastScrollY) {
        // Scrolling up
        setVisible(true);
      }

      lastScrollY = currentScrollY;
      setActiveDropdown(null);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>, dropdownKey: string) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const isRight = rect.left > window.innerWidth / 2;
    setDropdownPos({
      left: rect.left,
      right: window.innerWidth - rect.right,
      top: rect.bottom,
      alignRight: isRight,
    });
    setActiveDropdown(dropdownKey);
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const amount = direction === "left" ? -220 : 220;
      scrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (scrollRef.current && e.deltaY !== 0) {
      scrollRef.current.scrollLeft += e.deltaY;
    }
  };

  if (!comingSoonVisible) return null;

  const activeCategoryObj = navLinks.find(
    (l) => (l.slug || String(l.id)) === activeDropdown
  );
  const rawSubs: SubCategory[] = activeCategoryObj?.subcategories ?? [];
  const activeSubcategories = rawSubs.filter(
    (sub: SubCategory) => sub && sub.is_active !== false
  );
  const isWide = activeSubcategories.length > 8;
  const hasSubcats = activeSubcategories.length > 0;

  return (
    <>
      <div
        className="hidden lg:block fixed left-0 right-0 z-30 border-y border-gray-200 bg-white sm:px-6 lg:px-8 xl:px-10 transition-all duration-300 ease-in-out"
        style={{
          top: announcementBarEnabled ? "120px" : "80px",
          transform: visible ? "translateY(0)" : "translateY(-60px)",
          opacity: visible ? 1 : 0,
          pointerEvents: visible ? "auto" : "none",
        }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center">

            {/* Scrollable Nav Track */}
            <div
              ref={scrollRef}
              onWheel={handleWheel}
              className="w-full overflow-x-auto no-scrollbar scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            >
              <nav className="flex items-center justify-between min-w-full gap-4 lg:gap-6 xl:gap-8 h-14">
                {navLinks.map((link) => {
                  const isActive = pathname.startsWith(link.href);
                  const subs: SubCategory[] = link.subcategories ?? [];
                  const activeSubs = subs.filter(
                    (sub: SubCategory) => sub && sub.is_active !== false
                  );
                  const linkHasSubs = activeSubs.length > 0;
                  const dropdownKey = link.slug || String(link.id);

                  return (
                    <div
                      key={link.id}
                      className="relative flex h-14 items-center shrink-0"
                      onMouseEnter={(e) => handleMouseEnter(e, dropdownKey)}
                      onMouseLeave={() => setActiveDropdown(null)}
                    >
                      {/* Nav trigger link */}
                      <Link
                        href={link.href}
                        className={`subnav-link relative flex items-center gap-1.5 px-0 text-[12px] xl:text-[13px] font-semibold uppercase tracking-wider transition-colors duration-200 whitespace-nowrap ${
                          isActive ? "text-orange-500" : "text-black hover:text-orange-500"
                        }`}
                      >
                        {isActive && (
                          <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-orange-500" />
                        )}
                        {link.title}
                        {linkHasSubs && (
                          <ChevronDown
                            size={12}
                            className={`transition-transform duration-200 ${
                              activeDropdown === dropdownKey ? "rotate-180 text-orange-400" : "text-gray-400"
                            }`}
                          />
                        )}
                      </Link>
                    </div>
                  );
                })}
              </nav>
            </div>

          </div>
        </div>
      </div>

      {/* Floating Unclipped Dropdown Panel */}
      {activeDropdown && hasSubcats && dropdownPos && (
        <div
          className="fixed z-50 pt-1 transition-opacity duration-150"
          style={{
            top: `${dropdownPos.top}px`,
            ...(dropdownPos.alignRight
              ? { right: `${dropdownPos.right}px` }
              : { left: `${dropdownPos.left}px` }),
          }}
          onMouseEnter={() => setActiveDropdown(activeDropdown)}
          onMouseLeave={() => setActiveDropdown(null)}
        >
          <div
            className={`flex flex-col shadow-lg border border-gray-100 bg-white overflow-hidden rounded-lg ${
              isWide ? "w-[380px] flex-row flex-wrap" : "w-[200px]"
            }`}
          >
            {activeSubcategories.map((item: SubCategory, idx: number) => (
              <Link
                key={item.id}
                href={item.href}
                className={`subnav-dropdown-row flex items-center gap-2 bg-white px-4 py-[9px] text-[13px] font-semibold uppercase text-gray-600 hover:bg-orange-50 hover:text-orange-500 transition-colors ${
                  isWide ? "w-1/2" : "w-full"
                }`}
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <span className="h-[5px] w-[5px] rounded-full bg-orange-300 shrink-0" />
                {item.title}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Desktop placeholder to preserve layout space (since SubNavbar is fixed) */}
      <div className="hidden lg:block h-14" aria-hidden="true" />
    </>
  );
}