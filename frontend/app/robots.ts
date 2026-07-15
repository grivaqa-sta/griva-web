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
    "/track-order/",
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
        disallow: ["/admin/", "/api/", "/delivery/"],
      },
      {
        userAgent: "Googlebot-Image",
        allow: ["/", "/images/"],
        disallow: ["/admin/"],
      }
    ],
    sitemap: "https://thegriva.com/sitemap.xml",
    host: "https://thegriva.com",
  };
}
