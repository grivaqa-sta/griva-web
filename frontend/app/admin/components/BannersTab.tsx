import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Plus, Trash2, Edit, ToggleLeft, ToggleRight, Image as ImageIcon, Upload, Check, Loader, Loader2, RefreshCw
} from 'lucide-react';
import ProductBannersSection from './ProductBannersSection';
import { productService } from '@/app/services/product.service';
import { uploadService } from '@/app/services/upload.service';
import { ApiProduct } from '@/app/types/types';


const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

const CATEGORY_SLUGS = [
  { slug: 'toys', label: 'Toys & Games', defaultBanner: '/banners/banner_toys.png' },
  { slug: 'perfumes-buhoor', label: 'Perfumes & Buhoor', defaultBanner: '/banners/banner_perfumes-buhoor.png' },
  { slug: 'gadgets-electronics', label: 'Gadgets & Electronics', defaultBanner: '/banners/banner_gadgets-electronics.png' },
  { slug: 'gaming-accessories', label: 'Gaming Accessories', defaultBanner: '/banners/banner_gaming-accessories.png' },
  { slug: 'baby-products', label: 'Baby Products', defaultBanner: '/banners/banner_baby-products.png' },
  { slug: 'kitchen-appliances-essentials', label: 'Kitchen Appliances', defaultBanner: '/banners/banner_kitchen-appliances-essentials.png' },
];

interface BannersTabProps {
  slidesList: any[];
  categoriesList: any[];
  offersList: any[];
  handleToggleSlide: (index: number) => void;
  handleToggleOffer: (id: number) => void;
  mobileBannersList: any[];
  setMobileBannersList: (val: any[]) => void;
}

