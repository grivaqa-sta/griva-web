/**
 * Google Shopping XML Feed — /api/shopping-feed
 * Submit this URL to Google Merchant Center for daily fetch.
 * URL: https://thegriva.com/api/shopping-feed
 */

import { NextResponse } from "next/server";

// Map GRIVA categories to Google Shopping taxonomy IDs
function getGoogleCategory(category: string): string {
  const mapping: Record<string, string> = {
    "Gadgets & Electronics": "222",
    "Gaming Accessories": "1279",
    "Perfumes & Buhoor": "2915",
    "Toys": "1239",
    "Baby Products": "537",
    "Kitchen Appliances & Essentials": "730",
  };
  // Try exact match first, then partial match
  if (mapping[category]) return mapping[category];
  const lc = (category || "").toLowerCase();
  if (lc.includes("gaming")) return "1279";
  if (lc.includes("perfume") || lc.includes("buhoor") || lc.includes("fragrance")) return "2915";
  if (lc.includes("toy")) return "1239";
  if (lc.includes("baby")) return "537";
  if (lc.includes("kitchen")) return "730";
  return "222"; // Default: Electronics
}

function escapeXml(str: string): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

  let products: any[] = [];
  try {
    const res = await fetch(`${apiUrl}/products?limit=5000`, {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const data = await res.json();
      products = Array.isArray(data) ? data : data.data || [];
    }
  } catch (err) {
    console.error("Shopping feed: Failed to fetch products:", err);
  }

  const items = products
    .filter((p: any) => p && p.title && p.price)
    .map((p: any) => {
      const title = escapeXml(p.title || "");
      const desc = escapeXml(
        (p.short_description || p.description || "")
          .replace(/<[^>]*>/g, "")
          .slice(0, 5000)
      );
      const slug = p.slug || p.id;
      const link = `https://thegriva.com/product/${slug}`;
      const imageLink = p.main_image_url || (p.gallery_images?.[0]) || "";
      const additionalImages = (p.gallery_images || []).slice(1, 3);
      const price = `${Number(p.price || 0).toFixed(2)} QAR`;
      const originalPrice = p.original_price ? `${Number(p.original_price).toFixed(2)} QAR` : "";
      const availability = (p.stock ?? p.stock_quantity ?? 0) > 0 ? "in_stock" : "out_of_stock";
      const brand = escapeXml(p.brand || "GRIVA");
      const categoryTitle = typeof p.category === "object" ? p.category.title : (p.category || "");
      const subCategoryTitle = typeof p.subCategory === "object" ? p.subCategory.title : (p.subCategory || "");
      const googleCat = getGoogleCategory(categoryTitle);

      return `
    <item>
      <g:id>${p.id}</g:id>
      <g:title>${title} - Qatar</g:title>
      <g:description>${desc}</g:description>
      <g:link>${link}</g:link>
      <g:image_link>${escapeXml(imageLink)}</g:image_link>${additionalImages.map((img: string) => `
      <g:additional_image_link>${escapeXml(img)}</g:additional_image_link>`).join("")}
      <g:price>${price}</g:price>${originalPrice ? `
      <g:sale_price>${price}</g:sale_price>` : ""}
      <g:availability>${availability}</g:availability>
      <g:condition>new</g:condition>
      <g:brand>${brand}</g:brand>
      <g:google_product_category>${googleCat}</g:google_product_category>
      <g:product_type>${escapeXml(categoryTitle)}${subCategoryTitle ? ` > ${escapeXml(subCategoryTitle)}` : ""}</g:product_type>
      <g:shipping>
        <g:country>QA</g:country>
        <g:price>0 QAR</g:price>
        <g:service>Cash on Delivery</g:service>
      </g:shipping>
      <g:identifier_exists>false</g:identifier_exists>
      <g:custom_label_0>Qatar</g:custom_label_0>
      <g:custom_label_1>COD</g:custom_label_1>
      <g:custom_label_2>${escapeXml(categoryTitle)}</g:custom_label_2>${p.is_bestseller ? `
      <g:custom_label_3>bestseller</g:custom_label_3>` : ""}${p.is_new_arrival ? `
      <g:custom_label_4>new_arrival</g:custom_label_4>` : ""}
    </item>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>GRIVA Qatar</title>
    <link>https://thegriva.com</link>
    <description>Qatar Online Shopping - Electronics, Gaming, Perfumes, Toys, Baby Products, Kitchen Essentials</description>${items}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
