"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, Heart, Menu } from "lucide-react";
import ShopeCategoryDropDown from "../dropdowns/ShopeCategoryDropDown";
import { useWishlist } from "@/app/context/WishlistContext";

interface DropdownItem {
  label: string;
  href: string;
}

interface DropdownData {
  [key: string]: DropdownItem[];
}

interface NavLink {
  label: string;
  href: string;
  hasDropdown?: boolean;
  active?: boolean;
}

const shopCategories: DropdownItem[] = [
  { label: "Laptops", href: "/category/laptops" },
  { label: "Television", href: "/category/television" },
  { label: "Speakers", href: "/category/speakers" },
  { label: "Headphones", href: "/category/headphones" },
  { label: "Gaming", href: "/category/gaming" },
  { label: "Gadgets", href: "/category/gadgets" },
];

const dropdownData: DropdownData = {
  Home: [
    { label: "Home Page", href: "/" },
  ],
  Laptops: [
    { label: "MacBook Air/Pro", href: "/category/laptops" },
    { label: "Windows Laptops", href: "/category/laptops" },
  ],
  Television: [
    { label: "OLED Smart TVs", href: "/category/television" },
    { label: "QLED Displays", href: "/category/television" },
  ],
  Headphones: [
    { label: "Over-Ear ANC", href: "/category/headphones" },
    { label: "Wireless Earbuds", href: "/category/headphones" },
  ],
};

const navLinks: NavLink[] = [
  { label: "Home", href: "/", hasDropdown: true, active: true },
  { label: "Laptops", href: "/category/laptops", hasDropdown: true },
  { label: "Headphones", href: "/category/headphones", hasDropdown: true },
  { label: "Television", href: "/category/television", hasDropdown: true },
  { label: "Gadgets", href: "/category/gadgets" },
];

export default function SubNavbar() {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const { items: wishlistItems } = useWishlist();

  return (
    <div className="hidden lg:block w-full border-y border-gray-200 bg-white px-4 sm:px-6 lg:px-8 xl:px-10">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left Side */}
        <div className="flex items-center">
          {/* Categories Button */}
          <div
            className="relative h-14"
            onMouseEnter={() => setActiveDropdown("shop-categories")}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <button className="flex h-14 items-center gap-3 border-r border-gray-200 pr-10 hover:text-orange-500 transition-colors">
              <Menu size={20} className="text-black" />
              <span className="text-sm font-semibold text-black hover:text-orange-500 transition-colors">
                Shop Categories
              </span>
              <ChevronDown size={16} className="text-gray-500" />
            </button>

            <ShopeCategoryDropDown
              items={shopCategories}
              isOpen={activeDropdown === "shop-categories"}
            />
          </div>

          {/* Navigation */}
          <nav className="ml-10 hidden items-center gap-12 lg:flex">
            {navLinks.map((link) => (
              <div
                key={link.label}
                className="relative flex h-14 items-center"
                onMouseEnter={() => setActiveDropdown(link.label)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link
                  href={link.href}
                  className={`flex items-center gap-1 text-sm font-semibold transition-colors duration-200 ${
                    link.active
                      ? "text-orange-500 font-bold"
                      : "text-black hover:text-orange-500"
                  }`}
                >
                  {link.label}
                  {link.hasDropdown && (
                    <ChevronDown size={14} className="mt-[1px]" />
                  )}
                </Link>

                {link.hasDropdown && (
                  <div className="absolute left-0 top-full">
                    <ShopeCategoryDropDown
                      items={dropdownData[link.label] || []}
                      isOpen={activeDropdown === link.label}
                    />
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-8">
          {/* Wishlist */}
          <Link
            href="/wishlist"
            className="relative flex items-center border-r border-gray-200 pr-8 group cursor-pointer"
          >
            <Heart size={22} className="stroke-[1.8] text-black group-hover:text-orange-500 transition-colors" />
            {wishlistItems.length > 0 && (
              <span className="absolute -right-1 top-0 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white px-1 animate-pulse">
                {wishlistItems.length}
              </span>
            )}
          </Link>

          {/* Deal */}
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
