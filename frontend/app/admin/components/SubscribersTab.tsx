import React from 'react';
import {
  Plus, RefreshCw, Mail, Send, Sparkles
} from 'lucide-react';

interface SubscribersTabProps {
  subscribersList: any[];
  newSubEmail: string;
  setNewSubEmail: (val: string) => void;
  broadcastSubject: string;
  setBroadcastSubject: (val: string) => void;
  broadcastMessage: string;
  setBroadcastMessage: (val: string) => void;
  broadcastTarget: string;
  setBroadcastTarget: (val: string) => void;
  broadcastTargetEmail: string;
  setBroadcastTargetEmail: (val: string) => void;
  broadcastStatus: string;
  handleSendBroadcast: (e: any) => void;
  handleAddSubscriber: (e: any) => void;
}

const TEMPLATES = [
  {
    name: "Custom Message (Blank)",
    subject: "",
    message: ""
  },
  {
    name: "🎉 20% Off Welcome Discount Offer",
    subject: "Welcome to GRIVA Store! Get 20% Off Your Next Order 🎉",
    message: `Dear subscriber,\n\nThank you for joining the GRIVA newsletter! As a token of our appreciation, here is an exclusive 20% discount code for your next purchase.\n\nDiscount Code: GRIVA20\n\nShop our latest flagship laptops, smart drones, audio gear, and premium perfumes now at https://thegriva.com!\n\nBest regards,\nThe GRIVA Team`
  },
  {
    name: "🔥 New Flagship Arrival Announcement",
    subject: "🔥 Just Landed: The Newest Tech Flagships Are Now in Stock!",
    message: `Hello Tech Enthusiast,\n\nWe are thrilled to announce that the latest high-performance flagship devices have just arrived at our store!\n\nCheck out the brand new arrivals:\n- DJI Mini 4 Pro Drone Combo\n- Sony WH-1000XM5 ANC Headphones\n- Meta Quest 3 VR Headset\n- MacBook Air 15-inch M3 Chip\n\nStock is limited! Order now with Same-Day Delivery in Doha.\n\nShop here: https://thegriva.com/shop\n\nBest regards,\nThe GRIVA Team`
  },
  {
    name: "⚡ Weekend Flash Sale Alert",
    subject: "⚡ 48 Hours Only: GRIVA Weekend Flash Sale is Live!",
    message: `Hi there,\n\nOur Weekend Flash Sale is officially LIVE! For the next 48 hours, enjoy up to 50% off on selected items across our store.\n\nNo discount codes needed – all price cuts are automatically applied at checkout. Free shipping on orders over QAR 99.\n\nDon't miss out:\n👉 Shop the sale: https://thegriva.com/shop\n\nBest regards,\nThe GRIVA Team`
  }
];

