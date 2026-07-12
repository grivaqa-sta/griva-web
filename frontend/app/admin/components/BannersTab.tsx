import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Plus, Trash2, Edit, ToggleLeft, ToggleRight, Image as ImageIcon, Upload, Check, Loader, Loader2, RefreshCw, ChevronDown
} from 'lucide-react';
import ProductBannersSection from './ProductBannersSection';
import DiscoverMoreSection from './DiscoverMoreSection';
import ProductPromoBannersSection from './ProductPromoBannersSection';
import { productService } from '@/app/services/product.service';
import { uploadService } from '@/app/services/upload.service';
import dealOfDayService from '@/app/services/dealOfDay.service';
import { ApiProduct } from '@/app/types/types';
import { useToast } from '@/app/context/ToastContext';


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
  handleToggleSlide: (index: number) => void;
  mobileBannersList: any[];
  setMobileBannersList: (val: any[]) => void;
}

// ─── Mobile & Desktop Banners Section ─────────────────────────────────────────────────
function MobileBannersSection() {
  const [bannerProducts, setBannerProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [uploadingMobileId, setUploadingMobileId] = useState<number | null>(null);
  const [successMobileId, setSuccessMobileId] = useState<number | null>(null);
  
  const [uploadingDesktopId, setUploadingDesktopId] = useState<number | null>(null);
  const [successDesktopId, setSuccessDesktopId] = useState<number | null>(null);

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
    setUploadingMobileId(product.id);
    try {
      const uploadData = await uploadService.uploadImage(file);
      const newUrl: string = uploadData.imageUrl;

      await productService.updateBannerStatus(
        product.id,
        true,
        product.href || `/product/${product.slug}`,
        newUrl,
        product.banner_background_color,
        product.tags || [],
        product.desktop_ad_banner
      );

      setBannerProducts(prev =>
        prev.map(p => p.id === product.id ? { ...p, mobile_ad_banner: newUrl } : p)
      );
      setSuccessMobileId(product.id);
      setTimeout(() => setSuccessMobileId(null), 2500);
    } catch (err) {
      console.error('Mobile banner upload failed', err);
    }
    setUploadingMobileId(null);
  };

  const handleRemoveMobileImage = async (product: ApiProduct) => {
    setUploadingMobileId(product.id);
    try {
      await productService.updateBannerStatus(
        product.id,
        true,
        product.href || `/product/${product.slug}`,
        '',
        product.banner_background_color,
        product.tags || [],
        product.desktop_ad_banner
      );
      setBannerProducts(prev =>
        prev.map(p => p.id === product.id ? { ...p, mobile_ad_banner: '' } : p)
      );
    } catch (err) {
      console.error('Failed to remove mobile banner image', err);
    }
    setUploadingMobileId(null);
  };

  const handleDesktopImageUpload = async (product: ApiProduct, file: File) => {
    setUploadingDesktopId(product.id);
    try {
      const uploadData = await uploadService.uploadImage(file);
      const newUrl: string = uploadData.imageUrl;

      await productService.updateBannerStatus(
        product.id,
        true,
        product.href || `/product/${product.slug}`,
        product.mobile_ad_banner,
        product.banner_background_color,
        product.tags || [],
        newUrl
      );

      setBannerProducts(prev =>
        prev.map(p => p.id === product.id ? { ...p, desktop_ad_banner: newUrl } : p)
      );
      setSuccessDesktopId(product.id);
      setTimeout(() => setSuccessDesktopId(null), 2500);
    } catch (err) {
      console.error('Desktop banner upload failed', err);
    }
    setUploadingDesktopId(null);
  };

  const handleRemoveDesktopImage = async (product: ApiProduct) => {
    setUploadingDesktopId(product.id);
    try {
      await productService.updateBannerStatus(
        product.id,
        true,
        product.href || `/product/${product.slug}`,
        product.mobile_ad_banner,
        product.banner_background_color,
        product.tags || [],
        ''
      );
      setBannerProducts(prev =>
        prev.map(p => p.id === product.id ? { ...p, desktop_ad_banner: '' } : p)
      );
    } catch (err) {
      console.error('Failed to remove desktop banner image', err);
    }
    setUploadingDesktopId(null);
  };

  return (
    <div className="space-y-4">
      <div className="pb-3 border-b border-orange-500/20 flex justify-between items-center">
        <div>
          <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider"> Homepage Banner Creative Uploads (Mobile &amp; Desktop)</h4>
          <p className="text-[10px] text-gray-400 mt-1">Upload mobile and desktop-specific promo banner images for active hero products.</p>
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
            const desktopSrc = product.desktop_ad_banner;
            const isUploadingMobile = uploadingMobileId === product.id;
            const isSuccessMobile = successMobileId === product.id;
            const isUploadingDesktop = uploadingDesktopId === product.id;
            const isSuccessDesktop = successDesktopId === product.id;

            return (
              <div key={product.id} className="bg-white border border-orange-500/30 p-4 rounded-xl flex flex-col gap-4">
                {/* Product Title and Link */}
                <div className="flex justify-between items-start border-b border-gray-100 pb-2">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-gray-800 truncate">{product.title}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5 truncate">{product.href || `/product/${product.slug}`}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Mobile Banner Card */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Mobile Banner (750x400 approx.)</span>
                    <div className="flex gap-3 items-center">
                      <label
                        className="h-20 w-32 shrink-0 bg-gray-50 border border-gray-200 rounded-lg overflow-hidden relative cursor-pointer hover:opacity-80 transition-opacity group flex items-center justify-center"
                        title="Click to upload mobile banner image"
                      >
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleMobileImageUpload(product, file);
                          }}
                        />
                        {isUploadingMobile ? (
                          <Loader className="h-5 w-5 animate-spin text-orange-500" />
                        ) : isSuccessMobile ? (
                          <Check className="h-6 w-6 text-green-500" />
                        ) : mobileSrc ? (
                          <>
                            <img
                              src={mobileSrc.startsWith('http') || mobileSrc.startsWith('/') ? mobileSrc : `http://localhost:8080${mobileSrc}`}
                              className="w-full h-full object-cover"
                              alt="Mobile Banner"
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
                      <div className="flex-1 min-w-0">
                        {mobileSrc ? (
                          <div className="space-y-1">
                            <div className="text-[9px] text-green-600 font-semibold bg-green-50 px-2 py-0.5 rounded border border-green-100 text-center">
                              Uploaded
                            </div>
                            <button
                              onClick={() => handleRemoveMobileImage(product)}
                              className="text-[9px] font-bold text-red-500 hover:text-red-700 underline block cursor-pointer"
                            >
                              Remove Image
                            </button>
                          </div>
                        ) : (
                          <span className="text-[9px] text-gray-400 italic">No image</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Desktop Banner Card */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Desktop Banner (1920x600 approx.)</span>
                    <div className="flex gap-3 items-center">
                      <label
                        className="h-20 w-32 shrink-0 bg-gray-50 border border-gray-200 rounded-lg overflow-hidden relative cursor-pointer hover:opacity-80 transition-opacity group flex items-center justify-center"
                        title="Click to upload desktop banner image"
                      >
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleDesktopImageUpload(product, file);
                          }}
                        />
                        {isUploadingDesktop ? (
                          <Loader className="h-5 w-5 animate-spin text-orange-500" />
                        ) : isSuccessDesktop ? (
                          <Check className="h-6 w-6 text-green-500" />
                        ) : desktopSrc ? (
                          <>
                            <img
                              src={desktopSrc.startsWith('http') || desktopSrc.startsWith('/') ? desktopSrc : `http://localhost:8080${desktopSrc}`}
                              className="w-full h-full object-cover"
                              alt="Desktop Banner"
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
                      <div className="flex-1 min-w-0">
                        {desktopSrc ? (
                          <div className="space-y-1">
                            <div className="text-[9px] text-green-600 font-semibold bg-green-50 px-2 py-0.5 rounded border border-green-100 text-center">
                              Uploaded
                            </div>
                            <button
                              onClick={() => handleRemoveDesktopImage(product)}
                              className="text-[9px] font-bold text-red-500 hover:text-red-700 underline block cursor-pointer"
                            >
                              Remove Image
                            </button>
                          </div>
                        ) : (
                          <span className="text-[9px] text-gray-400 italic">No image</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}


// Helper: format Date to datetime-local string (YYYY-MM-DDTHH:MM)
function toDatetimeLocal(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function getDefaultDates() {
  const now = new Date();

  const start = new Date(now);
  start.setSeconds(0, 0); // round to minute

  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000); // 24 hours later

  return { defaultStart: toDatetimeLocal(start), defaultEnd: toDatetimeLocal(end) };
}

// ─── Deal of the Day Section ─────────────────────────────────────────────────
function DealOfDaySection() {
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [deals, setDeals] = useState<any[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [selectedProductId, setSelectedProductId] = useState<number | ''>('');
  const { defaultStart } = getDefaultDates();
  const [startDate, setStartDate] = useState(defaultStart);

  // Auto-compute end date: always 24 hours after startDate
  const computeEndFrom = (start: string): string => {
    if (!start) return '';
    const parsed = new Date(start);
    if (isNaN(parsed.getTime())) return start;
    const end = new Date(parsed.getTime() + 24 * 60 * 60 * 1000);
    return toDatetimeLocal(end);
  };
  const [endDate, setEndDate] = useState(() => computeEndFrom(defaultStart));

  // Whenever startDate changes, auto-update endDate to +24h
  useEffect(() => {
    setEndDate(computeEndFrom(startDate));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate]);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setErrorMsg('');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const showError = (msg: string) => {
    setErrorMsg(msg);
    setSuccessMsg('');
    setTimeout(() => setErrorMsg(''), 4000);
  };

  const loadData = useCallback(async (showLoader = true) => {
    if (showLoader) setInitialLoading(true);
    try {
      const productsRes = await productService.getProducts();
      const allProducts = Array.isArray(productsRes?.data) ? productsRes.data : Array.isArray(productsRes) ? productsRes : [];
      setProducts(allProducts.filter((p: any) => p.is_active !== false));

      try {
        const dealsRes = await dealOfDayService.getAllDeals();
        if (dealsRes?.success && dealsRes?.data) {
          setDeals(dealsRes.data);
        } else {
          setDeals([]);
        }
      } catch (e) {
        setDeals([]);
      }
    } catch (err) {
      console.error('Failed to load deal of day data', err);
    }
    if (showLoader) setInitialLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSaveDeal = async () => {
    if (!selectedProductId) {
      showError("Please select a product to create a deal.");
      return;
    }
    if (!startDate || !endDate) {
      showError("Please set a start and end date for the deal.");
      return;
    }
    if (new Date(endDate) <= new Date(startDate)) {
      showError("End date must be after start date.");
      return;
    }

    if (deals.some(d => Number(d.productId) === Number(selectedProductId))) {
      showError("This product is already added as a Deal of the Day.");
      return;
    }

    setIsSaving(true);
    try {
      const selectedP = products.find(p => p.id === Number(selectedProductId));
      const payload = {
        productId: Number(selectedProductId),
        title: selectedP?.title || "Deal of the Day",
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        isActive: true
      };

      await dealOfDayService.createDeal(payload);

      // Reset form
      setSelectedProductId('');
      const { defaultStart: newStart, defaultEnd: newEnd } = getDefaultDates();
      setStartDate(newStart);
      setEndDate(newEnd);

      await loadData(false);
      showSuccess("Deal created successfully!");
    } catch (err) {
      console.error(err);
      showError("Failed to save deal. Please try again.");
    }
    setIsSaving(false);
  };

  const handleToggleStatus = async (dealId: number) => {
    setTogglingId(dealId);
    try {
      await dealOfDayService.updateDealStatus(dealId);
      await loadData(false);
      showSuccess("Deal status updated.");
    } catch (err) {
      console.error(err);
      showError("Failed to toggle status.");
    }
    setTogglingId(null);
  };

  const handleDeleteDeal = async (dealId: number) => {
    setDeletingId(dealId);
    try {
      await dealOfDayService.deleteDeal(dealId);
      await loadData(false);
      setConfirmDeleteId(null);
      showSuccess("Deal deleted successfully.");
    } catch (err) {
      console.error(err);
      showError("Failed to delete deal.");
    }
    setDeletingId(null);
  };

  const canAddMore = deals.length < 4;

  const formatToLocal = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString(undefined, {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="space-y-4">
      <div className="pb-3 border-b border-orange-500/20 flex justify-between items-center">
        <div>
          <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider"> Deal of the Day ({deals.length}/4)</h4>
          <p className="text-[10px] text-gray-400 mt-1">Manage up to 4 deal of the day promotions on the homepage.</p>
        </div>
        <div className="flex items-center gap-3">
          {successMsg && <div className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-lg border border-green-200 animate-in fade-in zoom-in duration-300 flex items-center gap-1"><Check className="h-3 w-3" /> {successMsg}</div>}
          {errorMsg && <div className="text-xs font-bold text-red-600 bg-red-50 px-3 py-1.5 rounded-lg border border-red-200 animate-in fade-in zoom-in duration-300">{errorMsg}</div>}
          <button
            onClick={() => loadData(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-orange-500/30 hover:bg-orange-500/10 text-xs font-bold text-orange-500 rounded-lg transition-colors cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </button>
        </div>
      </div>

      {initialLoading ? (
        <div className="flex justify-center p-10">
          <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* List of active deals */}
          {deals.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {deals.map(deal => (
                <div key={deal.id} className="bg-white border border-orange-500/30 p-4 rounded-xl flex flex-col justify-between shadow-sm relative overflow-hidden">

                  {/* Delete Confirmation Overlay */}
                  {confirmDeleteId === deal.id && (
                    <div className="absolute inset-0 bg-white z-10 flex flex-col items-center justify-center p-4 text-center animate-in fade-in zoom-in-95 duration-200" style={{ backgroundColor: '#ffffff' }}>
                      <p className="text-xs font-bold mb-1" style={{ color: '#111827' }}>Delete this deal?</p>
                      <p className="text-[10px] mb-3" style={{ color: '#6b7280' }}>This action cannot be undone.</p>
                      <div className="flex gap-2 w-full">
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          disabled={deletingId === deal.id}
                          className="flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                          style={{ backgroundColor: '#f3f4f6', color: '#374151' }}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleDeleteDeal(deal.id)}
                          disabled={deletingId === deal.id}
                          className="flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer disabled:opacity-50 flex justify-center items-center gap-1"
                          style={{ backgroundColor: '#ef4444', color: '#ffffff' }}
                        >
                          {deletingId === deal.id ? <Loader className="h-3 w-3 animate-spin" /> : 'Yes, Delete'}
                        </button>
                      </div>
                    </div>
                  )}

                  <div>
                    <div className="flex gap-3 mb-3">
                      {(() => {
                        const product = deal.product || products.find(p => p.id === deal.productId);
                        const imgSrc = product?.main_image_url;
                        return imgSrc ? (
                          <img
                            src={imgSrc.startsWith('http') || imgSrc.startsWith('/') ? imgSrc : `http://localhost:8080${imgSrc}`}
                            alt="Product"
                            className="w-12 h-12 rounded-lg object-cover border border-gray-200 shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 shrink-0 flex items-center justify-center">
                            <ImageIcon className="w-5 h-5 text-gray-300" />
                          </div>
                        );
                      })()}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-bold text-orange-500 uppercase truncate pr-2">{deal.title}</span>
                          <span className={`text-[9px] font-semibold px-2 py-0.5 rounded border whitespace-nowrap ${deal.isActive ? 'bg-green-50 text-green-600 border-green-200' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                            {deal.isActive ? 'ACTIVE' : 'INACTIVE'}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-gray-800 line-clamp-2" title={deal.product?.title || products.find(p => p.id === deal.productId)?.title}>
                          {deal.product?.title || products.find(p => p.id === deal.productId)?.title || 'Unknown Product'}
                        </p>
                      </div>
                    </div>
                    <div className="text-[10px] text-gray-500 bg-gray-50 p-2 rounded-lg border border-gray-100 space-y-1 mt-2">
                      <div className="flex justify-between">
                        <span className="font-semibold text-gray-400">Start:</span>
                        <span>{formatToLocal(deal.startDate)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-semibold text-gray-400">End:</span>
                        <span>{formatToLocal(deal.endDate)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-orange-500/10">
                    <button
                      onClick={() => handleToggleStatus(deal.id)}
                      disabled={togglingId === deal.id}
                      className={`flex items-center gap-1.5 text-[10px] font-bold transition-colors cursor-pointer disabled:opacity-50 ${deal.isActive ? 'text-gray-500 hover:text-gray-700' : 'text-orange-500 hover:text-orange-600'}`}
                    >
                      {togglingId === deal.id ? (
                        <Loader className="h-3 w-3 animate-spin" />
                      ) : deal.isActive ? (
                        <><ToggleRight className="h-4 w-4 text-orange-500" /> Disable</>
                      ) : (
                        <><ToggleLeft className="h-4 w-4 text-gray-400" /> Enable</>
                      )}
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(deal.id)}
                      className="text-[10px] font-bold text-red-500 hover:text-red-700 flex items-center gap-1 transition-colors cursor-pointer bg-red-50 hover:bg-red-100 px-2 py-1 rounded"
                    >
                      <Trash2 className="h-3 w-3" /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add Form */}
          {canAddMore ? (
            <div className="bg-orange-50/50 border border-orange-500/20 p-5 rounded-xl">
              <h5 className="text-xs font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Plus className="h-4 w-4 text-orange-500" /> Add New Deal
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-start">
                <div>
                  <label className="block text-[10px] font-bold text-gray-700 mb-1">Product</label>
                  <div className="relative" ref={dropdownRef}>
                    <div
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="w-full flex items-center justify-between text-xs border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-orange-400 bg-white cursor-pointer"
                    >
                      <span className="truncate pr-2">
                        {selectedProductId
                          ? products.find(p => p.id === Number(selectedProductId))?.title || 'Select a product...'
                          : 'Select a product...'}
                      </span>
                      <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </div>

                    {isDropdownOpen && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                        <div
                          onClick={() => { setSelectedProductId(''); setIsDropdownOpen(false); }}
                          className="px-3 py-2 hover:bg-gray-50 cursor-pointer text-xs text-gray-500 border-b border-gray-100"
                        >
                          Select a product...
                        </div>
                        {products.map(p => {
                          const imgSrc = p.main_image_url;
                          const formattedImgSrc = imgSrc?.startsWith('http') || imgSrc?.startsWith('/') ? imgSrc : `http://localhost:8080${imgSrc}`;
                          return (
                            <div
                              key={p.id}
                              onClick={() => { setSelectedProductId(p.id); setIsDropdownOpen(false); }}
                              className={`px-3 py-2 hover:bg-orange-50 cursor-pointer flex items-center gap-3 border-b border-gray-50 last:border-0 ${selectedProductId === p.id ? 'bg-orange-50' : ''}`}
                            >
                              {imgSrc ? (
                                <img src={formattedImgSrc} alt="" className="w-8 h-8 rounded object-cover border border-gray-200 shrink-0" />
                              ) : (
                                <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center shrink-0">
                                  <ImageIcon className="w-4 h-4 text-gray-300" />
                                </div>
                              )}
                              <span className="text-xs font-medium text-gray-700 truncate">{p.title}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  {/* Selected Product Image Preview */}
                  {selectedProductId && (() => {
                    const selectedP = products.find(p => p.id === Number(selectedProductId));
                    const imgSrc = selectedP?.main_image_url;
                    if (!imgSrc) return null;
                    return (
                      <div className="mt-2 flex items-center gap-2 p-2 bg-white border border-gray-100 rounded-lg">
                        <img
                          src={imgSrc.startsWith('http') || imgSrc.startsWith('/') ? imgSrc : `http://localhost:8080${imgSrc}`}
                          alt="Selected Product"
                          className="w-8 h-8 rounded object-cover border border-gray-200 shrink-0"
                        />
                        <span className="text-[10px] font-medium text-gray-600 truncate">{selectedP?.title}</span>
                      </div>
                    );
                  })()}
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-700 mb-1">Start Date</label>
                  <input
                    type="datetime-local"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-orange-400"
                    style={{ backgroundColor: '#ffffff', color: '#111827', colorScheme: 'light' }}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-700 mb-1">End Date</label>
                  <input
                    type="datetime-local"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-orange-400"
                    style={{ backgroundColor: '#ffffff', color: '#111827', colorScheme: 'light' }}
                  />
                </div>

              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={handleSaveDeal}
                  disabled={isSaving}
                  className="flex items-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-sm"
                >
                  {isSaving ? <Loader className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  {isSaving ? 'Creating...' : 'Create Deal'}
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center p-4 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-500 font-medium">
              Maximum of 4 deals reached. Delete an existing deal to add a new one.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function BannersTab(props: BannersTabProps) {
  const { slidesList, handleToggleSlide, mobileBannersList, setMobileBannersList } = props;

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

      {/* Section C: Deal of the Day */}
      <DealOfDaySection />

       {/* Section E: Discover More Banners */}
      <DiscoverMoreSection />

      {/* Section D: Product Promo Banners */}
      <ProductPromoBannersSection />

    </div>
  );
}
