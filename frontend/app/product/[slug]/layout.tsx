import type { Metadata, ResolvingMetadata } from "next";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

interface Props {
  params: Promise<{ slug: string }>;
}

/**
 * Server-side dynamic metadata generation for product pages.
 * This enables proper OG images for WhatsApp, Instagram, Facebook, and Snapchat sharing.
 * Also generates SEO-optimized titles with Qatar/COD keywords for Google ranking.
 */
export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params;

  try {
    const res = await fetch(`${API_BASE}/products/slug/${slug}`, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!res.ok) throw new Error("Product not found");

    const data = await res.json();
    const product = data?.data || data?.product || data;

    if (!product) throw new Error("No product data");

    const productName = product.title || "Product";
    const brandName = product.brand || "GRIVA";
    const priceStr = product.price
      ? `QAR ${Number(product.price).toFixed(2)}`
      : "";
    const cleanDescription = product.description
      ? product.description.slice(0, 160).replace(/<[^>]*>/g, "")
      : `Buy ${productName} in Qatar. Fast delivery across Doha with Cash on Delivery.`;

    const title = `${productName} Price in Qatar | Buy Online COD | GRIVA`;
    const description = `Buy ${productName} in Qatar${priceStr ? ` at ${priceStr}` : ""}. ${cleanDescription}. Cash on Delivery across Qatar. Free shipping. GRIVA Qatar.`;

    const imageUrl = product.main_image_url || (await parent).openGraph?.images?.[0] || "/images/logo-dark.png";
    const pageUrl = `https://thegriva.com/product/${slug}`;

    const categoryName = typeof product.category === "object" ? product.category.title : (product.category || "");

    return {
      title,
      description,
      keywords: [
        `${productName} Qatar`,
        `${productName} price Qatar`,
        `buy ${productName} Qatar`,
        `${brandName} Qatar`,
        `${productName} COD Qatar`,
        `${productName} Doha`,
        categoryName ? `${categoryName} Qatar` : "",
      ].filter(Boolean),
      openGraph: {
        title: `${productName} | GRIVA Qatar`,
        description: `${priceStr ? priceStr + " — " : ""}${cleanDescription}`,
        url: pageUrl,
        siteName: "GRIVA Qatar",
        type: "website",
        images: [
          {
            url: imageUrl,
            width: 800,
            height: 800,
            alt: productName,
          },
        ],
        locale: "en_QA",
      },
      twitter: {
        card: "summary_large_image",
        title: `${productName} | GRIVA Qatar`,
        description: `${priceStr ? priceStr + " — " : ""}${cleanDescription}`,
        images: [imageUrl],
      },
      alternates: {
        canonical: pageUrl,
      },
    };
  } catch {
    // Fallback metadata if product fetch fails
    return {
      title: "Product — GRIVA Qatar",
      description: "Shop premium products in Qatar with fast Doha delivery and Cash on Delivery.",
      openGraph: {
        title: "Product — GRIVA Qatar",
        description: "Shop premium products in Qatar with fast Doha delivery.",
        images: ["/images/logo-dark.png"],
        siteName: "GRIVA Qatar",
        type: "website",
      },
    };
  }
}

export default function ProductLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
