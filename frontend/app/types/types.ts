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
//address
// ─────────────────────────────────────────────────────────


export interface AddressRequest {
  label: "home" | "office" | "other";
  fullName: string;
  mobile: string;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  city: string;
  district?: string;
  state: string;
  country?: string;
  pincode: string;
  isDefault?: boolean;
}

export interface Address {
  id: number;
  userId: number;
  label: "home" | "office" | "other";
  fullName: string;
  mobile: string;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  city: string;
  district?: string;
  state: string;
  country: string;
  pincode: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
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
  | { type: "CLEAR" };

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