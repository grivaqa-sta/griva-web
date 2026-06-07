import React, { useState } from "react";
import { useAdminSettings } from "../../context/AdminContext";
import { 
  Mail, 
  Tag, 
  Clock, 
  Image as ImageIcon, 
  Save,
  CheckCircle,
  AlertCircle
} from "lucide-react";

export default function ContentTab() {
  const { 
    cmsNewsletter, 
    setCmsNewsletter,
    cmsProductPromo,
    setCmsProductPromo,
    cmsDealTargetDate,
    setCmsDealTargetDate
  } = useAdminSettings();

  const [savedMessage, setSavedMessage] = useState("");

  const handleSave = () => {
    setSavedMessage("Content settings saved successfully!");
    setTimeout(() => setSavedMessage(""), 3000);
  };

  return (
    <div className="space-y-6 max-w-5xl text-gray-800 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-orange-500" />
            Homepage Content Manager
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Update text, images, and links across the storefront. Changes reflect instantly.
          </p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 bg-gradient-to-r  font-bold shadow-lg shadow-orange-500/20 transition-all duration-300"
        >
          <Save className="h-4 w-4" />
          Save Changes
        </button>
      </div>

      {savedMessage && (
        <div className="bg-green-500/10 border border-green-500/30 text-green-400 p-3 rounded-xl flex items-center gap-2 text-sm font-semibold">
          <CheckCircle className="h-4 w-4" />
          {savedMessage}
        </div>
      )}

      {/* Deal Of The Day Settings */}
      <div className="bg-white border border-orange-500/30 rounded-2xl p-6 shadow-xl shadow-black">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4 border-b border-orange-500/30 pb-3">
          <Clock className="h-4 w-4 text-orange-500" />
          Deal of the Day Timer
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Target End Date & Time</label>
            <input
              type="datetime-local"
              value={new Date(new Date(cmsDealTargetDate).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)}
              onChange={(e) => setCmsDealTargetDate(new Date(e.target.value).toISOString())}
              className="w-full bg-white border border-orange-500/30 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-orange-500"
            />
            <p className="text-[10px] text-gray-400 mt-2 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" /> Note: Once the timer hits 0, it resets automatically.
            </p>
          </div>
        </div>
      </div>

      {/* Product Promo Banner Settings */}
      <div className="bg-white border border-orange-500/30 rounded-2xl p-6 shadow-xl shadow-black">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4 border-b border-orange-500/30 pb-3">
          <Tag className="h-4 w-4 text-orange-500" />
          Product Promo Banner
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Tagline</label>
              <input
                type="text"
                value={cmsProductPromo.tagline}
                onChange={(e) => setCmsProductPromo({ ...cmsProductPromo, tagline: e.target.value })}
                className="w-full bg-white border border-orange-500/30 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Heading (use \n for line break)</label>
              <textarea
                value={cmsProductPromo.heading}
                onChange={(e) => setCmsProductPromo({ ...cmsProductPromo, heading: e.target.value })}
                rows={2}
                className="w-full bg-white border border-orange-500/30 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-orange-500 resize-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Description</label>
              <textarea
                value={cmsProductPromo.description}
                onChange={(e) => setCmsProductPromo({ ...cmsProductPromo, description: e.target.value })}
                rows={3}
                className="w-full bg-white border border-orange-500/30 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-orange-500 resize-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Product Image URL</label>
            <input
              type="text"
              value={cmsProductPromo.image}
              onChange={(e) => setCmsProductPromo({ ...cmsProductPromo, image: e.target.value })}
              className="w-full bg-white border border-orange-500/30 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-orange-500 mb-4"
              placeholder="/images/HeadphoneNew@.png"
            />
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-center min-h-[150px]">
              {cmsProductPromo.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={cmsProductPromo.image} alt="Preview" className="max-h-32 object-contain" />
              ) : (
                <span className="text-xs text-gray-400">No image</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Newsletter Settings */}
      <div className="bg-white border border-orange-500/30 rounded-2xl p-6 shadow-xl shadow-black">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4 border-b border-orange-500/30 pb-3">
          <Mail className="h-4 w-4 text-orange-500" />
          Newsletter Section
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Label</label>
            <input
              type="text"
              value={cmsNewsletter.label}
              onChange={(e) => setCmsNewsletter({ ...cmsNewsletter, label: e.target.value })}
              className="w-full bg-white border border-orange-500/30 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-orange-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Heading</label>
            <input
              type="text"
              value={cmsNewsletter.heading}
              onChange={(e) => setCmsNewsletter({ ...cmsNewsletter, heading: e.target.value })}
              className="w-full bg-white border border-orange-500/30 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-orange-500"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Description</label>
            <input
              type="text"
              value={cmsNewsletter.description}
              onChange={(e) => setCmsNewsletter({ ...cmsNewsletter, description: e.target.value })}
              className="w-full bg-white border border-orange-500/30 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-orange-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Button Text</label>
            <input
              type="text"
              value={cmsNewsletter.buttonText}
              onChange={(e) => setCmsNewsletter({ ...cmsNewsletter, buttonText: e.target.value })}
              className="w-full bg-white border border-orange-500/30 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-orange-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Background Color (Hex)</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={cmsNewsletter.bgColor}
                onChange={(e) => setCmsNewsletter({ ...cmsNewsletter, bgColor: e.target.value })}
                className="w-12 h-12 bg-white border border-orange-500/30 rounded-xl cursor-pointer"
              />
              <input
                type="text"
                value={cmsNewsletter.bgColor}
                onChange={(e) => setCmsNewsletter({ ...cmsNewsletter, bgColor: e.target.value })}
                className="flex-1 bg-white border border-orange-500/30 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-orange-500 uppercase"
              />
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
}
