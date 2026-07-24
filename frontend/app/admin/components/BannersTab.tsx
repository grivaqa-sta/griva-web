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
import { queryClient } from '@/app/utils/cache';
import { useCategories, useSubCategories } from '@/app/hooks/useCategories';


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
  fridaySaleConfig: any;
  onSaveFridaySaleConfig: (config: any) => Promise<void>;
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
          <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider"> Homepage Banner Creative Uploads (Mobile)</h4>
          <p className="text-[10px] text-gray-400 mt-1">Upload mobile-specific promo banner images for active hero products.</p>
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
            const isUploadingMobile = uploadingMobileId === product.id;
            const isSuccessMobile = successMobileId === product.id;

            return (
              <div key={product.id} className="bg-white border border-orange-500/30 p-4 rounded-xl flex flex-col gap-4">
                {/* Product Title and Link */}
                <div className="flex justify-between items-start border-b border-gray-100 pb-2">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-gray-800 truncate">{product.title}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5 truncate">{product.href || `/product/${product.slug}`}</p>
                  </div>
                </div>

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
      queryClient.invalidate("deal_of_day_active");

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
      queryClient.invalidate("deal_of_day_active");
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
      queryClient.invalidate("deal_of_day_active");
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
                            className="w-12 h-12 rounded-lg object-contain p-0.5 bg-gray-50 border border-gray-200 shrink-0"
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
              <h5 className="text-xs font-bold text-gray-800 mb-2 flex items-center gap-2">
                <Plus className="h-4 w-4 text-orange-500" /> Add New Deal
              </h5>
              <p className="text-[10px] text-orange-600 font-medium mb-4 leading-relaxed bg-orange-100/30 p-2.5 rounded-lg border border-orange-200/30">
                💡 <strong>Automated Scheduling:</strong> When creating a new deal, the End Date is automatically pre-configured to exactly 24 hours after the Start Date. After this 24-hour period, the deal will automatically expire and hide from the storefront homepage.
              </p>
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
                                <img src={formattedImgSrc} alt="" className="w-8 h-8 rounded object-contain p-0.5 bg-gray-50 border border-gray-200 shrink-0" />
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
                          className="w-8 h-8 rounded object-contain p-0.5 bg-gray-50 border border-gray-200 shrink-0"
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

// ─── Friday Deals Section ─────────────────────────────────────────────────────────────
function FridayDealsSection({ fridaySaleConfig, onSaveFridaySaleConfig }: { fridaySaleConfig: any, onSaveFridaySaleConfig: (config: any) => Promise<void> }) {
  const { toast } = useToast();
  const { categories } = useCategories();
  const { subCategories } = useSubCategories();
  const [products, setProducts] = useState<any[]>([]);
  const [isSavingFridayConfig, setIsSavingFridayConfig] = useState(false);

  const defaultCards = [
    { number: "01", title: "Gaming Gear", subtitle: "Up to 35% OFF", type: "category", slug: "gaming-store-qatar", discount: 35, image: "/images/gamejoysticnew.png" },
    { number: "02", title: "Premium Audio", subtitle: "Up to 40% OFF", type: "category", slug: "exclusive-offers", discount: 40, image: "/images/headphonenew.png" },
    { number: "03", title: "Smartwatches", subtitle: "Up to 30% OFF", type: "category", slug: "shop", discount: 30, image: "/images/iwatch.png" },
    { number: "04", title: "Speakers & More", subtitle: "Special Drops", type: "category", slug: "electronics-store-qatar", discount: 10, image: "/images/bspeaker.png" },
  ];

  const [cards, setCards] = useState<any[]>(defaultCards);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await productService.getProducts();
        const data = res?.data || res;
        setProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load products in Friday Deals:", err);
      }
    };
    loadProducts();
  }, []);

  useEffect(() => {
    if (fridaySaleConfig && Array.isArray(fridaySaleConfig) && fridaySaleConfig.length === 4) {
      setCards(fridaySaleConfig);
    }
  }, [fridaySaleConfig]);

  return (
    <div className="bg-white border border-orange-500/30 rounded-2xl p-6 shadow-sm space-y-6">
      <div className="border-b border-orange-500/10 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Friday Deals Card Manager</h4>
          <p className="text-[10px] text-gray-400 mt-0.5">Customize the titles, discounts, linked categories, and product images of the 4 storefront cards.</p>
        </div>
        <button
          onClick={async () => {
            setIsSavingFridayConfig(true);
            try {
              await onSaveFridaySaleConfig(cards);
              toast.success("Friday Deals layout saved successfully.");
            } catch (err) {
              toast.error("Failed to save Friday Deals layout.");
            } finally {
              setIsSavingFridayConfig(false);
            }
          }}
          disabled={isSavingFridayConfig}
          className="inline-flex items-center justify-center rounded-xl bg-orange-500 hover:bg-orange-600 px-6 py-2.5 text-xs font-bold text-white transition shadow-md shadow-orange-500/10 cursor-pointer disabled:opacity-50"
        >
          {isSavingFridayConfig ? "Saving..." : "Save Deals Configuration"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, idx) => {
          const matchedProducts = (() => {
            if (!card.slug) return [];
            if (card.type === "subcategory") {
              const sub = subCategories.find((s: any) => s.slug === card.slug);
              return sub ? products.filter((p: any) => p.subcategory_id === sub.id) : [];
            }
            const cat = categories.find((c: any) => c.slug === card.slug);
            if (!cat) return [];
            const subIds = subCategories
              .filter((sub: any) => sub.category_id === cat.id)
              .map((sub: any) => sub.id);
            return products.filter((p: any) => subIds.includes(p.subcategory_id));
          })();
          
          const matchedCategoryUrl = (() => {
            if (!card.slug) return null;
            if (card.type === "subcategory") {
              return subCategories.find((s: any) => s.slug === card.slug)?.image_url || null;
            }
            return categories.find((c: any) => c.slug === card.slug)?.image_url || null;
          })();

          return (
            <div key={idx} className="bg-gray-50/50 border border-gray-100 rounded-2xl p-5 space-y-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between border-b pb-2 border-gray-200/50">
                <span className="text-xs font-black text-orange-500">CARD {card.number}</span>
                <span className="text-[10px] font-bold text-gray-400">Position {idx + 1}</span>
              </div>

              {/* Title */}
              <div>
                <label className="block text-[9px] font-bold uppercase text-gray-400 tracking-wider mb-1">Card Title</label>
                <input
                  type="text"
                  value={card.title}
                  onChange={(e) => {
                    const newCards = [...cards];
                    newCards[idx] = { ...card, title: e.target.value };
                    setCards(newCards);
                  }}
                  placeholder="e.g. Gaming Gear"
                  className="w-full text-xs font-semibold text-gray-700 bg-white border border-orange-500/10 rounded-lg px-2.5 py-2 outline-none focus:border-orange-500 transition-colors"
                />
              </div>

              {/* Subtitle */}
              <div>
                <label className="block text-[9px] font-bold uppercase text-gray-400 tracking-wider mb-1">Card Subtitle / Offer Text</label>
                <input
                  type="text"
                  value={card.subtitle}
                  onChange={(e) => {
                    const newCards = [...cards];
                    newCards[idx] = { ...card, subtitle: e.target.value };
                    setCards(newCards);
                  }}
                  placeholder="e.g. Up to 35% OFF"
                  className="w-full text-xs font-semibold text-gray-700 bg-white border border-orange-500/10 rounded-lg px-2.5 py-2 outline-none focus:border-orange-500 transition-colors"
                />
              </div>

              {/* Target Type: Category or Subcategory */}
              <div>
                <label className="block text-[9px] font-bold uppercase text-gray-400 tracking-wider mb-1">Target Type</label>
                <select
                  value={card.type || "category"}
                  onChange={(e) => {
                    const newCards = [...cards];
                    newCards[idx] = { ...card, type: e.target.value, slug: "" };
                    setCards(newCards);
                  }}
                  className="w-full text-xs font-semibold text-gray-700 bg-white border border-orange-500/10 rounded-lg px-2 py-2 outline-none focus:border-orange-500 transition-colors"
                >
                  <option value="category">Category</option>
                  <option value="subcategory">Subcategory</option>
                </select>
              </div>

              {/* Target Slug selection */}
              <div>
                <label className="block text-[9px] font-bold uppercase text-gray-400 tracking-wider mb-1">Target Selection</label>
                <select
                  value={card.slug || ""}
                  onChange={(e) => {
                    const newSlug = e.target.value;
                    const newCards = [...cards];
                    
                    let autoTitle = card.title;
                    let autoImage = card.image;
                    
                    if (card.type === "subcategory") {
                      const matchedSub = subCategories.find((sub: any) => sub.slug === newSlug);
                      if (matchedSub) {
                        autoTitle = matchedSub.title;
                        const firstProd = products.find((p: any) => p.subcategory_id === matchedSub.id);
                        if (firstProd && firstProd.main_image_url) {
                          autoImage = firstProd.main_image_url;
                        } else if (matchedSub.image_url) {
                          autoImage = matchedSub.image_url;
                        }
                      }
                    } else {
                      const matchedCat = categories.find((cat: any) => cat.slug === newSlug);
                      if (matchedCat) {
                        autoTitle = matchedCat.title;
                        const matchedSubIds = subCategories
                          .filter((sub: any) => sub.category_id === matchedCat.id)
                          .map((sub: any) => sub.id);
                        const firstProd = products.find((p: any) => matchedSubIds.includes(p.subcategory_id));
                        if (firstProd && firstProd.main_image_url) {
                          autoImage = firstProd.main_image_url;
                        } else if (matchedCat.image_url) {
                          autoImage = matchedCat.image_url;
                        }
                      }
                    }

                    newCards[idx] = { ...card, slug: newSlug, title: autoTitle, image: autoImage };
                    setCards(newCards);
                  }}
                  className="w-full text-xs font-semibold text-gray-700 bg-white border border-orange-500/10 rounded-lg px-2 py-2 outline-none focus:border-orange-500 transition-colors"
                >
                  <option value="">Select Target...</option>
                  {card.type === "subcategory"
                    ? subCategories.map((sub: any) => (
                        <option key={sub.slug} value={sub.slug}>
                          {sub.title}
                        </option>
                      ))
                    : categories.map((cat: any) => (
                        <option key={cat.slug} value={cat.slug}>
                          {cat.title}
                        </option>
                      ))}
                </select>
              </div>

              {/* Discount Percentage */}
              <div>
                <label className="block text-[9px] font-bold uppercase text-gray-400 tracking-wider mb-1">Min Discount (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={card.discount || 0}
                  onChange={(e) => {
                    const newDiscount = Number(e.target.value);
                    const newCards = [...cards];
                    
                    let autoSubtitle = card.subtitle;
                    if (newDiscount > 0) {
                      autoSubtitle = `${newDiscount}% OFF & More`;
                    } else {
                      autoSubtitle = "Special Drops";
                    }

                    newCards[idx] = { ...card, discount: newDiscount, subtitle: autoSubtitle };
                    setCards(newCards);
                  }}
                  className="w-full text-xs font-semibold text-gray-700 bg-white border border-orange-500/10 rounded-lg px-2.5 py-2 outline-none focus:border-orange-500 transition-colors"
                />
              </div>

              {/* Product Image Selection */}
              <div className="space-y-2">
                <label className="block text-[9px] font-bold uppercase text-gray-400 tracking-wider">Featured Image</label>
                
                {(() => {
                  const presets = ["/images/gamejoysticnew.png", "/images/headphonenew.png", "/images/iwatch.png", "/images/bspeaker.png"];
                  const isPreset = presets.includes(card.image);
                  const isCategoryImg = matchedCategoryUrl && card.image === matchedCategoryUrl;
                  const isProductImg = matchedProducts.some((p: any) => p.main_image_url === card.image);
                  
                  let activeMode = "custom";
                  if (isPreset) activeMode = "preset";
                  else if (isCategoryImg) activeMode = "category";
                  else if (isProductImg) activeMode = "product";

                  return (
                    <>
                      {/* Mode Tabs */}
                      <div className="flex flex-wrap gap-1 bg-gray-100 p-0.5 rounded-lg mb-2">
                        {[
                          { id: "product", label: "Product" },
                          { id: "category", label: "Category" },
                          { id: "preset", label: "Preset" },
                          { id: "custom", label: "Custom" },
                        ].map((mode) => {
                          const isActive = activeMode === mode.id;
                          return (
                            <button
                              key={mode.id}
                              type="button"
                              onClick={() => {
                                const newCards = [...cards];
                                let newImg = "";
                                if (mode.id === "category") {
                                  newImg = matchedCategoryUrl || "";
                                } else if (mode.id === "preset") {
                                  newImg = presets[idx] || presets[0];
                                } else if (mode.id === "product") {
                                  const firstProd = matchedProducts.find((p: any) => p.main_image_url);
                                  newImg = firstProd ? firstProd.main_image_url : "";
                                }
                                newCards[idx] = { ...card, image: newImg };
                                setCards(newCards);
                              }}
                              className={`flex-1 text-[9px] font-bold py-1.5 px-1 rounded-md transition-all cursor-pointer ${
                                isActive
                                  ? "bg-white text-orange-600 shadow-sm"
                                  : "text-gray-500 hover:text-gray-900"
                              }`}
                            >
                              {mode.label}
                            </button>
                          );
                        })}
                      </div>

                      {/* Mode Fields */}
                      {activeMode === "product" && (
                        <div className="space-y-1">
                          <select
                            value={card.image || ""}
                            onChange={(e) => {
                              const newCards = [...cards];
                              newCards[idx] = { ...card, image: e.target.value };
                              setCards(newCards);
                            }}
                            className="w-full text-xs font-semibold text-gray-700 bg-white border border-orange-500/10 rounded-lg px-2 py-2 outline-none focus:border-orange-500 transition-colors"
                          >
                            {matchedProducts.filter((p: any) => p.main_image_url).length === 0 ? (
                              <option value="">No products with images found...</option>
                            ) : (
                              <>
                                <option value="">Select a product...</option>
                                {matchedProducts
                                  .filter((p: any) => p.main_image_url)
                                  .map((p: any) => (
                                    <option key={p.id} value={p.main_image_url}>
                                      {p.title}
                                    </option>
                                  ))}
                              </>
                            )}
                          </select>
                        </div>
                      )}

                      {activeMode === "category" && (
                        <div className="text-[10px] text-gray-500 bg-orange-50/50 p-2 rounded-lg border border-orange-100/30 flex items-center justify-between">
                          <span>Using default category image</span>
                          {matchedCategoryUrl ? (
                            <span className="text-green-600 font-bold text-[9px] uppercase">Active</span>
                          ) : (
                            <span className="text-red-500 font-bold text-[9px] uppercase font-bold">No Image</span>
                          )}
                        </div>
                      )}

                      {activeMode === "preset" && (
                        <div className="space-y-1">
                          <select
                            value={card.image}
                            onChange={(e) => {
                              const newCards = [...cards];
                              newCards[idx] = { ...card, image: e.target.value };
                              setCards(newCards);
                            }}
                            className="w-full text-xs font-semibold text-gray-700 bg-white border border-orange-500/10 rounded-lg px-2 py-2 outline-none focus:border-orange-500 transition-colors"
                          >
                            <option value="/images/gamejoysticnew.png">Gamepad (Preset)</option>
                            <option value="/images/headphonenew.png">Headphones (Preset)</option>
                            <option value="/images/iwatch.png">Smartwatch (Preset)</option>
                            <option value="/images/bspeaker.png">Speaker (Preset)</option>
                          </select>
                        </div>
                      )}

                      {activeMode === "custom" && (
                        <div className="space-y-1">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={card.image || ""}
                              onChange={(e) => {
                                const newCards = [...cards];
                                newCards[idx] = { ...card, image: e.target.value };
                                setCards(newCards);
                              }}
                              placeholder="Enter image URL..."
                              className="flex-1 text-xs font-semibold text-gray-700 bg-white border border-orange-500/10 rounded-lg px-2.5 py-2 outline-none focus:border-orange-500 transition-colors"
                            />
                            <div className="relative">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;
                                  try {
                                    const data = await uploadService.uploadImage(file);
                                    if (data && data.imageUrl) {
                                      const newCards = [...cards];
                                      newCards[idx] = { ...card, image: data.imageUrl };
                                      setCards(newCards);
                                      toast.success("Image uploaded successfully!");
                                    } else {
                                      toast.error("Failed to upload image. No URL returned.");
                                    }
                                  } catch (err: any) {
                                    toast.error(err?.response?.data?.message || "Failed to upload image");
                                  }
                                }}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              />
                              <button
                                type="button"
                                className="h-full px-3 bg-orange-50 hover:bg-orange-100 text-orange-600 font-bold rounded-lg text-xs transition-colors whitespace-nowrap min-h-[34px] flex items-center justify-center border border-orange-500/10 cursor-pointer"
                              >
                                Upload
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()}

                {/* Visual Image Preview */}
                <div className="mt-3">
                  <span className="block text-[8px] font-bold text-gray-400 uppercase tracking-wider mb-1">Image Preview</span>
                  <div className="h-24 w-full bg-gray-50 border border-gray-200 rounded-lg overflow-hidden relative flex items-center justify-center">
                    {card.image ? (
                      <img
                        src={card.image.startsWith('http') || card.image.startsWith('/') ? card.image : `http://localhost:8080${card.image}`}
                        alt="Preview"
                        className="h-full w-full object-contain p-1"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-gray-400 gap-1">
                        <ImageIcon className="h-5 w-5" />
                        <span className="text-[8px] font-bold uppercase">No Image Selected</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        </div>
      </div>
    );
  }

export default function BannersTab(props: BannersTabProps) {
  const { slidesList, handleToggleSlide, mobileBannersList, setMobileBannersList, fridaySaleConfig, onSaveFridaySaleConfig } = props;

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

      {/* Section D: Friday Deals Cards Manager */}
      <FridayDealsSection fridaySaleConfig={fridaySaleConfig} onSaveFridaySaleConfig={onSaveFridaySaleConfig} />

      {/* Section E: Discover More Banners */}
      <DiscoverMoreSection />

      {/* Section F: Product Promo Banners */}
      <ProductPromoBannersSection />

    </div>
  );
}
