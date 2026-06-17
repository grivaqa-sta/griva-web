"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  User as UserIcon, MapPin, Package, LogOut,
  Edit, Trash2, Plus, Loader2, Star, Home, Briefcase,
} from "lucide-react";
import { authService } from "@/app/services/auth.service";
import { addressService } from "@/app/services/address.service";
import { useUser } from "@/app/context/UserContext";
import { Address, AddressRequest } from "@/app/types/types";

interface ProfileData {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

const emptyForm: AddressRequest = {
  label: "home",
  fullName: "",
  mobile: "",
  addressLine1: "",
  addressLine2: "",
  landmark: "",
  city: "",
  district: "",
  state: "",
  country: "",
  pincode: "",
  isDefault: false,
};

const labelIcons = {
  home: Home,
  office: Briefcase,
  other: MapPin,
};

const labelColors = {
  home: "bg-blue-50 text-blue-600 border-blue-100",
  office: "bg-purple-50 text-purple-600 border-purple-100",
  other: "bg-gray-50 text-gray-600 border-gray-100",
};

export default function AccountPage() {
  const router = useRouter();
  const { logout } = useUser();
  const [activeTab, setActiveTab] = useState("profile");

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState("");

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [addressesError, setAddressesError] = useState("");
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [formData, setFormData] = useState<AddressRequest>(emptyForm);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");

  // Fetch profile
  useEffect(() => {
    if (activeTab === "profile" && !profile) {
      const fetchProfile = async () => {
        setProfileLoading(true);
        setProfileError("");
        try {
          const data = await authService.getProfile();
          if (data.success) {
            if (data.user.role === "admin") {
              router.push("/admin");
              return;
            }
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

  // Fetch addresses when tab is active
  useEffect(() => {
    if (activeTab === "addresses") {
      fetchAddresses();
    }
  }, [activeTab]);

  const fetchAddresses = async () => {
    setAddressesLoading(true);
    setAddressesError("");
    try {
      const data = await addressService.getAddresses();
      // Normalize all possible response shapes to an array
      const result = Array.isArray(data)
        ? data
        : Array.isArray(data?.addresses)
        ? data.addresses
        : Array.isArray(data?.data)
        ? data.data
        : [];
      setAddresses(result);
    } catch {
      setAddressesError("Unable to load addresses.");
    } finally {
      setAddressesLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/auth/login");
  };

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError("");
    try {
      if (editingAddress !== null) {
        await addressService.updateAddress(editingAddress.id, formData);
      } else {
        await addressService.createAddress(formData);
      }
      await fetchAddresses();
      closeForm();
    } catch {
      setFormError("Failed to save address. Please try again.");
    } finally {
      setFormLoading(false);
    }
  };

  const openAddAddress = () => {
    setFormData(emptyForm);
    setEditingAddress(null);
    setFormError("");
    setIsAddingAddress(true);
  };

  const openEditAddress = (addr: Address) => {
    setFormData({
      label: addr.label,
      fullName: addr.fullName,
      mobile: addr.mobile,
      addressLine1: addr.addressLine1,
      addressLine2: addr.addressLine2 ?? "",
      landmark: addr.landmark ?? "",
      city: addr.city,
      district: addr.district ?? "",
      state: addr.state,
      country: addr.country ?? "",
      pincode: addr.pincode,
      isDefault: addr.isDefault,
    });
    setEditingAddress(addr);
    setFormError("");
    setIsAddingAddress(true);
  };

  const closeForm = () => {
    setIsAddingAddress(false);
    setEditingAddress(null);
    setFormError("");
  };

  const deleteAddress = async (id: number) => {
    try {
      await addressService.deleteAddress(id);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
    } catch {
      setAddressesError("Failed to delete address.");
    }
  };

  const setDefaultAddress = async (id: number) => {
    try {
      await addressService.setDefaultAddress(id);
      setAddresses((prev) =>
        prev.map((a) => ({ ...a, isDefault: a.id === id }))
      );
    } catch {
      setAddressesError("Failed to set default address.");
    }
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: UserIcon },
    { id: "addresses", label: "Addresses", icon: MapPin },
    { id: "orders", label: "Order History", icon: Package },
  ];

  const inputClass =
    "mt-1 block w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors";

  const labelClass =
    "block text-xs font-bold uppercase tracking-wide text-gray-500";

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

                  {addressesError && (
                    <div className="text-red-500 text-sm text-center bg-red-50 border border-red-100 p-3 rounded-xl">
                      {addressesError}
                    </div>
                  )}

                  {isAddingAddress ? (
                    <form onSubmit={handleAddressSubmit} className="space-y-4 max-w-2xl bg-gray-50 p-6 rounded-xl border border-gray-100">
                      <h4 className="font-bold text-gray-800">
                        {editingAddress !== null ? "Edit Address" : "New Address"}
                      </h4>

                      {formError && (
                        <div className="text-red-500 text-sm bg-red-50 border border-red-100 p-3 rounded-xl">
                          {formError}
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                        {/* Label */}
                        <div className="sm:col-span-2">
                          <label className={labelClass}>Address Type</label>
                          <div className="mt-2 flex gap-3">
                            {(["home", "office", "other"] as const).map((l) => (
                              <button
                                key={l}
                                type="button"
                                onClick={() => setFormData({ ...formData, label: l })}
                                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl border text-sm font-semibold capitalize transition cursor-pointer ${
                                  formData.label === l
                                    ? "bg-orange-500 text-white border-orange-500 shadow-sm shadow-orange-500/20"
                                    : "bg-white text-gray-600 border-gray-200 hover:border-orange-300"
                                }`}
                              >
                                {l === "home" && <Home className="h-3.5 w-3.5" />}
                                {l === "office" && <Briefcase className="h-3.5 w-3.5" />}
                                {l === "other" && <MapPin className="h-3.5 w-3.5" />}
                                {l}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Full Name */}
                        <div>
                          <label className={labelClass}>Full Name</label>
                          <input type="text" required placeholder="John Doe" value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            className={inputClass} />
                        </div>

                        {/* Mobile */}
                        <div>
                          <label className={labelClass}>Mobile Number</label>
                          <input type="tel" required placeholder="9876543210" value={formData.mobile}
                            onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                            className={inputClass} />
                        </div>

                        {/* Address Line 1 */}
                        <div className="sm:col-span-2">
                          <label className={labelClass}>Address Line 1</label>
                          <input type="text" required placeholder="House / Flat No., Building Name" value={formData.addressLine1}
                            onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                            className={inputClass} />
                        </div>

                        {/* Address Line 2 */}
                        <div className="sm:col-span-2">
                          <label className={labelClass}>Address Line 2 <span className="normal-case font-normal text-gray-400">(optional)</span></label>
                          <input type="text" placeholder="Street, Area, Colony" value={formData.addressLine2 ?? ""}
                            onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
                            className={inputClass} />
                        </div>

                        {/* Landmark */}
                        <div className="sm:col-span-2">
                          <label className={labelClass}>Landmark <span className="normal-case font-normal text-gray-400">(optional)</span></label>
                          <input type="text" placeholder="Near bus stand, opposite park…" value={formData.landmark ?? ""}
                            onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                            className={inputClass} />
                        </div>

                        {/* City */}
                        <div>
                          <label className={labelClass}>City</label>
                          <input type="text" required placeholder="Mumbai" value={formData.city}
                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                            className={inputClass} />
                        </div>

                        {/* District */}
                        <div>
                          <label className={labelClass}>District <span className="normal-case font-normal text-gray-400">(optional)</span></label>
                          <input type="text" placeholder="Mumbai Suburban" value={formData.district ?? ""}
                            onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                            className={inputClass} />
                        </div>

                        {/* State */}
                        <div>
                          <label className={labelClass}>State</label>
                          <input type="text" required placeholder="Maharashtra" value={formData.state}
                            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                            className={inputClass} />
                        </div>

                        {/* Country */}
                        <div>
                          <label className={labelClass}>Country <span className="normal-case font-normal text-gray-400">(optional)</span></label>
                          <input type="text" placeholder="India" value={formData.country ?? ""}
                            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                            className={inputClass} />
                        </div>

                        {/* Pincode */}
                        <div>
                          <label className={labelClass}>Pincode</label>
                          <input type="text" required placeholder="400001" value={formData.pincode}
                            onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                            className={inputClass} />
                        </div>

                        {/* Set as Default */}
                        <div className="sm:col-span-2 flex items-center gap-2.5 mt-1">
                          <input
                            type="checkbox"
                            id="isDefault"
                            checked={formData.isDefault ?? false}
                            onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                            className="h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500 cursor-pointer"
                          />
                          <label htmlFor="isDefault" className="text-sm font-semibold text-gray-700 cursor-pointer">
                            Set as default address
                          </label>
                        </div>

                      </div>

                      <div className="pt-2 flex gap-3">
                        <button type="submit" disabled={formLoading}
                          className="flex items-center gap-2 bg-orange-500 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-orange-600 transition cursor-pointer shadow-sm shadow-orange-500/20 disabled:opacity-60 disabled:cursor-not-allowed">
                          {formLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                          Save Address
                        </button>
                        <button type="button" onClick={closeForm} disabled={formLoading}
                          className="bg-gray-100 text-gray-700 px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-200 transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed">
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      {addressesLoading ? (
                        <div className="flex items-center justify-center py-16">
                          <Loader2 className="h-8 w-8 text-orange-500 animate-spin" />
                        </div>
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
                            addresses.map((addr) => {
                              const LabelIcon = labelIcons[addr.label];
                              return (
                                <div key={addr.id}
                                  className={`p-5 rounded-xl border relative group transition-all ${
                                    addr.isDefault
                                      ? "border-orange-300 bg-orange-50/40 shadow-sm"
                                      : "border-gray-200 hover:border-orange-300 hover:shadow-sm"
                                  }`}>

                                  {/* Badges row */}
                                  <div className="flex items-center gap-2 mb-2.5">
                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 border text-[10px] font-bold uppercase tracking-wide rounded-full capitalize ${labelColors[addr.label]}`}>
                                      <LabelIcon className="h-2.5 w-2.5" />
                                      {addr.label}
                                    </span>
                                    {addr.isDefault && (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-100 text-orange-600 border border-orange-200 text-[10px] font-bold uppercase tracking-wide rounded-full">
                                        <Star className="h-2.5 w-2.5 fill-orange-500" /> Default
                                      </span>
                                    )}
                                  </div>

                                  <p className="font-bold text-gray-900 text-sm">{addr.fullName}</p>
                                  <p className="text-gray-500 text-xs mt-0.5">{addr.mobile}</p>
                                  <p className="text-gray-500 text-sm mt-1.5 leading-relaxed">
                                    {addr.addressLine1}
                                    {addr.addressLine2 && `, ${addr.addressLine2}`}
                                    {addr.landmark && ` (Near ${addr.landmark})`}
                                  </p>
                                  <p className="text-gray-500 text-sm">
                                    {addr.city}{addr.district ? `, ${addr.district}` : ""}, {addr.state} — {addr.pincode}
                                  </p>
                                  {addr.country && (
                                    <p className="text-gray-400 text-xs mt-0.5">{addr.country}</p>
                                  )}

                                  {!addr.isDefault && (
                                    <button
                                      onClick={() => setDefaultAddress(addr.id)}
                                      className="mt-3 text-xs font-semibold text-orange-500 hover:text-orange-600 transition cursor-pointer">
                                      Set as default
                                    </button>
                                  )}

                                  <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => openEditAddress(addr)}
                                      className="p-1.5 bg-gray-100 text-gray-500 rounded-lg hover:bg-orange-100 hover:text-orange-500 transition cursor-pointer" title="Edit">
                                      <Edit className="h-3.5 w-3.5" />
                                    </button>
                                    <button onClick={() => deleteAddress(addr.id)}
                                      className="p-1.5 bg-gray-100 text-gray-500 rounded-lg hover:bg-red-100 hover:text-red-500 transition cursor-pointer" title="Delete">
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      )}
                    </>
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