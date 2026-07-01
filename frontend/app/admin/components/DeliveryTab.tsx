import React, { useState, useEffect } from "react";
import { UserPlus, Mail, Shield, User, Key, Users, RefreshCw, Send, Lock, ChevronDown } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

interface DeliveryBoy {
  id: number;
  name: string;
  email: string;
  activeOrderCount: number;
  createdAt?: string;
}

export default function DeliveryTab() {
  const [drivers, setDrivers] = useState<DeliveryBoy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Create form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // Notification form state
  const [targetDriverId, setTargetDriverId] = useState("all");
  const [notifTitle, setNotifTitle] = useState("");
  const [notifMessage, setNotifMessage] = useState("");
  const [sendingNotif, setSendingNotif] = useState(false);
  const [notifSuccess, setNotifSuccess] = useState("");
  const [notifError, setNotifError] = useState("");

  // Password Reset state
  const [resetDriver, setResetDriver] = useState<DeliveryBoy | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [resettingPassword, setResettingPassword] = useState(false);
  const [openRecipientSelect, setOpenRecipientSelect] = useState(false);

  const fetchDrivers = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("griva_admin_token") || "";
      const res = await fetch(`${API_BASE}/orders/admin/delivery-boys`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setDrivers(data.deliveryBoys || []);
      } else {
        setError("Failed to fetch drivers.");
      }
    } catch {
      setError("Network error fetching drivers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const handleCreateDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setSubmitting(true);

    try {
      const token = localStorage.getItem("griva_admin_token") || "";
      const res = await fetch(`${API_BASE}/orders/admin/delivery-boys`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccessMsg(data.message || "Driver created successfully!");
        setName("");
        setEmail("");
        setPassword("");
        fetchDrivers(); // reload list
      } else {
        setError(data.message || "Failed to create driver.");
      }
    } catch {
      setError("Failed to connect to backend server.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetDriver) return;
    setResettingPassword(true);
    setError("");
    setSuccessMsg("");

    try {
      const token = localStorage.getItem("griva_admin_token") || "";
      const res = await fetch(`${API_BASE}/orders/admin/delivery-boys/${resetDriver.id}/reset-password`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ password: newPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccessMsg(data.message || "Driver password updated successfully!");
        setResetDriver(null);
        setNewPassword("");
      } else {
        setError(data.message || "Failed to update driver password.");
      }
    } catch {
      setError("Failed to connect to backend server.");
    } finally {
      setResettingPassword(false);
    }
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotifError("");
    setNotifSuccess("");
    setSendingNotif(true);

    try {
      const token = localStorage.getItem("griva_admin_token") || "";
      const res = await fetch(`${API_BASE}/delivery/admin/notifications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          driverId: targetDriverId === "all" ? "all" : Number(targetDriverId),
          title: notifTitle,
          message: notifMessage,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setNotifSuccess(data.message || "Alert sent successfully!");
        setNotifTitle("");
        setNotifMessage("");
      } else {
        setNotifError(data.message || "Failed to send alert.");
      }
    } catch {
      setNotifError("Failed to connect to backend server.");
    } finally {
      setSendingNotif(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in-50 duration-300">
      
      {/* Forms column */}
      <div className="lg:col-span-5 space-y-6">
        {/* Create Driver Form */}
        <div className="bg-white border border-orange-500/30 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-orange-500/30">
            <UserPlus className="h-4.5 w-4.5 text-orange-500" />
            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Create New Driver</h4>
          </div>
          <p className="text-[10px] text-gray-400 leading-relaxed">
            Register a new delivery staff account. Drivers can log into the mobile dashboard using these credentials.
          </p>

          {successMsg && !resetDriver && (
            <div className="bg-green-50 border border-green-200 text-green-600 text-xs font-bold p-3 rounded-xl">
              ✅ {successMsg}
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-xs font-bold p-3 rounded-xl">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleCreateDriver} className="space-y-4">
            <div>
              <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1.5">Driver Full Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                  <User className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  placeholder="e.g. Mohammed Al-Kuwari"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white border border-orange-500/30 rounded-xl pl-9 pr-4 py-2.5 text-xs text-gray-800 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1.5">Driver Email</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  type="email"
                  placeholder="driver@thegriva.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border border-orange-500/30 rounded-xl pl-9 pr-4 py-2.5 text-xs text-gray-800 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1.5">Driver Password</label>
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

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white rounded-xl transition-all cursor-pointer font-bold text-xs shadow-md"
            >
              {submitting ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  Create Driver Account
                </>
              )}
            </button>
          </form>
        </div>

        {/* Reset Driver Password Form */}
        {resetDriver && (
          <div className="bg-white border border-orange-500/30 rounded-2xl p-6 space-y-4 animate-in slide-in-from-top-4 duration-300">
            <div className="flex items-center gap-2 pb-3 border-b border-orange-500/30">
              <Lock className="h-4.5 w-4.5 text-orange-500" />
              <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Reset Driver Password</h4>
            </div>
            <p className="text-[10px] text-gray-400">
              Update password for: <strong>{resetDriver.name}</strong> ({resetDriver.email})
            </p>

            {successMsg && resetDriver && (
              <div className="bg-green-50 border border-green-200 text-green-600 text-xs font-bold p-3 rounded-xl">
                ✅ {successMsg}
              </div>
            )}

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
                  onClick={() => setResetDriver(null)}
                  className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl transition-all cursor-pointer font-bold text-xs"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Send Notification Form */}
        <div className="bg-white border border-orange-500/30 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-orange-500/30">
            <Send className="h-4.5 w-4.5 text-orange-500" />
            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Send Alert to Drivers</h4>
          </div>
          <p className="text-[10px] text-gray-400 leading-relaxed">
            Send an instant notification alert to a specific driver or broadcast a message to all delivery agents.
          </p>

          {notifSuccess && (
            <div className="bg-green-50 border border-green-200 text-green-600 text-xs font-bold p-3 rounded-xl">
              ✅ {notifSuccess}
            </div>
          )}

          {notifError && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-xs font-bold p-3 rounded-xl">
              ⚠️ {notifError}
            </div>
          )}

          <form onSubmit={handleSendNotification} className="space-y-4">
            <div>
              <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1.5">Select Recipient</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setOpenRecipientSelect(!openRecipientSelect)}
                  className="w-full flex items-center justify-between text-xs p-2.5 border border-orange-500/30 focus:border-orange-500 outline-none rounded-xl bg-white hover:border-orange-500/55 transition-colors text-left font-semibold text-gray-800 cursor-pointer"
                >
                  <span>
                    {targetDriverId === "all"
                      ? "📢 Broadcast to All Drivers"
                      : `👤 ${drivers.find(d => String(d.id) === targetDriverId)?.name || targetDriverId}`}
                  </span>
                  <ChevronDown size={14} className={`text-gray-400 shrink-0 transition-transform ${openRecipientSelect ? "rotate-180 text-orange-500" : ""}`} />
                </button>

                {openRecipientSelect && (
                  <>
                    <div
                      className="fixed inset-0 z-40 bg-transparent cursor-default"
                      onClick={() => setOpenRecipientSelect(false)}
                    />
                    <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-100 rounded-xl shadow-xl z-50 py-1 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 max-h-48 overflow-y-auto">
                      <button
                        type="button"
                        onClick={() => {
                          setTargetDriverId("all");
                          setOpenRecipientSelect(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs font-semibold transition-colors ${
                          targetDriverId === "all" ? "text-orange-500 bg-orange-50/50 font-bold" : "text-gray-700 hover:bg-orange-50 hover:text-orange-500"
                        }`}
                      >
                        📢 Broadcast to All Drivers
                      </button>
                      {drivers.map((driver) => (
                        <button
                          key={driver.id}
                          type="button"
                          onClick={() => {
                            setTargetDriverId(String(driver.id));
                            setOpenRecipientSelect(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-xs font-semibold transition-colors ${
                            targetDriverId === String(driver.id) ? "text-orange-500 bg-orange-50/50 font-bold" : "text-gray-700 hover:bg-orange-50 hover:text-orange-500"
                          }`}
                        >
                          👤 {driver.name}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div>
              <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1.5">Alert Title</label>
              <input
                type="text"
                placeholder="e.g. Urgent Order Update"
                value={notifTitle}
                onChange={(e) => setNotifTitle(e.target.value)}
                className="w-full bg-white border border-orange-500/30 rounded-xl px-3 py-2.5 text-xs text-gray-800 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1.5">Message Content</label>
              <textarea
                placeholder="Type your message to the driver(s) here..."
                value={notifMessage}
                onChange={(e) => setNotifMessage(e.target.value)}
                className="w-full bg-white border border-orange-500/30 rounded-xl px-3 py-2.5 text-xs text-gray-800 focus:outline-none"
                rows={3}
                required
              />
            </div>

            <button
              type="submit"
              disabled={sendingNotif}
              className="w-full flex items-center justify-center gap-2 py-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white rounded-xl transition-all cursor-pointer font-bold text-xs shadow-md"
            >
              {sendingNotif ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Sending Message...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Send Instant Alert
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Driver List Panel */}
      <div className="lg:col-span-7 space-y-6">
        <div className="bg-white border border-orange-500/30 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-orange-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4.5 w-4.5 text-orange-500" />
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Active Drivers ({drivers.length})</h4>
            </div>
            <button
              onClick={fetchDrivers}
              disabled={loading}
              className="p-1 hover:bg-gray-200 rounded-lg active:scale-95 transition-all"
            >
              <RefreshCw className={`h-4 w-4 text-gray-500 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[750px]">
              <thead>
                <tr className="border-b border-orange-500/30 text-[10px] text-gray-400 font-bold uppercase tracking-wider bg-gray-50 whitespace-nowrap">
                  <th className="p-4 pl-6">Driver</th>
                  <th className="p-4 text-center">Password</th>
                  <th className="p-4 text-center">Active Workload</th>
                  <th className="p-4 text-right pr-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading && drivers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-10 text-center text-xs text-gray-400 font-semibold">
                      <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2 text-orange-500" />
                      Loading drivers...
                    </td>
                  </tr>
                ) : drivers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-10 text-center text-xs text-gray-400 font-semibold">
                      No drivers registered yet.
                    </td>
                  </tr>
                ) : (
                  drivers.map((driver) => {
                    const initials = driver.name ? driver.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() : "D";
                    return (
                      <tr key={driver.id} className="bg-white hover:bg-[#fff9f3] transition-colors group whitespace-nowrap">
                        <td className="p-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-orange-400 to-amber-500 flex items-center justify-center font-black text-xs text-white shrink-0 shadow-xs">
                            {initials}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-gray-800 block truncate max-w-[200px] hover:text-orange-500 transition-colors">{driver.name}</span>
                            <span className="text-[10px] text-gray-450 font-medium block truncate max-w-[200px]">{driver.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <span className="text-xs font-semibold text-gray-400 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-200 select-none">
                          •••••• (Encrypted)
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        {driver.activeOrderCount > 0 ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-50 border border-orange-200 text-orange-700 rounded-lg text-[10px] font-bold">
                            <span className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse" />
                            {driver.activeOrderCount} active order{driver.activeOrderCount !== 1 ? 's' : ''}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-50 border border-gray-200 text-gray-400 rounded-lg text-[10px] font-bold">
                            <span className="h-1.5 w-1.5 rounded-full bg-gray-300" />
                            Idle / No active orders
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right pr-6" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setResetDriver(driver);
                              setNewPassword("");
                              setError("");
                              setSuccessMsg("");
                            }}
                            title="Change Password"
                            className="p-1.5 rounded-lg border border-orange-500/20 text-gray-500 hover:text-orange-500 hover:bg-orange-500/5 transition-colors cursor-pointer flex items-center justify-center gap-1 text-[10px] font-bold"
                          >
                            <Lock className="h-3.5 w-3.5" />
                            Change
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
    </div>
  );
}

