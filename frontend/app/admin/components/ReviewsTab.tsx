"use client";

import React, { useState, useEffect } from "react";
import { Star, Trash2, ShieldAlert, Award, MessageSquare, Truck, RefreshCw, Search } from "lucide-react";
import { getDeliveryReviewsApi, getProductReviewsApi, deleteReviewApi } from "@/app/utils/api";
import { useToast } from "@/app/context/ToastContext";

interface ProductReview {
  id: number;
  product_id: number;
  user_id: number;
  rating: number;
  title: string;
  body: string;
  verified: boolean;
  createdAt: string;
  product?: {
    id: number;
    title: string;
    main_image_url: string;
  };
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

interface DeliveryReviewOrder {
  id: number;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  status: string;
  delivery_rating: number;
  delivery_comment: string | null;
  updatedAt: string;
  deliveryBoy?: {
    id: number;
    name: string;
    email: string;
  };
}

export default function ReviewsTab() {
  const { toast, confirm } = useToast();
  const [activeSubTab, setActiveSubTab] = useState<"products" | "delivery">("products");
  const [productReviews, setProductReviews] = useState<ProductReview[]>([]);
  const [deliveryReviews, setDeliveryReviews] = useState<DeliveryReviewOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeSubTab === "products") {
        const reviews = await getProductReviewsApi();
        setProductReviews(reviews);
      } else {
        const reviews = await getDeliveryReviewsApi();
        setDeliveryReviews(reviews);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load reviews data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeSubTab]);

  // Reset search when switching between Product Reviews / Delivery Feedback tabs
  useEffect(() => {
    setSearchQuery("");
  }, [activeSubTab]);

  const handleDeleteReview = async (id: number) => {
    const isConfirmed = await confirm(
      "Are you sure you want to delete this product review?",
      "Delete Product Review"
    );
    if (!isConfirmed) return;

    try {
      const success = await deleteReviewApi(id);
      if (success) {
        toast.success("Review deleted successfully.");
        setProductReviews((prev) => prev.filter((r) => r.id !== id));
      } else {
        toast.error("Failed to delete review.");
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Error occurred while deleting review.");
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={12}
            className={star <= rating ? "fill-orange-500 text-orange-500" : "text-gray-200"}
          />
        ))}
      </div>
    );
  };

  // Filter product reviews by product title, customer name, or email
  const filteredProductReviews = productReviews.filter((review) => {
    const q = searchQuery.toLowerCase();
    if (!q) return true;
    const productTitle = review.product?.title?.toLowerCase() || "";
    const customerName = review.user?.name?.toLowerCase() || "";
    const customerEmail = review.user?.email?.toLowerCase() || "";
    return (
      productTitle.includes(q) ||
      customerName.includes(q) ||
      customerEmail.includes(q)
    );
  });

  // Filter delivery reviews by order number, customer name, or driver name
  const filteredDeliveryReviews = deliveryReviews.filter((order) => {
    const q = searchQuery.toLowerCase();
    if (!q) return true;
    const orderNumber = order.order_number?.toLowerCase() || "";
    const customerName = order.customer_name?.toLowerCase() || "";
    const driverName = order.deliveryBoy?.name?.toLowerCase() || "";
    return (
      orderNumber.includes(q) ||
      customerName.includes(q) ||
      driverName.includes(q)
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      {/* Header and Toggle Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-orange-500/10 pb-4">
        <div>
          <h2 className="text-xl font-black text-gray-900 tracking-tight">Feedback & Reviews</h2>
          <p className="text-[11px] text-gray-400 font-medium">Monitor product ratings and delivery services feedback.</p>
        </div>

        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl p-1 shrink-0 select-none">
          <button
            onClick={() => setActiveSubTab("products")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === "products"
                ? "bg-white text-orange-500 shadow-sm border border-gray-100"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            <MessageSquare size={14} />
            Product Reviews
          </button>
          <button
            onClick={() => setActiveSubTab("delivery")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === "delivery"
                ? "bg-white text-orange-500 shadow-sm border border-gray-100"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            <Truck size={14} />
            Delivery Feedback
          </button>
        </div>
      </div>

      {/* Centered Search Bar */}
      <div className="flex justify-center">
        <div className="relative w-full max-w-md">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-350 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              activeSubTab === "products"
                ? "Search by product or customer name..."
                : "Search by order, customer or driver name..."
            }
            className="w-full border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-xs font-medium focus:border-orange-500 outline-none bg-white shadow-xs"
          />
        </div>
      </div>

      {/* Main Panel Content */}
      <div className="bg-white border border-orange-500/20 rounded-2xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-20 text-center text-xs text-gray-400 font-semibold">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-3 text-orange-500" />
            Loading reviews data...
          </div>
        ) : activeSubTab === "products" ? (
          /* Product Reviews View */
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-orange-500/20 text-[10px] text-gray-450 font-bold uppercase tracking-wider bg-gray-50 whitespace-nowrap">
                  <th className="p-4 pl-6">Product Details</th>
                  <th className="p-4">Customer Info</th>
                  <th className="p-4 text-center">Rating</th>
                  <th className="p-4">Review Body</th>
                  <th className="p-4 text-center">Date</th>
                  <th className="p-4 text-right pr-6">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {filteredProductReviews.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-16 text-center text-gray-400 font-semibold">
                      {productReviews.length === 0
                        ? "No product reviews submitted yet."
                        : "No reviews match your search."}
                    </td>
                  </tr>
                ) : (
                  filteredProductReviews.map((review) => (
                    <tr key={review.id} className="hover:bg-[#fff9f3]/40 transition-colors whitespace-nowrap">
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={review.product?.main_image_url || "/images/placeholder.jpg"}
                            alt={review.product?.title}
                            className="h-10 w-10 object-cover rounded-lg border border-gray-150 flex-shrink-0"
                          />
                          <div>
                            <span className="font-bold text-gray-800 block truncate max-w-[200px]">
                              {review.product?.title || `Product #${review.product_id}`}
                            </span>
                            <span className="text-[10px] text-gray-400 font-medium block">
                              ID: {review.product_id}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-gray-800 block">
                          {review.user?.name || "Guest Reviewer"}
                        </span>
                        <span className="text-[10px] text-gray-400 block font-medium">
                          {review.user?.email || "N/A"}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <div className="inline-flex flex-col items-center gap-1">
                          {renderStars(review.rating)}
                          <span className="text-[10px] font-black text-orange-500 bg-orange-50 px-1.5 py-0.5 rounded-md">
                            {review.rating}/5
                          </span>
                        </div>
                      </td>
                      <td className="p-4 max-w-[300px] whitespace-normal">
                        <p className="text-gray-600 font-medium leading-relaxed break-words">
                          {review.body}
                        </p>
                      </td>
                      <td className="p-4 text-center font-medium text-gray-400">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-right pr-6">
                        <button
                          onClick={() => handleDeleteReview(review.id)}
                          className="p-2 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg hover:text-red-600 active:scale-95 transition-all cursor-pointer inline-flex items-center justify-center"
                          title="Delete Review"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          /* Delivery Reviews View */
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[850px]">
              <thead>
                <tr className="border-b border-orange-500/20 text-[10px] text-gray-455 font-bold uppercase tracking-wider bg-gray-50 whitespace-nowrap">
                  <th className="p-4 pl-6">Order ID</th>
                  <th className="p-4">Delivery Driver</th>
                  <th className="p-4 text-center">Rating</th>
                  <th className="p-4">Customer Details</th>
                  <th className="p-4">Feedback / Comment</th>
                  <th className="p-4 text-center pr-6">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {filteredDeliveryReviews.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-16 text-center text-gray-400 font-semibold">
                      {deliveryReviews.length === 0
                        ? "No delivery reviews submitted yet."
                        : "No reviews match your search."}
                    </td>
                  </tr>
                ) : (
                  filteredDeliveryReviews.map((order) => (
                    <tr key={order.id} className="hover:bg-[#fff9f3]/40 transition-colors whitespace-nowrap">
                      <td className="p-4 pl-6 font-bold text-gray-800">
                        {order.order_number}
                      </td>
                      <td className="p-4">
                        {order.deliveryBoy ? (
                          <>
                            <span className="font-bold text-gray-800 block">
                              {order.deliveryBoy.name}
                            </span>
                            <span className="text-[10px] text-gray-450 block">
                              {order.deliveryBoy.email}
                            </span>
                          </>
                        ) : (
                          <span className="text-gray-400 italic">No driver assigned</span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        <div className="inline-flex flex-col items-center gap-1">
                          {renderStars(order.delivery_rating)}
                          <span className="text-[10px] font-black text-orange-500 bg-orange-50 px-1.5 py-0.5 rounded-md">
                            {order.delivery_rating}/5
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-gray-800 block">
                          {order.customer_name}
                        </span>
                        <span className="text-[10px] text-gray-400 block font-medium">
                          {order.customer_phone}
                        </span>
                      </td>
                      <td className="p-4 max-w-[300px] whitespace-normal">
                        <p className="text-gray-650 font-medium leading-relaxed">
                          {order.delivery_comment || <span className="text-gray-350 italic">No text feedback given.</span>}
                        </p>
                      </td>
                      <td className="p-4 text-center font-medium text-gray-400 pr-6">
                        {new Date(order.updatedAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}