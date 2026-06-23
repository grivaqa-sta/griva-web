"use client";

import React, { useState, useEffect } from "react";
import { UserPlus, Mail, Shield, User, Key, Users, RefreshCw, Edit2, Lock, Ban, CheckCircle, XCircle } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

interface StaffMember {
  id: number;
  name: string;
  email: string;
  status: "ACTIVE" | "BLOCKED";
  createdAt?: string;
}

export default function StaffTab() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Create / Edit state
  const [editMode, setEditMode] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(""); // Only used in Create mode
  const [submitting, setSubmitting] = useState(false);

  // Reset password state
  const [resetStaff, setResetStaff] = useState<StaffMember | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [resettingPassword, setResettingPassword] = useState(false);

  const fetchStaff = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("griva_admin_token") || "";
      const res = await fetch(`${API_BASE}/admin/staff`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setStaff(data.staff || []);
      } else {
        setError(data.message || "Failed to fetch staff list.");
      }
    } catch {
      setError("Network error fetching staff list.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleCreateOrUpdateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setSubmitting(true);

    try {
      const token = localStorage.getItem("griva_admin_token") || "";
      let res;
      if (editMode && selectedStaffId) {
        // Update staff
        res = await fetch(`${API_BASE}/admin/staff/${selectedStaffId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name, email }),
        });
      } else {
        // Create staff
        res = await fetch(`${API_BASE}/admin/staff`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name, email, password }),
        });
      }

      const data = await res.json();

      if (res.ok) {
        setSuccessMsg(data.message || (editMode ? "Staff updated successfully!" : "Staff created successfully!"));
        setName("");
        setEmail("");
        setPassword("");
        setEditMode(false);
        setSelectedStaffId(null);
        fetchStaff(); // reload list
      } else {
        setError(data.message || "Failed to save staff details.");
      }
    } catch {
      setError("Failed to connect to backend server.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClick = (member: StaffMember) => {
    setEditMode(true);
    setSelectedStaffId(member.id);
    setName(member.name);
    setEmail(member.email);
    setError("");
    setSuccessMsg("");
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setSelectedStaffId(null);
    setName("");
    setEmail("");
    setPassword("");
    setError("");
    setSuccessMsg("");
  };

  const handleToggleStatus = async (member: StaffMember) => {
    setError("");
    setSuccessMsg("");
    const newStatus = member.status === "ACTIVE" ? "BLOCKED" : "ACTIVE";

    try {
      const token = localStorage.getItem("griva_admin_token") || "";
      const res = await fetch(`${API_BASE}/admin/staff/${member.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccessMsg(data.message || `Staff status updated to ${newStatus}`);
        fetchStaff();
      } else {
        setError(data.message || "Failed to update staff status.");
      }
    } catch {
      setError("Failed to connect to backend server.");
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetStaff) return;
    setError("");
    setSuccessMsg("");
    setResettingPassword(true);

    try {
      const token = localStorage.getItem("griva_admin_token") || "";
      const res = await fetch(`${API_BASE}/admin/staff/${resetStaff.id}/reset-password`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ password: newPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccessMsg(data.message || "Staff password reset successfully!");
        setNewPassword("");
        setResetStaff(null);
      } else {
        setError(data.message || "Failed to reset password.");
      }
    } catch {
      setError("Failed to connect to backend server.");
    } finally {
      setResettingPassword(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-300">
      
      {/* ── Forms Column ── */}
      <div className="lg:col-span-5 space-y-6">
        {/* Create / Edit Staff Form */}
        <div className="bg-white border border-orange-500/30 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-orange-500/30">
            <UserPlus className="h-4.5 w-4.5 text-orange-500" />
            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
              {editMode ? "Edit Staff Member" : "Create New Staff"}
            </h4>
          </div>
          <p className="text-[10px] text-gray-400 leading-relaxed">
            {editMode
              ? "Modify the profile details of the selected staff member."
              : "Register a new operations staff account. Staff can log into the panel using these credentials."}
          </p>

          {successMsg && (
            <div className="bg-green-50 border border-green-200 text-green-600 text-xs font-bold p-3 rounded-xl">
              ✅ {successMsg}
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-xs font-bold p-3 rounded-xl">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleCreateOrUpdateStaff} className="space-y-4">
            <div>
              <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1.5">Full Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                  <User className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  placeholder="e.g. Abdullah Jassim"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white border border-orange-500/30 rounded-xl pl-9 pr-4 py-2.5 text-xs text-gray-800 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1.5">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  type="email"
                  placeholder="staff@thegriva.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border border-orange-500/30 rounded-xl pl-9 pr-4 py-2.5 text-xs text-gray-800 focus:outline-none"
                  required
                />
              </div>
            </div>

            {!editMode && (
              <div>
                <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1.5">Login Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                    <Key className="h-4 w-4" />
                  </span>
                  <input
                    type="password"
                    placeholder="Minimum 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white border border-orange-500/30 rounded-xl pl-9 pr-4 py-2.5 text-xs text-gray-800 focus:outline-none"
                    required
                    minLength={6}
                  />
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white rounded-xl transition-all cursor-pointer font-bold text-xs shadow-md"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" />
                    {editMode ? "Update Details" : "Create Account"}
                  </>
                )}
              </button>

              {editMode && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-4 py-3 bg-gray-100 hover:bg-gray-250 text-gray-600 rounded-xl transition-all cursor-pointer font-bold text-xs"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Reset Password Form (Visible when staff selected) */}
        {resetStaff && (
          <div className="bg-white border border-orange-500/30 rounded-2xl p-6 space-y-4 animate-in slide-in-from-top-4 duration-300">
            <div className="flex items-center gap-2 pb-3 border-b border-orange-500/30">
              <Lock className="h-4.5 w-4.5 text-orange-500" />
              <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Reset Password</h4>
            </div>
            <p className="text-[10px] text-gray-400">
              Update password for: <strong>{resetStaff.name}</strong> ({resetStaff.email})
            </p>

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1.5">New Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                    <Key className="h-4 w-4" />
                  </span>
                  <input
                    type="password"
                    placeholder="Minimum 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-white border border-orange-500/30 rounded-xl pl-9 pr-4 py-2.5 text-xs text-gray-800 focus:outline-none"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={resettingPassword}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white rounded-xl transition-all cursor-pointer font-bold text-xs shadow-md"
                >
                  {resettingPassword ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    "Reset Password"
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setResetStaff(null)}
                  className="px-4 py-3 bg-gray-100 hover:bg-gray-250 text-gray-600 rounded-xl transition-all cursor-pointer font-bold text-xs"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* ── Staff List Panel ── */}
      <div className="lg:col-span-7 space-y-6">
        <div className="bg-white border border-orange-500/30 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-orange-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4.5 w-4.5 text-orange-500" />
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Active Staff ({staff.length})</h4>
            </div>
            <button
              onClick={fetchStaff}
              disabled={loading}
              className="p-1 hover:bg-gray-200 rounded-lg active:scale-95 transition-all cursor-pointer"
            >
              <RefreshCw className={`h-4 w-4 text-gray-500 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>

          <table className="w-full text-left border-collapse min-w-[500px]">
            <thead>
              <tr className="border-b border-orange-500/30 text-[10px] text-gray-400 font-bold uppercase tracking-wider bg-gray-50">
                <th className="p-4 pl-6">Staff Member</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-right pr-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-150">
              {loading && staff.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-10 text-center text-xs text-gray-400 font-semibold">
                    <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2 text-orange-500" />
                    Loading staff directory...
                  </td>
                </tr>
              ) : staff.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-10 text-center text-xs text-gray-400 font-semibold">
                    No staff accounts created yet.
                  </td>
                </tr>
              ) : (
                staff.map((member) => {
                  const initials = member.name ? member.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() : "S";
                  return (
                    <tr key={member.id} className="hover:bg-orange-500/3 transition-colors group">
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-orange-400 to-amber-500 flex items-center justify-center font-black text-xs text-white shrink-0 shadow-xs">
                            {initials}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-gray-800 block truncate max-w-[200px] hover:text-orange-500 transition-colors">{member.name}</span>
                            <span className="text-[10px] text-gray-450 font-medium block truncate max-w-[200px]">{member.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        {member.status === "ACTIVE" ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 border border-green-200 text-green-700 rounded-lg text-[10px] font-bold">
                            <CheckCircle className="w-3.5 h-3.5 text-green-500" /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 border border-red-200 text-red-700 rounded-lg text-[10px] font-bold">
                            <XCircle className="w-3.5 h-3.5 text-red-500" /> Blocked
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right pr-6" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2.5">
                          {/* Edit Button */}
                          <button
                            onClick={() => handleEditClick(member)}
                            title="Edit Profile"
                            className="p-1.5 rounded-lg border border-orange-500/20 text-gray-500 hover:text-orange-500 hover:bg-orange-500/5 transition-colors cursor-pointer"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>

                          {/* Password Reset Trigger */}
                          <button
                            onClick={() => {
                              setResetStaff(member);
                              setNewPassword("");
                              setError("");
                              setSuccessMsg("");
                            }}
                            title="Reset Password"
                            className="p-1.5 rounded-lg border border-orange-500/20 text-gray-500 hover:text-orange-500 hover:bg-orange-500/5 transition-colors cursor-pointer"
                          >
                            <Lock className="h-3.5 w-3.5" />
                          </button>

                          {/* Block/Unblock Status */}
                          <button
                            onClick={() => handleToggleStatus(member)}
                            title={member.status === "ACTIVE" ? "Deactivate Account" : "Reactivate Account"}
                            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                              member.status === "ACTIVE"
                                ? "border-red-500/20 text-red-500 hover:bg-red-50"
                                : "border-green-500/20 text-green-600 hover:bg-green-50"
                            }`}
                          >
                            {member.status === "ACTIVE" ? <Ban className="h-3.5 w-3.5" /> : <CheckCircle className="h-3.5 w-3.5" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
