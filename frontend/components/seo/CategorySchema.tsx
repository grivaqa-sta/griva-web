/**
 * SEO FEATURE — Category Schema — thegriva.com
 * CollectionPage JSON-LD with BreadcrumbList for category pages
 */

import React from "react";

interface CategorySchemaProps {
  categoryName: string;
  categorySlug: string;
  description?: string;
  products?: Array<{ slug: string; title: string }>;
}

export default function CategorySchema({ categoryName, categorySlug, description, products }: CategorySchemaProps) {
  const categoryUrl = `https://thegriva.com/category/${categorySlug}`;

  const schema: any = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": `${categoryName} - GRIVA Qatar`,
    "description": description || `Buy ${categoryName} online in Qatar. Best prices with Cash on Delivery.`,
    "url": categoryUrl,
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://thegriva.com"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Shop",
          "item": "https://thegriva.com/shop"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": categoryName,
          "item": categoryUrl
        }
      ]
    }
  };

  if (products && products.length > 0) {
    schema.mainEntity = {
      "@type": "ItemList",
      "itemListElement": products.slice(0, 10).map((p, i) => ({
        "@type": "ListItem",
        "position": i + 1,
        "url": `https://thegriva.com/product/${p.slug}`,
        "name": p.title
      }))
    };
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
