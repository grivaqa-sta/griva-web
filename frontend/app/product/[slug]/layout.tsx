import type { Metadata, ResolvingMetadata } from "next";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

interface Props {
  params: Promise<{ slug: string }>;
}

/**
 * Server-side dynamic metadata generation for product pages.
 * This enables proper OG images for WhatsApp, Instagram, Facebook, and Snapchat sharing.
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

    const title = product.title || "Product";
    const description = product.description
      ? product.description.slice(0, 160).replace(/<[^>]*>/g, "")
      : `Buy ${title} in Qatar. Fast delivery across Doha with Cash on Delivery.`;

    const priceStr = product.price
      ? `QAR ${Number(product.price).toFixed(2)}`
      : "";

    const imageUrl = product.main_image_url || (await parent).openGraph?.images?.[0] || "/images/logo-dark.png";

    const pageUrl = `https://thegriva.com/product/${slug}`;

    return {
      title: `${title} — GRIVA Qatar`,
      description: `${priceStr ? priceStr + " | " : ""}${description}`,
      openGraph: {
        title: `${title} | GRIVA Qatar`,
        description: `${priceStr ? priceStr + " — " : ""}${description}`,
        url: pageUrl,
        siteName: "GRIVA Qatar",
        type: "website",
        images: [
          {
            url: imageUrl,
            width: 800,
            height: 800,
            alt: title,
          },
        ],
        locale: "en_QA",
      },
      twitter: {
        card: "summary_large_image",
        title: `${title} | GRIVA Qatar`,
        description: `${priceStr ? priceStr + " — " : ""}${description}`,
        images: [imageUrl],
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
