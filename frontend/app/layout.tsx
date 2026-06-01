import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/app/components/navbar/Navbar";
import Footer from "@/app/components/footer/Footer";
import { Providers } from "@/app/context/Providers";
import CartDrawer from "@/app/components/cart/CartDrawer";

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
  description: "Explore flagship smartphones, laptops, smartwatches, audiophile headphones, and gaming gear at GriVA.",
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
    >
      <body className="min-h-full flex flex-col bg-white text-gray-900" suppressHydrationWarning>
        <Providers>
          <Navbar />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
          <CartDrawer />
        </Providers>
      </body>
    </html>
  );
}
