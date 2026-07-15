import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Navbar from "@/app/components/navbar/Navbar";
import AnnouncementBar from "@/app/components/navbar/AnnouncementBar";
import Footer from "@/app/components/footer/Footer";
import { Providers } from "@/app/context/Providers";
import CartDrawer from "@/app/components/cart/CartDrawer";
import BackToTop from "@/app/components/common/BackToTop";
import GrivaAIChatbot from "@/app/components/common/GrivaAIChatbot";
import PixelScripts from "@/app/components/common/PixelScripts";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://thegriva.com"),
  title: {
    default: "GRIVA Qatar | Online Shopping - Electronics, Toys, Perfumes | Cash on Delivery",
    template: "%s | GRIVA Qatar",
  },
  description: "Shop online in Qatar with GRIVA. Best deals on Apple & Samsung accessories, gaming gadgets, perfumes, buhoor, toys, baby products & kitchen essentials. Free delivery across Qatar. Cash on Delivery available.",
  keywords: [
    // Tier 1 — English Qatar keywords
    "online shopping Qatar",
    "buy electronics Qatar",
    "Apple accessories Qatar",
    "Samsung charger Qatar",
    "iPhone charger Qatar",
    "cash on delivery Qatar",
    "online store Qatar",
    "gadgets Qatar",
    "gaming accessories Qatar",
    "perfumes Qatar",
    "buhoor Qatar",
    "toys Qatar",
    "baby products Qatar",
    "kitchen appliances Qatar",
    "COD Qatar",
    "free delivery Qatar",
    "Doha online shopping",
    "Qatar e-commerce",
    // Tier 2 — Medium priority
    "iPhone accessories Doha",
    "power bank price Qatar",
    "smartwatch Qatar price",
    "gaming controller Qatar",
    "educational toys Qatar",
    "Arabic perfume Qatar",
    "coffee maker Qatar",
    "same day delivery electronics Qatar",
    "thegriva.com",
    "griva qatar",
    "griva electronics",
    "griva doha",
    "griva online store",
    // Tier 3 — Arabic keywords
    "تسوق اون لاين قطر",
    "شراء الكترونيات قطر",
    "شواحن ايفون قطر",
    "العاب اطفال قطر",
    "عطور قطر",
    "بخور قطر",
    "منتجات اطفال قطر",
    "الدفع عند الاستلام قطر",
    "ادوات مطبخ قطر",
    // Long tail
    "buy Apple charger cash on delivery Qatar",
    "best gaming headset price Qatar",
    "Islamic educational toys Qatar online",
    "buhoor Arabic incense Qatar delivery",
    "baby bouncer Qatar cash on delivery",
  ],
  applicationName: "GRIVA Qatar",
  authors: [{ name: "GRIVA", url: "https://thegriva.com" }],
  generator: "Next.js",
  creator: "GRIVA Qatar",
  publisher: "GRIVA Qatar",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_QA",
    alternateLocale: "ar_QA",
    url: "https://thegriva.com",
    siteName: "GRIVA Qatar",
    title: "GRIVA Qatar - Online Shopping with Cash on Delivery",
    description: "Qatar's trusted online store. Apple & Samsung accessories, gaming, perfumes, toys, baby products. COD available across Qatar. Free delivery over QAR 99.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "GRIVA Qatar Online Shopping",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@grivaqa",
    creator: "@grivaqa",
    title: "GRIVA Qatar | Online Shopping COD",
    description: "Best online store in Qatar. Electronics, Gaming, Perfumes, Toys & More. Cash on Delivery!",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any", type: "image/x-icon" },
      { url: "/icon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/images/pwa-logo.png", sizes: "192x192", type: "image/png" },
      { url: "/images/pwa-logo.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
      { url: "/images/pwa-logo.png", sizes: "512x512", type: "image/png" },
    ],
    other: [
      { rel: "mask-icon", url: "/safari-pinned-tab.svg" },
    ],
  },
  manifest: "/manifest.json",
  alternates: {
    canonical: "https://thegriva.com",
    languages: {
      "en-QA": "https://thegriva.com",
      "ar-QA": "https://thegriva.com/ar",
    },
  },
  verification: {
    google: "Q2ysveIjmNIGQrpHfdJMvaPlyM1W1xaW799O3G3RnxE",
    other: {
      "facebook-domain-verification": "bswovkme9kzzdihcncgswrer4oy3s0",
    },
  },
  other: {
    "facebook-domain-verification": "bswovkme9kzzdihcncgswrer4oy3s0",
  },
  category: "shopping",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f97316" },
    { media: "(prefers-color-scheme: dark)", color: "#f97316" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      data-scroll-behavior="smooth"
    >
      <head>
        {/* Google Tag Manager */}
        <Script
          id="gtm-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','GTM-MMHF4RJ5');
            `,
          }}
        />
        {/* Facebook Domain Verification */}
        <meta name="facebook-domain-verification" content="bswovkme9kzzdihcncgswrer4oy3s0" />
      </head>
      <body className="min-h-full flex flex-col bg-white text-gray-900 font-sans" suppressHydrationWarning>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-MMHF4RJ5"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        {/* Meta Pixel (noscript) */}
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=2570473940080239&ev=PageView&noscript=1"
            alt="Meta Pixel"
          />
        </noscript>
        <Providers>
          <div id="layout-header">
            <AnnouncementBar />
            <Navbar />
          </div>
          <main className="flex-grow pb-16 sm:pb-0">
            {children}
          </main>
          <div id="layout-footer">
            <Footer />
          </div>
          <CartDrawer />
          <GrivaAIChatbot />
          <BackToTop />
          <PixelScripts />
        </Providers>
      </body>
    </html>
  );
}
