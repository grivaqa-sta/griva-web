import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
    default: "GRIVA Qatar — Premium Electronics Store | Fast Delivery Doha",
    template: "%s | GRIVA Qatar",
  },
  description: "Qatar's #1 online electronics store. Shop Sony, Apple, Samsung, JBL and more. Free delivery on orders over QAR 99. Cash on delivery available across Doha, Lusail, The Pearl, West Bay and all Qatar areas. Same day delivery guaranteed.",
  keywords: [
    "electronics qatar",
    "online electronics store qatar",
    "buy electronics qatar",
    "electronics doha",
    "tech store qatar",
    "gadgets qatar",
    "electronics online qatar",
    "buy gadgets online qatar",
    "electronics cash on delivery qatar",
    "same day delivery electronics qatar",
    "thegriva.com",
    "griva qatar",
    "griva electronics",
    "griva doha",
    "griva online store"
  ],
  applicationName: "GRIVA Qatar",
  authors: [{ name: "GRIVA Qatar", url: "https://thegriva.com" }],
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
    title: "GRIVA — Elevating Every Experience | Qatar Electronics Store",
    description: "Premium electronics delivered same day across Qatar. Sony, Apple, Samsung and more. Cash on delivery available. Free delivery over QAR 99.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "GRIVA Qatar — Premium Electronics Store",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@grivaqa",
    creator: "@grivaqa",
    title: "GRIVA Qatar Electronics Store — Same Day Delivery",
    description: "Premium electronics. Same day Qatar delivery. Cash on delivery. Shop Sony, Apple, Samsung and more.",
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
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
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
    google: "ADD_YOUR_GOOGLE_SEARCH_CONSOLE_VERIFICATION_CODE_HERE",
    yandex: "ADD_IF_NEEDED",
    other: {
      me: ["support@thegriva.com"],
    },
  },
  category: "electronics",
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
  const isComingSoon = process.env.NEXT_PUBLIC_COMING_SOON === "true";

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      data-scroll-behavior="smooth"
    >
      <body className="min-h-full flex flex-col bg-white text-gray-900 font-sans" suppressHydrationWarning>
        <Providers>
          <div id="layout-header" className={isComingSoon ? "hidden" : ""}>
            <AnnouncementBar />
            <Navbar />
          </div>
          <main className="flex-grow pb-16 sm:pb-0">
            {children}
          </main>
          <div id="layout-footer" className={isComingSoon ? "hidden" : ""}>
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
