"use client";

import React from "react";
import { ProductRequest, Category, SubCategory } from "@/app/types/types";
import { Check, Edit, AlertCircle } from "lucide-react";

interface SeoPublishStepProps {
  formData: Partial<ProductRequest>;
  handleChange: (field: keyof ProductRequest, value: any) => void;
  categories: Category[];
  subCategories: SubCategory[];
  goToStep: (step: number) => void;
}

export default function SeoPublishStep({
  formData,
  handleChange,
  categories,
  subCategories,
  goToStep
}: SeoPublishStepProps) {
  
  // Lookup Category and Subcategory Name
  const subCategoryName = (() => {
    const s = subCategories.find(sub => sub.id === formData.subcategory_id);
    if (!s) return "Not Selected";
    const parentCat = categories.find(c => c.id === s.category_id);
    return parentCat ? `${parentCat.title} > ${s.title}` : s.title;
  })();

  const specCount = (formData.specifications || []).filter(
    s => s.name !== "Warranty Title" && s.name !== "Warranty Description"
  ).length;

  const warrantyEnabled = (formData.specifications || []).some(
    s => s.name === "Warranty Title" || s.name === "Warranty Description"
  );

  return (
    <div className="space-y-8 animate-step-fade">
      {/* Step Header */}
      <div>
        <h3 className="text-base font-bold text-gray-900 mb-1">SEO & Publish</h3>
        <p className="text-xs text-gray-500">Add metadata for search engines and verify settings before publishing.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left Side: SEO & Status Toggles */}
        <div className="space-y-6">
          {/* SEO Metadata Card */}
          <div className="p-5 border border-orange-500/10 rounded-2xl bg-white shadow-xs space-y-4">
            <h4 className="text-xs font-black uppercase text-orange-500 tracking-wider">Search Engine Optimization</h4>
            
            {/* Meta Title */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wide">Meta Title</label>
              <input
                value={formData.meta_title || ""}
                onChange={(e) => handleChange("meta_title", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-orange-500 outline-none transition-all"
                placeholder="Meta title for Google search results"
              />
            </div>

            {/* Meta Description */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wide">Meta Description</label>
              <textarea
                rows={3}
                value={formData.meta_description || ""}
                onChange={(e) => handleChange("meta_description", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-orange-500 outline-none transition-all resize-none"
                placeholder="Brief summary shown below title in search results"
              />
            </div>
          </div>

          {/* Visibility and Status Flags */}
          <div className="p-5 border border-orange-500/10 rounded-2xl bg-white shadow-xs space-y-4">
            <h4 className="text-xs font-black uppercase text-orange-500 tracking-wider">Product Visibility & Badges</h4>
            
            <div className="grid grid-cols-2 gap-4">
              {[
                { id: "is_active", label: "Is Active", desc: "Visible to customers" },
                { id: "is_new", label: "New Arrival", desc: "Shows on new section" },
                { id: "is_featured", label: "Featured Product", desc: "Highlight on home" },
                { id: "is_best_seller", label: "Best Seller", desc: "Top selling item badge" },
                { id: "is_trending", label: "Trending Item", desc: "Hot trends section badge" }
              ].map((flag) => (
                <div key={flag.id} className="flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    id={`flag-${flag.id}`}
                    checked={Boolean(formData[flag.id as keyof ProductRequest])}
                    onChange={(e) => handleChange(flag.id as keyof ProductRequest, e.target.checked)}
                    className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500 mt-0.5 cursor-pointer"
                  />
                  <label htmlFor={`flag-${flag.id}`} className="flex flex-col cursor-pointer">
                    <span className="text-xs font-bold text-gray-800">{flag.label}</span>
                    <span className="text-[9px] text-gray-400 font-medium">{flag.desc}</span>
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Review Summary before publishing */}
        <div className="p-5 border border-orange-500/10 rounded-2xl bg-white shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-black uppercase text-orange-500 tracking-wider mb-3">📋 Review Summary</h4>
            <p className="text-[11px] text-gray-400 mb-4">Double check product configurations. Click Edit icon next to sections to modify details.</p>
            
            <div className="divide-y divide-gray-100 text-xs">
              {/* Product Name */}
              <div className="py-2.5 flex justify-between items-center">
                <div>
                  <span className="text-gray-400 font-medium block text-[9px] uppercase tracking-wide">Product Title</span>
                  <span className="font-bold text-gray-800">{formData.title || "Not Specified"}</span>
                </div>
                <button type="button" onClick={() => goToStep(1)} className="text-gray-400 hover:text-orange-500">
                  <Edit size={14} />
                </button>
              </div>

              {/* Categorization */}
              <div className="py-2.5 flex justify-between items-center">
                <div>
                  <span className="text-gray-400 font-medium block text-[9px] uppercase tracking-wide">Category</span>
                  <span className="font-bold text-gray-800">{subCategoryName}</span>
                </div>
                <button type="button" onClick={() => goToStep(1)} className="text-gray-400 hover:text-orange-500">
                  <Edit size={14} />
                </button>
              </div>

              {/* Pricing & Stock */}
              <div className="py-2.5 flex justify-between items-center">
                <div>
                  <span className="text-gray-400 font-medium block text-[9px] uppercase tracking-wide">Pricing & Stock</span>
                  <span className="font-bold text-gray-900">
                    QAR {Number(formData.price || 0).toFixed(2)}{" "}
                    {formData.old_price ? (
                      <span className="text-[10px] text-gray-400 font-medium line-through">
                        (was QAR {Number(formData.old_price).toFixed(2)})
                      </span>
                    ) : null}
                    {" · "}
                    <span className="text-orange-500">{formData.stock || 0} in stock</span>
                  </span>
                </div>
                <button type="button" onClick={() => goToStep(2)} className="text-gray-400 hover:text-orange-500">
                  <Edit size={14} />
                </button>
              </div>

              {/* Media assets summary */}
              <div className="py-2.5 flex justify-between items-center">
                <div>
                  <span className="text-gray-400 font-medium block text-[9px] uppercase tracking-wide">Media Attachments</span>
                  <span className="font-bold text-gray-800">
                    Main Image: {formData.main_image_url ? "✓ Uploaded" : "❌ Missing"}{" · "}
                    Gallery: {formData.gallery_images?.length || 0} images
                  </span>
                </div>
                <button type="button" onClick={() => goToStep(2)} className="text-gray-400 hover:text-orange-500">
                  <Edit size={14} />
                </button>
              </div>

              {/* Description & specs */}
              <div className="py-2.5 flex justify-between items-center">
                <div>
                  <span className="text-gray-400 font-medium block text-[9px] uppercase tracking-wide">Details & Specifications</span>
                  <span className="font-bold text-gray-800">
                    Specs: {specCount} configured
                    {warrantyEnabled ? " · Warranty: ✓ Active" : " · Warranty: ❌ Inactive"}
                  </span>
                </div>
                <button type="button" onClick={() => goToStep(3)} className="text-gray-400 hover:text-orange-500">
                  <Edit size={14} />
                </button>
              </div>

              {/* Variants */}
              <div className="py-2.5 flex justify-between items-center">
                <div>
                  <span className="text-gray-400 font-medium block text-[9px] uppercase tracking-wide">Options & Variants</span>
                  <span className="font-bold text-gray-800">
                    Options: {formData.attributes?.length || 0} configured{" · "}
                    Variants: {formData.variants?.length || 0} generated
                  </span>
                </div>
                <button type="button" onClick={() => goToStep(4)} className="text-gray-400 hover:text-orange-500">
                  <Edit size={14} />
                </button>
              </div>
            </div>
          </div>

          {!formData.main_image_url && (
            <div className="flex items-center gap-1.5 text-[10px] text-red-500 bg-red-50 border border-red-200/50 rounded-xl p-2.5">
              <AlertCircle size={14} className="shrink-0" />
              <span>Main Image is required in Step 2 before publishing this product.</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
