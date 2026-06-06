"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser, Address } from "@/app/context/UserContext";
import { useCart } from "@/app/context/CartContext";
import SectionHeading from "@/app/components/common/SectionHeading";

export default function CheckoutPage() {
  const { state: userState, addAddress, saveOrder } = useUser();
  const { state: cartState, dispatch: cartDispatch } = useCart();
  const router = useRouter();

  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [isAddingAddress, setIsAddingAddress] = useState(userState.addresses.length === 0);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);
  const [formData, setFormData] = useState<Address>({
    fullName: userState.user?.name || "",
    streetAddress: "",
    city: "",
    state: "",
    zipCode: "",
  });

  useEffect(() => {
    if (isPlacingOrder) return;
    if (!userState.isLoggedIn) {
      router.push("/login");
    } else if (cartState.items.length === 0) {
      router.push("/cart");
    }
  }, [userState.isLoggedIn, cartState.items.length, router, isPlacingOrder]);

  if (!userState.isLoggedIn || (!isPlacingOrder && cartState.items.length === 0)) {
    return null; 
  }

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addAddress(formData);
    setSelectedAddressIndex(userState.addresses.length);
    setIsAddingAddress(false);
    setFormData({
      fullName: userState.user?.name || "",
      streetAddress: "",
      city: "",
      state: "",
      zipCode: "",
    });
  };

  const shippingCost = cartState.totalPrice > 50 || cartState.totalPrice === 0 ? 0 : 9.99;
  const estimatedTax = cartState.totalPrice * 0.08;
  const orderTotal = cartState.totalPrice + shippingCost + estimatedTax;

  const handlePlaceOrder = () => {
    if (userState.addresses.length === 0 && !isAddingAddress) {
      setIsAddingAddress(true);
      return;
    }
    
    setIsPlacingOrder(true);

    const orderId = "ORD-" + Math.random().toString(36).substring(2, 9).toUpperCase();
    
    saveOrder({
      id: orderId,
      date: new Date().toISOString(),
      items: cartState.items,
      total: orderTotal,
      status: "Processing"
    });
    
    cartDispatch({ type: "CLEAR" });
    router.push("/order-success");
  };

  return (
    <div className="bg-gray-50/50 min-h-screen py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading title="Checkout" subtitle="Complete your order" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
          <div className="lg:col-span-8 space-y-6">
            
            {/* Address Section */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex justify-between items-center mb-4 border-b pb-2">
                <h3 className="text-lg font-bold text-gray-900">Shipping Address</h3>
                {userState.addresses.length > 0 && !isAddingAddress && (
                   <button
                     onClick={() => setIsAddingAddress(true)}
                     className="text-sm font-semibold text-orange-500 hover:text-orange-600"
                   >
                     + Add New Address
                   </button>
                )}
              </div>
              
              {isAddingAddress ? (
                <form onSubmit={handleAddressSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">Full Name</label>
                      <input
                        type="text"
                        required
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm px-3 py-2 border"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">Street Address</label>
                      <input
                        type="text"
                        required
                        value={formData.streetAddress}
                        onChange={(e) => setFormData({ ...formData, streetAddress: e.target.value })}
                        className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm px-3 py-2 border"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">City</label>
                      <input
                        type="text"
                        required
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm px-3 py-2 border"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">State / Province</label>
                      <input
                        type="text"
                        required
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm px-3 py-2 border"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">ZIP / Postal Code</label>
                      <input
                        type="text"
                        required
                        value={formData.zipCode}
                        onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                        className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm px-3 py-2 border"
                      />
                    </div>
                  </div>
                  <div className="pt-2">
                    <button
                      type="submit"
                      className="bg-orange-500 text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-orange-600 transition"
                    >
                      Save Address
                    </button>
                    {userState.addresses.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setIsAddingAddress(false)}
                        className="ml-4 text-gray-500 hover:text-gray-700 text-sm font-semibold"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              ) : (
                <div className="space-y-3">
                  {userState.addresses.map((addr, idx) => (
                    <div 
                      key={idx}
                      onClick={() => setSelectedAddressIndex(idx)}
                      className={`p-4 rounded-xl border cursor-pointer transition ${
                        selectedAddressIndex === idx ? "border-orange-500 bg-orange-50" : "border-gray-200 hover:border-orange-300"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input 
                          type="radio" 
                          checked={selectedAddressIndex === idx} 
                          readOnly
                          className="mt-1 text-orange-500 focus:ring-orange-500" 
                        />
                        <div>
                          <p className="font-semibold text-gray-900">{addr.fullName}</p>
                          <p className="text-gray-600 text-sm mt-1">{addr.streetAddress}</p>
                          <p className="text-gray-600 text-sm">{addr.city}, {addr.state} {addr.zipCode}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Payment Section */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Payment Method</h3>
              <div className="flex items-center gap-3 p-4 border border-orange-500 bg-orange-50 rounded-xl">
                <input
                  type="radio"
                  id="cod"
                  name="payment"
                  checked
                  readOnly
                  className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300"
                />
                <label htmlFor="cod" className="font-semibold text-orange-900">
                  Cash on Delivery (COD)
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-2 ml-7">
                Pay with cash upon delivery. No upfront payment required.
              </p>
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6 sticky top-24">
              <h3 className="text-base font-bold text-gray-900 border-b pb-4">
                Order Summary
              </h3>

              <div className="space-y-4 text-sm">
                {cartState.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-gray-600">
                    <span className="truncate pr-4">{item.quantity} x {item.title}</span>
                    <span className="font-semibold text-gray-900">${(item.priceNumber * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              
              <div className="border-t pt-4 space-y-4 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-900">${cartState.totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="font-semibold text-gray-900">{shippingCost === 0 ? "Free" : `$${shippingCost.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Estimated Tax</span>
                  <span className="font-semibold text-gray-900">${estimatedTax.toFixed(2)}</span>
                </div>
                <div className="border-t pt-4 flex justify-between text-base font-bold text-gray-900">
                  <span>Total</span>
                  <span className="text-orange-500">${orderTotal.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={isAddingAddress || userState.addresses.length === 0}
                className={`w-full flex items-center justify-center rounded-xl py-3.5 text-sm font-semibold text-white transition-colors shadow-lg ${
                  isAddingAddress || userState.addresses.length === 0
                    ? "bg-gray-300 cursor-not-allowed shadow-none"
                    : "bg-orange-500 hover:bg-orange-600 shadow-orange-500/10 cursor-pointer"
                }`}
              >
                Place Order
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
