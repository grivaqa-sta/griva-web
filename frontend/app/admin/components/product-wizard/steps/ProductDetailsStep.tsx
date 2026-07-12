"use client";

import React, { useState } from "react";
import { ProductRequest, ProductSpecification } from "@/app/types/types";
import { X, Sparkles, HelpCircle } from "lucide-react";
import { WarrantyData } from "../productWizardUtils";

interface ProductDetailsStepProps {
  formData: Partial<ProductRequest>;
  handleChange: (field: keyof ProductRequest, value: any) => void;
  warranty: WarrantyData;
  handleWarrantyChange: (warranty: WarrantyData) => void;
}

export default function ProductDetailsStep({
  formData,
  handleChange,
  warranty,
  handleWarrantyChange
}: ProductDetailsStepProps) {
  const [newSpecName, setNewSpecName] = useState("");
  const [newSpecValue, setNewSpecValue] = useState("");
  
  // Specifications paste block state
  const [pasteSpecsBlock, setPasteSpecsBlock] = useState("");
  const [showPasteZone, setShowPasteZone] = useState(false);

  const [newTag, setNewTag] = useState("");

  const addSpec = () => {
    if (newSpecName.trim() && newSpecValue.trim()) {
      const currentSpecs = formData.specifications || [];
      // Prevent duplicates
      if (!currentSpecs.some(s => s.name.toLowerCase() === newSpecName.trim().toLowerCase())) {
        handleChange("specifications", [
          ...currentSpecs,
          { name: newSpecName.trim(), value: newSpecValue.trim() }
        ]);
      }
      setNewSpecName("");
      setNewSpecValue("");
    }
  };

  const handlePasteSpecs = () => {
    if (!pasteSpecsBlock.trim()) return;
    
    // Parse specs: splits by newline or comma, expects Key: Value
    const currentSpecs = [...(formData.specifications || [])];
    const lines = pasteSpecsBlock.split(/[,\n]+/);
    
    let addedCount = 0;
    lines.forEach(line => {
      const parts = line.split(":");
      if (parts.length >= 2) {
        const key = parts[0].trim();
        const value = parts.slice(1).join(":").trim(); // join remaining in case value had colon
        if (key && value && !currentSpecs.some(s => s.name.toLowerCase() === key.toLowerCase())) {
          currentSpecs.push({ name: key, value });
          addedCount++;
        }
      }
    });

    if (addedCount > 0) {
      handleChange("specifications", currentSpecs);
      setPasteSpecsBlock("");
      setShowPasteZone(false);
    }
  };

  const removeSpec = (index: number) => {
    const specs = (formData.specifications || []).filter((_, i) => i !== index);
    handleChange("specifications", specs);
  };

  const addTag = () => {
    if (newTag.trim()) {
      const currentTags = formData.tags || [];
      if (!currentTags.includes(newTag.trim())) {
        handleChange("tags", [...currentTags, newTag.trim()]);
      }
      setNewTag("");
    }
  };

  const removeTag = (index: number) => {
    const tags = (formData.tags || []).filter((_, i) => i !== index);
    handleChange("tags", tags);
  };

  // Filter out internal warranty specs so we don't display them in the general specs list
  const displaySpecs = (formData.specifications || []).filter(
    s => s.name !== "Warranty Title" && s.name !== "Warranty Description"
  );

  return (
    <div className="space-y-8 animate-step-fade">
      {/* Step Header */}
      <div>
        <h3 className="text-base font-bold text-gray-900 mb-1">Product Details</h3>
        <p className="text-xs text-gray-500">Provide descriptions, product specifications, warranty info and search tags.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left Side: Descriptions & Warranty */}
        <div className="space-y-6">
          <div className="p-5 border border-orange-500/10 rounded-2xl bg-white shadow-xs space-y-4">
            <h4 className="text-xs font-black uppercase text-orange-500 tracking-wider">Descriptions</h4>
            
            {/* Short Description */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wide">Short Description</label>
              <textarea
                rows={2}
                value={formData.short_description || ""}
                onChange={(e) => handleChange("short_description", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-orange-500 outline-none transition-all resize-none"
                placeholder="Brief summary of the product features"
              />
            </div>

            {/* Full Description */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wide">Full Description</label>
              <textarea
                rows={5}
                value={formData.description || ""}
                onChange={(e) => handleChange("description", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-orange-500 outline-none transition-all resize-none"
                placeholder="Detailed specifications, review, features..."
              />
            </div>
          </div>

          {/* Warranty Card */}
          <div className="p-5 border border-orange-500/10 rounded-2xl bg-white shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase text-orange-500 tracking-wider">Warranty Information</h4>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={warranty.enabled}
                  onChange={(e) => handleWarrantyChange({ ...warranty, enabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-200 hover:bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-500"></div>
              </label>
            </div>

            {warranty.enabled && (
              <div className="space-y-3.5 animate-in fade-in duration-200">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-650 uppercase">Warranty Title</label>
                  <input
                    value={warranty.title}
                    onChange={(e) => handleWarrantyChange({ ...warranty, title: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-xs focus:border-orange-500 outline-none"
                    placeholder="e.g. 1 Year Local Warranty"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-650 uppercase">Warranty Description</label>
                  <textarea
                    rows={2}
                    value={warranty.description}
                    onChange={(e) => handleWarrantyChange({ ...warranty, description: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-xs focus:border-orange-500 outline-none resize-none"
                    placeholder="e.g. Covers manufacturer hardware defects. Battery wear and tear excluded."
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Specifications & Tags */}
        <div className="space-y-6">
          
          {/* Specifications Card */}
          <div className="p-5 border border-orange-500/10 rounded-2xl bg-white shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase text-orange-500 tracking-wider">Specifications</h4>
              <button
                type="button"
                onClick={() => setShowPasteZone(!showPasteZone)}
                className="text-[10px] text-orange-600 hover:underline flex items-center gap-1 font-bold"
              >
                <Sparkles size={12} />
                {showPasteZone ? "Manual Builder" : "AI Paste Mode"}
              </button>
            </div>

            {showPasteZone ? (
              <div className="space-y-3.5 animate-in fade-in duration-200">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-gray-400 font-bold uppercase">Paste Spec Block (Key: Value)</span>
                  <textarea
                    rows={3}
                    value={pasteSpecsBlock}
                    onChange={(e) => setPasteSpecsBlock(e.target.value)}
                    placeholder="Material: Cotton, Color: White, Weight: 120g&#10;Or paste one per line"
                    className="w-full border border-gray-200 rounded-xl p-3 text-xs focus:border-orange-500 outline-none resize-none font-mono"
                  />
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-[9px] text-gray-400">Separate key-value by colon (:), entries by commas or newlines.</span>
                    <button
                      type="button"
                      onClick={handlePasteSpecs}
                      className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-xs font-bold transition-colors"
                    >
                      Parse & Add
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  placeholder="Key (e.g. Material)"
                  value={newSpecName}
                  onChange={(e) => setNewSpecName(e.target.value)}
                  className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:border-orange-500 outline-none"
                />
                <input
                  placeholder="Value (e.g. Cotton)"
                  value={newSpecValue}
                  onChange={(e) => setNewSpecValue(e.target.value)}
                  className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:border-orange-500 outline-none"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addSpec();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={addSpec}
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer shrink-0"
                >
                  Add
                </button>
              </div>
            )}

            {/* Specs List */}
            {displaySpecs.length > 0 && (
              <div className="flex flex-col gap-2 pt-2">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Configured Specs:</span>
                <div className="flex flex-wrap gap-1.5">
                  {displaySpecs.map((spec, index) => {
                    // Find actual index in original specifications array
                    const originalIdx = formData.specifications!.findIndex(
                      s => s.name === spec.name && s.value === spec.value
                    );
                    return (
                      <span
                        key={index}
                        className="text-[10px] bg-gray-50 border border-gray-200 text-gray-700 px-2.5 py-1 rounded-lg flex items-center gap-1.5"
                      >
                        <span className="font-bold text-gray-900">{spec.name}:</span>
                        <span>{spec.value}</span>
                        <X
                          size={12}
                          className="text-gray-400 hover:text-red-500 cursor-pointer"
                          onClick={() => removeSpec(originalIdx)}
                        />
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Tags Card */}
          <div className="p-5 border border-orange-500/10 rounded-2xl bg-white shadow-xs space-y-4">
            <h4 className="text-xs font-black uppercase text-orange-500 tracking-wider">Search Tags</h4>

            <div className="flex gap-2">
              <input
                placeholder="e.g. summer, discount, electronics"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag();
                  }
                }}
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:border-orange-500 outline-none"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer shrink-0"
              >
                Add Tag
              </button>
            </div>

            {formData.tags && formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {formData.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="text-[10px] bg-orange-50 text-orange-600 border border-orange-200/50 font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1.5"
                  >
                    {tag}
                    <X
                      size={12}
                      className="text-orange-400 hover:text-orange-700 cursor-pointer"
                      onClick={() => removeTag(i)}
                    />
                  </span>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
