"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  User as UserIcon, MapPin, Package, LogOut,
  Edit, Trash2, Plus, Loader2,
} from "lucide-react";
import { authService } from "@/app/services/auth.service";
import { useUser } from "@/app/context/UserContext";

interface ProfileData {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

interface Address {
  fullName: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
}

export default function AccountPage() {
  const router = useRouter();
  const { logout } = useUser();
  const [activeTab, setActiveTab] = useState("profile");

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState("");

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [editingAddressIndex, setEditingAddressIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<Address>({
    fullName: "", streetAddress: "", city: "", state: "", zipCode: "",
  });

  useEffect(() => {
    if (activeTab === "profile" && !profile) {
      const fetchProfile = async () => {
        setProfileLoading(true);
        setProfileError("");
        try {
          const data = await authService.getProfile();
          if (data.success) {
            setProfile(data.user);
          } else {
            setProfileError("Failed to load profile.");
          }
        } catch {
          setProfileError("Unable to connect to server.");
        } finally {
          setProfileLoading(false);
        }
      };
      fetchProfile();
    }
  }, [activeTab, profile]);

  const handleLogout = () => {
    logout();
    router.push("/auth/login");
  };

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAddressIndex !== null) {
      setAddresses((prev) => prev.map((a, i) => (i === editingAddressIndex ? formData : a)));
    } else {
      setAddresses((prev) => [...prev, formData]);
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

  const deleteAddress = (index: number) => {
    setAddresses((prev) => prev.filter((_, i) => i !== index));
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: UserIcon },
    { id: "addresses", label: "Addresses", icon: MapPin },
    { id: "orders", label: "Order History", icon: Package },
  ];

  const inputClass =
    "mt-1 block w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors";

  return (
    <div className="bg-gray-50/50 min-h-[80vh] py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">My Account</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your profile, orders, and addresses</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

          {/* Sidebar */}
          <div className="md:col-span-3">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 space-y-1">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                    activeTab === id
                      ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
                      : "text-gray-600 hover:bg-orange-50 hover:text-orange-500"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {label}
                </button>
              ))}

              <div className="pt-2 border-t border-gray-100 mt-2">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-all cursor-pointer"
                >
                  <LogOut className="h-4 w-4 shrink-0" />
                  Logout
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="md:col-span-9">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">

              {/* PROFILE TAB */}
              {activeTab === "profile" && (
                <div className="space-y-6">
                  <div className="border-b border-gray-100 pb-4">
                    <h3 className="text-lg font-bold text-gray-900">Personal Profile</h3>
                    <p className="text-xs text-gray-400 mt-0.5">Your account information</p>
                  </div>

                  {profileLoading && (
                    <div className="flex items-center justify-center py-16">
                      <Loader2 className="h-8 w-8 text-orange-500 animate-spin" />
                    </div>
                  )}

                  {profileError && !profileLoading && (
                    <div className="text-red-500 text-sm text-center bg-red-50 border border-red-100 p-3 rounded-xl">
                      {profileError}
                    </div>
                  )}

                  {profile && !profileLoading && (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">

                      {/* Info */}
                      <div className="flex-1 space-y-3">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Full Name</p>
                          <p className="text-lg font-bold text-gray-900 mt-0.5">{profile.name}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Email Address</p>
                          <p className="text-sm text-gray-700 mt-0.5">{profile.email}</p>
                        </div>
                        <span className="inline-block px-3 py-1 bg-green-50 text-green-600 border border-green-100 text-xs font-bold uppercase tracking-wide rounded-full">
                          Active Member
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ADDRESSES TAB */}
              {activeTab === "addresses" && (
                <div className="space-y-6">
                  <div className="border-b border-gray-100 pb-4 flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Saved Addresses</h3>
                      <p className="text-xs text-gray-400 mt-0.5">Manage your delivery addresses</p>
                    </div>
                    {!isAddingAddress && (
                      <button
                        onClick={openAddAddress}
                        className="flex items-center gap-1.5 text-sm font-bold text-white bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-xl transition cursor-pointer shadow-sm shadow-orange-500/20"
                      >
                        <Plus className="h-4 w-4" /> Add New
                      </button>
                    )}
                  </div>

                  {isAddingAddress ? (
                    <form onSubmit={handleAddressSubmit} className="space-y-4 max-w-2xl bg-gray-50 p-6 rounded-xl border border-gray-100">
                      <h4 className="font-bold text-gray-800">
                        {editingAddressIndex !== null ? "Edit Address" : "New Address"}
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-bold uppercase tracking-wide text-gray-500">Full Name</label>
                          <input type="text" required placeholder="John Doe" value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            className={inputClass} />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-bold uppercase tracking-wide text-gray-500">Street Address</label>
                          <input type="text" required placeholder="123 Main St" value={formData.streetAddress}
                            onChange={(e) => setFormData({ ...formData, streetAddress: e.target.value })}
                            className={inputClass} />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wide text-gray-500">City</label>
                          <input type="text" required placeholder="Mumbai" value={formData.city}
                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                            className={inputClass} />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wide text-gray-500">State / Province</label>
                          <input type="text" required placeholder="Maharashtra" value={formData.state}
                            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                            className={inputClass} />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-bold uppercase tracking-wide text-gray-500">ZIP / Postal Code</label>
                          <input type="text" required placeholder="400001" value={formData.zipCode}
                            onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                            className={inputClass} />
                        </div>
                      </div>
                      <div className="pt-2 flex gap-3">
                        <button type="submit"
                          className="bg-orange-500 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-orange-600 transition cursor-pointer shadow-sm shadow-orange-500/20">
                          Save Address
                        </button>
                        <button type="button"
                          onClick={() => { setIsAddingAddress(false); setEditingAddressIndex(null); }}
                          className="bg-gray-100 text-gray-700 px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-200 transition cursor-pointer">
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {addresses.length === 0 ? (
                        <div className="col-span-2 text-center py-12">
                          <MapPin className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                          <p className="text-gray-400 text-sm font-medium">No addresses saved yet.</p>
                          <button onClick={openAddAddress}
                            className="mt-4 text-sm font-bold text-orange-500 hover:text-orange-600 transition cursor-pointer">
                            + Add your first address
                          </button>
                        </div>
                      ) : (
                        addresses.map((addr, idx) => (
                          <div key={idx}
                            className="p-5 rounded-xl border border-gray-200 relative group hover:border-orange-300 hover:shadow-sm transition-all">
                            <p className="font-bold text-gray-900 text-sm">{addr.fullName}</p>
                            <p className="text-gray-500 text-sm mt-1">{addr.streetAddress}</p>
                            <p className="text-gray-500 text-sm">{addr.city}, {addr.state} {addr.zipCode}</p>
                            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => openEditAddress(idx, addr)}
                                className="p-1.5 bg-gray-100 text-gray-500 rounded-lg hover:bg-orange-100 hover:text-orange-500 transition cursor-pointer" title="Edit">
                                <Edit className="h-3.5 w-3.5" />
                              </button>
                              <button onClick={() => deleteAddress(idx)}
                                className="p-1.5 bg-gray-100 text-gray-500 rounded-lg hover:bg-red-100 hover:text-red-500 transition cursor-pointer" title="Delete">
                                <Trash2 className="h-3.5 w-3.5" />
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
                  <div className="border-b border-gray-100 pb-4">
                    <h3 className="text-lg font-bold text-gray-900">Order History</h3>
                    <p className="text-xs text-gray-400 mt-0.5">Track and review your past orders</p>
                  </div>
                  <div className="text-center py-16">
                    <div className="h-16 w-16 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center mx-auto mb-4">
                      <Package className="h-8 w-8 text-gray-300" />
                    </div>
                    <p className="text-gray-500 font-medium text-sm">No orders yet</p>
                    <p className="text-gray-400 text-xs mt-1">Your completed orders will appear here</p>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}