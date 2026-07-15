import type { Metadata } from "next";
import SubNavbar from "@/app/components/navbar/SubNavbar";
import CategorySection from "./components/home/CategorySection";
import HeroBanner from "./components/home/HeroBanner";
import ProductSection from "./components/home/ProductSection";
import PromoBannerSection from "./components/home/PromoBannerSection";
import OfferSection from "./components/home/OfferSection";
import TrendingProductsSection from "./components/home/TrendingProductsSection";
import NewsletterSection from "./components/home/NewsletterSection";
import DealOfTheDaySection from "./components/home/DealOfTheDaySection";
import ProductPromoBanner from "./components/home/ProductPromoBanner";
import LazyFridayDeals from "./components/home/LazyFridayDeals";
import MoreToExploreSection from "./components/home/MoreToExploreSection";
import WebsiteSchema from "@/components/seo/WebsiteSchema";
import OrganizationSchema from "@/components/seo/OrganizationSchema";
import OnlineStoreSchema from "@/components/seo/OnlineStoreSchema";

export const metadata: Metadata = {
  title: "GRIVA Qatar — Online Shopping | Electronics, Toys, Perfumes, Gaming | Same Day Delivery Doha",
  description: "Shop online in Qatar at GRIVA. Premium electronics, Apple & Samsung accessories, gaming gadgets, Arabic perfumes, buhoor, educational toys, baby products & kitchen essentials. Free same day delivery in Doha on orders over QAR 99. Cash on Delivery across all Qatar.",
  keywords: [
    "online shopping Qatar", "buy electronics Qatar", "GRIVA Qatar",
    "Apple accessories Qatar", "Samsung charger Qatar", "gaming accessories Qatar",
    "perfumes Qatar", "buhoor Qatar", "toys Qatar", "baby products Qatar",
    "kitchen appliances Qatar", "cash on delivery Qatar", "free delivery Qatar",
    "تسوق اون لاين قطر", "شراء الكترونيات قطر", "العاب اطفال قطر",
  ],
  alternates: {
    canonical: "https://thegriva.com",
  },
};

export default function Home() {
  return (
    <div>
      <WebsiteSchema />
      <OrganizationSchema />
      <OnlineStoreSchema />
      <div id="layout-subnavbar">
        <SubNavbar />
      </div>
      <div id="main-store-content" className="px-0 sm:px-4 md:px-6 lg:px-8 pb-1 bg-[#ffff]">
        <CategorySection />
        <HeroBanner />
        <LazyFridayDeals />
        <DealOfTheDaySection />
        <ProductSection />
        <PromoBannerSection />
        <OfferSection />
        <TrendingProductsSection />
        <ProductPromoBanner />
        <MoreToExploreSection />
        <NewsletterSection />
      </div>
    </div>
  );
}
