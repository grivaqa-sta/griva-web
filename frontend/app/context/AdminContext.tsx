"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import {
  CategoryItem,
  SlideData,
  mobileBannerImage,
  SlideItem,
  BannerItem,
  OfferCard,
} from "@/app/types/types";

// Import defaults from data
import {
  categories as defaultCategories,
  slide as defaultSlides,
  mobilebanners as defaultMobileBanners,
  slides as defaultDealSlides,
  banners as defaultBanners,
  offers as defaultOffers,
} from "@/app/data/data";

// Helper to convert StaticImageData to string for localStorage
function getImageSrc(img: any): string {
  if (typeof img === "string") return img;
  if (img && img.src) return img.src;
  return "";
}

// Map defaults to strings
const mappedCategories = defaultCategories.map(c => ({ ...c, image: getImageSrc(c.image) }));
const mappedSlides = defaultSlides.map(s => ({ ...s, image: getImageSrc(s.image) }));
const mappedMobileBanners = defaultMobileBanners.map(m => ({ ...m, src: getImageSrc(m.src) }));
const mappedDealSlides = defaultDealSlides.map(d => ({ ...d, mainImage: getImageSrc(d.mainImage), thumbs: d.thumbs.map(getImageSrc) }));
const mappedBanners = defaultBanners.map(b => ({ ...b, image: getImageSrc(b.image) }));
const mappedOffers = defaultOffers.map(o => ({ ...o, image: getImageSrc(o.image) }));

export interface NewsletterSettings {
  label: string;
  heading: string;
  description: string;
  bgColor: string;
  buttonText: string;
}

export interface ProductPromoSettings {
  tagline: string;
  heading: string;
  description: string;
  image: string;
}

export interface AdminSettings {
  // Existing toggles
  announcementBarEnabled: boolean;
  fridaySaleEnabled: boolean;
  midnightSaleEnabled: boolean;
  
  // CMS Content
  cmsCategories: CategoryItem[];
  cmsHeroSlides: SlideData[];
  cmsMobileBanners: mobileBannerImage[];
  cmsDealTargetDate: string; // ISO string
  cmsDealSlides: SlideItem[];
  cmsBanners: BannerItem[];
  cmsOffers: OfferCard[];
  cmsProductPromo: ProductPromoSettings;
  cmsNewsletter: NewsletterSettings;
}

export interface AdminContextType extends AdminSettings {
  setAnnouncementBarEnabled: (val: boolean) => void;
  setFridaySaleEnabled: (val: boolean) => void;
  setMidnightSaleEnabled: (val: boolean) => void;
  
  // CMS setters
  setCmsCategories: (val: CategoryItem[]) => void;
  setCmsHeroSlides: (val: SlideData[]) => void;
  setCmsMobileBanners: (val: mobileBannerImage[]) => void;
  setCmsDealTargetDate: (val: string) => void;
  setCmsDealSlides: (val: SlideItem[]) => void;
  setCmsBanners: (val: BannerItem[]) => void;
  setCmsOffers: (val: OfferCard[]) => void;
  setCmsProductPromo: (val: ProductPromoSettings) => void;
  setCmsNewsletter: (val: NewsletterSettings) => void;
}

const STORAGE_KEY = "griva_admin_settings_v2";

const defaults: AdminSettings = {
  announcementBarEnabled: true,
  fridaySaleEnabled: true,
  midnightSaleEnabled: false,
  
  cmsCategories: mappedCategories,
  cmsHeroSlides: mappedSlides,
  cmsMobileBanners: mappedMobileBanners,
  cmsDealTargetDate: new Date(Date.now() + 15 * 60 * 60 * 1000).toISOString(),
  cmsDealSlides: mappedDealSlides,
  cmsBanners: mappedBanners,
  cmsOffers: mappedOffers,
  
  cmsProductPromo: {
    tagline: "Exclusive Headphone",
    heading: "Discounts 50% On\nAll Headphone",
    description: "Discover premium wireless headphones with immersive sound, active noise cancellation, and unbeatable comfort.",
    image: "/images/HeadphoneNew@.png",
  },
  
  cmsNewsletter: {
    label: "Newsletter",
    heading: "Sign Up & Get 20% Off",
    description: "Join thousands of subscribers. No spam, ever.",
    bgColor: "#8990f1",
    buttonText: "Subscribe",
  }
};

function loadFromStorage(): AdminSettings {
  if (typeof window === "undefined") return defaults;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw);
    return {
      ...defaults,
      ...parsed,
      cmsCategories: defaults.cmsCategories,
    };
  } catch {
    return defaults;
  }
}

const AdminContext = createContext<AdminContextType>({
  ...defaults,
  setAnnouncementBarEnabled: () => {},
  setFridaySaleEnabled: () => {},
  setMidnightSaleEnabled: () => {},
  
  setCmsCategories: () => {},
  setCmsHeroSlides: () => {},
  setCmsMobileBanners: () => {},
  setCmsDealTargetDate: () => {},
  setCmsDealSlides: () => {},
  setCmsBanners: () => {},
  setCmsOffers: () => {},
  setCmsProductPromo: () => {},
  setCmsNewsletter: () => {},
});

export function AdminProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AdminSettings>(defaults);

  // Hydrate from localStorage after mount
  useEffect(() => {
    setSettings(loadFromStorage());
  }, []);

  // Persist every change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const updateSetting = <K extends keyof AdminSettings>(key: K) => (val: AdminSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: val }));
  };

  return (
    <AdminContext.Provider
      value={{
        ...settings,
        setAnnouncementBarEnabled: updateSetting("announcementBarEnabled"),
        setFridaySaleEnabled: updateSetting("fridaySaleEnabled"),
        setMidnightSaleEnabled: updateSetting("midnightSaleEnabled"),
        
        setCmsCategories: updateSetting("cmsCategories"),
        setCmsHeroSlides: updateSetting("cmsHeroSlides"),
        setCmsMobileBanners: updateSetting("cmsMobileBanners"),
        setCmsDealTargetDate: updateSetting("cmsDealTargetDate"),
        setCmsDealSlides: updateSetting("cmsDealSlides"),
        setCmsBanners: updateSetting("cmsBanners"),
        setCmsOffers: updateSetting("cmsOffers"),
        setCmsProductPromo: updateSetting("cmsProductPromo"),
        setCmsNewsletter: updateSetting("cmsNewsletter"),
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdminSettings() {
  return useContext(AdminContext);
}
