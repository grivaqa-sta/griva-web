import React from 'react';
import {
  LayoutDashboard, Package, Sliders, Users, Search, Bell, Plus, Trash2, RefreshCw, TrendingUp, DollarSign, ShoppingCart, Percent, ChevronRight, Edit, ArrowUpRight, Mail, Send, Eye, AlertTriangle, X, Sparkles, ToggleLeft, ToggleRight, Image as ImageIcon, CheckCircle, EyeOff
} from 'lucide-react';
interface SubscribersTabProps {
  subscribersList: any[];
  newSubEmail: string;
  setNewSubEmail: (val: string) => void;
  broadcastMessage: string;
  setBroadcastMessage: (val: string) => void;
  broadcastStatus: string;
  handleSendBroadcast: (e: any) => void;
  handleAddSubscriber: (e: any) => void;
}

export default function SubscribersTab(props: SubscribersTabProps) {
  const { subscribersList, newSubEmail, setNewSubEmail, broadcastMessage, setBroadcastMessage, broadcastStatus, handleSendBroadcast, handleAddSubscriber } = props;
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in-50 duration-300">
              <div className="lg:col-span-7 space-y-6">
                <form
                  onSubmit={handleAddSubscriber}
                  className="flex gap-3 bg-white p-4 rounded-xl border border-orange-500/30"
                >
                  <input
                    type="email"
                    placeholder="Add manual subscriber email..."
                    value={newSubEmail}
                    onChange={(e) => setNewSubEmail(e.target.value)}
                    required
                    className="flex-1 bg-white border border-orange-500/30 rounded-xl px-4 py-2 text-xs text-gray-800 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-4 py-2 bg-orange-500-white rounded-xl transition-colors cursor-pointer"
                  >
                    <Plus className="h-4.5 w-4.5" /> Add
                  </button>
                </form>

                <div className="bg-white border border-orange-500/30 rounded-2xl overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-orange-500/30 text-[10px] text-gray-400 font-bold uppercase tracking-wider bg-gray-50">
                        <th className="p-4">Subscriber Email</th>
                        <th className="p-4">Joined Date</th>
                        <th className="p-4">Country</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {subscribersList.map((sub, idx) => (
                        <tr key={idx} className="hover:bg-gray-50 transition-colors">
                          <td className="p-4 text-xs font-bold text-gray-800">{sub.email}</td>
                          <td className="p-4 text-xs text-gray-400">{sub.joinedDate}</td>
                          <td className="p-4 text-xs text-gray-400">{sub.country}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="lg:col-span-5">
                <div className="bg-white border border-orange-500/30 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center gap-2 pb-3 border-b border-orange-500/30">
                    <Mail className="h-4.5 w-4.5 text-orange-500" />
                    <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Campaign Broadcast Composer</h4>
                  </div>
                  <p className="text-[10px] text-gray-400 leading-relaxed">
                    Write and dispatch newsletter announcements to all ({subscribersList.length}) subscribers simultaneously.
                  </p>
                  <form onSubmit={handleSendBroadcast} className="space-y-4">
                    <div>
                      <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1.5">Broadcast Subject</label>
                      <input
                        type="text"
                        placeholder="e.g. Exclusive Weekend Sale - Up to 50% Off!"
                        className="w-full bg-white border border-orange-500/30 rounded-xl px-4 py-2.5 text-xs text-gray-800 focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1.5">Email Message Body</label>
                      <textarea
                        rows={6}
                        placeholder="Write your email markup details here..."
                        value={broadcastMessage}
                        onChange={(e) => setBroadcastMessage(e.target.value)}
                        className="w-full bg-white border border-orange-500/30 rounded-xl px-4 py-2.5 text-xs text-gray-800 focus:outline-none resize-none"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={broadcastStatus !== "idle"}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-orange-500-white rounded-xl transition-all cursor-pointer shadow-lg"
                    >
                      {broadcastStatus === "idle" && (
                        <>
                          <Send className="h-4 w-4" />
                          Send Broadcast to {subscribersList.length} Emails
                        </>
                      )}
                      {broadcastStatus === "sending" && (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          Sending Emails...
                        </>
                      )}
                      {broadcastStatus === "sent" && (
                        <>
                          <Sparkles className="h-4 w-4 text-green-400" />
                          Broadcast Dispatched Successfully!
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </div>
  );
}
