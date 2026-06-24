import { api } from "../lib/axios";

export interface ApiWishlistProduct {
  id: number;
  title: string;
  slug?: string;
  price: string;
  old_price?: string;
  main_image_url: string;
  rating: number;
  brand?: string;
  stock: number;
  is_active: boolean;
}

export interface ApiWishlistItem {
  id: number;
  user_id: number;
  product_id: number;
  product: ApiWishlistProduct;
  createdAt: string;
  updatedAt: string;
}

export interface WishlistApiResponse {
  success: boolean;
  data: ApiWishlistItem[];
}

export interface WishlistActionResponse {
  success: boolean;
  message?: string;
  data?: ApiWishlistItem;
  deleted?: boolean;
}

export const wishlistService = {
  getWishlist: async (): Promise<WishlistApiResponse> => {
    const response = await api.get("/wishlist");
    return response.data;
  },

  addToWishlist: async (productId: number): Promise<WishlistActionResponse> => {
    const response = await api.post("/wishlist", { product_id: productId });
    return response.data;
  },

  removeFromWishlist: async (productId: number): Promise<WishlistActionResponse> => {
    const response = await api.delete(`/wishlist/${productId}`);
    return response.data;
  },
};
