import { api } from "../lib/axios";

export interface ApiCartItem {
  id: number;
  productId: number;
  title: string;
  image: string;
  price: string;
  priceNumber: number;
  quantity: number;
  selectedColor?: string;
  selectedStorage?: string;
  category: string;
}

export interface ApiCart {
  id: number;
  user_id: number;
  items: ApiCartItem[];
  totalItems: number;
  totalPrice: number;
}

export interface CartApiResponse {
  success: boolean;
  message?: string;
  cart: ApiCart;
}

export const cartService = {
  getCart: async (): Promise<CartApiResponse> => {
    const response = await api.get("/cart");
    return response.data;
  },

  addItem: async (
    productId: number,
    selectedColor?: string,
    selectedStorage?: string,
    quantity?: number
  ): Promise<CartApiResponse> => {
    const response = await api.post("/cart/items", {
      product_id: productId,
      selected_color: selectedColor || null,
      selected_storage: selectedStorage || null,
      quantity: quantity || 1,
    });
    return response.data;
  },

  updateItemQty: async (itemId: number, quantity: number): Promise<CartApiResponse> => {
    const response = await api.patch(`/cart/items/${itemId}`, {
      quantity,
    });
    return response.data;
  },

  removeItem: async (itemId: number): Promise<CartApiResponse> => {
    const response = await api.delete(`/cart/items/${itemId}`);
    return response.data;
  },

  clearCart: async (): Promise<CartApiResponse> => {
    const response = await api.delete("/cart");
    return response.data;
  },

  mergeCart: async (
    items: Array<{
      productId: number;
      quantity: number;
      selectedColor?: string;
      selectedStorage?: string;
    }>
  ): Promise<CartApiResponse> => {
    const response = await api.post("/cart/merge", { items });
    return response.data;
  },
};
