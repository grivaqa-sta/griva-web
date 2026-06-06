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

export default function Home() {
  return (
    <div>
      <SubNavbar />
      <div className="px-0 sm:px-4 md:px-6 lg:px-8 pb-1 bg-[#ffff]">
        <CategorySection />
        <HeroBanner />
        <DealOfTheDaySection />
        <ProductSection />
        <PromoBannerSection />
        <OfferSection />
        <TrendingProductsSection />
        <ProductPromoBanner/>
        <NewsletterSection />
      </div>
    </div>
  );
}
