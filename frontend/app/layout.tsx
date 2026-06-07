import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/app/components/navbar/Navbar";
import AnnouncementBar from "@/app/components/navbar/AnnouncementBar";
import Footer from "@/app/components/footer/Footer";
import { Providers } from "@/app/context/Providers";
import CartDrawer from "@/app/components/cart/CartDrawer";
import NotificationBubble from "./components/common/NotificationBubble";
import BackToTop from "@/app/components/common/BackToTop";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GriVA — Premium Electronics Store",
  description: "Explore premium laptops, smartwatches, drones, audiophile headphones, and gaming gear at GriVA.",
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
      <body className="min-h-full flex flex-col bg-white text-gray-900" suppressHydrationWarning>
        <Providers>
          <AnnouncementBar />
          <Navbar />
          <main className="flex-grow pb-16 sm:pb-0">
            {children}
          </main>
          <Footer />
          <CartDrawer />
          <NotificationBubble />
          <BackToTop />
        </Providers>
      </body>
    </html>
  );
}
