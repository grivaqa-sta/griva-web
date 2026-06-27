"use client";

import { Review } from "@/app/types/types";
import { Star, CheckCircle } from "lucide-react";

interface ReviewCardProps {
  review: Review;
}

export default function ReviewCard({ review }: ReviewCardProps) {
  return (
    <div className="border-b border-gray-100 py-6">
      <div className="flex items-start justify-between gap-4">
        {/* Author info */}
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-50 text-sm font-bold text-orange-500">
            {review.author.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="text-sm font-bold text-gray-900">{review.author}</h4>
              {review.verified && (
                <span className="flex items-center gap-0.5 text-[10px] font-semibold text-green-600">
                  <CheckCircle className="h-3 w-3 fill-green-600 text-white" />
                  Verified Buyer
                </span>
              )}
            </div>
            <p className="text-[11px] text-gray-400">{review.date}</p>
          </div>
        </div>

        {/* Rating Stars */}
        <div className="flex items-center gap-0.5">
          {[...Array(5)].map((_, idx) => (
            <Star
              key={idx}
              className={`h-4. w-4. ${
                idx < review.rating
                  ? "fill-orange-400 text-orange-400"
                  : "text-gray-200"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Review Text */}
      <div className="mt-3">
        <p className="text-xs leading-relaxed text-gray-500">
          {review.body}
        </p>
      </div>
    </div>
  );
}
