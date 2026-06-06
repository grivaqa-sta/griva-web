"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser, Address } from "@/app/context/UserContext";
import SectionHeading from "@/app/components/common/SectionHeading";
import { User as UserIcon, MapPin, Package, LogOut, Edit, Trash2, Plus } from "lucide-react";
import Image from "next/image";

export default function AccountPage() {
  const { state: userState, logout, addAddress, updateAddress, deleteAddress } = useUser();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("profile");

  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [editingAddressIndex, setEditingAddressIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<Address>({
    fullName: "", streetAddress: "", city: "", state: "", zipCode: ""
  });

  useEffect(() => {
    if (!userState.isLoggedIn) {
      router.push("/login");
    }
  }, [userState.isLoggedIn, router]);

  if (!userState.isLoggedIn) return null;

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAddressIndex !== null) {
      updateAddress(editingAddressIndex, formData);
    } else {
      addAddress(formData);
    }
    setIsAddingAddress(false);
    setEditingAddressIndex(null);
  };

  const openAddAddress = () => {
    setFormData({ fullName: "", streetAddress: "", city: "", state: "", zipCode: "" });
    setIsAddingAddress(true);
    setEditingAddressIndex(null);
  };

  const openEditAddress = (index: number, addr: Address) => {
    setFormData(addr);
    setIsAddingAddress(true);
    setEditingAddressIndex(index);
  };

  return (
    <div className="bg-gray-50/50 min-h-[80vh] py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading title="My Account" subtitle="Manage your profile, orders, and addresses" />

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mt-8">
          {/* Sidebar */}
          <div className="md:col-span-3 space-y-2">
            <button
              onClick={() => setActiveTab("profile")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition cursor-pointer ${
                activeTab === "profile" ? "bg-orange-500 text-white shadow-md shadow-orange-500/20" : "bg-white text-gray-700 hover:bg-orange-50"
              }`}
            >
              <UserIcon className="h-5 w-5" /> Profile
            </button>
            <button
              onClick={() => setActiveTab("addresses")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition cursor-pointer ${
                activeTab === "addresses" ? "bg-orange-500 text-white shadow-md shadow-orange-500/20" : "bg-white text-gray-700 hover:bg-orange-50"
              }`}
            >
              <MapPin className="h-5 w-5" /> Addresses
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition cursor-pointer ${
                activeTab === "orders" ? "bg-orange-500 text-white shadow-md shadow-orange-500/20" : "bg-white text-gray-700 hover:bg-orange-50"
              }`}
            >
              <Package className="h-5 w-5" /> Order History
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-red-500 bg-white hover:bg-red-50 transition cursor-pointer mt-4"
            >
              <LogOut className="h-5 w-5" /> Logout
            </button>
          </div>

          {/* Main Content */}
          <div className="md:col-span-9 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
            
            {/* PROFILE TAB */}
            {activeTab === "profile" && (
              <div className="space-y-6">
                <h3 className="text-base sm:text-xl font-bold text-gray-900 border-b pb-4">Personal Profile</h3>
                <div className="flex items-center gap-6">
                  <div className="h-16 w-16 sm:h-24 sm:w-24 rounded-full bg-orange-100 text-orange-500 flex items-center justify-center text-xl sm:text-3xl font-bold uppercase">
                    {userState.user?.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-lg sm:text-2xl font-bold text-gray-900">{userState.user?.name}</h4>
                    <p className="text-gray-500">{userState.user?.email}</p>
                    <span className="inline-block mt-2 px-3 py-1 bg-green-100 text-green-700 text-xs font-bold uppercase rounded-full">
                      Active Member
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* ADDRESSES TAB */}
            {activeTab === "addresses" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b pb-4">
                  <h3 className="text-base sm:text-xl font-bold text-gray-900">Saved Addresses</h3>
                  {!isAddingAddress && (
                    <button
                      onClick={openAddAddress}
                      className="flex items-center gap-1 text-sm font-bold text-orange-500 hover:text-orange-600 transition cursor-pointer"
                    >
                      <Plus className="h-4 w-4" /> Add New
                    </button>
                  )}
                </div>

                {isAddingAddress ? (
                  <form onSubmit={handleAddressSubmit} className="space-y-4 max-w-2xl bg-gray-50 p-6 rounded-xl border border-gray-100">
                    <h4 className="font-bold text-gray-800 mb-2">{editingAddressIndex !== null ? "Edit Address" : "Add New Address"}</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Full Name</label>
                        <input
                          type="text"
                          required
                          value={formData.fullName}
                          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                          className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm px-3 py-2 border bg-white"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Street Address</label>
                        <input
                          type="text"
                          required
                          value={formData.streetAddress}
                          onChange={(e) => setFormData({ ...formData, streetAddress: e.target.value })}
                          className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm px-3 py-2 border bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">City</label>
                        <input
                          type="text"
                          required
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm px-3 py-2 border bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">State / Province</label>
                        <input
                          type="text"
                          required
                          value={formData.state}
                          onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                          className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm px-3 py-2 border bg-white"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">ZIP / Postal Code</label>
                        <input
                          type="text"
                          required
                          value={formData.zipCode}
                          onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                          className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm px-3 py-2 border bg-white"
                        />
                      </div>
                    </div>
                    <div className="pt-2 flex gap-3">
                      <button
                        type="submit"
                        className="bg-orange-500 text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-orange-600 transition cursor-pointer"
                      >
                        Save Address
                      </button>
                      <button
                        type="button"
                        onClick={() => { setIsAddingAddress(false); setEditingAddressIndex(null); }}
                        className="bg-gray-200 text-gray-700 px-6 py-2 rounded-xl text-sm font-bold hover:bg-gray-300 transition cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {userState.addresses.length === 0 ? (
                      <p className="text-gray-500 col-span-2 py-4">No addresses saved yet.</p>
                    ) : (
                      userState.addresses.map((addr, idx) => (
                        <div key={idx} className="p-5 rounded-xl border border-gray-200 relative group hover:border-orange-200 transition">
                          <p className="font-bold text-gray-900">{addr.fullName}</p>
                          <p className="text-gray-600 text-sm mt-1">{addr.streetAddress}</p>
                          <p className="text-gray-600 text-sm">{addr.city}, {addr.state} {addr.zipCode}</p>
                          
                          <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => openEditAddress(idx, addr)}
                              className="p-1.5 bg-gray-100 text-gray-600 rounded hover:bg-orange-100 hover:text-orange-500 transition cursor-pointer"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => deleteAddress(idx)}
                              className="p-1.5 bg-gray-100 text-gray-600 rounded hover:bg-red-100 hover:text-red-500 transition cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ORDERS TAB */}
            {activeTab === "orders" && (
              <div className="space-y-6">
                <h3 className="text-base sm:text-xl font-bold text-gray-900 border-b pb-4">Order History</h3>
                
                {userState.orders.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">You haven&apos;t placed any orders yet.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {userState.orders.map((order) => (
                      <div key={order.id} className="border border-gray-200 rounded-xl overflow-hidden">
                        <div className="bg-gray-50 px-6 py-4 flex flex-wrap justify-between items-center gap-4 border-b border-gray-200">
                          <div>
                            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Order Placed</p>
                            <p className="text-sm font-semibold text-gray-900">{new Date(order.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Total</p>
                            <p className="text-sm font-semibold text-gray-900">${order.total.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Order ID</p>
                            <p className="text-sm font-semibold text-gray-900">{order.id}</p>
                          </div>
                          <div>
                            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold uppercase rounded-full">
                              {order.status}
                            </span>
                          </div>
                        </div>
                        <div className="px-6 py-4 space-y-4">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex items-center gap-4">
                              <div className="relative h-16 w-16 bg-gray-50 rounded-lg border flex-shrink-0">
                                <Image
                                  src={item.image}
                                  alt={item.title}
                                  fill
                                  className="object-contain p-2"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-gray-900 truncate">{item.title}</p>
                                <p className="text-xs text-gray-500 mt-1">Qty: {item.quantity}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-bold text-orange-500">${(item.priceNumber * item.quantity).toFixed(2)}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
