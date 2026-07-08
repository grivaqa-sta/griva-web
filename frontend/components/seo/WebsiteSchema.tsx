/**
 * SEO FEATURE — Website Schema — thegriva.com
 */

import React from "react";

export default function WebsiteSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": "https://thegriva.com/#website",
    "url": "https://thegriva.com",
    "name": "GRIVA Qatar",
    "description": "Qatar's premier online electronics store",
    "publisher": {
      "@id": "https://thegriva.com/#organization"
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://thegriva.com/shop?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    },
    "inLanguage": ["en-QA", "ar-QA"]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
