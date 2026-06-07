import React from 'react';
import {
  LayoutDashboard, Package, Sliders, Users, Search, Bell, Plus, Trash2, RefreshCw, TrendingUp, DollarSign, ShoppingCart, Percent, ChevronRight, Edit, ArrowUpRight, Mail, Send, Eye, AlertTriangle, X, Sparkles, ToggleLeft, ToggleRight, Image as ImageIcon, CheckCircle, EyeOff
} from 'lucide-react';
interface OverviewTabProps {
  announcementBarEnabled: boolean;
  setAnnouncementBarEnabled: (val: boolean) => void;
  fridaySaleEnabled: boolean;
  setFridaySaleEnabled: (val: boolean) => void;
  midnightSaleEnabled: boolean;
  setMidnightSaleEnabled: (val: boolean) => void;
  highlightedSchemaSection: string | null;
  setHighlightedSchemaSection: (val: string | null) => void;
  setActiveTab: (val: any) => void;
  slidesList: any[];
  categoriesList: any[];
  offersList: any[];
}

export default function OverviewTab(props: OverviewTabProps) {
  const { announcementBarEnabled, setAnnouncementBarEnabled, fridaySaleEnabled, setFridaySaleEnabled, midnightSaleEnabled, setMidnightSaleEnabled, highlightedSchemaSection, setHighlightedSchemaSection, setActiveTab, slidesList, categoriesList, offersList } = props;
  return (
    <div className="space-y-8 animate-in fade-in-50 duration-300">

              {/* Campaign Switches (Friday / Midnight Sales) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Announcement Bar Toggle */}
                <div className="bg-white border border-orange-500/30 p-6 rounded-2xl flex flex-col justify-between hover:border-gray-700 transition-colors">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full uppercase tracking-wider">Top Banner</span>
                      {announcementBarEnabled ? (
                        <CheckCircle className="h-4.5 w-4.5 text-green-400" />
                      ) : (
                        <EyeOff className="h-4.5 w-4.5 text-gray-400" />
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-gray-900 mt-3">Storefront Top Bar</h4>
                    <p className="text-[10px] text-gray-400 mt-1.5 leading-relaxed">
                      Enables the sliding marquee announcement ticker ("Active Shoppers count") at the very top of the website.
                    </p>
                  </div>
                  <button
                    onClick={() => setAnnouncementBarEnabled(!announcementBarEnabled)}
                    className="flex items-center gap-2 mt-6 py-2.5 px-4 rounded-xl text-xs font-bold w-full justify-center border transition-all duration-300 cursor-pointer bg-white border-orange-500/30 hover:bg-orange-500-white"
                  >
                    {announcementBarEnabled ? (
                      <>
                        <ToggleRight className="h-5 w-5 text-orange-500" />
                        Enabled (Showing)
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="h-5 w-5 text-gray-400" />
                        Disabled (Hidden)
                      </>
                    )}
                  </button>
                </div>

                {/* Friday Super Sale Toggle */}
                <div className="bg-white border border-orange-500/30 p-6 rounded-2xl flex flex-col justify-between hover:border-gray-700 transition-colors">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full uppercase tracking-wider">Weekly Offer</span>
                      {fridaySaleEnabled ? (
                        <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                      ) : (
                        <span className="h-2 w-2 rounded-full bg-gray-600" />
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-gray-900 mt-3">Friday Super Sale</h4>
                    <p className="text-[10px] text-gray-400 mt-1.5 leading-relaxed">
                      Applies a dynamic "-26%" discount badge and special badge styling to products and hero promotion banners on the homepage.
                    </p>
                  </div>
                  <button
                    onClick={() => setFridaySaleEnabled(!fridaySaleEnabled)}
                    className="flex items-center gap-2 mt-6 py-2.5 px-4 rounded-xl text-xs font-bold w-full justify-center border transition-all duration-300 cursor-pointer bg-white border-orange-500/30 hover:bg-orange-500-white"
                  >
                    {fridaySaleEnabled ? (
                      <>
                        <ToggleRight className="h-5 w-5 text-green-500" />
                        Active (26% Off Applied)
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="h-5 w-5 text-gray-400" />
                        Inactive
                      </>
                    )}
                  </button>
                </div>

                {/* Midnight Flash Sale Toggle */}
                <div className="bg-white border border-orange-500/30 p-6 rounded-2xl flex flex-col justify-between hover:border-gray-700 transition-colors">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full uppercase tracking-wider">Midnight Flash</span>
                      {midnightSaleEnabled ? (
                        <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                      ) : (
                        <span className="h-2 w-2 rounded-full bg-gray-600" />
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-gray-900 mt-3">Midnight Flash Sale</h4>
                    <p className="text-[10px] text-gray-400 mt-1.5 leading-relaxed">
                      Forces the storefront into Midnight theme mode, updating prices to 75% off and highlighting the "Deal of the Day" countdown timer.
                    </p>
                  </div>
                  <button
                    onClick={() => setMidnightSaleEnabled(!midnightSaleEnabled)}
                    className="flex items-center gap-2 mt-6 py-2.5 px-4 rounded-xl text-xs font-bold w-full justify-center border transition-all duration-300 cursor-pointer bg-white border-orange-500/30 hover:bg-orange-500-white"
                  >
                    {midnightSaleEnabled ? (
                      <>
                        <ToggleRight className="h-5 w-5 text-red-500" />
                        Active (75% Off Applied)
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="h-5 w-5 text-gray-400" />
                        Inactive
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Layout Visual Mapper: Showing how admin matches the Homepage UI */}
              <div className="bg-white border border-orange-500/30 rounded-2xl p-6">
                <div className="pb-4 mb-6 border-b border-orange-500/20">
                  <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Visual Storefront Mapping Schema</h4>
                  <p className="text-[10px] text-gray-400 mt-1">
                    Hover over any component of the homepage layout below to instantly see which admin module manages its cover content and settings.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

                  {/* Left Column: Homepage schema */}
                  <div className="lg:col-span-7 space-y-3 bg-white p-6 rounded-2xl border border-orange-500/20">
                    <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest block text-center mb-3">GriVA Storefront Homepage Layout</span>

                    {/* Schema Element: Announcement Bar */}
                    <div
                      onMouseEnter={() => setHighlightedSchemaSection("announcement")}
                      onMouseLeave={() => setHighlightedSchemaSection(null)}
                      onClick={() => setActiveTab("overview")}
                      className={`py-1.5 px-3 rounded text-[9px] font-bold text-center border cursor-pointer transition-all duration-300 ${announcementBarEnabled ? "bg-orange-500/10 border-orange-500/40 text-orange-400" : "bg-white border-orange-500/20 text-gray-600"
                        } ${highlightedSchemaSection === "announcement" ? "scale-[1.02] ring-2 ring-orange-500" : ""}`}
                    >
                      Top Announcement Bar {announcementBarEnabled ? "(ACTIVE)" : "(DISABLED)"}
                    </div>

                    {/* Schema Element: Main Header */}
                    <div className="py-2.5 px-3 rounded text-[9px] font-bold text-center border bg-white border-orange-500/20 text-gray-900">
                      Website Navigation Header (Search, Wishlist, Cart)
                    </div>

                    {/* Schema Element: Hero Carousel */}
                    <div
                      onMouseEnter={() => setHighlightedSchemaSection("hero")}
                      onMouseLeave={() => setHighlightedSchemaSection(null)}
                      onClick={() => setActiveTab("banners")}
                      className={`py-8 px-3 rounded text-[10px] font-black text-center border cursor-pointer transition-all duration-300 ${highlightedSchemaSection === "hero" ? "bg-orange-500/20 border-orange-500 text-orange-400 scale-[1.01]" : "bg-white border-orange-500/30 text-gray-900"
                        }`}
                    >
                      Hero Promo Carousel Slides (Manage {slidesList.length} Slides)
                    </div>

                    {/* Schema Element: Categories */}
                    <div
                      onMouseEnter={() => setHighlightedSchemaSection("categories")}
                      onMouseLeave={() => setHighlightedSchemaSection(null)}
                      onClick={() => setActiveTab("banners")}
                      className={`py-3.5 px-3 rounded text-[9px] font-bold text-center border cursor-pointer transition-all duration-300 ${highlightedSchemaSection === "categories" ? "bg-orange-500/20 border-orange-500 text-orange-400 scale-[1.01]" : "bg-white border-orange-500/30 text-gray-900"
                        }`}
                    >
                      Category Quick Nav Banners (Manage {categoriesList.length} Categories)
                    </div>

                    {/* Schema Element: Offer Cards */}
                    <div
                      onMouseEnter={() => setHighlightedSchemaSection("offers")}
                      onMouseLeave={() => setHighlightedSchemaSection(null)}
                      onClick={() => setActiveTab("banners")}
                      className={`grid grid-cols-4 gap-2 text-center text-[8px] font-bold cursor-pointer transition-all duration-300 ${highlightedSchemaSection === "offers" ? "scale-[1.01]" : ""
                        }`}
                    >
                      {offersList.map((o) => (
                        <div
                          key={o.id}
                          className={`p-2.5 border rounded ${o.badge === "DISABLED" ? "bg-white border-orange-500/20 text-gray-600" : "bg-orange-500/10 border-orange-500/30 text-orange-400"
                            } ${highlightedSchemaSection === "offers" ? "border-orange-500" : ""}`}
                        >
                          {o.title}
                        </div>
                      ))}
                    </div>

                    {/* Schema Element: Product Grid */}
                    <div
                      onMouseEnter={() => setHighlightedSchemaSection("products")}
                      onMouseLeave={() => setHighlightedSchemaSection(null)}
                      onClick={() => setActiveTab("products")}
                      className={`py-6 px-3 rounded text-[10px] font-bold text-center border cursor-pointer transition-all duration-300 ${highlightedSchemaSection === "products" ? "bg-orange-500/20 border-orange-500 text-orange-400 scale-[1.01]" : "bg-white border-orange-500/30 text-gray-900"
                        }`}
                    >
                      Catalog Product Grids (Filterable Category Shop views)
                    </div>
                  </div>

                  {/* Right Column: Explanatory Context Details */}
                  <div className="lg:col-span-5 space-y-4">
                    <div className="p-4 bg-gray-50 border border-orange-500/20 rounded-xl">
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Selected Component Controller</span>

                      {highlightedSchemaSection === null && (
                        <p className="text-xs text-gray-400 mt-2">Hover over the storefront layout schema components to inspect mapping.</p>
                      )}

                      {highlightedSchemaSection === "announcement" && (
                        <div className="mt-2 space-y-2">
                          <h5 className="text-xs font-bold text-gray-900">Announcement Marquee</h5>
                          <p className="text-[10px] text-gray-400 leading-relaxed">
                            Controlled under **Overview & Campaigns** page via the "Storefront Top Bar" switch. Displays custom notifications like "Worldwide Free shipping over $50" to shoppers in Qatar.
                          </p>
                        </div>
                      )}

                      {highlightedSchemaSection === "hero" && (
                        <div className="mt-2 space-y-2">
                          <h5 className="text-xs font-bold text-gray-900">Hero Slideshow Carousel</h5>
                          <p className="text-[10px] text-gray-400 leading-relaxed">
                            Controlled under **Banners & Layouts** page. Edit text titles, add cover image URLs, configure promotional pricing labels, and change background slide colors dynamically.
                          </p>
                        </div>
                      )}

                      {highlightedSchemaSection === "categories" && (
                        <div className="mt-2 space-y-2">
                          <h5 className="text-xs font-bold text-gray-900">Category Grid Elements</h5>
                          <p className="text-[10px] text-gray-400 leading-relaxed">
                            Controlled under **Banners & Layouts** page. Modify category cover images (e.g. Speakers, Television) to match promotional inventory styles.
                          </p>
                        </div>
                      )}

                      {highlightedSchemaSection === "offers" && (
                        <div className="mt-2 space-y-2">
                          <h5 className="text-xs font-bold text-gray-900">Promotion Offer Tiles</h5>
                          <p className="text-[10px] text-gray-400 leading-relaxed">
                            Controlled under **Banners & Layouts** page. Each tile can be toggled Active/Disabled. Turning a tile off automatically hides it from the homepage grid wrapper.
                          </p>
                        </div>
                      )}

                      {highlightedSchemaSection === "products" && (
                        <div className="mt-2 space-y-2">
                          <h5 className="text-xs font-bold text-gray-900">Catalog Product Inventory</h5>
                          <p className="text-[10px] text-gray-400 leading-relaxed">
                            Controlled under **Manage Products** page. Edit stock parameters, modify prices, configure specifications details list, and upload WebP images to Cloudflare R2 storage.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
  );
}
