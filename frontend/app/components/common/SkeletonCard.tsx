"use client";

export default function SkeletonCard() {
  return (
    <div className="w-full animate-pulse rounded-xl border border-gray-100 bg-white p-4">
      {/* Image Area */}
      <div className="relative aspect-square w-full rounded-lg bg-gray-200" />
      {/* Category */}
      <div className="mt-4 h-3 w-1/4 rounded bg-gray-200" />
      {/* Title */}
      <div className="mt-2 h-4 w-3/4 rounded bg-gray-200" />
      {/* Rating */}
      <div className="mt-2 flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-4 w-4 rounded bg-gray-200" />
        ))}
      </div>
      {/* Price + Button */}
      <div className="mt-4 flex items-center justify-between">
        <div className="h-5 w-1/3 rounded bg-gray-200" />
        <div className="h-8 w-8 rounded-full bg-gray-200" />
      </div>
    </div>
  );
}
