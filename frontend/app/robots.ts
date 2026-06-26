import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const commonDisallows = [
    "/admin/",
    "/delivery/",
    "/api/",
    "/account/",
    "/cart",
    "/checkout/",
    "/order-success/",
    "/auth/",
    "/_next/",
    "/static/",
    "/*.json$"
  ];

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: commonDisallows,
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: commonDisallows,
      },
      {
        userAgent: "Googlebot-Image",
        allow: "/",
        disallow: ["/admin/"],
      }
    ],
    sitemap: "https://thegriva.com/sitemap.xml",
    host: "https://thegriva.com",
  };
}
