import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://thegriva.com";
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

  // 1. Static pages
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}`, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${baseUrl}/shop`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/faq`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 },
    { url: `${baseUrl}/same-day-delivery-doha`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/cash-on-delivery-qatar`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/electronics-store-qatar`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/tech-gifts-qatar`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/apple-products-qatar`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/gaming-store-qatar`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/shipping`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${baseUrl}/returns`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${baseUrl}/terms`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
  ];

  let productRoutes: MetadataRoute.Sitemap = [];
  let categoryRoutes: MetadataRoute.Sitemap = [];

  try {
    const resProducts = await fetch(`${apiUrl}/products?limit=1000`, { next: { revalidate: 3600 } });
    if (resProducts.ok) {
      const data = await resProducts.json();
      const products = Array.isArray(data) ? data : (data.data || []);
      productRoutes = products
        .filter((p: any) => p && (p.slug || p.id))
        .map((p: any) => ({
          url: `${baseUrl}/product/${p.slug || p.id}`,
          lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
          changeFrequency: "weekly",
          priority: 0.8,
        }));
    }
  } catch (error) {
    console.error("Sitemap generator: products fetch error:", error);
  }

  try {
    const resCategories = await fetch(`${apiUrl}/categories`, { next: { revalidate: 3600 } });
    if (resCategories.ok) {
      const data = await resCategories.json();
      const categories = Array.isArray(data) ? data : (data.data || []);
      categoryRoutes = categories
        .filter((c: any) => c && c.slug)
        .map((c: any) => ({
          url: `${baseUrl}/category/${c.slug}`,
          lastModified: c.updatedAt ? new Date(c.updatedAt) : new Date(),
          changeFrequency: "weekly",
          priority: 0.7,
        }));
    }
  } catch (error) {
    console.error("Sitemap generator: categories fetch error:", error);
  }

  return [...staticRoutes, ...productRoutes, ...categoryRoutes];
}
