import type { Metadata } from "next";

const CATEGORY_SEO: Record<string, {
  title: string;
  description: string;
  keywords: string[];
}> = {
  "gadgets-electronics": {
    title: "Gadgets & Electronics Qatar | Apple Samsung Chargers Cables | GRIVA",
    description: "Buy Apple & Samsung chargers, cables, power banks, earphones, screen protectors, smartwatches in Qatar. Best prices with Cash on Delivery. Shop GRIVA now!",
    keywords: [
      "Apple charger Qatar", "Samsung cable Qatar",
      "iPhone charger Qatar price", "power bank Qatar",
      "earphones Qatar", "screen protector Qatar",
      "smartwatch Qatar", "buy electronics Qatar COD",
      "Apple accessories Doha", "Samsung accessories Qatar",
      "شواحن ايفون قطر", "شراء الكترونيات قطر"
    ]
  },
  "gaming-accessories": {
    title: "Gaming Accessories Qatar | Controllers Headsets Phone Coolers | GRIVA",
    description: "Gaming controllers, triggers, earbuds, headsets, phone coolers, finger sleeves in Qatar. Best gaming accessories with Cash on Delivery. GRIVA Qatar.",
    keywords: [
      "gaming accessories Qatar", "mobile controller Qatar",
      "gaming headset Qatar", "phone cooler Qatar",
      "gaming trigger Qatar", "finger sleeve gaming Qatar",
      "mobile gaming Qatar", "buy gaming Qatar COD",
      "best gaming headset price Qatar"
    ]
  },
  "perfumes-buhoor": {
    title: "Perfumes & Buhoor Qatar | Arabic Oud Fragrances | GRIVA",
    description: "Shop authentic Arabic perfumes, buhoor, oud, body spray, car fragrance in Qatar. Traditional and modern fragrances with Cash on Delivery. GRIVA Qatar.",
    keywords: [
      "perfume Qatar", "buhoor Qatar", "oud Qatar",
      "Arabic perfume Qatar", "buy perfume Qatar COD",
      "car fragrance Qatar", "body spray Qatar",
      "عطور قطر", "بخور قطر", "عود قطر",
      "عطور قطر اونلاين",
      "buhoor Arabic incense Qatar delivery"
    ]
  },
  "toys": {
    title: "Toys Qatar | Educational Islamic RC Cars Baby Toys | GRIVA",
    description: "Buy educational toys, Islamic learning toys, RC cars, newborn toys, metal toys in Qatar. Safe quality toys with Cash on Delivery. GRIVA Qatar.",
    keywords: [
      "toys Qatar", "educational toys Qatar",
      "Islamic toys Qatar", "RC cars Qatar",
      "baby toys Qatar", "learning toys Qatar",
      "buy toys Qatar COD", "العاب اطفال قطر",
      "metal toys Qatar", "newborn toys Qatar",
      "Islamic educational toys Qatar online"
    ]
  },
  "baby-products": {
    title: "Baby Products Qatar | Baby Bath Toys Bouncers Play Mats | GRIVA",
    description: "Shop baby bath accessories, play mats, bouncers, cradles, clothes storage in Qatar. Premium baby products with Cash on Delivery. GRIVA Qatar.",
    keywords: [
      "baby products Qatar", "baby accessories Qatar",
      "baby bath Qatar", "baby bouncer Qatar",
      "baby play mat Qatar", "baby cradle Qatar",
      "buy baby products Qatar COD",
      "منتجات اطفال قطر", "مستلزمات مولود قطر",
      "baby bouncer Qatar cash on delivery"
    ]
  },
  "kitchen-appliances-essentials": {
    title: "Kitchen Appliances Qatar | Coffee Maker Egg Boiler Racks | GRIVA",
    description: "Buy kitchen racks, coffee makers, egg boilers, egg beaters, shoe racks in Qatar. Best kitchen essentials with Cash on Delivery. GRIVA Qatar.",
    keywords: [
      "kitchen appliances Qatar", "coffee maker Qatar",
      "egg boiler Qatar", "kitchen rack Qatar",
      "shoe rack Qatar", "buy kitchen Qatar COD",
      "اجهزة مطبخ قطر", "رف مطبخ قطر",
      "ادوات مطبخ قطر"
    ]
  }
};

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const seo = CATEGORY_SEO[slug];

  if (!seo) {
    // Fallback for unknown categories
    const fallbackTitle = slug
      .replace(/[-_]/g, " ")
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

    return {
      title: `${fallbackTitle} Qatar | GRIVA`,
      description: `Shop ${fallbackTitle} online in Qatar with Cash on Delivery. GRIVA Qatar.`,
      alternates: {
        canonical: `https://thegriva.com/category/${slug}`,
      },
    };
  }

  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    openGraph: {
      title: seo.title,
      description: seo.description,
      url: `https://thegriva.com/category/${slug}`,
      type: "website",
      siteName: "GRIVA Qatar",
    },
    twitter: {
      card: "summary_large_image",
      title: seo.title,
      description: seo.description,
    },
    alternates: {
      canonical: `https://thegriva.com/category/${slug}`,
    },
  };
}

export default function CategoryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
