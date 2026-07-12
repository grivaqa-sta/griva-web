import React, { useRef, useState, useMemo } from "react";
import { ProductRequest } from "@/app/types/types";
import { Upload, Loader2, X, AlertCircle } from "lucide-react";
import { calculateDiscount } from "../productWizardUtils";

interface PricingMediaStepProps {
  formData: Partial<ProductRequest>;
  handleChange: (field: keyof ProductRequest, value: any) => void;
  handleMainImageFile: (file: File) => Promise<void>;
  handleGalleryFile: (files: FileList) => Promise<void>;
  isUploadingMain: boolean;
  isUploadingGallery: boolean;
  showVariantsStep: boolean;
  handleToggleVariantsStep: (val: boolean) => void;
}

export default function PricingMediaStep({
  formData,
  handleChange,
  handleMainImageFile,
  handleGalleryFile,
  isUploadingMain,
  isUploadingGallery,
  showVariantsStep,
  handleToggleVariantsStep
}: PricingMediaStepProps) {
  const mainImageRef = useRef<HTMLInputElement>(null);
  const galleryImagesRef = useRef<HTMLInputElement>(null);
  const [confirmMode, setConfirmMode] = useState<"enable" | "disable" | null>(null);

  // Check if variants exist to determine if stock field should be read-only
  const hasVariants = (formData.attributes?.length ?? 0) > 0 || (formData.variants?.length ?? 0) > 0 || showVariantsStep;

  // Calculate variant total stock count dynamically
  const variantTotalStock = useMemo(() => {
    if (!formData.variants || formData.variants.length === 0) return 0;
    const activeAttributes = formData.attributes || [];
    const filtered = formData.variants.filter((v: any) => {
      if (!v.combination) return false;
      const keys = Object.keys(v.combination);
      if (keys.length !== activeAttributes.length) return false;
      return activeAttributes.every((attr) => {
        const comboKey = keys.find(k => k.toLowerCase() === attr.name.toLowerCase());
        if (!comboKey) return false;
        const val = v.combination[comboKey];
        if (val === undefined) return false;
        return attr.values.some(opt => opt.toLowerCase() === val.toLowerCase());
      });
    });
    return filtered.reduce((sum, v) => sum + (v.stock || 0), 0);
  }, [formData.variants, formData.attributes]);

  const onMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleMainImageFile(file);
    }
  };

  const onGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleGalleryFile(files);
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    if (checked) {
      if ((formData.stock || 0) > 0) {
        setConfirmMode("enable");
      } else {
        handleToggleVariantsStep(true);
      }
    } else {
      const hasConfiguredVariants = (formData.attributes?.length ?? 0) > 0 || (formData.variants?.length ?? 0) > 0;
      if (hasConfiguredVariants) {
        setConfirmMode("disable");
      } else {
        handleToggleVariantsStep(false);
      }
    }
  };

  const confirmActivation = () => {
    handleToggleVariantsStep(true);
    handleChange("stock", variantTotalStock);
    setConfirmMode(null);
  };

  const confirmDeactivation = () => {
    handleToggleVariantsStep(false);
    handleChange("stock", variantTotalStock);
    setConfirmMode(null);
  };

  return (
    <div className="space-y-8 animate-step-fade">
      {/* Step Header */}
      <div>
        <h3 className="text-base font-bold text-gray-900 mb-1">Pricing & Media</h3>
        <p className="text-xs text-gray-500">Configure prices, inventory level and upload catalog media assets.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Pricing Card */}
        <div className="space-y-5 p-5 border border-orange-500/10 rounded-2xl bg-white shadow-xs">
          <h4 className="text-xs font-black uppercase text-orange-500 tracking-wider">Pricing & Stock</h4>
          
          <div className="grid grid-cols-2 gap-4">
            {/* Selling Price */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wide">Selling Price (QAR) *</label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.price || ""}
                onChange={(e) => {
                  const newPrice = parseFloat(e.target.value) || 0;
                  const originalPrice = formData.old_price || 0;
                  const discount = calculateDiscount(newPrice, originalPrice);
                  handleChange("price", newPrice);
                  handleChange("discount_percentage", discount);
                }}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-orange-500 outline-none transition-all font-semibold"
                placeholder="0.00"
              />
            </div>

            {/* Original Price */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wide">Original Price (QAR)</label>
              <input
                type="number"
                step="0.01"
                value={formData.old_price || ""}
                onChange={(e) => {
                  const originalPrice = parseFloat(e.target.value) || 0;
                  const sellingPrice = formData.price || 0;
                  const discount = calculateDiscount(sellingPrice, originalPrice);
                  handleChange("old_price", originalPrice);
                  handleChange("discount_percentage", discount);
                }}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-orange-500 outline-none transition-all font-semibold"
                placeholder="0.00"
              />
            </div>

            {/* Discount Percentage */}
            <div className="flex flex-col gap-1.5 col-span-2 md:col-span-1">
              <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wide">Discount (%)</label>
              <input
                type="number"
                value={formData.discount_percentage || ""}
                onChange={(e) => handleChange("discount_percentage", parseFloat(e.target.value) || 0)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-orange-500 outline-none transition-all"
                placeholder="0"
              />
            </div>

            {/* Inventory / Stock */}
            <div className="flex flex-col gap-1.5 col-span-2 md:col-span-1">
              {hasVariants ? (
                <div className="p-3 bg-orange-50/45 border border-orange-200/50 rounded-xl space-y-1.5">
                  <span className="text-[9px] text-orange-500 font-bold uppercase tracking-wider block">Inventory Managed by Variants</span>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-gray-500 font-semibold">Total Variant Stock</span>
                    <span className="text-xs font-black text-gray-900">{variantTotalStock} Units</span>
                  </div>
                  <span className="text-[8px] text-gray-400 block font-medium">Automatically calculated</span>
                </div>
              ) : (
                <div className="flex flex-col gap-1.5 w-full">
                  <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wide">Stock Count *</label>
                  <input
                    type="number"
                    required
                    value={formData.stock === undefined ? "" : formData.stock}
                    onChange={(e) => {
                      const val = Math.max(0, parseInt(e.target.value) || 0);
                      handleChange("stock", val);
                    }}
                    className="w-full border border-gray-200 text-gray-700 rounded-xl px-4 py-2.5 text-sm focus:border-orange-500 outline-none transition-all"
                    placeholder="0"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-gray-150 flex items-start gap-2.5">
            <input
              type="checkbox"
              id="has-variants-toggle"
              checked={showVariantsStep}
              onChange={handleCheckboxChange}
              className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500 mt-0.5 cursor-pointer"
            />
            <label htmlFor="has-variants-toggle" className="flex flex-col cursor-pointer select-none">
              <span className="text-xs font-bold text-gray-800">This product has options, like size or color</span>
              <span className="text-[10px] text-gray-400 font-medium">Enable this to generate and manage custom variant combinations in Step 4.</span>
            </label>
          </div>
        </div>

        {/* Enable Confirmation Modal */}
        {confirmMode === "enable" && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
            <div className="bg-white border border-orange-500/20 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-200 text-left">
              <div className="flex items-center gap-2.5 text-orange-500">
                <AlertCircle className="w-6 h-6 shrink-0" />
                <h3 className="text-sm font-black uppercase tracking-wide">Enable Variant Inventory?</h3>
              </div>
              
              <div className="text-[11px] text-gray-600 space-y-2.5 leading-relaxed">
                <p>
                  This product currently has <span className="font-bold text-gray-900">{formData.stock || 0} units</span> stored in Product Inventory.
                </p>
                <p>
                  Variant inventory currently contains <span className="font-bold text-gray-900">{variantTotalStock} units</span>.
                </p>
                <p className="bg-orange-50 border border-orange-200/50 p-2.5 rounded-xl text-orange-700 font-semibold">
                  After activation, Product Inventory will no longer be used. Inventory will be managed entirely by variants.
                </p>
                <div className="flex items-center justify-between pt-2 border-t border-gray-100 font-bold">
                  <span className="text-gray-700">Final Available Stock:</span>
                  <span className="text-xs text-orange-600">{variantTotalStock} Units</span>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setConfirmMode(null)}
                  className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold rounded-xl text-xs transition-colors cursor-pointer outline-none"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmActivation}
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer outline-none shadow-md shadow-orange-500/10"
                >
                  Activate Variants
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Disable Confirmation Modal */}
        {confirmMode === "disable" && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
            <div className="bg-white border border-red-500/20 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-200 text-left">
              <div className="flex items-center gap-2.5 text-red-500">
                <AlertCircle className="w-6 h-6 shrink-0" />
                <h3 className="text-sm font-black uppercase tracking-wide">Disable Option & Variant Inventory?</h3>
              </div>
              
              <div className="text-[11px] text-gray-650 space-y-2.5 leading-relaxed">
                <p className="bg-red-50 border border-red-200/50 p-2.5 rounded-xl text-red-700 font-semibold">
                  This action will delete all options, attribute combinations, and variant items configured for this product.
                </p>
                <p>
                  Inventory will switch back to a Simple Product with an editable stock count.
                </p>
                <div className="flex items-center justify-between pt-2 border-t border-gray-100 font-bold">
                  <span className="text-gray-700">Initial Stock Count:</span>
                  <span className="text-xs text-gray-900">{variantTotalStock} Units (Editable)</span>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setConfirmMode(null)}
                  className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-750 font-bold rounded-xl text-xs transition-colors cursor-pointer outline-none"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDeactivation}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer outline-none shadow-md shadow-red-500/10"
                >
                  Disable Variants
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Media Assets Card */}
        <div className="space-y-5 p-5 border border-orange-500/10 rounded-2xl bg-white shadow-xs">
          <h4 className="text-xs font-black uppercase text-orange-500 tracking-wider">Product Media</h4>

          {/* Main Image */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wide">Main Image *</label>
            <input
              type="file"
              ref={mainImageRef}
              accept="image/*"
              onChange={onMainImageChange}
              className="hidden"
              id="main-image-input"
              disabled={isUploadingMain}
            />
            <label
              htmlFor="main-image-input"
              className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-orange-300 hover:border-orange-500 rounded-xl cursor-pointer hover:bg-orange-50/30 transition-all ${
                isUploadingMain ? "opacity-50 pointer-events-none" : ""
              }`}
            >
              {formData.main_image_url ? (
                <div className="relative h-full w-full p-2 flex items-center justify-center bg-white rounded-xl">
                  <img src={formData.main_image_url} alt="Main Preview" className="h-full w-full object-contain rounded-lg" />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleChange("main_image_url", "");
                      if (mainImageRef.current) mainImageRef.current.value = "";
                    }}
                    className="absolute top-3 right-3 p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-sm"
                  >
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <div className="text-center p-4">
                  {isUploadingMain ? (
                    <Loader2 className="w-6 h-6 text-orange-500 mb-1.5 animate-spin mx-auto" />
                  ) : (
                    <Upload className="w-6 h-6 text-orange-400 mb-1.5 mx-auto" />
                  )}
                  <span className="text-xs text-gray-700 font-bold block">{isUploadingMain ? "Uploading Image..." : "Upload Main Image"}</span>
                  <span className="text-[10px] text-gray-400">Drag & drop or click (PNG, JPG up to 10MB)</span>
                </div>
              )}
            </label>
          </div>

          {/* Gallery Images */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wide">Gallery Images</label>
            <input
              type="file"
              ref={galleryImagesRef}
              accept="image/*"
              multiple
              onChange={onGalleryChange}
              className="hidden"
              id="gallery-images-input"
              disabled={isUploadingGallery}
            />
            <label
              htmlFor="gallery-images-input"
              className={`flex flex-col items-center justify-center w-full h-20 border-2 border-dashed border-gray-300 hover:border-orange-500 rounded-xl cursor-pointer hover:bg-gray-50/50 transition-all ${
                isUploadingGallery ? "opacity-50 pointer-events-none" : ""
              }`}
            >
              <div className="text-center">
                {isUploadingGallery ? (
                  <Loader2 className="w-5 h-5 text-orange-500 mb-1 animate-spin mx-auto" />
                ) : (
                  <Upload className="w-5 h-5 text-gray-400 mb-1 mx-auto" />
                )}
                <span className="text-xs text-gray-700 font-bold block">{isUploadingGallery ? "Uploading Gallery..." : "Upload Gallery Images"}</span>
              </div>
            </label>

            {formData.gallery_images && formData.gallery_images.length > 0 && (
              <div className="flex flex-wrap gap-2.5 mt-3">
                {formData.gallery_images.map((img, i) => (
                  <div key={i} className="relative group rounded-xl overflow-hidden border border-gray-150 w-16 h-16 bg-white shadow-2xs">
                    <img src={img} alt={`Gallery ${i}`} className="w-full h-full object-cover" />
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
    </div>
  );
}
