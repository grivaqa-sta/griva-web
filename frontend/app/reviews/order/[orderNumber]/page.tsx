"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { FaStar, FaCheckCircle, FaExclamationTriangle, FaTruck } from "react-icons/fa";

interface Product {
  id: number;
  title: string;
  main_image_url: string;
}

interface OrderItem {
  id: number;
  product: Product;
}

interface DeliveryBoy {
  id: number;
  name: string;
  email: string;
}

interface OrderData {
  id: number;
  order_number: string;
  status: string;
  items: OrderItem[];
  deliveryBoy?: DeliveryBoy;
}

export default function OrderReviewPage() {
  const { orderNumber } = useParams();
  const router = useRouter();

  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form State
  const [deliveryRating, setDeliveryRating] = useState<number>(0);
  const [deliveryComment, setDeliveryComment] = useState("");
  
  // Product Reviews State: maps product.id -> { rating, comment }
  const [productReviews, setProductReviews] = useState<{
    [productId: number]: { rating: number; comment: string };
  }>({});

  useEffect(() => {
    if (!orderNumber) return;

    const fetchOrder = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
        const response = await axios.get(`${apiUrl}/reviews/order/${orderNumber}`);
        const orderData = response.data.order;
        setOrder(orderData);

        // Initialize product reviews state
        const initialReviews: typeof productReviews = {};
        orderData.items.forEach((item: OrderItem) => {
          if (item.product) {
            initialReviews[item.product.id] = { rating: 5, comment: "" }; // default to 5 star rating
          }
        });
        setProductReviews(initialReviews);
      } catch (err: any) {
        console.error(err);
        setError(err.response?.data?.error || "Failed to load order details. Please check the review link.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderNumber]);

  const handleProductRatingChange = (productId: number, rating: number) => {
    setProductReviews((prev) => ({
      ...prev,
      [productId]: { ...prev[productId], rating },
    }));
  };

  const handleProductCommentChange = (productId: number, comment: string) => {
    setProductReviews((prev) => ({
      ...prev,
      [productId]: { ...prev[productId], comment },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;

    setSubmitting(true);
    setError(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      
      const payload = {
        order_number: order.order_number,
        delivery_rating: deliveryRating > 0 ? deliveryRating : undefined,
        delivery_comment: deliveryComment.trim() || undefined,
        product_reviews: Object.entries(productReviews).map(([productId, data]) => ({
          product_id: parseInt(productId, 10),
          rating: data.rating,
          body: data.comment.trim() || "Good quality product.",
        })),
      };

      await axios.post(`${apiUrl}/reviews/order`, payload);
      setSuccess(true);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || "Something went wrong while submitting reviews.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ff6a00] mb-4"></div>
        <p className="text-gray-400 font-medium">Fetching your order details...</p>
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center text-white p-4">
        <div className="bg-[#121212] p-8 rounded-2xl max-w-md w-full border border-red-500/20 text-center shadow-xl">
          <FaExclamationTriangle className="text-5xl text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Review Link Invalid</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="w-full bg-[#ff6a00] hover:bg-[#e05d00] transition-colors py-3 rounded-xl font-semibold"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center text-white p-4">
        <div className="bg-[#121212] p-8 rounded-2xl max-w-md w-full border border-green-500/20 text-center shadow-xl animate-fade-in">
          <FaCheckCircle className="text-6xl text-green-500 mx-auto mb-4 animate-bounce" />
          <h2 className="text-2xl font-bold mb-2">Thank You!</h2>
          <p className="text-gray-400 mb-6">
            Your reviews have been submitted successfully. We appreciate your valuable feedback!
          </p>
          <button
            onClick={() => router.push("/")}
            className="w-full bg-[#ff6a00] hover:bg-[#e05d00] transition-colors py-3 rounded-xl font-semibold"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-[#ff6a00]">
            Share Your Experience
          </h1>
          <p className="mt-2 text-sm text-gray-400">
            For order <span className="font-semibold text-white">#{order?.order_number}</span>
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6 text-sm flex items-center gap-3">
            <FaExclamationTriangle className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Delivery Review */}
          <div className="bg-[#121212] rounded-2xl p-6 border border-[#222] shadow-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-[#ff6a00]/10 rounded-xl text-[#ff6a00]">
                <FaTruck className="text-xl" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Delivery Service Rating</h2>
                {order?.deliveryBoy ? (
                  <p className="text-xs text-gray-400 mt-0.5">
                    Your delivery agent: <span className="text-white font-medium">{order.deliveryBoy.name}</span>
                  </p>
                ) : (
                  <p className="text-xs text-gray-400 mt-0.5">Rate our home delivery service</p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">How satisfied were you with the delivery?</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setDeliveryRating(star)}
                      className="focus:outline-none transition-transform active:scale-95"
                    >
                      <FaStar
                        className={`text-2xl cursor-pointer transition-colors ${
                          star <= deliveryRating ? "text-[#ff6a00]" : "text-[#333] hover:text-[#555]"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Comments (Optional)</label>
                <textarea
                  value={deliveryComment}
                  onChange={(e) => setDeliveryComment(e.target.value)}
                  placeholder="Tell us about the speed, behavior, and convenience of delivery..."
                  rows={3}
                  className="w-full bg-[#1A1A1A] border border-[#333] rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#ff6a00] transition-colors text-sm"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Product Reviews */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-gray-300">Rate the Items You Bought</h3>

            {order?.items.map((item) => {
              if (!item.product) return null;
              const product = item.product;
              const reviewState = productReviews[product.id] || { rating: 5, comment: "" };

              return (
                <div key={item.id} className="bg-[#121212] rounded-2xl p-6 border border-[#222] shadow-md flex flex-col md:flex-row gap-6">
                  {/* Product Details */}
                  <div className="flex items-start gap-4 md:w-1/3">
                    <img
                      src={product.main_image_url || "/images/placeholder.jpg"}
                      alt={product.title}
                      className="w-20 h-20 object-cover rounded-xl border border-[#333] flex-shrink-0"
                    />
                    <div>
                      <h4 className="font-bold text-sm leading-snug line-clamp-2">{product.title}</h4>
                      <p className="text-xs text-gray-500 mt-1">Product ID: {product.id}</p>
                    </div>
                  </div>

                  {/* Rating inputs */}
                  <div className="flex-1 space-y-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Product Rating</label>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => handleProductRatingChange(product.id, star)}
                            className="focus:outline-none transition-transform active:scale-95"
                          >
                            <FaStar
                              className={`text-xl cursor-pointer transition-colors ${
                                star <= reviewState.rating ? "text-[#ff6a00]" : "text-[#333] hover:text-[#555]"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Product Review</label>
                      <textarea
                        value={reviewState.comment}
                        onChange={(e) => handleProductCommentChange(product.id, e.target.value)}
                        placeholder="Write your honest review about this product..."
                        rows={3}
                        required
                        className="w-full bg-[#1A1A1A] border border-[#333] rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#ff6a00] transition-colors text-sm"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#ff6a00] hover:bg-[#e05d00] disabled:bg-[#555] disabled:cursor-not-allowed transition-colors py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                  <span>Submitting Reviews...</span>
                </>
              ) : (
                <span>Submit Feedback</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
