"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { Category, SubCategory } from "@/app/types/types";
import { categoryService } from "@/app/services/category.service";

interface CategoryWithSubcategories extends Category {
  subcategories: SubCategory[];
}

export default function SubNavbar() {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [navLinks, setNavLinks] = useState<CategoryWithSubcategories[]>([]);
  const pathname = usePathname();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoryService.getCategoriesWithSubcategories();
        const raw: CategoryWithSubcategories[] =
          Array.isArray(res) ? res :
            Array.isArray(res?.data) ? res.data :
              Array.isArray(res?.categories) ? res.categories :
                [];
        setNavLinks(raw.filter((cat) => cat.is_active));
      } catch (err) {
        console.error("Failed to load categories:", err);
        try {
          const fallbackRes = await categoryService.getCategories();
          const raw: Category[] =
            Array.isArray(fallbackRes) ? fallbackRes :
              Array.isArray(fallbackRes?.data) ? fallbackRes.data :
                Array.isArray(fallbackRes?.categories) ? fallbackRes.categories :
                  [];
          setNavLinks(
            raw.filter((cat) => cat.is_active)
               .map((cat) => ({ ...cat, subcategories: [] }))
          );
        } catch (fallbackErr) {
          console.error("Fallback fetch also failed:", fallbackErr);
        }
      }
    };
    fetchCategories();
  }, []);

  return (
    <>
      {/* Inject keyframe animation + Sen font */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sen:wght@400;700&display=swap');

        /*
          Rows sit flush against each other (no gap, no per-row border).
          Rounding only applies to the outer 4 corners of the whole
          stack, via overflow-hidden + rounded-lg on the parent. Each
          row still fades/slides in on its own timer, one after another.
        */
        @keyframes subnavRowIn {
          0% {
            opacity: 0;
            transform: translateY(-10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .subnav-dropdown-row {
          opacity: 0;
          animation: subnavRowIn 380ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .subnav-link {
          font-family: 'Sen', sans-serif;
        }

        .subnav-dropdown-panel {
          font-family: 'Sen', sans-serif;
        }
      `}</style>

      <div className="hidden lg:block w-full border-y border-gray-200 bg-white px-4 sm:px-6 lg:px-8 xl:px-10">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-center px-4 sm:px-6 lg:px-8">

          <nav className="flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname.startsWith(link.href);
              const activeSubcategories = link.subcategories?.filter(
                (sub) => sub.is_active
              ) ?? [];

              // If more than 8 items → use 2-column grid layout
              const isWide = activeSubcategories.length > 8;

              return (
                <div
                  key={link.id}
                  className="relative flex h-14 items-center"
                  onMouseEnter={() => setActiveDropdown(link.slug)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  {/* Nav trigger link */}
                  <Link
                    href={link.href}
                    className={`subnav-link relative flex items-center gap-1 px-3 text-[13px] font-semibold transition-colors duration-200 whitespace-nowrap
                      ${isActive ? "text-orange-500" : "text-black hover:text-orange-500"}`}
                  >
                    {isActive && (
                      <span className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full bg-orange-500" />
                    )}
                    {link.title}
                    {activeSubcategories.length > 0 && (
                      <ChevronDown
                        size={12}
                        className={`transition-transform duration-200 ${
                          activeDropdown === link.slug ? "rotate-180 text-orange-400" : "text-gray-400"
                        }`}
                      />
                    )}
                  </Link>

                  {/* Dropdown panel */}
                  {activeDropdown === link.slug && activeSubcategories.length > 0 && (
                    <div className="absolute left-0 top-full z-50 pt-1">
                      {/*
                        No shared panel background. Rows sit flush
                        against each other (no gap) so they read as one
                        continuous block once they've all appeared, but
                        each row still animates in on its own, one by
                        one. Rounding is only applied to the outer 4
                        corners of the whole stack (top corners on the
                        first row, bottom corners on the last row).
                      */}
                      <div
                        className={`flex flex-col shadow-md overflow-hidden rounded-lg ${isWide ? "w-[380px] flex-row flex-wrap" : "w-[200px]"}`}
                      >
                        {/* Each item animates in on its own, but sits flush against its neighbors */}
                        {activeSubcategories.map((item, idx) => (
                          <Link
                            key={item.id}
                            href={item.href}
                            className={`subnav-dropdown-row flex items-center gap-2 bg-white px-4 py-[9px] text-[13px] text-gray-600 hover:bg-orange-50 hover:text-orange-500 transition-colors
                              ${isWide ? "w-1/2" : "w-full"}`}
                            style={{ animationDelay: `${idx * 100}ms` }}
                          >
                            <span className="h-[5px] w-[5px] rounded-full bg-orange-300 shrink-0" />
                            {item.title}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

        </div>
      </div>
    </>
  );
}