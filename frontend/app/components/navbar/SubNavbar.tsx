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
        console.log("API response:", res);

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
            raw
              .filter((cat) => cat.is_active)
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
    <div className="hidden lg:block w-full border-y border-gray-200 bg-white px-4 sm:px-6 lg:px-8 xl:px-10">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Category Nav Links */}
        <nav className="flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = pathname.startsWith(link.href);
            const activeSubcategories = link.subcategories?.filter(
              (sub) => sub.is_active
            ) ?? [];

            return (
              <div
                key={link.id}
                className="relative flex h-14 items-center"
                onMouseEnter={() => setActiveDropdown(link.slug)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link
                  href={link.href}
                  className={`relative flex items-center gap-1 px-3 text-[13px] font-semibold transition-colors duration-200 whitespace-nowrap
                    ${isActive ? "text-orange-500" : "text-black hover:text-orange-500"}`}
                >
                  {isActive && (
                    <span className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full bg-orange-500" />
                  )}
                  {link.title}
                  {activeSubcategories.length > 0 && (
                    <ChevronDown size={12} className="text-gray-400" />
                  )}
                </Link>

                {activeDropdown === link.slug && activeSubcategories.length > 0 && (
                  <div className="absolute left-0 top-full z-50 pt-1">
                    <div className="min-w-[200px] overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg">
                      <div className="bg-orange-50 px-4 py-2 border-b border-orange-100">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-orange-500">
                          {link.title}
                        </p>
                      </div>
                      {activeSubcategories.map((item) => (
                        <Link
                          key={item.id}
                          href={item.href}
                          className="flex items-center gap-2 px-4 py-2 text-[13px] text-gray-600 hover:bg-orange-50 hover:text-orange-500 transition-colors"
                        >
                          <span className="h-1 w-1 rounded-full bg-gray-300 shrink-0" />
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

        {/* Right Side */}
        <div className="flex items-center gap-6">
          <Link href="/shop" className="text-[13px] font-semibold text-gray-600 hover:text-orange-500 transition-colors">
            New Arrivals
          </Link>
          <Link href="/shop" className="text-[13px] font-semibold text-gray-600 hover:text-orange-500 transition-colors">
            Best Deals
          </Link>
          <Link href="/shop" className="flex items-center gap-2 group">
            <span className="text-sm font-semibold text-black group-hover:text-orange-500 transition-colors">
              Today&apos;s Deal
            </span>
            <span className="rounded bg-orange-500 px-1.5 py-[2px] text-[10px] font-bold uppercase text-white animate-bounce">
              Hot
            </span>
          </Link>
        </div>

      </div>
    </div>
  );
}