"use client";

import React, { useState, useEffect } from "react";
import { ProductRequest } from "@/app/types/types";
import { HelpCircle, ChevronDown, ChevronRight, X, Trash2, Plus, Sparkles, AlertCircle, CheckCircle2 } from "lucide-react";

interface VariantsStepProps {
  formData: Partial<ProductRequest>;
  handleChange: (field: keyof ProductRequest, value: any) => void;
  addOption: (name: string, valuesStr: string) => void;
  deleteOption: (index: number) => void;
  addNestedOption: (name: string) => void;
  addOptionValue: (value: string) => void;
  deleteOptionValue: (attrName: string, value: string) => void;
  addNestedOptionValue: (attrName: string, value: string, parentVal: string, qty?: number) => void;
  activateSubVariant: (parentVal: string, childAttrName: string, childVal: string) => void;
  addVariantForParent: (parentVal: string) => void;
  deleteVariantRow: (index: number) => void;
  updateVariantCombo: (varIdx: number, attrName: string, value: string) => void;
  updateVariantField: (varIdx: number, field: string, value: any) => void;
  isUploadingVariant: Record<number, boolean>;
  handleVariantImageUpload: (globalIdx: number, file: File) => Promise<void>;
}

export default function VariantsStep({
  formData,
  handleChange,
  addOption,
  deleteOption,
  addNestedOption,
  addOptionValue,
  deleteOptionValue,
  addNestedOptionValue,
  activateSubVariant,
  addVariantForParent,
  deleteVariantRow,
  updateVariantCombo,
  updateVariantField,
  isUploadingVariant,
  handleVariantImageUpload
}: VariantsStepProps) {
  // Option creator states
  const [tempAttrName, setTempAttrName] = useState("");
  const [tempAttrValuesStr, setTempAttrValuesStr] = useState("");
  const [showHelp, setShowHelp] = useState(true);
  const [justGenerated, setJustGenerated] = useState(false);

  // Group expand/collapse states (keyed by parent value)
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  // Inline forms states for nested options
  const [nestedOptionInputs, setNestedOptionInputs] = useState<Record<string, string>>({});
  const [nestedOptionValInputs, setNestedOptionValInputs] = useState<Record<string, string>>({});
  const [nestedOptionValQty, setNestedOptionValQty] = useState<Record<string, number>>({});
  const [newParentValInput, setNewParentValInput] = useState("");

  const presets = ["Color", "Size", "Storage", "RAM", "Weight", "Material", "Length", "Capacity", "Pattern"];

  // Auto expand newly added groups
  useEffect(() => {
    if (formData.attributes?.[0]?.values) {
      const newExp: Record<string, boolean> = { ...expandedGroups };
      formData.attributes[0].values.forEach(val => {
        if (newExp[val] === undefined) {
          newExp[val] = false; // Collapsed by default
        }
      });
      setExpandedGroups(newExp);
    }
  }, [formData.attributes]);

  // AI-friendly input handler: split by colon if pasted in Option Name
  const handleOptionNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val.includes(":")) {
      const parts = val.split(":");
      setTempAttrName(parts[0].trim());
      setTempAttrValuesStr(parts[1].trim());
    } else {
      setTempAttrName(val);
    }
  };

  const handlePresetClick = (preset: string) => {
    setTempAttrName(preset);
  };

  const handleGenerate = () => {
    if (tempAttrName.trim() && tempAttrValuesStr.trim()) {
      addOption(tempAttrName.trim(), tempAttrValuesStr.trim());
      setTempAttrName("");
      setTempAttrValuesStr("");
      setJustGenerated(true);
      setTimeout(() => setJustGenerated(false), 5000);
    }
  };

  // Duplicate option name check
  const isDuplicateName = formData.attributes?.some(
    attr => attr.name.toLowerCase() === tempAttrName.trim().toLowerCase()
  );

  // Duplicate values check
  const valueTokens = tempAttrValuesStr.split(",").map(v => v.trim().toLowerCase()).filter(Boolean);
  const hasDuplicateValues = valueTokens.some((val, idx) => valueTokens.indexOf(val) !== idx);

  // Exclude checking for disable generate button
  const canGenerate = tempAttrName.trim() && tempAttrValuesStr.trim() && !isDuplicateName && !hasDuplicateValues;

  const previewValues = tempAttrValuesStr
    .split(",")
    .map(v => v.trim())
    .filter(Boolean);

  const [deleteTarget, setDeleteTarget] = useState<{ attrName: string; value: string; activeGroups: string[] } | null>(null);

  const getActiveParentValuesForValue = (attrName: string, value: string) => {
    const pAttr = formData.attributes?.[0];
    if (!pAttr) return [];
    
    const activeParents = new Set<string>();
    (formData.variants || []).forEach((v: any) => {
      if (v.combination) {
        const keys = Object.keys(v.combination);
        const comboKey = keys.find(k => k.toLowerCase() === attrName.toLowerCase());
        if (comboKey && String(v.combination[comboKey]).toLowerCase() === value.toLowerCase()) {
          const parentVal = v.combination[pAttr.name];
          if (parentVal) {
            activeParents.add(parentVal);
          }
        }
      }
    });
    return Array.from(activeParents);
  };

  const handleDeleteOptionValueClick = (attrName: string, value: string, currentParentVal?: string) => {
    const activeParents = getActiveParentValuesForValue(attrName, value);
    const otherActiveParents = activeParents.filter(p => p !== currentParentVal);
    
    if (otherActiveParents.length > 0) {
      setDeleteTarget({
        attrName,
        value,
        activeGroups: otherActiveParents
      });
    } else {
      deleteOptionValue(attrName, value);
    }
  };

  const parentAttr = formData.attributes?.[0];
  const childAttrs = formData.attributes?.slice(1) || [];

  const totalVariantStock = React.useMemo(() => {
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

  return (
    <div className="space-y-8 animate-step-fade">
      {/* Step Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-gray-900 mb-1">Product Options & Variants</h3>
          <p className="text-xs text-gray-500">Configure customizable option details like sizes, colors or storage options.</p>
        </div>
        <button
          type="button"
          onClick={() => setShowHelp(!showHelp)}
          className="text-xs text-orange-600 hover:text-orange-700 flex items-center gap-1 font-bold"
        >
          <HelpCircle size={14} />
          {showHelp ? "Hide Help Guide" : "Show Help Guide"}
        </button>
      </div>

      {/* Total Variant Inventory summary widget */}
      {formData.attributes && formData.attributes.length > 0 && (
        <div className="p-4 bg-orange-50/50 border border-orange-200/50 rounded-2xl flex items-center justify-between shadow-2xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <span className="text-lg">📦</span>
            <div>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Total Variant Inventory</span>
              <span className="text-[9px] text-gray-505 font-semibold">Sum of all active variant quantities</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-base font-black text-orange-600 block leading-none">{totalVariantStock} Units</span>
            <span className="text-[8px] text-orange-400 font-bold uppercase tracking-wider">Managed by Variants</span>
          </div>
        </div>
      )}

      {/* Help Card */}
      {showHelp && (
        <div className="wizard-help-card animate-in fade-in duration-200">
          <h4 className="text-xs font-black uppercase text-orange-500 tracking-wider mb-3 flex items-center gap-1.5">
            <span>💡</span> How Product Options & Variants Work
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-[11px] text-gray-650">
            <div className="space-y-1">
              <span className="font-bold text-gray-800">Step 1: Create an Option</span>
              <p className="text-gray-500">Enter a name like Color or Size, or click a popular preset.</p>
            </div>
            <div className="space-y-1">
              <span className="font-bold text-gray-800">Step 2: Enter Option Values</span>
              <p className="text-gray-500">Add multiple values separated by commas (e.g. Black, White, Pink).</p>
            </div>
            <div className="space-y-1">
              <span className="font-bold text-gray-800">Step 3: Generate Variants</span>
              <p className="text-gray-500">Click Generate to build the combination catalog matrix rows.</p>
            </div>
            <div className="space-y-1">
              <span className="font-bold text-gray-800">Step 4: Configure Rows</span>
              <p className="text-gray-500">Configure override prices, individual stock counts and upload images.</p>
            </div>
          </div>
        </div>
      )}

      {/* Option Creator Card */}
      <div className="p-5 border border-orange-500/10 rounded-2xl bg-white shadow-xs space-y-4">
        <h4 className="text-xs font-black uppercase text-orange-500 tracking-wider">Create New Option</h4>

        {/* Presets */}
        <div className="space-y-1.5">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Popular Presets:</span>
          <div className="flex flex-wrap gap-1.5">
            {presets.map(p => (
              <button
                key={p}
                type="button"
                onClick={() => handlePresetClick(p)}
                className="wizard-preset-chip"
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-gray-700 uppercase">Option Name</label>
            <input
              value={tempAttrName}
              onChange={handleOptionNameChange}
              placeholder="e.g. Color, Size, Storage"
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-xs focus:border-orange-500 outline-none"
            />
            <span className="text-[9px] text-gray-400">Examples: Color, Size. Tip: paste 'Color: Red, Blue' to auto-split!</span>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-gray-700 uppercase">Option Values (separated by commas)</label>
            <input
              value={tempAttrValuesStr}
              onChange={(e) => setTempAttrValuesStr(e.target.value)}
              placeholder="e.g. Black, White, Gold"
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-xs focus:border-orange-500 outline-none"
            />
            <span className="text-[9px] text-gray-400">Separate multiple values by commas (e.g. S, M, L)</span>
          </div>
        </div>

        {/* Duplicate Validation */}
        {isDuplicateName && (
          <div className="flex items-center gap-1.5 text-[10px] text-red-500">
            <AlertCircle size={12} />
            <span>Option '{tempAttrName}' already exists.</span>
          </div>
        )}
        {hasDuplicateValues && (
          <div className="flex items-center gap-1.5 text-[10px] text-red-500">
            <AlertCircle size={12} />
            <span>Duplicate value detected in your comma list.</span>
          </div>
        )}

        {/* Live Preview */}
        {previewValues.length > 0 && !hasDuplicateValues && (
          <div className="wizard-live-preview-container">
            <span className="text-[10px] text-gray-400 font-bold block w-full mb-1">Will create option values:</span>
            {previewValues.map((val, idx) => (
              <span key={idx} className="wizard-live-preview-chip">
                ✓ {val}
              </span>
            ))}
          </div>
        )}

        {/* Generate Button */}
        <div className="flex justify-end pt-2">
          <button
            type="button"
            disabled={!canGenerate}
            onClick={handleGenerate}
            className="px-5 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-colors shrink-0 cursor-pointer shadow-md shadow-orange-500/10"
          >
            Generate Variants
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {justGenerated && (
        <div className="wizard-success-banner flex items-center gap-2 animate-in slide-in-from-top-3 duration-250">
          <CheckCircle2 size={16} />
          <span>✔ Successfully created variants. Now configure stock, price and images in the list below.</span>
        </div>
      )}

      {/* Configured Options Summary list */}
      {formData.attributes && formData.attributes.length > 0 && (
        <div className="p-5 border border-orange-500/10 rounded-2xl bg-white shadow-xs space-y-3">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Configured Options:</span>
          <div className="flex flex-wrap gap-2.5">
            {formData.attributes.map((attr, idx) => (
              <span key={idx} className="text-[10px] bg-gray-50 border border-orange-500/10 text-gray-700 px-3 py-1.5 rounded-xl flex items-center gap-2">
                <span className="font-bold text-orange-500">{attr.name}:</span>
                <div className="flex items-center gap-1 flex-wrap">
                  {attr.values.map(val => (
                    <span key={val} className="flex items-center gap-1 bg-white border border-gray-200 px-1.5 py-0.5 rounded-md">
                      {val}
                      <X
                        className="w-3 h-3 text-gray-400 hover:text-red-500 cursor-pointer"
                        onClick={() => handleDeleteOptionValueClick(attr.name, val)}
                      />
                    </span>
                  ))}
                </div>
                <X
                  className="w-4 h-4 text-red-500 hover:text-red-700 cursor-pointer ml-1 border-l border-gray-250 pl-1.5"
                  onClick={() => deleteOption(idx)}
                />
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Variant Lists grouped by Parent attribute */}
      {parentAttr && parentAttr.values.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-orange-100 pb-2.5 flex-wrap gap-2">
            <h4 className="text-[11px] font-black text-orange-600 uppercase tracking-wider">
              Variant Management (by {parentAttr.name})
            </h4>
            
            {/* Inline add new parent option value */}
            <div className="flex items-center gap-2">
              <input
                placeholder={`Add new ${parentAttr.name} (e.g. Red)`}
                value={newParentValInput}
                onChange={(e) => setNewParentValInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addOptionValue(newParentValInput);
                    setNewParentValInput("");
                  }
                }}
                className="border border-orange-200 bg-white rounded-xl px-3.5 py-1.5 text-xs focus:border-orange-500 outline-none w-44 font-semibold text-gray-700"
              />
              <button
                type="button"
                onClick={() => {
                  addOptionValue(newParentValInput);
                  setNewParentValInput("");
                }}
                className="px-3.5 py-1.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer shrink-0"
              >
                + Add {parentAttr.name}
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {parentAttr.values.map((parentVal) => {
              const groupVariants = (formData.variants || []).filter(
                (v: any) => v.combination && v.combination[parentAttr.name] === parentVal
              );
              const isExpanded = !!expandedGroups[parentVal];

              return (
                <div key={parentVal} className="border border-gray-150 rounded-2xl bg-white shadow-2xs overflow-hidden">
                  
                  {/* Collapsible Group Header */}
                  <div
                    onClick={() => setExpandedGroups(prev => ({ ...prev, [parentVal]: !prev[parentVal] }))}
                    className="variant-group-header"
                  >
                    <div className="flex items-center gap-2">
                      {isExpanded ? <ChevronDown size={16} className="text-gray-500" /> : <ChevronRight size={16} className="text-gray-500" />}
                      <span className="text-xs font-bold text-gray-800">
                        {parentAttr.name}: <span className="text-orange-500">{parentVal}</span>
                      </span>
                      <span className="text-[10px] bg-orange-50 text-orange-600 font-bold px-2 py-0.5 rounded-full">
                        {groupVariants.length} variants
                      </span>
                    </div>

                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      {childAttrs.length > 1 && (
                        <button
                          type="button"
                          onClick={() => addVariantForParent(parentVal)}
                          className="px-2.5 py-1 bg-orange-50 hover:bg-orange-100 text-orange-600 font-bold rounded-xl text-[10px] transition-colors border border-orange-100 cursor-pointer flex items-center gap-1"
                        >
                          + Add Variant Combination
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => deleteOptionValue(parentAttr.name, parentVal)}
                        className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl text-[10px] transition-colors border border-red-100 cursor-pointer flex items-center gap-1"
                      >
                        <Trash2 size={12} />
                        Delete Group
                      </button>
                    </div>
                  </div>

                  {/* Expanded group content */}
                  {isExpanded && (
                    <div className="p-4 border-t border-gray-150 space-y-4 bg-gray-50/20">
                      
                      {childAttrs.length === 0 ? (
                        /* Case 1: No sub options yet */
                        <div>
                          {(() => {
                            const v = groupVariants[0];
                            if (!v) {
                              return (
                                <button
                                  type="button"
                                  onClick={() => addVariantForParent(parentVal)}
                                  className="w-full py-2.5 bg-orange-50/20 hover:bg-orange-50/50 border border-dashed border-orange-200 text-orange-600 font-bold rounded-xl text-[10px] transition-colors cursor-pointer flex items-center justify-center gap-1"
                                >
                                  Activate Variant Row for {parentVal}
                                </button>
                              );
                            }

                            const globalIdx = formData.variants!.findIndex((x) => {
                               if (!x.combination || !v.combination) return false;
                               const xKeys = Object.keys(x.combination);
                               const vKeys = Object.keys(v.combination);
                               if (xKeys.length !== vKeys.length) return false;
                               return xKeys.every(k => String(x.combination[k]).toLowerCase() === String(v.combination[k]).toLowerCase());
                             });
                            return (
                              <div className="flex flex-wrap items-center gap-4 bg-white border border-gray-150 rounded-xl p-3 shadow-2xs">
                                {/* Stock adjust */}
                                <div className="flex flex-col gap-0.5 w-[110px]">
                                  <span className="text-[9px] text-gray-400 font-bold uppercase">Qty / Stock</span>
                                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden w-full bg-white">
                                    <button
                                      type="button"
                                      onClick={() => updateVariantField(globalIdx, "stock", Math.max(0, (v.stock || 0) - 1))}
                                      className="px-2.5 py-1 text-xs hover:bg-gray-50 font-bold border-r border-gray-250"
                                    >
                                      -
                                    </button>
                                    <input
                                      type="number"
                                      value={v.stock === undefined ? 10 : v.stock}
                                      onChange={(e) => updateVariantField(globalIdx, "stock", parseInt(e.target.value) || 0)}
                                      className="w-12 text-center text-xs focus:outline-none border-none py-1 font-semibold"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => updateVariantField(globalIdx, "stock", (v.stock || 0) + 1)}
                                      className="px-2.5 py-1 text-xs hover:bg-gray-50 font-bold border-l border-gray-250"
                                    >
                                      +
                                    </button>
                                  </div>
                                </div>

                                {/* SKU */}
                                <div className="flex flex-col gap-0.5 w-[145px]">
                                  <span className="text-[9px] text-gray-400 font-bold uppercase">SKU (Auto-Generated)</span>
                                  <input
                                    value={v.sku || ""}
                                    onChange={(e) => updateVariantField(globalIdx, "sku", e.target.value)}
                                    className="border border-gray-200 rounded-lg px-2.5 py-1 text-xs focus:border-orange-500 outline-none w-full font-mono"
                                  />
                                </div>

                                {/* Price */}
                                <div className="flex flex-col gap-0.5 w-[85px]">
                                  <span className="text-[9px] text-gray-400 font-bold uppercase">Selling Price</span>
                                  <input
                                    type="number"
                                    step="0.01"
                                    placeholder={formData.price ? String(formData.price) : "Override"}
                                    value={v.price || ""}
                                    onChange={(e) => updateVariantField(globalIdx, "price", e.target.value ? parseFloat(e.target.value) : "")}
                                    className="border border-gray-200 rounded-lg px-2.5 py-1 text-xs focus:border-orange-500 outline-none w-full text-center font-semibold"
                                  />
                                </div>

                                {/* Original Price */}
                                <div className="flex flex-col gap-0.5 w-[85px]">
                                  <span className="text-[9px] text-gray-400 font-bold uppercase">Original Price</span>
                                  <input
                                    type="number"
                                    step="0.01"
                                    placeholder={formData.old_price ? String(formData.old_price) : "Override"}
                                    value={v.old_price || ""}
                                    onChange={(e) => updateVariantField(globalIdx, "old_price", e.target.value ? parseFloat(e.target.value) : "")}
                                    className="border border-gray-200 rounded-lg px-2.5 py-1 text-xs focus:border-orange-500 outline-none w-full text-center font-semibold"
                                  />
                                </div>

                                {/* Variant Image */}
                                <div className="flex flex-col gap-0.5">
                                  <span className="text-[9px] text-gray-400 font-bold uppercase">Image</span>
                                  {v.images && v.images[0] ? (
                                    <div className="relative h-7 w-7 rounded-lg border bg-white overflow-hidden group/img">
                                      <img src={v.images[0]} className="h-full w-full object-contain" />
                                      <button
                                        type="button"
                                        onClick={() => updateVariantField(globalIdx, "images", [])}
                                        className="absolute inset-0 bg-black/60 text-white flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity text-[8px]"
                                      >
                                        ❌
                                      </button>
                                    </div>
                                  ) : (
                                    <label className="h-7 px-2 border border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-white cursor-pointer hover:bg-gray-50 text-[10px] text-gray-500 font-bold gap-1">
                                      {isUploadingVariant[globalIdx] ? "Uploading..." : "Upload"}
                                      <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        disabled={isUploadingVariant[globalIdx]}
                                        onChange={async (e) => {
                                          const file = e.target.files?.[0];
                                          if (file) await handleVariantImageUpload(globalIdx, file);
                                        }}
                                      />
                                    </label>
                                  )}
                                </div>

                                <button
                                  type="button"
                                  onClick={() => deleteVariantRow(globalIdx)}
                                  className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors ml-auto border border-gray-200"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            );
                          })()}

                          {/* Sub Options / Nested prompt */}
                          <div className="mt-4 pt-4 border-t border-dashed border-gray-200 flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-gray-150">
                            <span className="text-[10px] text-gray-500 font-bold uppercase">Want to add nested options (e.g. Size, Storage) for {parentVal}?</span>
                            <div className="flex gap-2">
                              <input
                                placeholder="Nested option name (e.g. Size)"
                                value={nestedOptionInputs[parentVal] || ""}
                                onChange={(e) => setNestedOptionInputs(prev => ({ ...prev, [parentVal]: e.target.value }))}
                                className="border border-gray-200 rounded-lg px-2.5 py-1 text-xs focus:border-orange-500 outline-none w-44"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  addNestedOption(nestedOptionInputs[parentVal]);
                                  setNestedOptionInputs(prev => ({ ...prev, [parentVal]: "" }));
                                }}
                                className="px-3.5 py-1.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer shrink-0"
                              >
                                Create Nested Option
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : childAttrs.length === 1 ? (
                        /* Case 2: Exactly 1 sub option */
                        <div className="space-y-3">
                          {/* Inner value addition */}
                          <div className="flex items-center justify-between mb-4 bg-orange-50/30 border border-orange-500/10 rounded-xl p-3.5 gap-3 flex-wrap shadow-2xs">
                            <span className="text-[10px] text-gray-500 font-bold uppercase">Add value to {childAttrs[0].name} (e.g. 128GB, S):</span>
                            <div className="flex gap-2 items-center">
                              <input
                                placeholder="e.g. 128GB, 256GB"
                                value={nestedOptionValInputs[parentVal] || ""}
                                onChange={(e) => setNestedOptionValInputs(prev => ({ ...prev, [parentVal]: e.target.value }))}
                                className="border border-gray-200 bg-white rounded-lg px-2.5 py-1 text-xs focus:border-orange-500 outline-none w-36"
                              />
                              <div className="flex items-center gap-1.5">
                                <span className="text-[9px] text-gray-400 font-bold uppercase">Qty:</span>
                                <input
                                  type="number"
                                  placeholder="10"
                                  value={nestedOptionValQty[parentVal] === undefined ? "" : nestedOptionValQty[parentVal]}
                                  onChange={(e) => {
                                    const val = e.target.value ? parseInt(e.target.value) : 10;
                                    setNestedOptionValQty(prev => ({ ...prev, [parentVal]: val }));
                                  }}
                                  className="border border-gray-200 bg-white rounded-lg px-2 py-1 text-xs focus:border-orange-500 outline-none w-14 text-center"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  const qty = nestedOptionValQty[parentVal] === undefined ? 10 : nestedOptionValQty[parentVal];
                                  addNestedOptionValue(childAttrs[0].name, nestedOptionValInputs[parentVal], parentVal, qty);
                                  setNestedOptionValInputs(prev => ({ ...prev, [parentVal]: "" }));
                                  setNestedOptionValQty(prev => {
                                    const copy = { ...prev };
                                    delete copy[parentVal];
                                    return copy;
                                  });
                                }}
                                className="px-3.5 py-1.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer"
                              >
                                Add Option
                              </button>
                            </div>
                          </div>

                          {/* Loop through each values in child option */}
                          <div className="space-y-2">
                            {childAttrs[0].values.map((childVal) => {
                              const v = groupVariants.find(
                                (x: any) => x.combination && x.combination[childAttrs[0].name] === childVal
                              );

                              if (!v) {
                                return (
                                  <div key={childVal} className="flex items-center justify-between bg-white border border-dashed border-gray-250 rounded-xl p-3.5 shadow-2xs">
                                    <span className="text-xs font-semibold text-gray-400">
                                      {childAttrs[0].name}: <b className="text-gray-500">{childVal}</b> (Inactive)
                                    </span>
                                    <div className="flex items-center gap-2">
                                      <button
                                        type="button"
                                        onClick={() => activateSubVariant(parentVal, childAttrs[0].name, childVal)}
                                        className="px-3 py-1 bg-white border border-gray-200 hover:bg-orange-50 hover:border-orange-200 text-gray-600 hover:text-orange-600 font-bold rounded-lg text-[10px] transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                                      >
                                        + Activate Option
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteOptionValueClick(childAttrs[0].name, childVal, parentVal)}
                                        className="p-1.5 text-gray-450 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-gray-200"
                                      >
                                        <Trash2 size={12} />
                                      </button>
                                    </div>
                                  </div>
                                );
                              }

                              const globalIdx = formData.variants!.findIndex((x) => {
                               if (!x.combination || !v.combination) return false;
                               const xKeys = Object.keys(x.combination);
                               const vKeys = Object.keys(v.combination);
                               if (xKeys.length !== vKeys.length) return false;
                               return xKeys.every(k => String(x.combination[k]).toLowerCase() === String(v.combination[k]).toLowerCase());
                             });
                              return (
                                <div key={childVal} className="flex flex-wrap items-center gap-4 bg-white border border-gray-150 rounded-xl p-3 shadow-2xs">
                                  {/* Child Label */}
                                  <div className="flex flex-col gap-0.5 min-w-[90px]">
                                    <span className="text-[9px] text-gray-400 font-bold uppercase">{childAttrs[0].name}</span>
                                    <span className="text-xs font-bold text-gray-800 py-1">{childVal}</span>
                                  </div>

                                  {/* Qty */}
                                  <div className="flex flex-col gap-0.5 w-[110px]">
                                    <span className="text-[9px] text-gray-400 font-bold uppercase">Qty / Stock</span>
                                    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden w-full bg-white">
                                      <button
                                        type="button"
                                        onClick={() => updateVariantField(globalIdx, "stock", Math.max(0, (v.stock || 0) - 1))}
                                        className="px-2.5 py-1 text-xs hover:bg-gray-55 font-bold border-r border-gray-250"
                                      >
                                        -
                                      </button>
                                      <input
                                        type="number"
                                        value={v.stock === undefined ? 10 : v.stock}
                                        onChange={(e) => updateVariantField(globalIdx, "stock", parseInt(e.target.value) || 0)}
                                        className="w-12 text-center text-xs focus:outline-none border-none py-1 font-semibold"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => updateVariantField(globalIdx, "stock", (v.stock || 0) + 1)}
                                        className="px-2.5 py-1 text-xs hover:bg-gray-55 font-bold border-l border-gray-250"
                                      >
                                        +
                                      </button>
                                    </div>
                                  </div>

                                  {/* SKU */}
                                  <div className="flex flex-col gap-0.5 w-[145px]">
                                    <span className="text-[9px] text-gray-400 font-bold uppercase">SKU (Auto-Generated)</span>
                                    <input
                                      value={v.sku || ""}
                                      onChange={(e) => updateVariantField(globalIdx, "sku", e.target.value)}
                                      className="border border-gray-200 rounded-lg px-2.5 py-1 text-xs focus:border-orange-500 outline-none w-full font-mono"
                                    />
                                  </div>

                                  {/* Price */}
                                  <div className="flex flex-col gap-0.5 w-[85px]">
                                    <span className="text-[9px] text-gray-400 font-bold uppercase">Selling Price</span>
                                    <input
                                      type="number"
                                      step="0.01"
                                      placeholder={formData.price ? String(formData.price) : "Override"}
                                      value={v.price || ""}
                                      onChange={(e) => updateVariantField(globalIdx, "price", e.target.value ? parseFloat(e.target.value) : "")}
                                      className="border border-gray-200 rounded-lg px-2.5 py-1 text-xs focus:border-orange-500 outline-none w-full text-center font-semibold"
                                    />
                                  </div>

                                  {/* Original Price */}
                                  <div className="flex flex-col gap-0.5 w-[85px]">
                                    <span className="text-[9px] text-gray-400 font-bold uppercase">Original Price</span>
                                    <input
                                      type="number"
                                      step="0.01"
                                      placeholder={formData.old_price ? String(formData.old_price) : "Override"}
                                      value={v.old_price || ""}
                                      onChange={(e) => updateVariantField(globalIdx, "old_price", e.target.value ? parseFloat(e.target.value) : "")}
                                      className="border border-gray-200 rounded-lg px-2.5 py-1 text-xs focus:border-orange-500 outline-none w-full text-center font-semibold"
                                    />
                                  </div>

                                  {/* Variant Image */}
                                  <div className="flex flex-col gap-0.5">
                                    <span className="text-[9px] text-gray-400 font-bold uppercase">Image</span>
                                    {v.images && v.images[0] ? (
                                      <div className="relative h-7 w-7 rounded-lg border bg-white overflow-hidden group/img">
                                        <img src={v.images[0]} className="h-full w-full object-contain" />
                                        <button
                                          type="button"
                                          onClick={() => updateVariantField(globalIdx, "images", [])}
                                          className="absolute inset-0 bg-black/60 text-white flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity text-[8px]"
                                        >
                                          ❌
                                        </button>
                                      </div>
                                    ) : (
                                      <label className="h-7 px-2 border border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-white cursor-pointer hover:bg-gray-50 text-[10px] text-gray-500 font-bold gap-1">
                                        {isUploadingVariant[globalIdx] ? "Uploading..." : "Upload"}
                                        <input
                                          type="file"
                                          accept="image/*"
                                          className="hidden"
                                          disabled={isUploadingVariant[globalIdx]}
                                          onChange={async (e) => {
                                            const file = e.target.files?.[0];
                                            if (file) await handleVariantImageUpload(globalIdx, file);
                                          }}
                                        />
                                      </label>
                                    )}
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => deleteVariantRow(globalIdx)}
                                    className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors ml-auto border border-gray-200"
                                  >
                                    <X size={14} />
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        /* Case 3: Multiple sub options */
                        <div className="space-y-2">
                          {groupVariants.map((v: any) => {
                            const globalIdx = formData.variants!.findIndex((x) => {
                               if (!x.combination || !v.combination) return false;
                               const xKeys = Object.keys(x.combination);
                               const vKeys = Object.keys(v.combination);
                               if (xKeys.length !== vKeys.length) return false;
                               return xKeys.every(k => String(x.combination[k]).toLowerCase() === String(v.combination[k]).toLowerCase());
                             });
                            return (
                              <div key={globalIdx} className="flex flex-wrap items-center gap-4 bg-white border border-gray-150 rounded-xl p-3 shadow-2xs">
                                
                                {/* Dropdowns for child options */}
                                <div className="flex flex-wrap gap-2.5">
                                  {childAttrs.map((cAttr) => (
                                    <div key={cAttr.name} className="flex flex-col gap-0.5 min-w-[95px]">
                                      <span className="text-[9px] text-gray-400 font-bold uppercase">{cAttr.name}</span>
                                      <select
                                        value={v.combination ? (v.combination[cAttr.name] || "") : ""}
                                        onChange={(e) => updateVariantCombo(globalIdx, cAttr.name, e.target.value)}
                                        className="border border-gray-200 bg-white rounded-lg px-2 py-1 text-xs focus:border-orange-500 outline-none w-full"
                                      >
                                        {cAttr.values.map((val) => (
                                          <option key={val} value={val}>{val}</option>
                                        ))}
                                      </select>
                                    </div>
                                  ))}
                                </div>

                                {/* Qty */}
                                <div className="flex flex-col gap-0.5 w-[110px]">
                                  <span className="text-[9px] text-gray-400 font-bold uppercase">Qty / Stock</span>
                                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden w-full bg-white">
                                    <button
                                      type="button"
                                      onClick={() => updateVariantField(globalIdx, "stock", Math.max(0, (v.stock || 0) - 1))}
                                      className="px-2.5 py-1 text-xs hover:bg-gray-55 font-bold border-r border-gray-250"
                                    >
                                      -
                                    </button>
                                    <input
                                      type="number"
                                      value={v.stock === undefined ? 10 : v.stock}
                                      onChange={(e) => updateVariantField(globalIdx, "stock", parseInt(e.target.value) || 0)}
                                      className="w-12 text-center text-xs focus:outline-none border-none py-1 font-semibold"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => updateVariantField(globalIdx, "stock", (v.stock || 0) + 1)}
                                      className="px-2.5 py-1 text-xs hover:bg-gray-55 font-bold border-l border-gray-250"
                                    >
                                      +
                                    </button>
                                  </div>
                                </div>

                                {/* SKU */}
                                <div className="flex flex-col gap-0.5 w-[145px]">
                                  <span className="text-[9px] text-gray-400 font-bold uppercase">SKU (Auto-Generated)</span>
                                  <input
                                    value={v.sku || ""}
                                    onChange={(e) => updateVariantField(globalIdx, "sku", e.target.value)}
                                    className="border border-gray-200 rounded-lg px-2.5 py-1 text-xs focus:border-orange-500 outline-none w-full font-mono"
                                  />
                                </div>

                                {/* Price */}
                                <div className="flex flex-col gap-0.5 w-[85px]">
                                  <span className="text-[9px] text-gray-400 font-bold uppercase">Selling Price</span>
                                  <input
                                    type="number"
                                    step="0.01"
                                    placeholder={formData.price ? String(formData.price) : "Override"}
                                    value={v.price || ""}
                                    onChange={(e) => updateVariantField(globalIdx, "price", e.target.value ? parseFloat(e.target.value) : "")}
                                    className="border border-gray-200 rounded-lg px-2.5 py-1 text-xs focus:border-orange-500 outline-none w-full text-center font-semibold"
                                  />
                                </div>

                                {/* Original Price */}
                                <div className="flex flex-col gap-0.5 w-[85px]">
                                  <span className="text-[9px] text-gray-400 font-bold uppercase">Original Price</span>
                                  <input
                                    type="number"
                                    step="0.01"
                                    placeholder={formData.old_price ? String(formData.old_price) : "Override"}
                                    value={v.old_price || ""}
                                    onChange={(e) => updateVariantField(globalIdx, "old_price", e.target.value ? parseFloat(e.target.value) : "")}
                                    className="border border-gray-200 rounded-lg px-2.5 py-1 text-xs focus:border-orange-500 outline-none w-full text-center font-semibold"
                                  />
                                </div>

                                {/* Variant Image */}
                                <div className="flex flex-col gap-0.5">
                                  <span className="text-[9px] text-gray-400 font-bold uppercase">Image</span>
                                  {v.images && v.images[0] ? (
                                    <div className="relative h-7 w-7 rounded-lg border bg-white overflow-hidden group/img">
                                      <img src={v.images[0]} className="h-full w-full object-contain" />
                                      <button
                                        type="button"
                                        onClick={() => updateVariantField(globalIdx, "images", [])}
                                        className="absolute inset-0 bg-black/60 text-white flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity text-[8px]"
                                      >
                                        ❌
                                      </button>
                                    </div>
                                  ) : (
                                    <label className="h-7 px-2 border border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-white cursor-pointer hover:bg-gray-50 text-[10px] text-gray-500 font-bold gap-1">
                                      {isUploadingVariant[globalIdx] ? "Uploading..." : "Upload"}
                                      <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        disabled={isUploadingVariant[globalIdx]}
                                        onChange={async (e) => {
                                          const file = e.target.files?.[0];
                                          if (file) await handleVariantImageUpload(globalIdx, file);
                                        }}
                                      />
                                    </label>
                                  )}
                                </div>

                                <button
                                  type="button"
                                  onClick={() => deleteVariantRow(globalIdx)}
                                  className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-55 transition-colors ml-auto border border-gray-200"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}

                    </div>
                  )}

                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Delete Option Value Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-red-500/20 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-200 text-left">
            <div className="flex items-center gap-2.5 text-red-500">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h3 className="text-sm font-black uppercase tracking-wide">Delete {deleteTarget.attrName} Value?</h3>
            </div>
            
            <div className="text-[11px] text-gray-650 space-y-2.5 leading-relaxed">
              <p>
                Deleting <span className="font-bold text-gray-900">"{deleteTarget.value}"</span> will remove it from the product option list completely.
              </p>
              <p className="bg-red-50 border border-red-200/50 p-2.5 rounded-xl text-red-700 font-semibold">
                ⚠️ This value is currently active in the following variant groups:
                <span className="block font-black text-gray-900 mt-1.5">• {deleteTarget.activeGroups.join(", ")}</span>
              </p>
              <p>
                Confirming will delete it and deactivate all matching variants across all groups.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-750 font-bold rounded-xl text-xs transition-colors cursor-pointer outline-none"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteOptionValue(deleteTarget.attrName, deleteTarget.value);
                  setDeleteTarget(null);
                }}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer outline-none shadow-md shadow-red-500/10"
              >
                Delete Everywhere
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
