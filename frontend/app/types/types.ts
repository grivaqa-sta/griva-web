import { StaticImageData } from "next/image";

// ─────────────────────────────────────────────────────────
//authentication
// ─────────────────────────────────────────────────────────
export interface AuthUser {
  id: number;
  name?: string;
  email: string;
  role: string;
}
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}
export interface AuthResponse {
  message?: string;
  token?: string;
  user?: AuthUser;
}
export interface GenericMessageResponse {
  message: string;
}
export interface LoginRequest {
  email: string;
  password: string;
}
export interface ForgotPasswordResponse {
  message: string;
  resetUrl: string;
  success: boolean;
}
export interface ProfileData {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

// ─────────────────────────────────────────────────────────
//address (Qatar-specific)
// ─────────────────────────────────────────────────────────
export interface AddressRequest {
  label: "home" | "office" | "other";
  fullName: string;
  mobile: string;
  area: string;
  street: string;
  building_number: string;
  villa_apartment?: string;
  floor?: string;
  landmark?: string;
  zone?: string;
  city?: string;
  country?: string;
  isDefault?: boolean;
}

export interface Address {
  id: number;
  userId: number;
  label: "home" | "office" | "other";
  fullName: string;
  mobile: string;
  area: string;
  street: string;
  building_number: string;
  villa_apartment?: string;
  floor?: string;
  landmark?: string;
  zone?: string;
  city: string;
  country: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─────────────────────────────────────────────────────────
// category
// ─────────────────────────────────────────────────────────

export interface CategoryRequest {
  title: string;
  slug: string;
  href: string;
  image_url?: string;
  mobile_image_url?: string;
  is_active?: boolean;
};
export interface Category  {
  id: number;
  title: string;
  slug: string;
  href: string;
  image_url: string | null;
  mobile_image_url: string | null;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
};

// ─────────────────────────────────────────────────────────
// subcategory
// ─────────────────────────────────────────────────────────

export interface SubCategoryRequest  {
  category_id: number;
  title: string;
  slug: string;
  href: string;
  image_url?: string;
  is_active?: boolean;
};

export interface SubCategory  {
  id: number;
  category_id: number;
  title: string;
  slug: string;
  href: string;
  image_url: string | null;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
};

// ─────────────────────────────────────────────────────────
// Product Types
// ─────────────────────────────────────────────────────────
export interface ApiProductVariant  {
  color: string;
  size: string;
};

export interface ProductSpecification  {
  name: string;
  value: string;
};

export interface ProductRequest  {
  subcategory_id: number;
  title: string;
  slug: string;
  short_description?: string;
  description?: string;
  price: number;
  old_price?: number;
  discount_percentage?: number;
  stock?: number;
  sku?: string;
  brand?: string;
  main_image_url: string;
  gallery_images?: string[];
  variants?: ApiProductVariant[];
  specifications?: ProductSpecification[];
  tags?: string[];
  is_featured?: boolean;
  is_best_seller?: boolean;
  is_trending?: boolean;
  is_new?: boolean;
  is_active?: boolean;
  meta_title?: string;
  meta_description?: string;
};

// ─────────────────────────────────────────────────────────
// Backend API Product — exact field names from Product.js model
// ─────────────────────────────────────────────────────────
export interface ApiProduct {
  id: number;
  subcategory_id: number;
  title: string;
  slug: string;
  short_description?: string;
  description?: string;
  price: string;               // DECIMAL returned as string from DB e.g. "49.99"
  old_price?: string;          // Optional, e.g. "69.99"
  discount_percentage?: number;
  stock: number;
  sku?: string;
  brand?: string;
  main_image_url: string;
  gallery_images?: string[];
  variants?: { color?: string; size?: string }[];
  specifications?: { name: string; value: string }[];
  tags?: string[];
  rating: number;
  review_count: number;
  is_featured: boolean;
  is_best_seller: boolean;
  is_trending: boolean;
  is_new: boolean;
  is_active: boolean;
  is_banner?: boolean;
  banner_background_color?: string;
  mobile_ad_banner?: string;
  href?: string;
  meta_title?: string;
  meta_description?: string;
  views_count?: number;
  createdAt?: string;
  updatedAt?: string;
}


// ─────────────────────────────────────────────────────────
// Banner Types
// ─────────────────────────────────────────────────────────

export interface BannerUpdatePayload {
  is_banner: boolean;
  href?: string;
  tags?: string[];
  bannerColor?: string;
  old_price?:number;
}

export interface BannerProduct extends ProductRequest {
    id: number;
    href?: string;
    banner_background_color?: string;
    mobile_ad_banner:string;
}


export interface HeroSlide {
    title: string;
    subtitle: string;
    badge: string;
    image: string;
    price: number;
    old_price?: number;
    href: string;
    bg: string;
    mobile_ad_banner:string;
}





// ─────────────────────────────────────────────────────────
// Core Product Types
// ─────────────────────────────────────────────────────────
export interface ProductVariant {
  label: string;
  value: string;
}

export interface ProductColor {
  name: string;
  hex: string;
}

export interface ProductSpec {
  label: string;
  value: string;
}

export interface Review {
  id: number;
  author: string;
  avatar: string;
  rating: number;
  date: string;
  title: string;
  body: string;
  verified: boolean;
}

export interface Product {
  id: number;
  category: string;
  title: string;
  image: string | StaticImageData;
  images?: (string | StaticImageData)[];
  price: string;
  oldPrice?: string;
  badge?: string;
  badgeColor?: string;
  buttonText: string;
  rating: number;
  reviewCount?: number;
  stock?: number;
  description?: string;
  specs?: ProductSpec[];
  colors?: ProductColor[];
  storageOptions?: ProductVariant[];
  reviews?: Review[];
}

// ─────────────────────────────────────────────────────────
// Cart Types
// ─────────────────────────────────────────────────────────
export interface CartItem {
  id: number;
  productId: number;
  title: string;
  image: string | StaticImageData;
  price: string;
  priceNumber: number;
  quantity: number;
  selectedColor?: string;
  selectedStorage?: string;
  category: string;
}

export type CartAction =
  | { type: "ADD"; payload: CartItem }
  | { type: "REMOVE"; payload: { id: number } }
  | { type: "UPDATE_QTY"; payload: { id: number; quantity: number } }
  | { type: "CLEAR" }
  | { type: "SET_CART"; payload: CartItem[] };

export interface CartState {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
}

// ─────────────────────────────────────────────────────────
// Wishlist Types
// ─────────────────────────────────────────────────────────
export interface WishlistItem {
  id: number;
  productId: number;
  title: string;
  image: string | StaticImageData;
  price: string;
  oldPrice?: string;
  rating: number;
  category: string;
}

// ─────────────────────────────────────────────────────────
// Search Types
// ─────────────────────────────────────────────────────────
export interface SearchResult {
  id: number;
  title: string;
  image: string | StaticImageData;
  price: string;
  category: string;
}

// ─────────────────────────────────────────────────────────
// Banner / Promo Types
// ─────────────────────────────────────────────────────────
export interface BannerItem {
  id: number;
  category: string;
  title: string;
  image: string | StaticImageData;
  buttonText: string;
  href: string;
}

export interface OfferCard {
  id: number;
  badge: string;
  title: string;
  subtitle: string;
  image: string | StaticImageData;
  bgColor: string;
  href: string;
}

// ─────────────────────────────────────────────────────────
// Trending Products
// ─────────────────────────────────────────────────────────
export interface TrendingProduct {
  id: number;
  category: string;
  title: string;
  image: string | StaticImageData;
  price: string;
  oldPrice?: string;
  rating: number;
  badge?: string;
  hot?: boolean;
  href: string;
}

// ─────────────────────────────────────────────────────────
// Countdown Timer
// ─────────────────────────────────────────────────────────
export interface CountdownTime {
  hours: number;
  mins: number;
  secs: number;
}

// ─────────────────────────────────────────────────────────
// Deal of The Day Slides
// ─────────────────────────────────────────────────────────
export interface SlideItem {
  id: number;
  badge: string;
  hot: boolean;
  category: string;
  title: string;
  price: string;
  oldPrice: string;
  description: string;
  rating: number;
  mainImage: string | StaticImageData;
  thumbs: string[] | StaticImageData[];
}

// ─────────────────────────────────────────────────────────
// Category
// ─────────────────────────────────────────────────────────
export interface CategoryItem {
  title: string;
  href: string;
  image: string | StaticImageData;
}

// ─────────────────────────────────────────────────────────
// FAQ
// ─────────────────────────────────────────────────────────
export interface FAQItem {
  question: string;
  answer: string;
}

export interface SlideData {
  badge: string;
  title: string;
  subtitle: string;
  price: string;
  image: string | StaticImageData;
  bg: string;
  link?: string;
}

export interface mobileBannerImage {
  src: string | StaticImageData;
  href: string;
  alt: string;
}