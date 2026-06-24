"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, ToggleLeft, ToggleRight, Loader, Loader2, Image as ImageIcon, ChevronDown, Check } from 'lucide-react';
import productBannerService from '@/app/services/productBanner.service';
import { productService } from '@/app/services/product.service';
import { ApiProduct, ProductBanner } from '@/app/types/types';
import { useToast } from '@/app/context/ToastContext';

export default function ProductPromoBannersSection() {
  const [banners, setBanners] = useState<ProductBanner[]>([]);
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [selectedProductId, setSelectedProductId] = useState<number | ''>('');
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { toast, confirm } = useToast();

  useEffect(() => {
    loadData();
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [bannersRes, productsRes] = await Promise.all([
        productBannerService.getAllBanners(),
        productService.getProducts()
      ]);
      setBanners(Array.isArray(bannersRes) ? bannersRes : []);
      const pData = productsRes?.data || productsRes;
      if (Array.isArray(pData)) {
        setProducts(pData.filter((p: ApiProduct) => p.is_active !== false));
      }
    } catch (err) {
      console.error('Failed to load product promo banners', err);
    }
    setLoading(false);
  };

  const handleSaveBanner = async () => {
    if (!selectedProductId) {
      toast.error('Please select a product.');
      return;
    }
    if (!title.trim()) {
      toast.error('Please enter a title.');
      return;
    }

    setIsSaving(true);
    try {
      await productBannerService.createBanner({
        productId: Number(selectedProductId),
        title: title.trim(),
        subtitle: subtitle.trim(),
        isActive: true
      });
      
      toast.success('Promo banner created successfully!');
      setSelectedProductId('');
      setTitle('');
      setSubtitle('');
      await loadData();
    } catch (err) {
      console.error(err);
      toast.error('Failed to save banner.');
    }
    setIsSaving(false);
  };

  const handleToggleStatus = async (banner: ProductBanner) => {
    setTogglingId(banner.id);
    try {
      await productBannerService.updateBannerStatus(banner.id, !banner.isActive);
      setBanners(prev => prev.map(b => b.id === banner.id ? { ...b, isActive: !b.isActive } : b));
      toast.success('Banner status updated.');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update status.');
    }
    setTogglingId(null);
  };

  const handleDeleteBanner = async (id: number) => {
    const isConfirmed = await confirm('Are you sure you want to delete this promo banner?');
    if (!isConfirmed) return;
    setDeletingId(id);
    try {
      await productBannerService.deleteBanner(id);
      setBanners(prev => prev.filter(b => b.id !== id));
      toast.success('Banner deleted successfully.');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete banner.');
    }
    setDeletingId(null);
  };

  return (
    <div className="space-y-4 mt-10">
      <div className="pb-3 border-b border-orange-500/20">
        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">D. Product Promo Banners</h4>
        <p className="text-[10px] text-gray-400 mt-1">Manage promotional offer cards featuring specific products.</p>
      </div>

      {loading ? (
        <div className="flex justify-center p-8">
          <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
        </div>
      ) : (
        <div className="space-y-6">
          {banners.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {banners.map(banner => {
                const product = banner.product || products.find(p => p.id === banner.productId);
                const imgSrc = product?.main_image_url;
                return (
                  <div key={banner.id} className="bg-white border border-orange-500/30 p-4 rounded-xl flex flex-col justify-between shadow-sm relative">
                    <div>
                      <div className="flex gap-3 mb-3">
                        {imgSrc ? (
                          <img
                            src={imgSrc.startsWith('http') || imgSrc.startsWith('/') ? imgSrc : `http://localhost:8080${imgSrc}`}
                            alt="Product"
                            className="w-12 h-12 rounded-lg object-cover border border-gray-200 shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 shrink-0 flex items-center justify-center">
                            <ImageIcon className="w-5 h-5 text-gray-300" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-bold text-orange-500 uppercase truncate pr-2">PROMO</span>
                            <span className={`text-[9px] font-semibold px-2 py-0.5 rounded border whitespace-nowrap ${banner.isActive ? 'bg-green-50 text-green-600 border-green-200' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                              {banner.isActive ? 'ACTIVE' : 'INACTIVE'}
                            </span>
                          </div>
                          <p className="text-xs font-bold text-gray-800 line-clamp-2">{banner.title}</p>
                          {banner.subtitle && <p className="text-[10px] text-gray-500 line-clamp-1">{banner.subtitle}</p>}
                        </div>
                      </div>
                      <div className="text-[10px] text-gray-500 bg-gray-50 p-2 rounded-lg border border-gray-100 mt-2 truncate">
                        Product: {product?.title || 'Unknown Product'}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-orange-500/10">
                      <button
                        onClick={() => handleToggleStatus(banner)}
                        disabled={togglingId === banner.id}
                        className={`flex items-center gap-1.5 text-[10px] font-bold transition-colors cursor-pointer disabled:opacity-50 ${banner.isActive ? 'text-gray-500 hover:text-gray-700' : 'text-orange-500 hover:text-orange-600'}`}
                      >
                        {togglingId === banner.id ? (
                          <Loader className="h-3 w-3 animate-spin" />
                        ) : banner.isActive ? (
                          <><ToggleRight className="h-4 w-4 text-orange-500" /> Disable</>
                        ) : (
                          <><ToggleLeft className="h-4 w-4 text-gray-400" /> Enable</>
                        )}
                      </button>
                      <button
                        onClick={() => handleDeleteBanner(banner.id)}
                        disabled={deletingId === banner.id}
                        className="text-[10px] font-bold text-red-500 hover:text-red-700 flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {deletingId === banner.id ? <Loader className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />} Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {banners.length >= 1 ? (
            <div className="bg-orange-50/50 border border-orange-500/20 p-5 rounded-xl flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                <Check className="w-4 h-4 text-orange-500" />
              </div>
              <div>
                <h5 className="text-xs font-bold text-gray-800">Promo Banner Active</h5>
                <p className="text-[10px] text-gray-500 mt-0.5">You can only have one promotional offer banner active at a time. Delete the existing banner to create a new one.</p>
              </div>
            </div>
          ) : (
            <div className="bg-orange-50/50 border border-orange-500/20 p-5 rounded-xl">
              <h5 className="text-xs font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Plus className="h-4 w-4 text-orange-500" /> Add New Promo Banner
              </h5>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
              <div className="md:col-span-2">
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
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. MEGA SALE"
                  className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-orange-400 bg-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-700 mb-1">Subtitle (Optional)</label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="e.g. 50% OFF"
                  className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-orange-400 bg-white"
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={handleSaveBanner}
                disabled={isSaving}
                className="flex items-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-sm"
              >
                {isSaving ? <Loader className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                {isSaving ? 'Creating...' : 'Create Promo Banner'}
              </button>
            </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
