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

export const metadata: Metadata = {
  title: "GriVA Qatar — Premium Electronics & Tech Gifts Store | Same Day Delivery Doha",
  description: "Shop premium electronics, gadgets, gaming gear, high-fidelity audio, and luxury gifts in Qatar. Enjoy free same day delivery in Doha on orders over QAR 99, 100% authentic products, and Cash on Delivery.",
  alternates: {
    canonical: "https://thegriva.com",
  },
};

export default function Home() {
  return (
    <div>
      <WebsiteSchema />
      <OrganizationSchema />
      <SubNavbar />
      <div className="px-0 sm:px-4 md:px-6 lg:px-8 pb-1 bg-[#ffff]">
        <CategorySection />
        <HeroBanner />
        {/* <LazyFridayDeals /> */}
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