export default function SubscribersTab(props: SubscribersTabProps) {
  const {
    subscribersList,
    newSubEmail,
    setNewSubEmail,
    broadcastSubject,
    setBroadcastSubject,
    broadcastMessage,
    setBroadcastMessage,
    broadcastTarget,
    setBroadcastTarget,
    broadcastTargetEmail,
    setBroadcastTargetEmail,
    broadcastStatus,
    handleSendBroadcast,
    handleAddSubscriber
  } = props;

  const getRecipientLabel = () => {
    if (broadcastTarget === "individual") {
      return broadcastTargetEmail.trim() || "Individual";
    }
    if (broadcastTarget === "new_7_days") {
      return "New Users (7 Days)";
    }
    if (broadcastTarget === "recent_24_hours") {
      return "Recent Users (24 Hours)";
    }
    return `All (${subscribersList.length}) Subscribers`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in-50 duration-300">
      <div className="lg:col-span-7 space-y-6">
        <form
          onSubmit={handleAddSubscriber}
          className="flex gap-3 bg-white p-4 rounded-xl border border-orange-500/30 shadow-sm"
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
            className="flex items-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl transition-colors cursor-pointer text-xs font-bold shadow-sm"
          >
            <Plus className="h-4.5 w-4.5" /> Add
          </button>
        </form>

        <div className="bg-white border border-orange-500/30 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-orange-500/30 text-[10px] text-gray-400 font-bold uppercase tracking-wider bg-gray-50">
                <th className="p-4">Subscriber Email</th>
                <th className="p-4">Joined Date</th>
                <th className="p-4">Country</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {subscribersList.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-xs text-gray-400">
                    No subscribers found.
                  </td>
                </tr>
              ) : (
                subscribersList.map((sub, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-xs font-bold text-gray-800">{sub.email}</td>
                    <td className="p-4 text-xs text-gray-400">{sub.joinedDate}</td>
                    <td className="p-4 text-xs text-gray-400">{sub.country}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="lg:col-span-5">
        <div className="bg-white border border-orange-500/30 rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 pb-3 border-b border-orange-500/30">
            <Mail className="h-4.5 w-4.5 text-orange-500" />
            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Campaign Broadcast Composer</h4>
          </div>
          <p className="text-[10px] text-gray-400 leading-relaxed">
            Write and dispatch newsletter announcements to filtered recipient audiences.
          </p>

          <form onSubmit={handleSendBroadcast} className="space-y-4">
            <div>
              <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1.5">Recipient Target</label>
              <select
                value={broadcastTarget}
                onChange={(e) => setBroadcastTarget(e.target.value)}
                className="w-full bg-white border border-orange-500/30 rounded-xl px-4 py-2.5 text-xs text-gray-800 focus:outline-none cursor-pointer mb-2.5"
              >
                <option value="all">All Subscribers ({subscribersList.length})</option>
                <option value="new_7_days">New Users (Last 7 Days)</option>
                <option value="recent_24_hours">Recent Users (Last 24 Hours)</option>
                <option value="individual">Individual Subscriber</option>
              </select>

              {broadcastTarget === "individual" && (
                <input
                  type="email"
                  placeholder="Enter recipient email address..."
                  value={broadcastTargetEmail}
                  onChange={(e) => setBroadcastTargetEmail(e.target.value)}
                  required
                  className="w-full bg-white border border-orange-500/30 rounded-xl px-4 py-2.5 text-xs text-gray-800 focus:outline-none animate-in slide-in-from-top-1 duration-200"
                />
              )}
            </div>

            <div>
              <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1.5">Load Readymessage Template</label>
              <select
                onChange={(e) => {
                  const idx = Number(e.target.value);
                  const selected = TEMPLATES[idx];
                  if (selected) {
                    setBroadcastSubject(selected.subject);
                    setBroadcastMessage(selected.message);
                  }
                }}
                defaultValue="0"
                className="w-full bg-white border border-orange-500/30 rounded-xl px-4 py-2.5 text-xs text-gray-800 focus:outline-none cursor-pointer"
              >
                {TEMPLATES.map((t, idx) => (
                  <option key={idx} value={idx}>{t.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1.5">Broadcast Subject</label>
              <input
                type="text"
                placeholder="e.g. Exclusive Weekend Sale - Up to 50% Off!"
                value={broadcastSubject}
                onChange={(e) => setBroadcastSubject(e.target.value)}
                className="w-full bg-white border border-orange-500/30 rounded-xl px-4 py-2.5 text-xs text-gray-800 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1.5">Email Message Body</label>
              <textarea
                rows={6}
                placeholder="Write your email details here..."
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                className="w-full bg-white border border-orange-500/30 rounded-xl px-4 py-2.5 text-xs text-gray-800 focus:outline-none resize-none font-sans"
                required
              />
            </div>

            <button
              type="submit"
              disabled={broadcastStatus !== "idle" || (broadcastTarget !== "individual" && subscribersList.length === 0)}
              className="w-full flex items-center justify-center gap-2 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl transition-all cursor-pointer shadow-lg disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-xs"
            >
              {broadcastStatus === "idle" && (
                <>
                  <Send className="h-4 w-4" />
                  Send Broadcast to {getRecipientLabel()}
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
