"use client";

interface BadgeProps {
  text: string;
  variant?: "sale" | "hot" | "new" | "neutral";
  className?: string;
}

export default function Badge({ text, variant = "neutral", className = "" }: BadgeProps) {
  const getStyles = () => {
    switch (variant) {
      case "sale":
        return "bg-orange-500 text-white";
      case "hot":
        return "bg-red-600 text-white animate-pulse";
      case "new":
        return "bg-green-600 text-white";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${getStyles()} ${className}`}
    >
      {text}
    </span>
  );
}
