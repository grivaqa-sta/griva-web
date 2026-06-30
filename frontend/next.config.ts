import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "images.pexels.com",
      },
      {
        protocol: "https",
        hostname: "www.pngmart.com",
      },
      {
        protocol: "https",
        hostname: "fdn2.gsmarena.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "**.r2.dev",
      },
      {
        protocol: "https",
        hostname: "**.cloudflarestorage.com",
      },
      {
        protocol: "https",
        hostname: "**.blob.core.windows.net",
      }
    ],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: false,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(self)",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/home",
        destination: "/",
        permanent: true,
      },
      {
        source: "/products",
        destination: "/shop",
        permanent: true,
      },
      {
        source: "/store",
        destination: "/shop",
        permanent: true,
      },
      {
        source: "/electronics",
        destination: "/category/electronics",
        permanent: true,
      },
      {
        source: "/headphones",
        destination: "/category/headphones",
        permanent: true,
      },
      {
        source: "/laptops",
        destination: "/category/laptops",
        permanent: true,
      },
      {
        source: "/gaming",
        destination: "/category/gaming",
        permanent: true,
      },
      {
        source: "/delivery",
        destination: "/same-day-delivery-doha",
        permanent: true,
      },
      {
        source: "/cod",
        destination: "/cash-on-delivery-qatar",
        permanent: true,
      },
    ];
  },
  compress: true,
  poweredByHeader: false,
  trailingSlash: false,
  generateEtags: true,
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
