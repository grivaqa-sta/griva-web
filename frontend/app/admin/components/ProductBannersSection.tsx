import React, { useState, useEffect } from 'react';
import { Trash2, Check, X, Loader2, ChevronDown } from 'lucide-react';
import { productService } from '@/app/services/product.service';
import { ApiProduct } from '@/app/types/types';

const COLORS = [
  { id: '#1A3A2A', name: 'Dark Green', hex: '#1A3A2A' },
  { id: '#23264A', name: 'Dark Blue', hex: '#23264A' },
  { id: '#3A1A2A', name: 'Dark Red', hex: '#3A1A2A' },
];

export default function ProductBannersSection() {
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [saveSuccessId, setSaveSuccessId] = useState<number | null>(null);
  const [openDropdownSlot, setOpenDropdownSlot] = useState<number | null>(null);

  // Local state for edits
  const [edits, setEdits] = useState<Record<number, {
    is_banner: boolean;
    banner_background_color: string;
    tags: string[];
    href: string;
  }>>({});

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await productService.getProducts();
      const pData = res?.data || res;
      if (Array.isArray(pData)) {
        setProducts(pData);
        const initialEdits: any = {};
        pData.forEach((p: ApiProduct) => {
          if (p.is_banner) {
            initialEdits[p.id] = {
              is_banner: p.is_banner,
              banner_background_color: p.banner_background_color || COLORS[0].id,
              tags: p.tags || [],
              href: p.href || `/product/${p.id}`,
            };
          }
        });
        setEdits(initialEdits);
      }
    } catch (err) {
      console.error("Failed to load products for banners", err);
    }
    setLoading(false);
  };

  const handleAddBanner = async (productId: number) => {
    const prod = products.find(p => p.id === productId);
    if (!prod) return;

    setSavingId(productId);
    try {
      const defaultHref = `/product/${productId}`;
      
      // Immediately save it as a banner with default config
      await productService.updateBannerStatus(
        productId,
        true,
        defaultHref,
        prod.banner_background_color || COLORS[0].id,
        prod.tags || []
      );
      
      setProducts(prev => prev.map(p => 
        p.id === productId ? { ...p, is_banner: true, href: defaultHref } : p
      ));

      setEdits(prev => ({
        ...prev,
        [productId]: {
          is_banner: true,
          banner_background_color: prod.banner_background_color || COLORS[0].id,
          tags: prod.tags || [],
          href: defaultHref,
        }
      }));
    } catch (err) {
      console.error(err);
    }
    setSavingId(null);
  };

  const handleRemoveBanner = async (productId: number) => {
    setSavingId(productId);
    try {
      await productService.updateBannerStatus(productId, false);
      
      setProducts(prev => prev.map(p => 
        p.id === productId ? { ...p, is_banner: false } : p
      ));

      setEdits(prev => {
        const next = { ...prev };
        delete next[productId];
        return next;
      });
    } catch (err) {
      console.error(err);
    }
    setSavingId(null);
  };

  const handleSaveBannerConfig = async (id: number) => {
    const editData = edits[id];
    if (!editData) return;

    setSavingId(id);
    try {
      await productService.updateBannerStatus(
        id,
        true,
        editData.href,
        editData.banner_background_color,
        editData.tags
      );
      
      setProducts(prev => prev.map(p => 
        p.id === id ? {
          ...p,
          banner_background_color: editData.banner_background_color,
          tags: editData.tags,
          href: editData.href
        } : p
      ));
      
      setSaveSuccessId(id);
      setTimeout(() => setSaveSuccessId(null), 2500);
    } catch (err: any) {
      console.error(err);
    }
    setSavingId(null);
  };

  const updateEdit = (id: number, field: string, value: any) => {
    setEdits(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value
      }
    }));
  };

  const addTag = (id: number, tagInputId: string) => {
    const input = document.getElementById(tagInputId) as HTMLInputElement;
    if (input && input.value.trim()) {
      const newTag = input.value.trim();
      setEdits(prev => ({
        ...prev,
        [id]: {
          ...prev[id],
          tags: [...(prev[id].tags || []), newTag]
        }
      }));
      input.value = '';
    }
  };

  const removeTag = (id: number, indexToRemove: number) => {
    setEdits(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        tags: prev[id].tags.filter((_, i) => i !== indexToRemove)
      }
    }));
  };

  // Get active banners based on `edits`
  const activeBanners = products.filter(p => edits[p.id]?.is_banner);
  const availableProducts = products.filter(p => p.is_active && !edits[p.id]);

  // We enforce exactly 3 slots
  const SLOTS = [0, 1, 2];

  return (
    <div className="space-y-4">
      <div className="pb-3 border-b border-orange-500/20">
        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">E. Product Banners</h4>
        <p className="text-[10px] text-gray-400 mt-1">Manage up to 3 active product banners. Select a product for each slot below.</p>
      </div>

      {loading ? (
        <div className="flex justify-center p-8">
          <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SLOTS.map(slotIndex => {
            const product = activeBanners[slotIndex];

            // If slot is empty, show a Select Product dropdown
            if (!product) {
              return (
                <div key={`slot-${slotIndex}`} className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-start pt-12 min-h-[300px]">
                  <h5 className="text-sm font-bold text-gray-400 mb-4 uppercase tracking-wider">Banner Slot {slotIndex + 1}</h5>
                  <div className="relative w-full">
                    <button
                      type="button"
                      className="w-full flex items-center justify-between border border-gray-300 rounded-xl px-4 py-2.5 text-xs outline-none bg-white font-semibold text-gray-700 shadow-sm cursor-pointer hover:border-orange-500 focus:border-orange-500 transition-colors"
                      onClick={() => setOpenDropdownSlot(openDropdownSlot === slotIndex ? null : slotIndex)}
                    >
                      <span>+ Select Product to Add</span>
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    </button>
                    {openDropdownSlot === slotIndex && (
                      <>
                        <div 
                          className="fixed inset-0 z-40"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenDropdownSlot(null);
                          }}
                        />
                        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-56 overflow-y-auto overflow-x-hidden text-left">
                          {availableProducts.length > 0 ? (
                          availableProducts.map(p => (
                            <div
                              key={p.id}
                              className="flex items-center gap-3 px-3 py-2.5 hover:bg-orange-50 cursor-pointer border-b border-gray-50 last:border-0 transition-colors"
                              onClick={() => {
                                handleAddBanner(p.id);
                                setOpenDropdownSlot(null);
                              }}
                            >
                              <div className="w-8 h-8 rounded shrink-0 overflow-hidden bg-gray-100 flex items-center justify-center border border-gray-100">
                                {p.main_image_url ? (
                                  <img src={p.main_image_url} alt={p.title} className="w-full h-full object-contain" />
                                ) : (
                                  <span className="text-[8px] text-gray-400">No Img</span>
                                )}
                              </div>
                              <span className="text-xs text-gray-700 truncate flex-1">{p.title}</span>
                            </div>
                          ))
                        ) : (
                          <div className="px-4 py-3 text-xs text-center text-gray-500">No products available</div>
                        )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            }

            // If slot is filled, show config
            const editState = edits[product.id];
            const isSaving = savingId === product.id;

            return (
              <div key={product.id} className="bg-white border border-orange-500/30 rounded-2xl overflow-hidden shadow-sm flex flex-col">
                <div className="p-4 bg-orange-50/50 border-b border-orange-500/20 flex gap-4 items-start relative">
                  <div className="h-14 w-14 bg-white border border-orange-500/20 rounded-xl p-1 shrink-0">
                    {product.main_image_url ? (
                      <img src={product.main_image_url} alt={product.title} className="w-full h-full object-contain" />
                    ) : (
                      <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center text-[10px] text-gray-400">No Img</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 pr-8">
                    <span className="text-[10px] font-bold text-orange-500 uppercase tracking-widest block mb-1">Slot {slotIndex + 1}</span>
                    <h5 className="text-xs font-bold text-gray-900 line-clamp-2 leading-snug">{product.title}</h5>
                  </div>
                  
                  {/* Delete Button */}
                  <button
                    onClick={() => handleRemoveBanner(product.id)}
                    disabled={isSaving}
                    className="absolute top-4 right-4 p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    title="Remove Banner"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="p-4 space-y-4 flex-1">
                  {/* Color Selection */}
                  <div>
                    <label className="text-[10px] font-bold text-gray-700 block mb-2 uppercase tracking-wider">Background Color</label>
                    <div className="flex gap-2">
                      {COLORS.map(c => (
                        <button
                          key={c.id}
                          onClick={() => updateEdit(product.id, 'banner_background_color', c.id)}
                          className="w-7 h-7 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                          style={{ backgroundColor: c.hex }}
                          title={c.name}
                        >
                          {editState.banner_background_color === c.id && <Check className="w-3.5 h-3.5 text-white" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tags Management */}
                  <div>
                    <label className="text-[10px] font-bold text-gray-700 block mb-2 uppercase tracking-wider">Banner Tag (Max 1)</label>
                    <div className="flex gap-2 mb-2">
                      <input 
                        id={`tag-input-${product.id}`}
                        type="text"
                        placeholder="e.g. MEGA SALE"
                        disabled={editState.tags.length >= 1}
                        className="flex-1 text-xs border border-gray-200 rounded-lg px-3 py-1.5 focus:border-orange-500 outline-none disabled:bg-gray-50 disabled:text-gray-400"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (editState.tags.length < 1) addTag(product.id, `tag-input-${product.id}`);
                          }
                        }}
                      />
                      <button 
                        onClick={() => {
                          if (editState.tags.length < 1) addTag(product.id, `tag-input-${product.id}`);
                        }}
                        disabled={editState.tags.length >= 1}
                        className="px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg text-xs transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {editState.tags.map((tag, i) => (
                        <span key={i} className="text-[10px] bg-orange-50 text-orange-600 border border-orange-200 px-2 py-1 rounded-md flex items-center gap-1 font-semibold">
                          {tag}
                          <X className="w-3 h-3 cursor-pointer hover:text-red-500" onClick={() => removeTag(product.id, i)} />
                        </span>
                      ))}
                      {editState.tags.length === 0 && (
                        <span className="text-[10px] text-gray-400 italic">No tag added</span>
                      )}
                    </div>
                  </div>

                  {/* Banner Link / Href */}
                  <div>
                    <label className="text-[10px] font-bold text-gray-700 block mb-2 uppercase tracking-wider">Destination Link</label>
                    <input 
                      type="text"
                      value={editState.href}
                      disabled
                      className="w-full text-xs border border-gray-200 rounded-lg px-3 py-1.5 outline-none disabled:bg-gray-50 disabled:text-gray-400 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="p-4 border-t border-gray-100 bg-gray-50">
                  <button
                    onClick={() => handleSaveBannerConfig(product.id)}
                    disabled={isSaving || saveSuccessId === product.id}
                    className={`w-full flex items-center justify-center gap-2 px-5 py-2.5 text-white text-xs font-bold rounded-xl transition-colors disabled:opacity-60 ${
                      saveSuccessId === product.id 
                        ? "bg-green-500 hover:bg-green-600" 
                        : "bg-orange-500 hover:bg-orange-600"
                    }`}
                  >
                    {isSaving ? (
                      <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...</>
                    ) : saveSuccessId === product.id ? (
                      <><Check className="w-4 h-4" /> Saved Successfully!</>
                    ) : (
                      'Save Configuration'
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