// ─── Mobile Banners Section ─────────────────────────────────────────────────
function MobileBannersSection() {
  const [bannerProducts, setBannerProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  const [successId, setSuccessId] = useState<number | null>(null);
  const fileInputRefs = useRef<Record<number, HTMLInputElement | null>>({});

  const loadBannerProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await productService.getBannerProducts();
      const data = res?.data || res;
      if (Array.isArray(data)) setBannerProducts(data);
    } catch (err) {
      console.error('Failed to load banner products', err);
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadBannerProducts(); }, [loadBannerProducts]);

  const handleMobileImageUpload = async (product: ApiProduct, file: File) => {
    setUploadingId(product.id);
    try {
      const uploadData = await uploadService.uploadImage(file);
      const newUrl: string = uploadData.imageUrl;

      // Call updateBannerStatus with the new mobile_ad_banner URL
      await productService.updateBannerStatus(
        product.id,
        true,
        product.href || `/product/${product.id}`,
        newUrl,
        product.banner_background_color,
        product.tags || []
      );

      // Update local state
      setBannerProducts(prev =>
        prev.map(p => p.id === product.id ? { ...p, mobile_ad_banner: newUrl } : p)
      );
      setSuccessId(product.id);
      setTimeout(() => setSuccessId(null), 2500);
    } catch (err) {
      console.error('Mobile banner upload failed', err);
    }
    setUploadingId(null);
  };

  const handleRemoveMobileImage = async (product: ApiProduct) => {
    setUploadingId(product.id);
    try {
      await productService.updateBannerStatus(
        product.id,
        true,
        product.href || `/product/${product.id}`,
        '',
        product.banner_background_color,
        product.tags || []
      );
      setBannerProducts(prev =>
        prev.map(p => p.id === product.id ? { ...p, mobile_ad_banner: '' } : p)
      );
    } catch (err) {
      console.error('Failed to remove mobile banner image', err);
    }
    setUploadingId(null);
  };

  return (
    <div className="space-y-4">
      <div className="pb-3 border-b border-orange-500/20 flex justify-between items-center">
        <div>
          <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">B. Mobile View Homepage Banners</h4>
          <p className="text-[10px] text-gray-400 mt-1">Upload mobile-specific promo images for each active hero banner product.</p>
        </div>
        <button
          onClick={loadBannerProducts}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-orange-500/30 hover:bg-orange-500/10 text-xs font-bold text-orange-500 rounded-lg transition-colors cursor-pointer"
          title="Refresh"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center p-10">
          <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
        </div>
      ) : bannerProducts.length === 0 ? (
        <div className="text-center py-10 text-gray-400 text-sm">
          No active hero banner products found. Add products in Section A first.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bannerProducts.map((product) => {
            const mobileSrc = product.mobile_ad_banner;
            const isUploading = uploadingId === product.id;
            const isSuccess = successId === product.id;

            return (
              <div key={product.id} className="bg-white border border-orange-500/30 p-4 rounded-xl flex gap-4 items-center">
                {/* Mobile Banner Preview / Upload */}
                <label
                  className="h-20 w-32 shrink-0 bg-gray-50 border border-gray-200 rounded-lg overflow-hidden relative cursor-pointer hover:opacity-80 transition-opacity group"
                  title="Click to upload mobile banner image"
                >
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={el => { fileInputRefs.current[product.id] = el; }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleMobileImageUpload(product, file);
                    }}
                  />
                  {isUploading ? (
                    <div className="w-full h-full flex items-center justify-center bg-orange-50">
                      <Loader className="h-5 w-5 animate-spin text-orange-500" />
                    </div>
                  ) : isSuccess ? (
                    <div className="w-full h-full flex items-center justify-center bg-green-50">
                      <Check className="h-6 w-6 text-green-500" />
                    </div>
                  ) : mobileSrc ? (
                    <>
                      <img
                        src={mobileSrc.startsWith('http') || mobileSrc.startsWith('/') ? mobileSrc : `http://localhost:8080${mobileSrc}`}
                        className="w-full h-full object-cover"
                        alt={product.title}
                      />
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

                {/* Product Info & Actions */}
                <div className="flex-1 flex justify-between items-center gap-4 min-w-0">
                  <div className="flex-1 space-y-1.5 overflow-hidden">
                    <p className="text-xs font-bold text-gray-800 truncate">{product.title}</p>
                    <div
                      className="text-[10px] text-gray-500 bg-gray-50 px-2 py-1.5 rounded border border-gray-100 truncate"
                      title={mobileSrc || 'No mobile image set'}
                    >
                      {mobileSrc ? mobileSrc.split('/').pop() : 'No mobile image uploaded'}
                    </div>
                    <div className="text-[10px] text-gray-500 bg-gray-50 px-2 py-1.5 rounded border border-gray-100 truncate">
                      {product.href || `/product/${product.id}`}
                    </div>
                  </div>

                  {/* Remove mobile image button */}
                  {mobileSrc && (
                    <button
                      onClick={() => handleRemoveMobileImage(product)}
                      disabled={isUploading}
                      className="p-2.5 border border-red-200 text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                      title="Remove mobile banner image"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function BannersTab(props: BannersTabProps) {
  const { slidesList, categoriesList, offersList, handleToggleSlide, handleToggleOffer, mobileBannersList, setMobileBannersList } = props;

  // State for per-category banner management
  const [categoryBanners, setCategoryBanners] = useState<Record<string, string>>(
    Object.fromEntries(CATEGORY_SLUGS.map(c => [c.slug, c.defaultBanner]))
  );
  const [uploadingSlug, setUploadingSlug] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const handleCategoryBannerUpload = async (slug: string, file: File) => {
    setUploadingSlug(slug);
    try {
      const data = await uploadService.uploadImage(file);
      setCategoryBanners(prev => ({ ...prev, [slug]: data.imageUrl }));
      setUploadSuccess(slug);
      setTimeout(() => setUploadSuccess(null), 2500);
    } catch (e) {
      console.error('Banner upload failed', e);
    } finally {
      setUploadingSlug(null);
    }
  };

  const handleCategoryBannerURLSave = (slug: string, url: string) => {
    setCategoryBanners(prev => ({ ...prev, [slug]: url }));
    setUploadSuccess(slug);
    setTimeout(() => setUploadSuccess(null), 2500);
  };

  return (
    <div className="space-y-10 animate-in fade-in-50 duration-300">

              {/* Section A: Product Banners */}
              <ProductBannersSection />

              {/* Section B: Mobile View Homepage Banners */}
              <MobileBannersSection />

              {/* Section C: Category Navigation Cover Contents */}
              <div className="space-y-4">
                <div className="pb-3 border-b border-orange-500/20">
                  <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">C. Category Navigation Cover Contents</h4>
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

              {/* Section D: Homepage Offer Promotion Cards */}
              <div className="space-y-4">
                <div className="pb-3 border-b border-orange-500/20">
                  <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">D. Homepage Promotion Card Banners</h4>
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

              {/* Section D: Category Hero Banners — NEW PREMIUM FEATURE */}
              <div className="space-y-4">
                <div className="pb-3 border-b border-orange-500/20">
                  <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">E. Category Hero Banner Images</h4>
                  <p className="text-[10px] text-gray-400 mt-1">Upload or change the full-width hero banner image shown at the top of each category page. Supports JPEG, PNG, WebP.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {CATEGORY_SLUGS.map((cat) => {
                    const currentBanner = categoryBanners[cat.slug];
                    const isUploading = uploadingSlug === cat.slug;
                    const isSuccess = uploadSuccess === cat.slug;

                    return (
                      <div key={cat.slug} className="bg-white border border-orange-500/30 rounded-2xl overflow-hidden shadow-sm">
                        {/* Banner preview */}
                        <div className="relative h-32 bg-gray-100 overflow-hidden">
                          {currentBanner ? (
                            <img
                              src={currentBanner.startsWith('/') ? currentBanner : `http://localhost:8080${currentBanner}`}
                              alt={cat.label}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                              <ImageIcon className="h-10 w-10" />
                            </div>
                          )}
                          {/* Dark overlay with category label */}
                          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent flex items-end p-3">
                            <span className="text-xs font-bold text-white">{cat.label}</span>
                          </div>
                          {/* Success flash */}
                          {isSuccess && (
                            <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                              <div className="bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
                                <Check className="h-3.5 w-3.5" /> Updated!
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Upload controls */}
                        <div className="p-4 space-y-3">
                          {/* File upload button */}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            ref={(el) => { fileInputRefs.current[cat.slug] = el; }}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleCategoryBannerUpload(cat.slug, file);
                            }}
                          />
                          <button
                            onClick={() => fileInputRefs.current[cat.slug]?.click()}
                            disabled={isUploading}
                            className="w-full flex items-center justify-center gap-2 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                          >
                            {isUploading ? (
                              <><Loader className="h-3.5 w-3.5 animate-spin" /> Uploading...</>
                            ) : (
                              <><Upload className="h-3.5 w-3.5" /> Upload New Banner Image</>
                            )}
                          </button>

                          {/* Or paste URL */}
                          <div className="flex gap-2">
                            <input
                              type="url"
                              placeholder="Or paste image URL..."
                              className="flex-1 text-[10px] border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-orange-400"
                              onBlur={(e) => {
                                if (e.target.value.startsWith('http')) {
                                  handleCategoryBannerURLSave(cat.slug, e.target.value);
                                }
                              }}
                            />
                            <button
                              className="px-3 bg-gray-50 border border-gray-200 text-[10px] font-bold text-gray-600 hover:bg-orange-50 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                              onClick={() => {
                                const input = fileInputRefs.current[cat.slug]?.previousElementSibling as HTMLInputElement;
                                // handled via onBlur
                              }}
                            >
                              Set URL
                            </button>
                          </div>

                          <p className="text-[9px] text-gray-400 text-center">
                            Recommended: 1400×420px, JPEG/WebP. Max 5MB.
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>


            </div>
  );
}
