"use client";

import React, { useState, useEffect } from "react";
import { Category, SubCategory, ProductRequest } from "@/app/types/types";
import { useProductForm } from "./useProductForm";
import { validateStep } from "./productWizardUtils";
import BasicInfoStep from "./steps/BasicInfoStep";
import PricingMediaStep from "./steps/PricingMediaStep";
import ProductDetailsStep from "./steps/ProductDetailsStep";
import VariantsStep from "./steps/VariantsStep";
import SeoPublishStep from "./steps/SeoPublishStep";
import { ArrowLeft, Loader2, Save, AlertCircle } from "lucide-react";
import "./product-wizard.css";

interface ProductWizardProps {
  productToEdit?: any;
  categories: Category[];
  subCategories: SubCategory[];
  onSuccess: () => void;
  onClose: () => void;
}

export default function ProductWizard({
  productToEdit,
  categories,
  subCategories,
  onSuccess,
  onClose
}: ProductWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});

  const {
    formData,
    handleChange,
    handleTitleChange,
    handleSubCategoryChange,
    warranty,
    handleWarrantyChange,
    isUploadingMain,
    isUploadingGallery,
    isUploadingVariant,
    handleMainImageFile,
    handleGalleryFile,
    handleVariantImageUpload,
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
    loading,
    error,
    setError,
    saveStatus,
    submitForm,
    showVariantsStep,
    handleToggleVariantsStep,
    isDirty,
    resetForm
  } = useProductForm({
    productToEdit,
    categories,
    subCategories,
    onSuccess,
    onClose
  });

  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const hasVariants = (formData.attributes?.length ?? 0) > 0 || (formData.variants?.length ?? 0) > 0 || showVariantsStep;

  const handleClearDraft = () => {
    resetForm();
    setCurrentStep(1);
    setShowClearConfirm(false);
  };

  // Stepper steps configuration
  const allSteps = [
    { number: 1, label: "Basic Info", id: "basic" },
    { number: 2, label: "Pricing & Media", id: "pricing" },
    { number: 3, label: "Product Details", id: "details" },
    { number: 4, label: "Options & Variants", id: "variants", isVariantStep: true },
    { number: 5, label: "SEO & Publish", id: "publish" }
  ];

  // Dynamic stepper items based on variant state
  const visibleSteps = hasVariants
    ? allSteps
    : allSteps.filter(s => !s.isVariantStep);

  // Keep track of visited steps
  useEffect(() => {
    setCompletedSteps(prev => ({
      ...prev,
      [currentStep]: true
    }));
  }, [currentStep]);

  const handleNext = () => {
    const validationError = validateStep(currentStep, formData);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError("");

    if (currentStep === 3) {
      if (hasVariants) {
        setCurrentStep(4);
      } else {
        setCurrentStep(5);
      }
    } else if (currentStep === 4) {
      setCurrentStep(5);
    } else if (currentStep < 3) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    setError("");
    if (currentStep === 5) {
      if (hasVariants) {
        setCurrentStep(4);
      } else {
        setCurrentStep(3);
      }
    } else if (currentStep === 4) {
      setCurrentStep(3);
    } else if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleStepClick = (stepNum: number) => {
    // If clicking a future step, make sure all previous steps are validated
    if (stepNum > currentStep) {
      for (let s = currentStep; s < stepNum; s++) {
        // Skip variants validation if the variant step is currently not visible/used
        if (s === 4 && !hasVariants) continue;

        const validationError = validateStep(s, formData);
        if (validationError) {
          setError(`Please complete step ${s} first: ${validationError}`);
          return;
        }
      }
    }

    setError("");
    setCurrentStep(stepNum);
  };

  const handlePublish = async () => {
    // Verify required fields on publish
    const step1Err = validateStep(1, formData);
    if (step1Err) {
      setError(`Basic Info error: ${step1Err}`);
      setCurrentStep(1);
      return;
    }
    const step2Err = validateStep(2, formData);
    if (step2Err) {
      setError(`Pricing & Media error: ${step2Err}`);
      setCurrentStep(2);
      return;
    }

    const success = await submitForm();
    if (!success) {
      // Error message is set inside useProductForm.ts hook
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header / Breadcrumbs and Save draft state */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 transition-colors font-semibold outline-none border-none bg-transparent cursor-pointer p-0 mb-1"
          >
            <ArrowLeft size={14} /> Back to Products
          </button>
          <h2 className="text-xl font-black text-gray-900 tracking-tight">
            {productToEdit ? `Edit: ${formData.title || "Product"}` : "Redesign New Product Wizard"}
          </h2>
        </div>

        {/* Auto save indicator */}
        {!productToEdit && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-150 rounded-xl px-3 py-1.5 w-fit">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                {saveStatus === "saving" ? "Auto-saving..." : "Draft Saved"}
              </span>
            </div>
            
            <button
              type="button"
              onClick={() => setShowClearConfirm(true)}
              className="text-[10px] text-red-500 hover:text-red-650 font-extrabold uppercase tracking-wider px-3 py-1.5 border border-red-200 hover:bg-red-50 rounded-xl transition-all cursor-pointer outline-none bg-white shadow-2xs"
            >
              Clear Draft
            </button>
          </div>
        )}
      </div>

      {/* Stepper Navigation */}
      <div className="wizard-stepper-container px-2">
        <div className="wizard-stepper-line"></div>
        {/* Dynamic orange highlight for active step progress */}
        <div
          className="wizard-stepper-line-active"
          style={{
            width: `${
              hasVariants
                ? ((currentStep - 1) / 4) * 100
                : currentStep === 5
                ? 100
                : ((currentStep - 1) / 3) * 100
            }%`
          }}
        ></div>

        {visibleSteps.map((s, idx) => {
          const isActive = currentStep === s.number;
          const isCompleted = completedSteps[s.number] && s.number !== currentStep;
          
          return (
            <div
              key={s.id}
              onClick={() => handleStepClick(s.number)}
              className={`wizard-step-node ${isActive ? "wizard-step-node-active" : ""} ${
                isCompleted ? "wizard-step-node-completed" : ""
              }`}
            >
              <div className="wizard-step-circle">
                {isCompleted ? "✓" : idx + 1}
              </div>
              <span className="wizard-step-label">{s.label}</span>
            </div>
          );
        })}
      </div>

      {/* Error alert banner */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-650 text-xs rounded-xl font-bold flex items-center gap-2 animate-in fade-in duration-200">
          <span className="text-sm">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Render Steps */}
      <div className="wizard-card bg-white">
        {currentStep === 1 && (
          <BasicInfoStep
            formData={formData}
            handleChange={handleChange}
            handleTitleChange={handleTitleChange}
            handleSubCategoryChange={handleSubCategoryChange}
            categories={categories}
            subCategories={subCategories}
          />
        )}

        {currentStep === 2 && (
          <PricingMediaStep
            formData={formData}
            handleChange={handleChange}
            handleMainImageFile={handleMainImageFile}
            handleGalleryFile={handleGalleryFile}
            isUploadingMain={isUploadingMain}
            isUploadingGallery={isUploadingGallery}
            showVariantsStep={showVariantsStep}
            handleToggleVariantsStep={handleToggleVariantsStep}
          />
        )}

        {currentStep === 3 && (
          <ProductDetailsStep
            formData={formData}
            handleChange={handleChange}
            warranty={warranty}
            handleWarrantyChange={handleWarrantyChange}
          />
        )}

        {currentStep === 4 && hasVariants && (
          <VariantsStep
            formData={formData}
            handleChange={handleChange}
            addOption={addOption}
            deleteOption={deleteOption}
            addNestedOption={addNestedOption}
            addOptionValue={addOptionValue}
            deleteOptionValue={deleteOptionValue}
            addNestedOptionValue={addNestedOptionValue}
            activateSubVariant={activateSubVariant}
            addVariantForParent={addVariantForParent}
            deleteVariantRow={deleteVariantRow}
            updateVariantCombo={updateVariantCombo}
            updateVariantField={updateVariantField}
            isUploadingVariant={isUploadingVariant}
            handleVariantImageUpload={handleVariantImageUpload}
          />
        )}

        {currentStep === 5 && (
          <SeoPublishStep
            formData={formData}
            handleChange={handleChange}
            categories={categories}
            subCategories={subCategories}
            goToStep={handleStepClick}
          />
        )}
      </div>

      {/* Navigation Footer */}
      <div className="flex justify-between items-center bg-gray-50 border border-gray-150 p-4.5 rounded-2xl">
        <button
          type="button"
          disabled={currentStep === 1}
          onClick={handlePrev}
          className="px-5 py-2.5 bg-white border border-gray-250 text-gray-700 text-xs font-bold rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:pointer-events-none cursor-pointer outline-none shadow-2xs"
        >
          ← Previous
        </button>

        <div className="flex gap-2">
          {productToEdit && currentStep < 5 && isDirty && (
            <button
              type="button"
              disabled={loading}
              onClick={handlePublish}
              className="px-5 py-2.5 bg-white border border-orange-500 text-orange-600 hover:bg-orange-50 text-xs font-bold rounded-xl transition-colors cursor-pointer outline-none flex items-center gap-1.5 shadow-2xs animate-in fade-in duration-200"
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          )}

          {currentStep < 5 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2.5 bg-orange-500 text-white text-xs font-bold rounded-xl hover:bg-orange-600 transition-colors cursor-pointer outline-none shadow-md shadow-orange-500/10"
            >
              Next Step →
            </button>
          ) : (
            <button
              type="button"
              disabled={loading}
              onClick={handlePublish}
              className="px-7 py-2.5 bg-orange-500 text-white text-xs font-bold rounded-xl hover:bg-orange-600 transition-colors cursor-pointer outline-none flex items-center gap-1.5 shadow-lg shadow-orange-500/20 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save size={14} /> {productToEdit ? "Save Changes" : "🚀 Publish Product"}
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Clear Draft Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-red-500/20 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-200 text-left">
            <div className="flex items-center gap-2.5 text-red-500">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h3 className="text-sm font-black uppercase tracking-wide">Clear Form Draft?</h3>
            </div>
            
            <p className="text-[11px] text-gray-650 leading-relaxed">
              Are you sure you want to clear your current progress and reset the product creation wizard? This action cannot be undone.
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-750 font-bold rounded-xl text-xs transition-colors cursor-pointer outline-none"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleClearDraft}
                className="px-4 py-2 bg-red-500 hover:bg-red-650 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer outline-none shadow-md shadow-red-500/10"
              >
                Clear Draft
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
