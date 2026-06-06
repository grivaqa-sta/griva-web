"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  viewAllLink?: string;
  viewAllText?: string;
}

export default function SectionHeading({
  title,
  subtitle,
  viewAllLink,
  viewAllText = "View All",
}: SectionHeadingProps) {
  return (
    <div className="flex items-end justify-between border-b border-gray-100 pb-4 ">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-1 text-sm text-gray-500">
            {subtitle}
          </p>
        )}
      </div>
      {viewAllLink && (
        <Link
          href={viewAllLink}
          className="group flex items-center gap-1 text-sm font-semibold text-orange-500 hover:text-orange-600 transition-colors"
        >
          {viewAllText}
          <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}
