import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Plus, Trash2, Edit, ToggleLeft, ToggleRight, Image as ImageIcon, Upload, Check, Loader, Loader2, RefreshCw, ChevronDown
} from 'lucide-react';
import ProductBannersSection from './ProductBannersSection';
import DiscoverMoreSection from './DiscoverMoreSection';
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


// Helper: format Date to datetime-local string (YYYY-MM-DDTHH:MM)
function toDatetimeLocal(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function getDefaultDates() {
  const now = new Date();

  const start = new Date(now);
  start.setHours(0, 0, 0, 0); // 12:00 AM today

  const end = new Date(now);
  end.setDate(end.getDate() + 7);

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
  const { defaultStart, defaultEnd } = getDefaultDates();
  const [startDate, setStartDate] = useState(defaultStart);
  const [endDate, setEndDate] = useState(defaultEnd);

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
          <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">C. Deal of the Day ({deals.length}/4)</h4>
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
                    <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-4 text-center animate-in fade-in zoom-in-95 duration-200">
                      <p className="text-xs font-bold text-gray-800 mb-3">Delete this deal?</p>
                      <div className="flex gap-2 w-full">
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          disabled={deletingId === deal.id}
                          className="flex-1 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleDeleteDeal(deal.id)}
                          disabled={deletingId === deal.id}
                          className="flex-1 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer disabled:opacity-50 flex justify-center items-center gap-1"
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
                    className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-orange-400 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-700 mb-1">End Date</label>
                  <input
                    type="datetime-local"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-orange-400 bg-white"
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

      {/* Section F: Discover More Banners */}
      <DiscoverMoreSection />

    </div>
  );
}
