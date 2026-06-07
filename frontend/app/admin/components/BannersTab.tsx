import React from 'react';
import {
  LayoutDashboard, Package, Sliders, Users, Search, Bell, Plus, Trash2, RefreshCw, TrendingUp, DollarSign, ShoppingCart, Percent, ChevronRight, Edit, ArrowUpRight, Mail, Send, Eye, AlertTriangle, X, Sparkles, ToggleLeft, ToggleRight, Image as ImageIcon, CheckCircle, EyeOff
} from 'lucide-react';
interface BannersTabProps {
  slidesList: any[];
  categoriesList: any[];
  offersList: any[];
  handleToggleSlide: (index: number) => void;
  handleToggleOffer: (id: number) => void;
  mobileBannersList: any[];
  setMobileBannersList: (val: any[]) => void;
}

export default function BannersTab(props: BannersTabProps) {
  const { slidesList, categoriesList, offersList, handleToggleSlide, handleToggleOffer, mobileBannersList, setMobileBannersList } = props;
  return (
    <div className="space-y-10 animate-in fade-in-50 duration-300">

              {/* Section A: Hero Slideshow Carousel Banners */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-orange-500/20">
                  <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">A. Homepage Hero Slideshow Carousels</h4>
                  <button
                    onClick={() => alert("Creating a new slideshow slide...")}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500-white rounded-lg transition-colors cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Slide
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {slidesList.map((slideItem, index) => {
                    const isSlideDisabled = slideItem.badge === "DISABLED";
                    return (
                      <div
                        key={index}
                        className={`rounded-2xl border border-orange-500/30 overflow-hidden bg-white flex flex-col justify-between transition-opacity duration-300 ${isSlideDisabled ? "opacity-45" : "opacity-100"
                          }`}
                      >
                        <div
                          className="h-36 p-5 flex flex-col justify-between relative"
                          style={{ backgroundColor: slideItem.bg }}
                        >
                          <span className="text-[9px] font-bold text-gray-900 bg-gray-50 px-2 py-0.5 rounded-full w-fit uppercase tracking-widest">
                            {slideItem.badge}
                          </span>
                          <div className="text-white">
                            <span className="text-[9px] font-bold tracking-widest text-white/70 block uppercase">{slideItem.subtitle}</span>
                            <h5 className="text-md font-extrabold mt-1 whitespace-pre-line leading-snug">{slideItem.title}</h5>
                          </div>
                        </div>

                        <div className="p-4 bg-black/20 flex items-center justify-between border-t border-orange-500/30">
                          <div>
                            <span className="text-[10px] text-gray-400 font-semibold block">Store Price Tag</span>
                            <span className="text-xs font-black text-orange-400 mt-0.5 block">{slideItem.price}</span>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleToggleSlide(index)}
                              className="p-1.5 bg-white border border-orange-500/30 hover:text-gray-900 rounded-lg transition-colors cursor-pointer"
                              title={isSlideDisabled ? "Enable Slide" : "Disable Slide"}
                            >
                              {isSlideDisabled ? (
                                <ToggleLeft className="h-5 w-5 text-gray-400" />
                              ) : (
                                <ToggleRight className="h-5 w-5 text-green-500" />
                              )}
                            </button>
                            <button
                              onClick={() => alert("Opening slide configuration details...")}
                              className="px-2.5 py-1.5 bg-white border border-orange-500/30 hover:bg-orange-500/10 text-[10px] font-bold text-gray-800 rounded-lg transition-colors cursor-pointer"
                            >
                              Modify Content
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Section A2: Mobile Banners */}
              <div className="space-y-4">
                <div className="pb-3 border-b border-orange-500/20 flex justify-between items-center">
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">A2. Mobile View Homepage Banners</h4>
                    <p className="text-[10px] text-gray-400 mt-1">Manage mobile-only promo images (e.g. "Edit without limits").</p>
                  </div>
                  <button
                    onClick={() => {
                      setMobileBannersList([...mobileBannersList, { src: "", href: "/shop", alt: "New Banner" }]);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-orange-500/30 hover:bg-orange-500/10 text-xs font-bold text-orange-500 rounded-lg transition-colors cursor-pointer"
                  >
                    <Plus className="h-4 w-4" /> Add Banner
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mobileBannersList.map((banner, index) => (
                    <div key={index} className="bg-white border border-orange-500/30 p-4 rounded-xl flex gap-4 items-center">
                      <label className="h-20 w-32 shrink-0 bg-gray-50 border border-gray-200 rounded-lg overflow-hidden relative cursor-pointer hover:opacity-80 transition-opacity group">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                const newBanners = [...mobileBannersList];
                                newBanners[index].src = reader.result as string;
                                setMobileBannersList(newBanners);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                        {banner.src ? (
                          <>
                            <img src={typeof banner.src === 'string' ? banner.src : banner.src.src} className="w-full h-full object-cover" alt="Banner" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <span className="text-white text-[9px] font-bold">Change Image</span>
                            </div>
                          </>
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-1 hover:text-orange-500 transition-colors">
                            <ImageIcon className="h-5 w-5" />
                            <span className="text-[8px] font-bold uppercase">Upload</span>
                          </div>
                        )}
                      </label>
                      <div className="flex-1 flex justify-between items-center gap-4">
                        <div className="flex-1 space-y-1 overflow-hidden">
                          <div className="text-[10px] text-gray-500 bg-gray-50 px-2 py-1.5 rounded border border-gray-100 truncate w-full" title={typeof banner.src === 'string' ? banner.src : 'Uploaded Image'}>
                            {banner.src ? (typeof banner.src === 'string' ? banner.src.split('/').pop() : 'Uploaded Image') : 'No image uploaded'}
                          </div>
                          <div className="text-[10px] text-gray-500 bg-gray-50 px-2 py-1.5 rounded border border-gray-100">
                            {banner.href}
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            const newBanners = mobileBannersList.filter((_, i) => i !== index);
                            setMobileBannersList(newBanners);
                          }}
                          className="p-3 border border-red-200 text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                          title="Remove Banner"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section B: Category Banner Images & Links */}
              <div className="space-y-4">
                <div className="pb-3 border-b border-orange-500/20">
                  <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">B. Category Navigation Cover Contents</h4>
                  <p className="text-[10px] text-gray-400 mt-1">Manage title and custom cover image folders for homepage category navigation blocks.</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                  {categoriesList.map((cat, idx) => (
                    <div key={idx} className="bg-white border border-orange-500/30 p-4 rounded-xl flex flex-col justify-between items-center text-center">
                      <div className="h-10 w-10 rounded-lg bg-white p-1 flex items-center justify-center border border-orange-500/20">
                        {cat.image && typeof cat.image === "object" ? (
                          <ImageIcon className="h-5 w-5 text-orange-500" />
                        ) : (
                          <img src={cat.image as string} alt="" className="h-full w-full object-contain" />
                        )}
                      </div>
                      <span className="text-xs font-bold text-gray-800 mt-3 block">{cat.title}</span>
                      <button
                        onClick={() => alert("Updating Category: " + cat.title + " cover images...")}
                        className="mt-3 text-[9px] font-bold text-orange-500 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Edit className="h-3 w-3" /> Change Cover
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section C: Homepage Offer Promotion Cards */}
              <div className="space-y-4">
                <div className="pb-3 border-b border-orange-500/20">
                  <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">C. Homepage Promotion Card Banners</h4>
                  <p className="text-[10px] text-gray-400 mt-1">Toggle active promotional display cards on the website grid.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {offersList.map((offer) => {
                    const isOfferDisabled = offer.badge === "DISABLED";
                    return (
                      <div
                        key={offer.id}
                        className={`p-5 rounded-2xl border border-orange-500/30 bg-white flex flex-col justify-between transition-opacity duration-300 ${isOfferDisabled ? "opacity-45" : "opacity-100"
                          }`}
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-bold text-gray-400 uppercase">{offer.badge}</span>
                            <span className="text-[9px] text-gray-400 font-semibold bg-white px-2 py-0.5 rounded border border-orange-500/20">
                              Grid Item
                            </span>
                          </div>
                          <span className="text-[10px] font-bold text-orange-500 mt-3 block">{offer.subtitle}</span>
                          <h5 className="text-xs font-bold text-gray-800 mt-1">{offer.title}</h5>
                        </div>

                        <div className="flex items-center justify-between mt-6 pt-4 border-t border-orange-500/20">
                          <button
                            onClick={() => handleToggleOffer(offer.id)}
                            className="flex items-center gap-1.5 text-[10px] font-bold text-gray-700 hover:text-gray-900 transition-colors cursor-pointer"
                          >
                            {isOfferDisabled ? (
                              <div>
                                <ToggleLeft className="h-5 w-5 text-gray-400" />
                                Disabled
                              </div>
                            ) : (
                              <div>
                                <ToggleRight className="h-5 w-5 text-orange-500" />
                                Active
                              </div>
                            )}
                          </button>
                          <button
                            onClick={() => alert("Updating offer content...")}
                            className="text-[9px] font-bold text-orange-500 hover:underline"
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
  );
}
