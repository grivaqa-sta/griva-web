import { api } from "../lib/axios";

// ─────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────

export interface CreateOrderPayload {
  items: Array<{
    product_id: number;
    quantity: number;
    selectedColor?: string;
    selectedStorage?: string;
    variantId?: number;
    variant_id?: number;
    selectedAttributes?: Record<string, string>;
    selected_attributes?: Record<string, string>;
  }>;
  shipping_address: string;
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
  payment_method?: string;
  delivery_notes?: string;
  city?: string;
  delivery_slot_id?: number;
  checkout_token?: string;
  checkoutToken?: string;
  latitude?: number;
  longitude?: number;
}

export interface OrderResponse {
  success: boolean;
  message: string;
  order: {
    id: number;
    order_number: string;
    status: string;
    total_price: string;
    payment_method: string;
    createdAt: string;
  };
}

export interface MyOrderItem {
  id: number;
  product_id: number;
  quantity: number;
  selected_color?: string;
  selected_storage?: string;
  variant_id?: number;
  selected_attributes?: Record<string, string>;
  price_at_purchase: string | number;
  product?: {
    id: number;
    title: string;
    main_image_url: string;
  };
}

export interface MyOrder {
  id: number;
  order_number: string;
  status: string;
  total_price: string;
  shipping_address: string;
  customer_name?: string;
  customer_phone?: string;
  payment_method: string;
  createdAt: string;
  items: MyOrderItem[];
  latitude?: number;
  longitude?: number;
}

export interface MyOrdersResponse {
  orders: MyOrder[];
}

export interface TrackedOrder {
  id: number;
  order_number: string;
  status: string;
  total_price: string;
  shipping_address: string;
  customer_name?: string;
  customer_phone?: string;
  payment_method: string;
  payment_status: string;
  delivery_notes?: string;
  city?: string;
  createdAt: string;
  updatedAt: string;
  items: MyOrderItem[];
  latitude?: number;
  longitude?: number;
}

export interface TrackOrderResponse {
  success: boolean;
  message?: string;
  order?: TrackedOrder;
}

// ─────────────────────────────────────────────────────────
// Service
// ─────────────────────────────────────────────────────────

export const orderService = {
  /**
   * Place a new order — POST /api/orders
   */
  createOrder: async (payload: CreateOrderPayload): Promise<OrderResponse> => {
    const response = await api.post("/orders", payload);
    return response.data;
  },

  /**
   * Fetch logged-in user's order history — GET /api/orders/my-orders
   */
  getMyOrders: async (): Promise<MyOrdersResponse> => {
    const response = await api.get("/orders/my-orders");
    return response.data;
  },

  /**
   * Track a guest order by order number + phone — GET /api/orders/track
   */
  trackOrder: async (orderNumber: string, phone: string): Promise<TrackOrderResponse> => {
    const response = await api.get("/orders/track", {
      params: { order_number: orderNumber, phone },
    });
    return response.data;
  },

  /**
   * Cancel a pending order — PATCH /api/orders/:id/cancel
   */
  cancelOrder: async (orderId: number): Promise<any> => {
    const response = await api.patch(`/orders/${orderId}/cancel`);
    return response.data;
  },

  /**
   * Submit a return request - POST /api/returns
   */
  submitReturnRequest: async (payload: ReturnRequestPayload): Promise<any> => {
    const response = await api.post("/returns", payload);
    return response.data;
  },

  /**
   * Fetch current user's returns list - GET /api/returns/my-returns
   */
  getMyReturns: async (): Promise<MyReturnsResponse> => {
    const response = await api.get("/returns/my-returns");
    return response.data;
  },
};

// ─────────────────────────────────────────────────────────
// Return Request Types
// ─────────────────────────────────────────────────────────

export interface ReturnRequestPayload {
  orderId: number;
  orderItemId: number;
  quantity: number;
  type: "replacement" | "refund";
  reason: "damaged" | "defective" | "wrong_item" | "changed_mind" | "other";
  description?: string;
  images: string[];
}

export interface ReturnRequest {
  id: number;
  order_id: number;
  user_id: number;
  order_item_id: number;
  quantity: number;
  type: "replacement" | "refund";
  reason: string;
  description?: string;
  images: string[];
  status: "pending" | "approved_replacement" | "approved_refund" | "rejected";
  admin_notes?: string;
  resolved_at?: string;
  createdAt: string;
  updatedAt: string;
  order?: {
    id: number;
    order_number: string;
    createdAt: string;
  };
  orderItem?: {
    id: number;
    product_id: number;
    quantity?: number;
    selected_color?: string;
    selected_storage?: string;
    price_at_purchase?: number | string;
    product?: {
      id: number;
      title: string;
      main_image_url: string;
    };
  };
}

export interface MyReturnsResponse {
  success: boolean;
  returnRequests: ReturnRequest[];
}

