import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/app/components/navbar/Navbar";
import AnnouncementBar from "@/app/components/navbar/AnnouncementBar";
import Footer from "@/app/components/footer/Footer";
import { Providers } from "@/app/context/Providers";
import CartDrawer from "@/app/components/cart/CartDrawer";
import BackToTop from "@/app/components/common/BackToTop";
import WhatsAppFloat from "@/app/components/common/WhatsAppFloat";
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
  title: "GriVA — Premium Electronics Store in Qatar",
  description: "Shop premium electronics, gadgets, toys, and lifestyle products in Qatar. Fast delivery across Doha. Cash on Delivery available.",
  openGraph: {
    title: "GriVA — Premium Electronics Store in Qatar",
    description: "Shop premium electronics, gadgets, toys, and lifestyle products in Qatar. Fast delivery across Doha.",
    url: "https://thegriva.com",
    siteName: "GriVA Qatar",
    images: [
      {
        url: "/images/logo-dark.png",
        width: 1200,
        height: 630,
        alt: "GriVA Qatar Online Store",
      },
    ],
    locale: "en_QA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GriVA — Premium Electronics Store in Qatar",
    description: "Shop premium electronics, gadgets, toys, and lifestyle products in Qatar.",
    images: ["/images/logo-dark.png"],
  },
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
      <body className="min-h-full flex flex-col bg-white text-gray-900 font-sans" suppressHydrationWarning>
        <Providers>
          <AnnouncementBar />
          <Navbar />
          <main className="flex-grow pb-16 sm:pb-0">
            {children}
          </main>
          <Footer />
          <CartDrawer />
          <WhatsAppFloat />
          <BackToTop />
          <PixelScripts />
        </Providers>
      </body>
    </html>
  );
}
