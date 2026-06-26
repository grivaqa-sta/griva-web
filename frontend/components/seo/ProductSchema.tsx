/**
 * SEO FEATURE — Product Schema — thegriva.com
 */

import React from "react";

interface ProductSchemaProps {
  product: any;
}

export default function ProductSchema({ product }: ProductSchemaProps) {
  if (!product) return null;

  const getAbsoluteUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    return `https://thegriva.com${url.startsWith("/") ? "" : "/"}${url}`;
  };

  const title = product.title || product.name || "";
  const description = product.description || product.short_description || "";
  
  // Image URL mapping
  let imageUrls: string[] = [];
  if (product.gallery_images && product.gallery_images.length > 0) {
    imageUrls = product.gallery_images.map((img: string) => getAbsoluteUrl(img));
  } else if (product.images && product.images.length > 0) {
    imageUrls = product.images.map((img: any) => getAbsoluteUrl(typeof img === "string" ? img : img.src || ""));
  } else {
    const mainImg = product.main_image_url || product.image;
    if (mainImg) {
      imageUrls = [getAbsoluteUrl(typeof mainImg === "string" ? mainImg : mainImg.src || "")];
    }
  }

  const sku = product.sku || String(product.id || "");
  const brandName = product.brand || "GriVA Qatar";
  const categoryName = typeof product.category === "object" ? product.category.title : product.category || "";
  const productUrl = `https://thegriva.com/product/${product.id || product.slug || ""}`;

  const priceVal = typeof product.price === "string" ? product.price : String(product.price || "0");
  const stockQty = typeof product.stock === "number" ? product.stock : (product.stock_quantity ?? 10);
  const inStock = stockQty > 0;

  // Validity date set to 1 year from now
  const nextYear = new Date();
  nextYear.setFullYear(nextYear.getFullYear() + 1);
  const priceValidUntil = nextYear.toISOString().split("T")[0];

  const ratingValue = product.rating || 0;
  const reviewCount = product.review_count || product.reviewCount || (product.reviews?.length || 0);

  const schema: any = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `https://thegriva.com/product/${product.id || product.slug || ""}`,
    "name": title,
    "description": description,
    "image": imageUrls.length > 1 ? imageUrls : (imageUrls[0] || ""),
    "sku": sku,
    "mpn": sku,
    "brand": {
      "@type": "Brand",
      "name": brandName
    },
    "category": categoryName,
    "url": productUrl,
    "offers": {
      "@type": "Offer",
      "@id": `${productUrl}#offer`,
      "url": productUrl,
      "priceCurrency": "QAR",
      "price": priceVal,
      "priceValidUntil": priceValidUntil,
      "availability": inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "itemCondition": "https://schema.org/NewCondition",
      "seller": {
        "@type": "Organization",
        "name": "GriVA Qatar",
        "url": "https://thegriva.com"
      },
      "hasMerchantReturnPolicy": {
        "@type": "MerchantReturnPolicy",
        "applicableCountry": "QA",
        "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
        "merchantReturnDays": 30,
        "returnMethod": "https://schema.org/ReturnByMail",
        "returnFees": "https://schema.org/FreeReturn"
      },
      "shippingDetails": {
        "@type": "OfferShippingDetails",
        "shippingRate": {
          "@type": "MonetaryAmount",
          "value": 0,
          "currency": "QAR"
        },
        "shippingDestination": {
          "@type": "DefinedRegion",
          "addressCountry": "QA"
        },
        "deliveryTime": {
          "@type": "ShippingDeliveryTime",
          "handlingTime": {
            "@type": "QuantitativeValue",
            "minValue": 0,
            "maxValue": 1,
            "unitCode": "DAY"
          },
          "transitTime": {
            "@type": "QuantitativeValue",
            "minValue": 0,
            "maxValue": 1,
            "unitCode": "DAY"
          }
        }
      }
    }
  };

  if (reviewCount > 0) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      "ratingValue": ratingValue,
      "reviewCount": reviewCount,
      "bestRating": 5,
      "worstRating": 1
    };
  }

  if (product.reviews && product.reviews.length > 0) {
    schema.review = product.reviews.map((rev: any) => {
      const authorName = rev.author || rev.author_name || "Verified Buyer";
      const commentText = rev.body || rev.comment || "";
      const publishDate = rev.date || rev.createdAt || new Date().toISOString();
      const dateFormatted = publishDate.split("T")[0];

      return {
        "@type": "Review",
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": rev.rating || 5,
          "bestRating": 5
        },
        "author": {
          "@type": "Person",
          "name": authorName
        },
        "reviewBody": commentText,
        "datePublished": dateFormatted
      };
    });
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
