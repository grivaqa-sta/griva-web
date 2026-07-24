/**
 * SEO FEATURE — Organization Schema — thegriva.com
 */

import React from "react";

export default function OrganizationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://thegriva.com/#organization",
    "name": "GRIVA Qatar",
    "alternateName": ["GRIVA", "Griva Electronics Qatar", "griva.qa"],
    "url": "https://thegriva.com",
    "logo": {
      "@type": "ImageObject",
      "url": "https://thegriva.com/images/logo.png",
      "width": 200,
      "height": 60,
      "caption": "GRIVA Qatar Logo"
    },
    "image": "https://thegriva.com/og-image.jpg",
    "description": "Qatar's premier online store offering electronics, gaming accessories, perfumes, buhoor, toys, baby products and kitchen essentials with same day delivery and cash on delivery across all Qatar areas.",
    "foundingDate": "2024",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "QA",
      "addressLocality": "Doha",
      "addressRegion": "Ad Dawhah"
    },
    "contactPoint": [
      {
        "@type": "ContactPoint",
        "contactType": "customer service",
        "availableLanguage": ["English", "Arabic"],
        "contactOption": "TollFree",
        "areaServed": "QA"
      },
      {
        "@type": "ContactPoint",
        "contactType": "sales",
        "availableLanguage": ["English", "Arabic"],
        "areaServed": "QA"
      }
    ],
    "sameAs": [
      "https://instagram.com/griva.qa",
      "https://facebook.com/grivaqa",
      "https://snapchat.com/add/griva.qa",
      "https://twitter.com/grivaqa",
      "https://tiktok.com/@griva.qa"
    ],
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "GRIVA Product Catalog",
      "itemListElement": [
        { "@type": "OfferCatalog", "name": "Gadgets & Electronics", "url": "https://thegriva.com/category/gadgets-electronics" },
        { "@type": "OfferCatalog", "name": "Gaming Accessories", "url": "https://thegriva.com/category/gaming-accessories" },
        { "@type": "OfferCatalog", "name": "Perfumes & Buhoor", "url": "https://thegriva.com/category/perfumes-buhoor" },
        { "@type": "OfferCatalog", "name": "Toys", "url": "https://thegriva.com/category/toys" },
        { "@type": "OfferCatalog", "name": "Baby Products", "url": "https://thegriva.com/category/baby-products" },
        { "@type": "OfferCatalog", "name": "Kitchen Appliances & Essentials", "url": "https://thegriva.com/category/kitchen-appliances-essentials" }
      ]
    },
    "areaServed": {
      "@type": "Country",
      "name": "Qatar"
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
