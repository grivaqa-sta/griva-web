"use client";
import React, { useState, useEffect, useRef } from "react";
import { Sparkles, X, Upload, Link as LinkIcon, ImageIcon, Loader2 } from "lucide-react";
import { ProductRequest, Category, SubCategory } from "@/app/types/types";
import { productService } from "@/app/services/product.service";
import { uploadService } from "@/app/services/upload.service";

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  productToEdit?: any;
  categories: Category[];
  subCategories: SubCategory[];
}

export default function AddProductModal({ isOpen, onClose, onSuccess, productToEdit, categories, subCategories }: AddProductModalProps) {
  const [formData, setFormData] = useState<Partial<ProductRequest>>({
    title: "",
    slug: "",
    subcategory_id: 0,
    short_description: "",
    description: "",
    price: 0,
    old_price: 0,
    discount_percentage: 0,
    stock: 0,
    sku: "",
    brand: "",
    main_image_url: "",
    gallery_images: [],
    variants: [],
    specifications: [],
    tags: [],
    is_featured: false,
    is_best_seller: false,
    is_trending: false,
    is_new: true,
    is_active: true,
    meta_title: "",
    meta_description: ""
  });

  const [selectedCategory, setSelectedCategory] = useState<number>(0);
  const [newGalleryImage, setNewGalleryImage] = useState("");
  const [newTag, setNewTag] = useState("");
  const [newSpecName, setNewSpecName] = useState("");
  const [newSpecValue, setNewSpecValue] = useState("");
  const [newVariantColor, setNewVariantColor] = useState("");
  const [newVariantSize, setNewVariantSize] = useState("");
  const [loading, setLoading] = useState(false);
  const [isUploadingMain, setIsUploadingMain] = useState(false);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const [error, setError] = useState("");

  const mainImageFileRef = useRef<HTMLInputElement>(null);
  const galleryFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (productToEdit) {
      setFormData({
        title: productToEdit.title || "",
        slug: productToEdit.slug || "",
        subcategory_id: productToEdit.subcategory_id || 0,
        short_description: productToEdit.short_description || "",
        description: productToEdit.description || "",
        price: productToEdit.price || 0,
        old_price: productToEdit.old_price || 0,
        discount_percentage: productToEdit.discount_percentage || 0,
        stock: productToEdit.stock || 0,
        sku: productToEdit.sku || "",
        brand: productToEdit.brand || "",
        main_image_url: productToEdit.main_image_url || "",
        gallery_images: productToEdit.gallery_images || [],
        variants: productToEdit.variants || [],
        specifications: productToEdit.specifications || [],
        tags: productToEdit.tags || [],
        is_featured: productToEdit.is_featured || false,
        is_best_seller: productToEdit.is_best_seller || false,
        is_trending: productToEdit.is_trending || false,
        is_new: productToEdit.is_new || false,
        is_active: productToEdit.is_active !== undefined ? productToEdit.is_active : true,
        meta_title: productToEdit.meta_title || "",
        meta_description: productToEdit.meta_description || ""
      });

      // Find the category of the existing subcategory
      const sub = subCategories.find(s => s.id === productToEdit.subcategory_id);
      if (sub) {
        setSelectedCategory(sub.category_id);
      }
    }
  }, [productToEdit, subCategories]);

  const handleChange = (field: keyof ProductRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    setFormData(prev => ({ ...prev, title, slug }));
  };

  const handleSubCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const subId = Number(e.target.value);
    const sub = subCategories.find(s => s.id === subId);
    let newSku = formData.sku;

    if (sub) {
      const prefix = sub.title.substring(0, 3).toUpperCase();
      const randomDigits = Math.floor(10000 + Math.random() * 90000);
      newSku = `${prefix}${randomDigits}`;
    }

    setFormData(prev => ({ ...prev, subcategory_id: subId, sku: newSku }));
  };

  const handleMainImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploadingMain(true);
    setError("");
    try {
      const data = await uploadService.uploadImage(file);
      if (data && data.imageUrl) {
        handleChange("main_image_url", data.imageUrl);
      } else {
        setError("Failed to upload main image. No URL returned.");
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to upload main image.");
    }
    setIsUploadingMain(false);
    if (mainImageFileRef.current) mainImageFileRef.current.value = "";
  };

  const handleGalleryFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setIsUploadingGallery(true);
    setError("");
    try {
      const uploadedUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const data = await uploadService.uploadImage(files[i]);
        if (data && data.imageUrl) {
          uploadedUrls.push(data.imageUrl);
        }
      }
      handleChange("gallery_images", [...(formData.gallery_images || []), ...uploadedUrls]);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to upload gallery images.");
    }
    setIsUploadingGallery(false);
    if (galleryFileRef.current) galleryFileRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.slug || !formData.subcategory_id || !formData.price || !formData.main_image_url) {
      setError("Please fill all required fields (Title, Slug, SubCategory, Price, Main Image).");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const payload = { ...formData, subcategory_id: Number(formData.subcategory_id) } as ProductRequest;
      if (productToEdit) {
        await productService.updateProduct(productToEdit.id, payload);
      } else {
        await productService.createProduct(payload);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to save product. Please check the inputs.");
    }
    setLoading(false);
  };

  const addGalleryImage = () => {
    if (newGalleryImage) {
      handleChange("gallery_images", [...(formData.gallery_images || []), newGalleryImage]);
      setNewGalleryImage("");
    }
  };

  const addTag = () => {
    if (newTag) {
      handleChange("tags", [...(formData.tags || []), newTag]);
      setNewTag("");
    }
  };

  const addSpec = () => {
    if (newSpecName && newSpecValue) {
      handleChange("specifications", [...(formData.specifications || []), { name: newSpecName, value: newSpecValue }]);
      setNewSpecName("");
      setNewSpecValue("");
    }
  };

  const addVariant = () => {
    if (newVariantColor || newVariantSize) {
      handleChange("variants", [...(formData.variants || []), { color: newVariantColor, size: newVariantSize }]);
      setNewVariantColor("");
      setNewVariantSize("");
    }
  };

  const filteredSubCategories = subCategories.filter(s => s.category_id === selectedCategory);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-orange-500/20 rounded-3xl w-full max-w-4xl max-h-[90vh] shadow-2xl flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-orange-500" />
            <h4 className="text-lg font-bold text-gray-900 tracking-tight">
              {productToEdit ? "Edit Product" : "Add New Product"}
            </h4>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {error && <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 font-semibold">{error}</div>}

          <form id="productForm" onSubmit={handleSubmit} className="space-y-8">

            {/* Basic Info */}
            <div>
              <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Basic Information</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-gray-700 block mb-1">Product Title *</label>
                  <input
                    required
                    value={formData.title}
                    onChange={handleTitleChange}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-orange-500 outline-none"
                    placeholder="e.g. iPhone 15 Pro"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-700 block mb-1">Slug *</label>
                  <input
                    required
                    disabled
                    value={formData.slug}
                    onChange={(e) => handleChange("slug", e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 text-gray-500 cursor-not-allowed outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-700 block mb-1">Sub Category *</label>
                  <select
                    required
                    value={formData.subcategory_id}
                    onChange={handleSubCategoryChange}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-orange-500 outline-none bg-white"
                  >
                    <option value={0} disabled>Select Sub Category</option>
                    {subCategories.map(s => {
                      const parentCat = categories.find(c => c.id === s.category_id);
                      return <option key={s.id} value={s.id}>{parentCat ? `${parentCat.title} > ` : ''}{s.title}</option>
                    })}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-700 block mb-1">Brand</label>
                  <input
                    value={formData.brand || ""}
                    onChange={(e) => handleChange("brand", e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-orange-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-700 block mb-1">SKU</label>
                  <input
                    value={formData.sku || ""}
                    onChange={(e) => handleChange("sku", e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-orange-500 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Pricing & Stock */}
            <div>
              <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Pricing & Inventory</h5>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-gray-700 block mb-1">Price ($) *</label>
                  <input
                    type="number" step="0.01" required
                    value={formData.price || ""}
                    onChange={(e) => handleChange("price", parseFloat(e.target.value))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-orange-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-700 block mb-1">Old Price ($)</label>
                  <input
                    type="number" step="0.01"
                    value={formData.old_price || ""}
                    onChange={(e) => handleChange("old_price", parseFloat(e.target.value))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-orange-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-700 block mb-1">Discount (%)</label>
                  <input
                    type="number"
                    value={formData.discount_percentage || ""}
                    onChange={(e) => handleChange("discount_percentage", parseFloat(e.target.value))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-orange-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-700 block mb-1">Stock *</label>
                  <input
                    type="number" required
                    value={formData.stock || ""}
                    onChange={(e) => handleChange("stock", parseInt(e.target.value))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-orange-500 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Descriptions */}
            <div>
              <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Descriptions</h5>
              <div className="space-y-4">
                <div>
                  <label className="text-[11px] font-bold text-gray-700 block mb-1">Short Description</label>
                  <textarea
                    rows={2}
                    value={formData.short_description || ""}
                    onChange={(e) => handleChange("short_description", e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-orange-500 outline-none resize-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-700 block mb-1">Full Description</label>
                  <textarea
                    rows={4}
                    value={formData.description || ""}
                    onChange={(e) => handleChange("description", e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-orange-500 outline-none resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Media */}
            <div>
              <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Media & Images</h5>
              <div className="space-y-6">

                {/* Main Image */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[11px] font-bold text-gray-700">Main Image *</label>
                  </div>

                  <div>
                    <input
                      ref={mainImageFileRef}
                      type="file"
                      accept="image/*"
                      onChange={handleMainImageFile}
                      className="hidden"
                      id="main-image-file-input"
                      disabled={isUploadingMain}
                    />
                    <label
                      htmlFor="main-image-file-input"
                      className={`flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-orange-300 rounded-xl cursor-pointer hover:bg-orange-50 transition-colors ${isUploadingMain ? 'opacity-50 pointer-events-none' : ''}`}
                    >
                      {formData.main_image_url ? (
                        <img src={formData.main_image_url} alt="Preview" className="h-full w-full object-contain rounded-xl p-1" />
                      ) : (
                        <>
                          {isUploadingMain ? (
                            <Loader2 className="w-6 h-6 text-orange-400 mb-1 animate-spin" />
                          ) : (
                            <Upload className="w-6 h-6 text-orange-400 mb-1" />
                          )}
                          <span className="text-xs text-gray-400 font-semibold">{isUploadingMain ? 'Uploading...' : 'Click to upload'}</span>
                          <span className="text-[10px] text-gray-300">PNG, JPG, WEBP up to 10MB</span>
                        </>
                      )}
                    </label>
                    {formData.main_image_url && !isUploadingMain && (
                      <button
                        type="button"
                        onClick={() => { handleChange("main_image_url", ""); if (mainImageFileRef.current) mainImageFileRef.current.value = ""; }}
                        className="mt-1 text-[10px] text-red-400 hover:text-red-600 font-semibold"
                      >
                        Remove image
                      </button>
                    )}
                  </div>
                </div>

                {/* Gallery Images */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[11px] font-bold text-gray-700">Gallery Images</label>
                  </div>

                  <div>
                    <input
                      ref={galleryFileRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleGalleryFile}
                      className="hidden"
                      id="gallery-file-input"
                      disabled={isUploadingGallery}
                    />
                    <label
                      htmlFor="gallery-file-input"
                      className={`flex flex-col items-center justify-center w-full h-20 border-2 border-dashed border-orange-300 rounded-xl cursor-pointer hover:bg-orange-50 transition-colors ${isUploadingGallery ? 'opacity-50 pointer-events-none' : ''}`}
                    >
                      {isUploadingGallery ? (
                        <Loader2 className="w-5 h-5 text-orange-400 mb-1 animate-spin" />
                      ) : (
                        <Upload className="w-5 h-5 text-orange-400 mb-1" />
                      )}
                      <span className="text-xs text-gray-400 font-semibold">{isUploadingGallery ? 'Uploading...' : 'Click to upload multiple'}</span>
                    </label>
                  </div>

                  {formData.gallery_images && formData.gallery_images.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {formData.gallery_images.map((img, i) => (
                        <div key={i} className="relative group rounded-lg overflow-hidden border border-gray-200 w-16 h-16">
                          <img src={img} alt="Gallery" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleChange("gallery_images", formData.gallery_images!.filter((_, j) => j !== i))}
                            className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </div>

            {/* Specs & Variants */}
            <div>
              <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Specs, Variants & Tags</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Specs */}
                <div>
                  <label className="text-[11px] font-bold text-gray-700 block mb-1">Specifications</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      placeholder="Name (e.g. Color)"
                      value={newSpecName} onChange={(e) => setNewSpecName(e.target.value)}
                      className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-orange-500 outline-none"
                    />
                    <input
                      placeholder="Value (e.g. Red)"
                      value={newSpecValue} onChange={(e) => setNewSpecValue(e.target.value)}
                      className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-orange-500 outline-none"
                    />
                    <button type="button" onClick={addSpec} className="px-3 bg-gray-100 font-bold rounded-xl text-xs">Add</button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {formData.specifications?.map((s, i) => (
                      <span key={i} className="text-[10px] bg-gray-50 border border-gray-200 px-2 py-1 rounded flex items-center gap-1">
                        <b>{s.name}:</b> {s.value}
                        <X className="w-3 h-3 text-red-500 cursor-pointer" onClick={() => handleChange("specifications", formData.specifications!.filter((_, j) => j !== i))} />
                      </span>
                    ))}
                  </div>
                </div>

                {/* Variants */}
                <div>
                  <label className="text-[11px] font-bold text-gray-700 block mb-1">Variants</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      placeholder="Color"
                      value={newVariantColor} onChange={(e) => setNewVariantColor(e.target.value)}
                      className="w-20 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-orange-500 outline-none"
                    />
                    <input
                      placeholder="Size"
                      value={newVariantSize} onChange={(e) => setNewVariantSize(e.target.value)}
                      className="w-20 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-orange-500 outline-none"
                    />
                    <button type="button" onClick={addVariant} className="px-3 bg-gray-100 font-bold rounded-xl text-xs">Add</button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {formData.variants?.map((v, i) => (
                      <span key={i} className="text-[10px] bg-gray-50 border border-gray-200 px-2 py-1 rounded flex items-center gap-1">
                        C:{v.color} S:{v.size}
                        <X className="w-3 h-3 text-red-500 cursor-pointer" onClick={() => handleChange("variants", formData.variants!.filter((_, j) => j !== i))} />
                      </span>
                    ))}
                  </div>
                </div>

                {/* Tags */}
                <div className="md:col-span-2">
                  <label className="text-[11px] font-bold text-gray-700 block mb-1">Tags</label>
                  <div className="flex gap-2 max-w-sm mb-2">
                    <input
                      placeholder="e.g. sale, winter, electronics"
                      value={newTag} onChange={(e) => setNewTag(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                      className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-orange-500 outline-none"
                    />
                    <button type="button" onClick={addTag} className="px-3 bg-gray-100 font-bold rounded-xl text-xs">Add</button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {formData.tags?.map((t, i) => (
                      <span key={i} className="text-[10px] bg-orange-50 text-orange-600 border border-orange-200 px-2 py-1 rounded flex items-center gap-1 font-semibold">
                        {t}
                        <X className="w-3 h-3 cursor-pointer" onClick={() => handleChange("tags", formData.tags!.filter((_, j) => j !== i))} />
                      </span>
                    ))}
                  </div>
                </div>

              </div>
            </div>

            {/* Visibility & Flags */}
            <div>
              <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Flags & Status</h5>
              <div className="flex flex-wrap gap-6">
                {[
                  { id: "is_active", label: "Is Active" },
                  { id: "is_featured", label: "Featured" },
                  { id: "is_best_seller", label: "Best Seller" },
                  { id: "is_trending", label: "Trending" },
                  { id: "is_new", label: "New Arrival" }
                ].map((flag) => (
                  <label key={flag.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(formData[flag.id as keyof ProductRequest])}
                      onChange={(e) => handleChange(flag.id as keyof ProductRequest, e.target.checked)}
                      className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                    />
                    <span className="text-sm font-semibold text-gray-700">{flag.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* SEO */}
            <div>
              <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">SEO (Optional)</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-gray-700 block mb-1">Meta Title</label>
                  <input
                    value={formData.meta_title || ""}
                    onChange={(e) => handleChange("meta_title", e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-orange-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-700 block mb-1">Meta Description</label>
                  <input
                    value={formData.meta_description || ""}
                    onChange={(e) => handleChange("meta_description", e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-orange-500 outline-none"
                  />
                </div>
              </div>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 shrink-0 flex justify-end gap-3 bg-gray-50/50">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-bold rounded-xl hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            form="productForm"
            type="submit"
            disabled={loading}
            className="px-8 py-2.5 bg-orange-500 text-white text-sm font-bold rounded-xl hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Product"}
          </button>
        </div>

      </div>
    </div>
  );
}