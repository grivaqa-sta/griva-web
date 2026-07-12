import { useState, useEffect, useRef } from "react";
import { ProductRequest, Category, SubCategory, ProductSpecification } from "@/app/types/types";
import { productService } from "@/app/services/product.service";
import { uploadService } from "@/app/services/upload.service";
import {
  normalizeVariants,
  calculateDiscount,
  generateVariantSKU,
  syncAttributesFromVariants,
  saveDraft,
  loadDraft,
  clearDraft,
  extractWarranty,
  updateWarrantyInSpecs,
  WarrantyData
} from "./productWizardUtils";

export interface UseProductFormProps {
  productToEdit?: any;
  categories: Category[];
  subCategories: SubCategory[];
  onSuccess: () => void;
  onClose: () => void;
}

export function useProductForm({
  productToEdit,
  categories,
  subCategories,
  onSuccess,
  onClose
}: UseProductFormProps) {
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
  const [loading, setLoading] = useState(false);
  const [isUploadingMain, setIsUploadingMain] = useState(false);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const [isUploadingVariant, setIsUploadingVariant] = useState<Record<number, boolean>>({});
  const [error, setError] = useState("");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");

  // Warranty State
  const [warranty, setWarranty] = useState<WarrantyData>({
    enabled: false,
    title: "",
    description: ""
  });

  const mainImageFileRef = useRef<HTMLInputElement>(null);
  const galleryFileRef = useRef<HTMLInputElement>(null);
  const [showVariantsStep, setShowVariantsStep] = useState(false);
  const [initialFormDataStr, setInitialFormDataStr] = useState("");

  // Initialize draft or edit data
  useEffect(() => {
    if (productToEdit) {
      const loadedVariants = normalizeVariants(productToEdit.productVariants || productToEdit.variants || []);
      let loadedAttributes = productToEdit.attributes || [];
      
      if (loadedAttributes.length === 0 && loadedVariants.length > 0) {
        const attrMap: Record<string, Set<string>> = {};
        loadedVariants.forEach(v => {
          if (v.combination) {
            Object.keys(v.combination).forEach(k => {
              if (!attrMap[k]) {
                attrMap[k] = new Set<string>();
              }
              if (v.combination[k]) {
                attrMap[k].add(v.combination[k]);
              }
            });
          }
        });
        loadedAttributes = Object.keys(attrMap).map(name => ({
          name,
          values: Array.from(attrMap[name])
        }));
      }

      // Auto-pregenerate variants for any parent values that do not have variants
      if (loadedAttributes.length > 0) {
        const parentAttr = loadedAttributes[0];
        const childAttrs = loadedAttributes.slice(1);
        parentAttr.values.forEach((parentVal: string) => {
          const hasGroupVariants = loadedVariants.some(
            (v: any) => v.combination && v.combination[parentAttr.name] === parentVal
          );
          if (!hasGroupVariants) {
            if (childAttrs.length === 0) {
              const combination = { [parentAttr.name]: parentVal };
              const sku = `VAR-${productToEdit.id}-${parentVal.substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`;
              loadedVariants.push({
                combination,
                stock: 10,
                sku,
                price: "",
                old_price: "",
                images: []
              });
            } else {
              const childAttr = childAttrs[0];
              const childAttrValues = childAttr.values || [];
              childAttrValues.forEach((childVal: string) => {
                const combination: Record<string, string> = {
                  [parentAttr.name]: parentVal,
                  [childAttr.name]: childVal
                };
                childAttrs.slice(1).forEach((otherAttr: any) => {
                  if (otherAttr.values && otherAttr.values.length > 0) {
                    combination[otherAttr.name] = otherAttr.values[0];
                  }
                });
                const sku = `VAR-${productToEdit.id}-${parentVal.substring(0, 3).toUpperCase()}-${childVal.substring(0, 3).toUpperCase()}`;
                loadedVariants.push({
                  combination,
                  stock: 10,
                  sku,
                  price: "",
                  old_price: "",
                  images: []
                });
              });
            }
          }
        });
      }

      const initialSpecs = productToEdit.specifications || [];
      const extractedWarranty = extractWarranty(initialSpecs);
      setWarranty(extractedWarranty);

      const initialData = {
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
        variants: loadedVariants,
        attributes: loadedAttributes,
        specifications: initialSpecs,
        tags: productToEdit.tags || [],
        is_featured: productToEdit.is_featured || false,
        is_best_seller: productToEdit.is_best_seller || false,
        is_trending: productToEdit.is_trending || false,
        is_new: productToEdit.is_new || false,
        is_active: productToEdit.is_active !== undefined ? productToEdit.is_active : true,
        meta_title: productToEdit.meta_title || "",
        meta_description: productToEdit.meta_description || ""
      };

      setFormData(initialData);
      setInitialFormDataStr(JSON.stringify(initialData));

      const sub = subCategories.find(s => s.id === productToEdit.subcategory_id);
      if (sub) {
        setSelectedCategory(sub.category_id);
      }
    } else {
      // Load draft from localStorage if not editing
      const draft = loadDraft();
      if (draft) {
        setFormData(prev => ({ ...prev, ...draft }));
        const sub = subCategories.find(s => s.id === draft.subcategory_id);
        if (sub) {
          setSelectedCategory(sub.category_id);
        }
        if (draft.specifications) {
          setWarranty(extractWarranty(draft.specifications));
        }
      }
    }
  }, [productToEdit, subCategories]);

  // Sync showVariantsStep after data loads
  useEffect(() => {
    if (productToEdit) {
      setShowVariantsStep((productToEdit.attributes?.length ?? 0) > 0);
    } else {
      const draft = loadDraft();
      if (draft) {
        const hasAttrs = (draft.attributes?.length ?? 0) > 0;
        setShowVariantsStep(hasAttrs || (typeof window !== "undefined" && localStorage.getItem("griva_wizard_show_variants") === "true"));
      }
    }
  }, [productToEdit, formData.attributes]);

  const handleToggleVariantsStep = (val: boolean) => {
    setShowVariantsStep(val);
    if (typeof window !== "undefined") {
      localStorage.setItem("griva_wizard_show_variants", val ? "true" : "false");
    }
    if (!val) {
      setFormData(prev => {
        const updated = {
          ...prev,
          attributes: [],
          variants: []
        };
        if (!productToEdit) {
          setSaveStatus("saving");
          saveDraft(updated);
          setTimeout(() => setSaveStatus("saved"), 600);
        }
        return updated;
      });
    }
  };

  // Handle standard field changes
  const handleChange = (field: keyof ProductRequest, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      // Save draft (debounced in actual component if needed, or simple immediate write since localStorage is fast)
      if (!productToEdit) {
        setSaveStatus("saving");
        saveDraft(updated);
        setTimeout(() => setSaveStatus("saved"), 600);
      }
      return updated;
    });
  };

  // Sync total stock calculated from variants
  const calculatedTotalStock = (() => {
    if (!formData.attributes || formData.attributes.length === 0) {
      return null;
    }
    const activeAttributes = formData.attributes || [];
    const filtered = (formData.variants || []).filter((v: any) => {
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
  })();

  useEffect(() => {
    if (calculatedTotalStock !== null && formData.stock !== calculatedTotalStock) {
      handleChange("stock", calculatedTotalStock);
    }
  }, [calculatedTotalStock]);

  // Title change sets slug
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    setFormData(prev => {
      const updated = { ...prev, title, slug };
      if (!productToEdit) {
        saveDraft(updated);
      }
      return updated;
    });
  };

  // Subcategory change sets SKU
  const handleSubCategoryChange = (subId: number) => {
    const sub = subCategories.find(s => s.id === subId);
    let newSku = formData.sku;

    if (sub) {
      const prefix = sub.title.substring(0, 3).toUpperCase();
      const randomDigits = Math.floor(10000 + Math.random() * 90000);
      newSku = `${prefix}${randomDigits}`;
    }

    setFormData(prev => {
      const updated = { ...prev, subcategory_id: subId, sku: newSku };
      if (!productToEdit) {
        saveDraft(updated);
      }
      return updated;
    });
  };

  // Warranty updates specs
  const handleWarrantyChange = (updatedWarranty: WarrantyData) => {
    setWarranty(updatedWarranty);
    const updatedSpecs = updateWarrantyInSpecs(formData.specifications || [], updatedWarranty);
    handleChange("specifications", updatedSpecs);
  };

  // Image Uploading
  const handleMainImageFile = async (file: File) => {
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
  };

  const handleGalleryFile = async (files: FileList) => {
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
  };

  const handleVariantImageUpload = async (globalIdx: number, file: File) => {
    setIsUploadingVariant(prev => ({ ...prev, [globalIdx]: true }));
    setError("");
    try {
      const data = await uploadService.uploadImage(file);
      if (data && data.imageUrl) {
        const next = [...(formData.variants || [])];
        next[globalIdx] = {
          ...next[globalIdx],
          images: [data.imageUrl]
        };
        handleChange("variants", next);
      } else {
        setError("Failed to upload variant image.");
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to upload variant image.");
    }
    setIsUploadingVariant(prev => ({ ...prev, [globalIdx]: false }));
  };

  // Option Creation & Variant Generation
  const addOption = (name: string, valuesStr: string) => {
    if (!name.trim() || !valuesStr.trim()) return;
    const newValues = valuesStr.split(",").map(v => v.trim()).filter(Boolean);
    const newAttr = {
      name: name.trim(),
      values: newValues
    };
    const nextAttrs = [...(formData.attributes || []), newAttr];
    
    // Save attributes directly so helper functions can see it
    const parentAttr = nextAttrs[0];
    const childAttrs = nextAttrs.slice(1);
    const tempVariants = [...(formData.variants || [])];

    if (childAttrs.length === 0) {
      parentAttr.values.forEach((parentVal: string) => {
        const combination = { [parentAttr.name]: parentVal };
        const exists = tempVariants.some(v => 
          v && v.combination && Object.keys(combination).every(k => v.combination[k] !== undefined && String(v.combination[k]) === String(combination[k]))
        );
        if (!exists) {
          const newIdx = tempVariants.length;
          const sku = generateVariantSKU(combination, newIdx, tempVariants, formData.sku);
          tempVariants.push({
            combination,
            stock: 10,
            sku,
            price: "",
            old_price: "",
            images: []
          });
        }
      });
    } else {
      const childAttr = childAttrs[0];
      const childAttrValues = childAttr.values || [];
      parentAttr.values.forEach((parentVal: string) => {
        childAttrValues.forEach((childVal: string) => {
          const combination: Record<string, string> = {
            [parentAttr.name]: parentVal,
            [childAttr.name]: childVal
          };
          childAttrs.slice(1).forEach((otherAttr: any) => {
            if (otherAttr.values && otherAttr.values.length > 0) {
              combination[otherAttr.name] = otherAttr.values[0];
            }
          });
          const exists = tempVariants.some(v => 
            v && v.combination && Object.keys(combination).every(k => v.combination[k] !== undefined && String(v.combination[k]) === String(combination[k]))
          );
          if (!exists) {
            const newIdx = tempVariants.length;
            const sku = generateVariantSKU(combination, newIdx, tempVariants, formData.sku);
            tempVariants.push({
              combination,
              stock: 10,
              sku,
              price: "",
              old_price: "",
              images: []
            });
          }
        });
      });
    }

    setFormData(prev => {
      const updated = {
        ...prev,
        attributes: nextAttrs,
        variants: tempVariants
      };
      if (!productToEdit) saveDraft(updated);
      return updated;
    });
  };

  const deleteOption = (index: number) => {
    const next = [...(formData.attributes || [])];
    next.splice(index, 1);
    
    // Also clear variants if all options are deleted
    const updatedVariants = next.length === 0 ? [] : formData.variants;
    
    setFormData(prev => {
      const updated = {
        ...prev,
        attributes: next,
        variants: updatedVariants
      };
      if (!productToEdit) saveDraft(updated);
      return updated;
    });
  };

  const addNestedOption = (name: string) => {
    if (!name.trim()) return;
    const current = [...(formData.attributes || [])];
    if (current.some(a => a.name.toLowerCase() === name.trim().toLowerCase())) {
      setError("Option already exists!");
      return;
    }
    const newAttr = {
      name: name.trim(),
      values: []
    };
    handleChange("attributes", [...current, newAttr]);
  };

  const addOptionValue = (value: string) => {
    if (!value.trim()) return;
    const currentAttrs = [...(formData.attributes || [])];
    const parentAttr = currentAttrs[0];
    if (!parentAttr) return;

    const parentValues = [...(parentAttr.values || [])];
    if (!parentValues.includes(value.trim())) {
      parentValues.push(value.trim());
      currentAttrs[0] = {
        ...parentAttr,
        values: parentValues
      };
    }

    const childAttrs = currentAttrs.slice(1);
    const tempVariants = [...(formData.variants || [])];

    if (childAttrs.length === 0) {
      const combination = { [parentAttr.name]: value.trim() };
      const exists = tempVariants.some(v => 
        v && v.combination && Object.keys(combination).every(k => v.combination[k] !== undefined && String(v.combination[k]) === String(combination[k]))
      );
      if (!exists) {
        const newIdx = tempVariants.length;
        const sku = generateVariantSKU(combination, newIdx, tempVariants, formData.sku);
        tempVariants.push({
          combination,
          stock: 10,
          sku,
          price: "",
          images: []
        });
      }
    } else if (childAttrs.length === 1) {
      const childAttr = childAttrs[0];
      const childAttrValues = childAttr.values || [];
      childAttrValues.forEach((childVal) => {
        const combination = {
          [parentAttr.name]: value.trim(),
          [childAttr.name]: childVal
        };
        const exists = tempVariants.some(v => 
          v && v.combination && Object.keys(combination).every(k => v.combination[k] !== undefined && String(v.combination[k]) === String(combination[k]))
        );
        if (!exists) {
          const newIdx = tempVariants.length;
          const sku = generateVariantSKU(combination, newIdx, tempVariants, formData.sku);
          tempVariants.push({
            combination,
            stock: 10,
            sku,
            price: "",
            images: []
          });
        }
      });
    } else {
      const combination: Record<string, string> = { [parentAttr.name]: value.trim() };
      childAttrs.forEach((c) => {
        if (c.values && c.values.length > 0) {
          combination[c.name] = c.values[0];
        }
      });
      const exists = tempVariants.some(v => 
        v && v.combination && Object.keys(combination).every(k => v.combination[k] !== undefined && String(v.combination[k]) === String(combination[k]))
      );
      if (!exists) {
        const newIdx = tempVariants.length;
        const sku = generateVariantSKU(combination, newIdx, tempVariants, formData.sku);
        tempVariants.push({
          combination,
          stock: 10,
          sku,
          price: "",
          images: []
        });
      }
    }

    setFormData(prev => {
      const updated = {
        ...prev,
        attributes: currentAttrs,
        variants: tempVariants
      };
      if (!productToEdit) saveDraft(updated);
      return updated;
    });
  };

  const deleteOptionValue = (attrName: string, value: string) => {
    const currentAttrs = [...(formData.attributes || [])];
    const attrIdx = currentAttrs.findIndex(a => a.name === attrName);
    if (attrIdx === -1) return;

    const values = (currentAttrs[attrIdx].values || []).filter(v => v !== value);
    currentAttrs[attrIdx] = {
      ...currentAttrs[attrIdx],
      values
    };

    const tempVariants = [...(formData.variants || [])].filter(v => 
      !v.combination || String(v.combination[attrName]) !== String(value)
    );

    setFormData(prev => {
      const updated = {
        ...prev,
        attributes: currentAttrs,
        variants: tempVariants
      };
      if (!productToEdit) saveDraft(updated);
      return updated;
    });
  };

  const addNestedOptionValue = (attrName: string, value: string, parentVal: string, qty: number = 10) => {
    if (!value.trim()) return;
    const currentAttrs = [...(formData.attributes || [])];
    const attrIdx = currentAttrs.findIndex(a => a.name === attrName);
    if (attrIdx === -1) return;

    const values = [...(currentAttrs[attrIdx].values || [])];
    if (!values.includes(value.trim())) {
      values.push(value.trim());
      currentAttrs[attrIdx] = {
        ...currentAttrs[attrIdx],
        values
      };
    }

    const parentAttr = currentAttrs[0];
    if (!parentAttr) return;

    const combination: Record<string, string> = {
      [parentAttr.name]: parentVal,
      [attrName]: value.trim()
    };

    const otherChildAttrs = currentAttrs.slice(1).filter(a => a.name !== attrName);
    otherChildAttrs.forEach((c) => {
      if (c.values && c.values.length > 0) {
        combination[c.name] = c.values[0];
      }
    });

    const tempVariants = [...(formData.variants || [])];
    const exists = tempVariants.some(v => 
      v && v.combination && Object.keys(combination).every(k => v.combination[k] !== undefined && String(v.combination[k]) === String(combination[k]))
    );

    if (!exists) {
      const newIdx = tempVariants.length;
      const sku = generateVariantSKU(combination, newIdx, tempVariants, formData.sku);
      const newRow = {
        combination,
        stock: qty,
        sku,
        price: "",
        images: []
      };
      tempVariants.push(newRow);
    }

    setFormData(prev => {
      const updated = {
        ...prev,
        attributes: currentAttrs,
        variants: tempVariants
      };
      if (!productToEdit) saveDraft(updated);
      return updated;
    });
  };

  const activateSubVariant = (parentVal: string, childAttrName: string, childVal: string) => {
    const parentAttr = formData.attributes?.[0];
    if (!parentAttr) return;

    const combination: Record<string, string> = {
      [parentAttr.name]: parentVal,
      [childAttrName]: childVal
    };

    const childAttrs = formData.attributes!.slice(1);
    childAttrs.forEach((c) => {
      if (c.name !== childAttrName && c.values && c.values.length > 0) {
        combination[c.name] = c.values[0];
      }
    });

    const tempVariants = [...(formData.variants || [])];
    const newIdx = tempVariants.length;
    const sku = generateVariantSKU(combination, newIdx, tempVariants, formData.sku);
    const newRow = {
      combination,
      stock: 10,
      sku,
      price: "",
      images: []
    };
    
    setFormData(prev => {
      const updated = {
        ...prev,
        variants: [...tempVariants, newRow]
      };
      if (!productToEdit) saveDraft(updated);
      return updated;
    });
  };

  const addVariantForParent = (parentVal: string) => {
    const parentAttr = formData.attributes?.[0];
    if (!parentAttr) return;

    const childAttrs = formData.attributes!.slice(1);
    const combination: Record<string, string> = { [parentAttr.name]: parentVal };
    childAttrs.forEach((cAttr) => {
      if (cAttr.values && cAttr.values.length > 0) {
        combination[cAttr.name] = cAttr.values[0];
      }
    });

    const tempVariants = [...(formData.variants || [])];
    const newIdx = tempVariants.length;
    const sku = generateVariantSKU(combination, newIdx, tempVariants, formData.sku);

    const newRow = {
      combination,
      stock: 10,
      sku,
      price: "",
      images: []
    };
    const nextVariants = [...tempVariants, newRow];
    const nextAttrs = syncAttributesFromVariants(nextVariants, formData.attributes);

    setFormData(prev => {
      const updated = {
        ...prev,
        variants: nextVariants,
        attributes: nextAttrs
      };
      if (!productToEdit) saveDraft(updated);
      return updated;
    });
  };

  const deleteVariantRow = (index: number) => {
    if (index < 0 || index >= (formData.variants?.length ?? 0)) return;
    const next = [...(formData.variants || [])];
    next.splice(index, 1);
    const nextAttrs = syncAttributesFromVariants(next, formData.attributes);
    
    setFormData(prev => {
      const updated = {
        ...prev,
        variants: next,
        attributes: nextAttrs
      };
      if (!productToEdit) saveDraft(updated);
      return updated;
    });
  };

  const updateVariantCombo = (varIdx: number, attrName: string, value: string) => {
    const next = [...(formData.variants || [])];
    const updatedCombo = {
      ...next[varIdx].combination,
      [attrName]: value
    };
    next[varIdx] = {
      ...next[varIdx],
      combination: updatedCombo,
      sku: generateVariantSKU(updatedCombo, varIdx, next, formData.sku)
    };
    const nextAttrs = syncAttributesFromVariants(next, formData.attributes);
    
    setFormData(prev => {
      const updated = {
        ...prev,
        variants: next,
        attributes: nextAttrs
      };
      if (!productToEdit) saveDraft(updated);
      return updated;
    });
  };

  const updateVariantField = (varIdx: number, field: string, value: any) => {
    let finalValue = value;
    if (field === "stock") {
      finalValue = Math.max(0, parseInt(value) || 0);
    }
    const next = [...(formData.variants || [])];
    next[varIdx] = {
      ...next[varIdx],
      [field]: finalValue
    };
    
    setFormData(prev => {
      const updated = {
        ...prev,
        variants: next
      };
      if (!productToEdit) saveDraft(updated);
      return updated;
    });
  };

  // Submit API call
  const submitForm = async () => {
    if (!formData.title || !formData.slug || !formData.subcategory_id || !formData.price || !formData.main_image_url) {
      setError("Please fill all required fields (Title, Slug, SubCategory, Price, Main Image).");
      return false;
    }

    setLoading(true);
    setError("");

    try {
      const payload = { ...formData, subcategory_id: Number(formData.subcategory_id) } as ProductRequest;
      
      // Filter out variants that do not match current attribute options
      const activeAttributes = formData.attributes || [];
      if (Array.isArray(payload.variants)) {
        payload.variants = payload.variants.filter((v: any) => {
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
      }

      if (productToEdit) {
        await productService.updateProduct(productToEdit.id, payload);
      } else {
        await productService.createProduct(payload);
        clearDraft(); // clear draft on success
        if (typeof window !== "undefined") {
          localStorage.removeItem("griva_wizard_show_variants");
        }
      }
      onSuccess();
      return true;
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to save product. Please check the inputs.");
      setLoading(false);
      return false;
    }
  };

  const isDirty = productToEdit
    ? initialFormDataStr !== "" && JSON.stringify(formData) !== initialFormDataStr
    : true;

  const resetForm = () => {
    clearDraft();
    setFormData({
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
      attributes: [],
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
    setSelectedCategory(0);
    setWarranty({
      enabled: false,
      title: "",
      description: ""
    });
    if (typeof window !== "undefined") {
      localStorage.removeItem("griva_wizard_show_variants");
    }
  };

  return {
    formData,
    setFormData,
    selectedCategory,
    setSelectedCategory,
    loading,
    isUploadingMain,
    isUploadingGallery,
    isUploadingVariant,
    error,
    setError,
    saveStatus,
    warranty,
    handleWarrantyChange,
    mainImageFileRef,
    galleryFileRef,
    handleChange,
    handleTitleChange,
    handleSubCategoryChange,
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
    submitForm,
    showVariantsStep,
    handleToggleVariantsStep,
    isDirty,
    resetForm
  };
}
