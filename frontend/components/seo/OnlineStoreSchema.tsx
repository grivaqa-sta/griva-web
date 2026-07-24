/**
 * SEO FEATURE — OnlineStore Schema — thegriva.com
 * Rich JSON-LD for Google Shopping & Search featuring all 6 GRIVA product categories
 */

import React from "react";

export default function OnlineStoreSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "OnlineStore",
    "@id": "https://thegriva.com/#onlinestore",
    "name": "GRIVA Qatar",
    "url": "https://thegriva.com",
    "description": "Online shopping in Qatar - Electronics, Gaming, Perfumes, Toys, Baby Products, Kitchen Appliances with Cash on Delivery",
    "logo": {
      "@type": "ImageObject",
      "url": "https://thegriva.com/images/logo.png",
      "width": 200,
      "height": 60
    },
    "areaServed": {
      "@type": "Country",
      "name": "Qatar"
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "GRIVA Products",
      "itemListElement": [
        {
          "@type": "OfferCatalog",
          "name": "Gadgets & Electronics",
          "url": "https://thegriva.com/category/gadgets-electronics"
        },
        {
          "@type": "OfferCatalog",
          "name": "Gaming Accessories",
          "url": "https://thegriva.com/category/gaming-accessories"
        },
        {
          "@type": "OfferCatalog",
          "name": "Perfumes & Buhoor",
          "url": "https://thegriva.com/category/perfumes-buhoor"
        },
        {
          "@type": "OfferCatalog",
          "name": "Toys",
          "url": "https://thegriva.com/category/toys"
        },
        {
          "@type": "OfferCatalog",
          "name": "Baby Products",
          "url": "https://thegriva.com/category/baby-products"
        },
        {
          "@type": "OfferCatalog",
          "name": "Kitchen Appliances & Essentials",
          "url": "https://thegriva.com/category/kitchen-appliances-essentials"
        }
      ]
    },
    "paymentAccepted": "Cash on Delivery",
    "currenciesAccepted": "QAR",
    "priceRange": "QAR 10 - QAR 5000"
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
