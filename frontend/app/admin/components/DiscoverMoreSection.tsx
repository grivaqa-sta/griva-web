import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Plus, Trash2, ToggleLeft, ToggleRight, Image as ImageIcon, Upload, Check, Loader, Loader2, RefreshCw, ChevronDown
} from 'lucide-react';
import {
  getAllDiscoverMore,
  createDiscoverMore,
  updateDiscoverMoreStatus,
  deleteDiscoverMore
} from '@/app/services/discoverMore.service';
import { categoryService } from '@/app/services/category.service';
import { uploadService } from '@/app/services/upload.service';
import { Category, DiscoverMore, DiscoverMorePayload } from '@/app/types/types';

export default function DiscoverMoreSection() {
  const [banners, setBanners] = useState<DiscoverMore[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form State
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | ''>('');
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [href, setHref] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

    // Load categories independently so a banner API failure doesn't block the dropdown
    try {
      const categoriesRes = await categoryService.getAllActiveCategories();
      console.log('Categories res:', categoriesRes);
      const allCategories = Array.isArray(categoriesRes?.data) ? categoriesRes.data : Array.isArray(categoriesRes) ? categoriesRes : [];
      setCategories(allCategories);
    } catch (err) {
      console.error('Failed to load categories', err);
    }

    // Load banners separately
    try {
      const bannersData = await getAllDiscoverMore();
      setBanners(bannersData?.data || bannersData || []);
    } catch (err) {
      console.error('Failed to load discover more banners', err);
      setBanners([]);
    }

    if (showLoader) setInitialLoading(false);
  }, []);


  useEffect(() => { loadData(); }, [loadData]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const data = await uploadService.uploadImage(file);
      setImageUrl(data.imageUrl);
      showSuccess("Image uploaded successfully.");
    } catch (err) {
      console.error('Upload failed', err);
      showError("Image upload failed.");
    }
    setIsUploading(false);
  };

  const handleSaveBanner = async () => {
    if (!selectedCategoryId) return showError("Please select a category.");
    if (!title.trim() || !subtitle.trim() || !href.trim() || !imageUrl) {
      return showError("Please fill out all fields and upload an image.");
    }

    setIsSaving(true);
    try {
      const payload: DiscoverMorePayload = {
        categoryId: Number(selectedCategoryId),
        title,
        subtitle,
        href,
        image_url: imageUrl,
        is_active: true
      };

      await createDiscoverMore(payload);

      // Reset form
      setSelectedCategoryId('');
      setTitle('');
      setSubtitle('');
      setHref('');
      setImageUrl('');
      
      await loadData(false);
      showSuccess("Banner created successfully!");
    } catch (err) {
      console.error(err);
      showError("Failed to save banner. Please try again.");
    }
    setIsSaving(false);
  };

  const handleToggleStatus = async (id: number) => {
    setTogglingId(id);
    try {
      await updateDiscoverMoreStatus(id);
      await loadData(false);
      showSuccess("Banner status updated.");
    } catch (err) {
      console.error(err);
      showError("Failed to toggle status.");
    }
    setTogglingId(null);
  };

  const handleDeleteBanner = async (id: number) => {
    setDeletingId(id);
    try {
      await deleteDiscoverMore(id);
      await loadData(false);
      setConfirmDeleteId(null);
      showSuccess("Banner deleted successfully.");
    } catch (err) {
      console.error(err);
      showError("Failed to delete banner.");
    }
    setDeletingId(null);
  };

  const canAddMore = banners.length < 2;

  return (
    <div className="space-y-4">
      <div className="pb-3 border-b border-orange-500/20 flex justify-between items-center">
        <div>
          <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">F. Discover More Banners ({banners.length}/2)</h4>
          <p className="text-[10px] text-gray-400 mt-1">Manage Discover More promotional banners shown on the storefront.</p>
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
          {/* List of active banners */}
          {banners.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {banners.map(banner => (
                <div key={banner.id} className="bg-white border border-orange-500/30 p-4 rounded-xl flex flex-col justify-between shadow-sm relative overflow-hidden">
                  
                  {/* Delete Confirmation Overlay */}
                  {confirmDeleteId === banner.id && (
                    <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-4 text-center animate-in fade-in zoom-in-95 duration-200">
                      <p className="text-xs font-bold text-gray-800 mb-3">Delete this banner?</p>
                      <div className="flex gap-2 w-full">
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          disabled={deletingId === banner.id}
                          className="flex-1 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleDeleteBanner(banner.id)}
                          disabled={deletingId === banner.id}
                          className="flex-1 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer disabled:opacity-50 flex justify-center items-center gap-1"
                        >
                          {deletingId === banner.id ? <Loader className="h-3 w-3 animate-spin" /> : 'Yes, Delete'}
                        </button>
                      </div>
                    </div>
                  )}

                  <div>
                    <div className="h-32 rounded-lg bg-gray-100 mb-3 overflow-hidden relative border border-gray-200">
                      {banner.image_url ? (
                        <img 
                          src={banner.image_url.startsWith('http') || banner.image_url.startsWith('/') ? banner.image_url : `http://localhost:8080${banner.image_url}`} 
                          alt="Banner" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                           <ImageIcon className="h-8 w-8" />
                        </div>
                      )}
                      <div className="absolute top-2 right-2">
                        <span className={`text-[9px] font-semibold px-2 py-0.5 rounded border whitespace-nowrap shadow-sm ${banner.is_active ? 'bg-green-50 text-green-600 border-green-200' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                          {banner.is_active ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <h5 className="text-xs font-bold text-gray-800 truncate">{banner.title}</h5>
                      <p className="text-[10px] text-orange-500 font-bold uppercase truncate">{banner.subtitle}</p>
                      <p className="text-[10px] text-gray-500 truncate" title={banner.href}>Link: {banner.href}</p>
                      <p className="text-[10px] text-gray-500 truncate mt-1">
                        Category: {categories.find(c => c.id === banner.categoryId)?.title || `ID: ${banner.categoryId}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-orange-500/10">
                    <button
                      onClick={() => handleToggleStatus(banner.id)}
                      disabled={togglingId === banner.id}
                      className={`flex items-center gap-1.5 text-[10px] font-bold transition-colors cursor-pointer disabled:opacity-50 ${banner.is_active ? 'text-gray-500 hover:text-gray-700' : 'text-orange-500 hover:text-orange-600'}`}
                    >
                      {togglingId === banner.id ? (
                        <Loader className="h-3 w-3 animate-spin" />
                      ) : banner.is_active ? (
                        <><ToggleRight className="h-4 w-4 text-orange-500" /> Disable</>
                      ) : (
                        <><ToggleLeft className="h-4 w-4 text-gray-400" /> Enable</>
                      )}
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(banner.id)}
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
                <Plus className="h-4 w-4 text-orange-500" /> Add New Discover More Banner
              </h5>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                {/* Left Col: Info */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-700 mb-1">Select Category</label>
                    <div className="relative" ref={dropdownRef}>
                      <div 
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="w-full flex items-center justify-between text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-orange-400 bg-white cursor-pointer"
                      >
                        <span className="truncate pr-2">
                          {selectedCategoryId 
                            ? categories.find(c => c.id === Number(selectedCategoryId))?.title || 'Select a category...' 
                            : 'Select a category...'}
                        </span>
                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                      </div>
                      
                      {isDropdownOpen && (
                        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                          <div 
                            onClick={() => { setSelectedCategoryId(''); setHref(''); setIsDropdownOpen(false); }}
                            className="px-3 py-2 hover:bg-gray-50 cursor-pointer text-xs text-gray-500 border-b border-gray-100"
                          >
                            Select a category...
                          </div>
                          {categories.map(c => {
                            const imgSrc = c.image_url;
                            const formattedImgSrc = imgSrc?.startsWith('http') || imgSrc?.startsWith('/') ? imgSrc : `http://localhost:8080${imgSrc}`;
                            return (
                              <div 
                                key={c.id}
                                onClick={() => { setSelectedCategoryId(c.id); setHref(c.href); setIsDropdownOpen(false); }}
                                className={`px-3 py-2 hover:bg-orange-50 cursor-pointer flex items-center gap-3 border-b border-gray-50 last:border-0 ${selectedCategoryId === c.id ? 'bg-orange-50' : ''}`}
                              >
                                {imgSrc ? (
                                  <img src={formattedImgSrc} alt="" className="w-8 h-8 rounded object-cover border border-gray-200 shrink-0" />
                                ) : (
                                  <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center shrink-0">
                                    <ImageIcon className="w-4 h-4 text-gray-300" />
                                  </div>
                                )}
                                <span className="text-xs font-medium text-gray-700 truncate">{c.title}</span>
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
                      placeholder="e.g. New Tech Gadgets"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-orange-400 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-700 mb-1">Subtitle</label>
                    <input
                      type="text"
                      placeholder="e.g. DISCOVER NOW"
                      value={subtitle}
                      onChange={(e) => setSubtitle(e.target.value)}
                      className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-orange-400 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-700 mb-1">Redirect Link (href)</label>
                    <input
                      type="text"
                      placeholder="Auto-filled from selected category"
                      value={href}
                      onChange={(e) => setHref(e.target.value)}
                      className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-orange-400 bg-white bg-gray-50"
                      readOnly
                    />
                  </div>
                </div>

                {/* Right Col: Image Upload */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-700 mb-1">Banner Image</label>
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 bg-white text-center flex flex-col items-center justify-center min-h-[160px] relative overflow-hidden group">
                    {imageUrl ? (
                      <>
                        <img 
                          src={imageUrl.startsWith('http') || imageUrl.startsWith('/') ? imageUrl : `http://localhost:8080${imageUrl}`}
                          alt="Preview" 
                          className="w-full h-full object-cover absolute inset-0"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-[10px] font-bold transition-colors"
                          >
                            Change Image
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="bg-orange-50 p-3 rounded-full mb-2">
                          <ImageIcon className="h-6 w-6 text-orange-400" />
                        </div>
                        <p className="text-xs text-gray-500 mb-1">Drop image or click to upload</p>
                        <p className="text-[9px] text-gray-400">JPEG, PNG, WebP (Max 5MB)</p>
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploading}
                          className="mt-3 px-4 py-1.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-[10px] font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                        >
                          {isUploading ? <Loader className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
                          {isUploading ? 'Uploading...' : 'Upload File'}
                        </button>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>

                </div>

              </div>

              <div className="mt-5 flex justify-end pt-4 border-t border-orange-500/10">
                <button
                  onClick={handleSaveBanner}
                  disabled={isSaving}
                  className="flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-500 shadow-md shadow-orange-500/20 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  {isSaving ? <Loader className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  {isSaving ? 'Creating...' : 'Create Discover More Banner'}
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center p-4 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-500 font-medium">
              Maximum of 2 banners reached. Delete an existing banner to add a new one.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
