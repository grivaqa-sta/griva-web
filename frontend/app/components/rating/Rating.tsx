"use client";
import { Star } from "lucide-react";

function Rating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5 leading-none">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0 ${
            star <= rating
              ? "fill-orange-400 text-orange-400"
              : "fill-gray-200 text-gray-200"
          }`}
          strokeWidth={2}
        />
      ))}
    </div>
  );
}

export default Rating;