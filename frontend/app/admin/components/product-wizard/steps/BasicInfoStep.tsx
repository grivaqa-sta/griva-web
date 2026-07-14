"use client";

import React, { useState } from "react";
import { Category, SubCategory, ProductRequest } from "@/app/types/types";
import { ChevronDown } from "lucide-react";

interface BasicInfoStepProps {
  formData: Partial<ProductRequest>;
  handleChange: (field: keyof ProductRequest, value: any) => void;
  handleTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubCategoryChange: (subId: number) => void;
  categories: Category[];
  subCategories: SubCategory[];
}

export default function BasicInfoStep({
  formData,
  handleChange,
  handleTitleChange,
  handleSubCategoryChange,
  categories,
  subCategories
}: BasicInfoStepProps) {
  const [openSubCategorySelect, setOpenSubCategorySelect] = useState(false);
  const [subCategorySearch, setSubCategorySearch] = useState("");

  const searchedSubCategories = subCategories.filter((s) => {
    const parentCat = categories.find(c => c.id === s.category_id);
    const fullName = `${parentCat ? parentCat.title + " " : ""}${s.title}`.toLowerCase();
    return fullName.includes(subCategorySearch.toLowerCase());
  });

  return (
    <div className="space-y-6 animate-step-fade">
      <div>
        <h3 className="text-base font-bold text-gray-900 mb-1">Basic Information</h3>
        <p className="text-xs text-gray-500">Provide name, slug, brand and categorization.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Title */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wide">Product Title *</label>
          <input
            required
            value={formData.title || ""}
            onChange={handleTitleChange}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-orange-500 outline-none transition-all"
            placeholder="e.g. iPhone 15 Pro"
          />
        </div>

        {/* Slug */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wide">Slug *</label>
          <input
            required
            disabled
            value={formData.slug || ""}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 text-gray-500 cursor-not-allowed outline-none"
            placeholder="slug-auto-generated"
          />
        </div>

        {/* Sub Category */}
        <div className="flex flex-col gap-1.5 relative z-20">
          <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wide">Sub Category *</label>
          <div className="relative">
            <input
              type="text"
              value={
                openSubCategorySelect
                  ? subCategorySearch
                  : (() => {
                      const s = subCategories.find(sub => sub.id === formData.subcategory_id);
                      if (!s) return "";
                      const parentCat = categories.find(c => c.id === s.category_id);
                      return parentCat ? `${parentCat.title} > ${s.title}` : s.title;
                    })()
              }
              onChange={(e) => {
                setSubCategorySearch(e.target.value);
                if (!openSubCategorySelect) setOpenSubCategorySelect(true);
              }}
              onFocus={() => {
                setOpenSubCategorySelect(true);
                setSubCategorySearch("");
              }}
              placeholder="Select Sub Category"
              className="w-full border border-gray-200 rounded-xl pl-4 pr-9 py-2.5 text-sm focus:border-orange-500 outline-none bg-white hover:border-gray-300 transition-colors text-gray-900 font-semibold placeholder:text-gray-400 placeholder:font-normal"
            />
            <ChevronDown
              size={16}
              onClick={() => setOpenSubCategorySelect(!openSubCategorySelect)}
              className={`absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 shrink-0 transition-transform cursor-pointer ${
                openSubCategorySelect ? "rotate-180 text-orange-500" : ""
              }`}
            />
          </div>

          {openSubCategorySelect && (
            <>
              <div
                className="fixed inset-0 z-40 bg-transparent cursor-default"
                onClick={() => {
                  setOpenSubCategorySelect(false);
                  setSubCategorySearch("");
                }}
              />
              <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-100 rounded-xl shadow-xl z-50 py-1 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 max-h-48 overflow-y-auto">
                {searchedSubCategories.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-gray-400 font-semibold">
                    No sub category found
                  </div>
                ) : (
                  searchedSubCategories.map((s) => {
                    const parentCat = categories.find(c => c.id === s.category_id);
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => {
                          handleSubCategoryChange(s.id);
                          setOpenSubCategorySelect(false);
                          setSubCategorySearch("");
                        }}
                        className={`w-full text-left px-3 py-2 text-sm font-semibold transition-colors ${
                          formData.subcategory_id === s.id
                            ? "text-orange-500 bg-orange-50/50 font-bold"
                            : "text-gray-700 hover:bg-orange-50 hover:text-orange-500"
                        }`}
                      >
                        {parentCat ? `${parentCat.title} > ` : ""}{s.title}
                      </button>
                    );
                  })
                )}
              </div>
            </>
          )}
        </div>

        {/* Brand */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wide">Brand</label>
          <input
            value={formData.brand || ""}
            onChange={(e) => handleChange("brand", e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-orange-500 outline-none transition-all"
            placeholder="e.g. Apple"
          />
        </div>

        {/* SKU */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wide">SKU</label>
          <input
            value={formData.sku || ""}
            onChange={(e) => handleChange("sku", e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-orange-500 outline-none transition-all"
            placeholder="SKU Code"
          />
        </div>
      </div>
    </div>
  );
}
