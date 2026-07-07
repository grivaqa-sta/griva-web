"use client";
import React, { useState, useEffect, useRef } from "react";
import { Sparkles, X, Upload, Link as LinkIcon, ImageIcon, Loader2, ChevronDown, Trash2 } from "lucide-react";
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

const normalizeVariants = (variants: any[]): any[] => {
  if (!Array.isArray(variants)) return [];
  return variants.map(v => {
    if (!v) return v;
    if (v.combination) {
      return {
        ...v,
        old_price: v.old_price !== undefined ? v.old_price : ""
      };
    }
    const combination: Record<string, string> = {};
    const excludeKeys = ['id', 'product_id', 'stock', 'sku', 'price', 'old_price', 'images', 'createdAt', 'updatedAt', 'variantId'];
    Object.keys(v).forEach(k => {
      if (!excludeKeys.includes(k) && v[k] !== undefined && v[k] !== null) {
        const normalizedKey = k.charAt(0).toUpperCase() + k.slice(1);
        combination[normalizedKey] = String(v[k]);
      }
    });
    return {
      id: v.id,
      combination,
      stock: typeof v.stock === 'number' ? v.stock : 10,
      sku: v.sku || "",
      price: v.price || "",
      old_price: v.old_price || "",
      images: v.images || []
    };
  });
};

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

  const calculatedTotalStock = React.useMemo(() => {
    if (!formData.attributes || formData.attributes.length === 0) {
      return null;
    }
    const activeAttributes = formData.attributes || [];
    const filtered = (formData.variants || []).filter((v: any) => {
      if (!v.combination) return false;
      return Object.keys(v.combination).every((key) => {
        const attr = activeAttributes.find(a => a.name.toLowerCase() === key.toLowerCase());
        if (!attr) return false;
        const val = v.combination[key];
        return attr.values.some(opt => opt.toLowerCase() === val.toLowerCase());
      });
    });
    return filtered.reduce((sum, v) => sum + (v.stock || 0), 0);
  }, [formData.variants, formData.attributes]);

  useEffect(() => {
    if (calculatedTotalStock !== null && formData.stock !== calculatedTotalStock) {
      handleChange("stock", calculatedTotalStock);
    }
  }, [calculatedTotalStock]);
  const [newTag, setNewTag] = useState("");
  const [newSpecName, setNewSpecName] = useState("");
  const [newSpecValue, setNewSpecValue] = useState("");
  const [newVariantColor, setNewVariantColor] = useState("");
  const [newVariantSize, setNewVariantSize] = useState("");
  const [tempAttrName, setTempAttrName] = useState("");
  const [tempAttrValuesStr, setTempAttrValuesStr] = useState("");
  const [subAttrInputs, setSubAttrInputs] = useState<Record<string, string>>({});
  const [childValInputs, setChildValInputs] = useState<Record<string, string>>({});
  const [newParentValInput, setNewParentValInput] = useState("");
  const [childValQtyInputs, setChildValQtyInputs] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [isUploadingMain, setIsUploadingMain] = useState(false);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const [error, setError] = useState("");
  const [openSubCategorySelect, setOpenSubCategorySelect] = useState(false);
  const [subCategorySearch, setSubCategorySearch] = useState("");

  const mainImageFileRef = useRef<HTMLInputElement>(null);
  const galleryFileRef = useRef<HTMLInputElement>(null);

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

      // Auto-pregenerate variants for any parent values that do not have any variants in the database
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
        variants: loadedVariants,
        attributes: loadedAttributes,
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

  const calculateDiscount = (sellingPrice: number, originalPrice: number) => {
    if (!originalPrice || !sellingPrice || originalPrice <= sellingPrice) {
      return 0;
    }
    return Math.round(((originalPrice - sellingPrice) / originalPrice) * 100);
  };

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
      
      // Filter out variants that do not match the current active attribute configurations
      const activeAttributes = formData.attributes || [];
      if (Array.isArray(payload.variants)) {
        payload.variants = payload.variants.filter((v: any) => {
          if (!v.combination) return false;
          return Object.keys(v.combination).every((key) => {
            const attr = activeAttributes.find(a => a.name.toLowerCase() === key.toLowerCase());
            if (!attr) return false;
            const val = v.combination[key];
            return attr.values.some(opt => opt.toLowerCase() === val.toLowerCase());
          });
        });
      }

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

  const addAttribute = () => {
    if (!tempAttrName.trim() || !tempAttrValuesStr.trim()) return;
    const newAttr = {
      name: tempAttrName.trim(),
      values: tempAttrValuesStr.split(",").map(v => v.trim()).filter(Boolean)
    };
    const nextAttrs = [...(formData.attributes || []), newAttr];
    handleChange("attributes", nextAttrs);

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
          const sku = generateVariantSKU(combination, newIdx, tempVariants);
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
            const sku = generateVariantSKU(combination, newIdx, tempVariants);
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
    handleChange("variants", tempVariants);

    setTempAttrName("");
    setTempAttrValuesStr("");
  };

  const deleteAttribute = (index: number) => {
    const next = [...(formData.attributes || [])];
    next.splice(index, 1);
    handleChange("attributes", next);
  };

  const generateVariantSKU = (combo: Record<string, string>, index: number, currentVariants: any[]) => {
    const productSku = formData.sku || "PROD";
    const parts = Object.values(combo)
      .filter(Boolean)
      .map(v => v.toString().toUpperCase().replace(/[^A-Z0-9]/g, ''));
    
    let baseSku = `${productSku}-${parts.join('-')}`;
    if (baseSku.endsWith('-')) baseSku = baseSku.slice(0, -1);
    
    let finalSku = baseSku;
    let counter = 1;
    const existingSkus = currentVariants
      .map((v, i) => i !== index ? v.sku : null)
      .filter(Boolean);
      
    while (existingSkus.includes(finalSku)) {
      finalSku = `${baseSku}-${counter}`;
      counter++;
    }
    return finalSku;
  };

  const syncAttributesFromVariants = (updatedVariants: any[]) => {
    const parentAttr = formData.attributes?.[0];
    if (!parentAttr) return;

    const currentAttrs = [...(formData.attributes || [])];
    const otherKeys = new Set<string>();
    
    updatedVariants.forEach((v) => {
      if (v.combination) {
        Object.keys(v.combination).forEach((k) => {
          if (k !== parentAttr.name) {
            otherKeys.add(k);
          }
        });
      }
    });

    currentAttrs.forEach((attr, idx) => {
      if (idx > 0) {
        otherKeys.add(attr.name);
      }
    });

    const newChildAttrs = Array.from(otherKeys).map((k) => {
      const values = new Set<string>();
      
      const existingAttr = currentAttrs.find(a => a.name === k);
      if (existingAttr && existingAttr.values) {
        existingAttr.values.forEach(v => values.add(v));
      }
      
      updatedVariants.forEach((v) => {
        if (v.combination && v.combination[k]) {
          values.add(v.combination[k]);
        }
      });
      
      return {
        name: k,
        values: Array.from(values).filter(Boolean)
      };
    });

    const nextAttrs = [parentAttr, ...newChildAttrs];
    setFormData(prev => ({
      ...prev,
      attributes: nextAttrs
    }));
  };

  const addSubAttribute = (name: string) => {
    if (!name.trim()) return;
    const current = [...(formData.attributes || [])];
    if (current.some(a => a.name.toLowerCase() === name.trim().toLowerCase())) {
      setError("Attribute already exists!");
      return;
    }
    const newAttr = {
      name: name.trim(),
      values: []
    };
    const next = [...current, newAttr];
    handleChange("attributes", next);
  };

  const addParentAttributeValue = (value: string) => {
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
      handleChange("attributes", currentAttrs);
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
        const sku = generateVariantSKU(combination, newIdx, tempVariants);
        tempVariants.push({
          combination,
          stock: 10,
          sku,
          price: "",
          images: []
        });
      }
    } else if (childAttrs.length === 1) {
      // Auto-pregenerate variants for all configured child options (e.g. Size values)
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
          const sku = generateVariantSKU(combination, newIdx, tempVariants);
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
      // Multi-attribute fallback
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
        const sku = generateVariantSKU(combination, newIdx, tempVariants);
        tempVariants.push({
          combination,
          stock: 10,
          sku,
          price: "",
          images: []
        });
      }
    }

    handleChange("variants", tempVariants);
  };

  const deleteChildAttributeValue = (attrName: string, value: string) => {
    const currentAttrs = [...(formData.attributes || [])];
    const attrIdx = currentAttrs.findIndex(a => a.name === attrName);
    if (attrIdx === -1) return;

    // Remove from attribute values list
    const values = (currentAttrs[attrIdx].values || []).filter(v => v !== value);
    currentAttrs[attrIdx] = {
      ...currentAttrs[attrIdx],
      values
    };
    handleChange("attributes", currentAttrs);

    // Remove any variants containing this combination value
    const tempVariants = [...(formData.variants || [])].filter(v => 
      !v.combination || String(v.combination[attrName]) !== String(value)
    );
    handleChange("variants", tempVariants);
  };

  const addChildAttributeValue = (attrName: string, value: string, parentVal: string, qty: number = 10) => {
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
      handleChange("attributes", currentAttrs);
    }

    const parentAttr = formData.attributes?.[0];
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
      const sku = generateVariantSKU(combination, newIdx, tempVariants);
      const newRow = {
        combination,
        stock: qty,
        sku,
        price: "",
        images: []
      };
      handleChange("variants", [...tempVariants, newRow]);
    }
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
    const sku = generateVariantSKU(combination, newIdx, tempVariants);
    const newRow = {
      combination,
      stock: 10,
      sku,
      price: "",
      images: []
    };
    handleChange("variants", [...tempVariants, newRow]);
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
    const sku = generateVariantSKU(combination, newIdx, tempVariants);

    const newRow = {
      combination,
      stock: 10,
      sku,
      price: "",
      images: []
    };
    const nextVariants = [...tempVariants, newRow];
    handleChange("variants", nextVariants);
    syncAttributesFromVariants(nextVariants);
  };

  const handleVariantImageUpload = async (globalIdx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
        setError("Failed to upload variant image. No URL returned.");
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to upload variant image.");
    }
  };

  const deleteVariantRow = (index: number) => {
    const next = [...(formData.variants || [])];
    next.splice(index, 1);
    handleChange("variants", next);
    syncAttributesFromVariants(next);
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
      sku: generateVariantSKU(updatedCombo, varIdx, next)
    };
    handleChange("variants", next);
    syncAttributesFromVariants(next);
  };

  const updateCustomChildKey = (varIdx: number, oldKey: string, newKey: string) => {
    const next = [...(formData.variants || [])];
    const combo = { ...next[varIdx].combination };
    
    const val = combo[oldKey] || "";
    delete combo[oldKey];
    if (newKey) {
      combo[newKey] = val;
    }
    
    next[varIdx] = {
      ...next[varIdx],
      combination: combo,
      sku: generateVariantSKU(combo, varIdx, next)
    };
    
    handleChange("variants", next);
    syncAttributesFromVariants(next);
  };

  const updateCustomChildVal = (varIdx: number, key: string, newVal: string) => {
    const next = [...(formData.variants || [])];
    const combo = { ...next[varIdx].combination };
    
    if (key) {
      combo[key] = newVal;
    } else {
      combo["Option"] = newVal;
    }
    
    next[varIdx] = {
      ...next[varIdx],
      combination: combo,
      sku: generateVariantSKU(combo, varIdx, next)
    };
    
    handleChange("variants", next);
    syncAttributesFromVariants(next);
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
    handleChange("variants", next);
  };

  const filteredSubCategories = subCategories.filter(s => s.category_id === selectedCategory);

  const searchedSubCategories = subCategories.filter((s) => {
    const parentCat = categories.find(c => c.id === s.category_id);
    const fullName = `${parentCat ? parentCat.title + " " : ""}${s.title}`.toLowerCase();
    return fullName.includes(subCategorySearch.toLowerCase());
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-orange-500/20 rounded-3xl w-full max-w-4xl max-h-[90vh] shadow-2xl flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2">
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
                  <div className="relative">
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
                        onFocus={() => { setOpenSubCategorySelect(true); setSubCategorySearch(""); }}
                        placeholder="Select Sub Category"
                        className="w-full border border-gray-200 rounded-xl pl-4 pr-9 py-2.5 text-sm focus:border-orange-500 outline-none bg-white hover:border-gray-300 transition-colors text-gray-900 font-semibold placeholder:text-gray-400 placeholder:font-normal"
                      />
                      <ChevronDown
                        size={16}
                        onClick={() => setOpenSubCategorySelect(!openSubCategorySelect)}
                        className={`absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 shrink-0 transition-transform cursor-pointer ${openSubCategorySelect ? "rotate-180 text-orange-500" : ""}`}
                      />
                    </div>

                    {openSubCategorySelect && (
                      <>
                        <div
                          className="fixed inset-0 z-40 bg-transparent cursor-default"
                          onClick={() => { setOpenSubCategorySelect(false); setSubCategorySearch(""); }}
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
                                    const subId = s.id;
                                    let newSku = formData.sku;
                                    const prefix = s.title.substring(0, 3).toUpperCase();
                                    const randomDigits = Math.floor(10000 + Math.random() * 90000);
                                    newSku = `${prefix}${randomDigits}`;
                                    setFormData(prev => ({ ...prev, subcategory_id: subId, sku: newSku }));
                                    setOpenSubCategorySelect(false);
                                    setSubCategorySearch("");
                                  }}
                                  className={`w-full text-left px-3 py-2 text-sm font-semibold transition-colors ${
                                    formData.subcategory_id === s.id ? "text-orange-500 bg-orange-50/50 font-bold" : "text-gray-700 hover:bg-orange-50 hover:text-orange-500"
                                  }`}
                                >
                                  {parentCat ? `${parentCat.title} > ` : ''}{s.title}
                                </button>
                              );
                            })
                          )}
                        </div>
                      </>
                    )}
                  </div>
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
                  <label className="text-[11px] font-bold text-gray-700 block mb-1">Selling Price *</label>
                  <input
                    type="number" step="0.01" required
                    value={formData.price || ""}
                    onChange={(e) => {
                      const newPrice = parseFloat(e.target.value) || 0;
                      const originalPrice = formData.old_price || 0;
                      const discount = calculateDiscount(newPrice, originalPrice);
                      setFormData(prev => ({
                        ...prev,
                        price: newPrice,
                        discount_percentage: discount
                      }));
                    }}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-orange-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-700 block mb-1">Original Price</label>
                  <input
                    type="number" step="0.01"
                    value={formData.old_price || ""}
                    onChange={(e) => {
                      const originalPrice = parseFloat(e.target.value) || 0;
                      const sellingPrice = formData.price || 0;
                      const discount = calculateDiscount(sellingPrice, originalPrice);
                      setFormData(prev => ({
                        ...prev,
                        old_price: originalPrice,
                        discount_percentage: discount
                      }));
                    }}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-orange-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-700 block mb-1">Discount (%)</label>
                  <input
                    type="number"
                    value={formData.discount_percentage || ""}
                    onChange={(e) => handleChange("discount_percentage", parseFloat(e.target.value) || 0)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-orange-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-700 block mb-1">
                    Stock * {calculatedTotalStock !== null && <span className="text-orange-500 text-[10px]">(Calculated)</span>}
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.stock === undefined ? "" : formData.stock}
                    onChange={(e) => {
                      const val = Math.max(0, parseInt(e.target.value) || 0);
                      handleChange("stock", val);
                    }}
                    disabled={calculatedTotalStock !== null}
                    className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:border-orange-500 outline-none transition-colors ${
                      calculatedTotalStock !== null 
                        ? "bg-gray-50 border-gray-200 text-gray-450 cursor-not-allowed font-semibold"
                        : "border-gray-200 text-gray-700 bg-white"
                    }`}
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
                      placeholder="Name (e.g. Material, Warranty)"
                      value={newSpecName} onChange={(e) => setNewSpecName(e.target.value)}
                      className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-orange-500 outline-none"
                    />
                    <input
                      placeholder="Value (e.g. 100% Cotton, 1 Year)"
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

                {/* Dynamic Attributes Editor */}
                <div className="md:col-span-2 border-t pt-4">
                  <h5 className="text-xs font-bold text-gray-505 uppercase tracking-wider mb-3">Attributes & Variations</h5>
                  <div className="bg-[#fffcf9] border border-orange-500/10 rounded-2xl p-4.5 space-y-4">
                    
                    {/* Add Attribute Row */}
                    <div>
                      <label className="text-[11px] font-bold text-gray-700 block mb-1">Add Attribute</label>
                      <div className="flex gap-2.5">
                        <input
                          placeholder="Attribute Name (e.g. Size, Storage)"
                          value={tempAttrName}
                          onChange={(e) => setTempAttrName(e.target.value)}
                          className="flex-1 border border-gray-200 bg-white rounded-xl px-3 py-2 text-xs focus:border-orange-500 outline-none"
                        />
                        <input
                          placeholder="Values (comma-separated, e.g. 128GB, 256GB)"
                          value={tempAttrValuesStr}
                          onChange={(e) => setTempAttrValuesStr(e.target.value)}
                          className="flex-1 border border-gray-200 bg-white rounded-xl px-3 py-2 text-xs focus:border-orange-500 outline-none"
                        />
                        <button
                          type="button"
                          onClick={addAttribute}
                          className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-xs transition-colors shrink-0 cursor-pointer"
                        >
                          Add
                        </button>
                      </div>
                    </div>

                    {/* Attributes List */}
                    {formData.attributes && formData.attributes.length > 0 && (
                      <div className="flex flex-col gap-2">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Configured Attributes:</span>
                        <div className="flex flex-wrap gap-2">
                          {formData.attributes.map((attr, idx) => (
                            <span key={idx} className="text-[10px] bg-white border border-orange-500/15 text-gray-700 px-2.5 py-1.5 rounded-xl flex flex-wrap items-center gap-2 shadow-xs">
                              <span className="font-bold text-orange-500">{attr.name}:</span>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {attr.values.map(val => (
                                  <span key={val} className="flex items-center gap-1 bg-gray-50 border border-gray-200 px-1.5 py-0.5 rounded-md">
                                    {val}
                                    <X
                                      className="w-3 h-3 text-gray-400 hover:text-red-500 cursor-pointer transition-colors"
                                      onClick={() => deleteChildAttributeValue(attr.name, val)}
                                    />
                                  </span>
                                ))}
                              </div>
                              <X
                                className="w-4 h-4 text-red-500 hover:text-red-750 cursor-pointer transition-colors ml-1 border-l border-orange-500/10 pl-1"
                                onClick={() => deleteAttribute(idx)}
                              />
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>
                </div>

                {/* Dynamic Variants Row Editor */}
                {formData.attributes && formData.attributes.length > 0 && (() => {
                  const parentAttr = formData.attributes[0];
                  const childAttrs = formData.attributes.slice(1);
                  return (
                    <div className="md:col-span-2 border-t pt-4">
                      {/* Big Outer Container for the Parent Attribute (e.g. Color) */}
                      <div className="bg-[#fffdfb] border border-orange-500/10 rounded-3xl p-5 shadow-sm">
                        <div className="flex items-center justify-between border-b border-orange-100 pb-2.5 mb-4 flex-wrap gap-2">
                          <h6 className="text-[11px] font-extrabold text-orange-600 uppercase tracking-wider">
                            Variant Management (by {parentAttr.name})
                          </h6>
                          <div className="flex items-center gap-2">
                            <input
                              placeholder={`Add another ${parentAttr.name} (e.g. Red)`}
                              value={newParentValInput}
                              onChange={(e) => setNewParentValInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  addParentAttributeValue(newParentValInput);
                                  setNewParentValInput("");
                                }
                              }}
                              className="border border-orange-200 bg-white rounded-xl px-3 py-1.5 text-xs focus:border-orange-500 outline-none w-48 font-semibold text-gray-700"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                addParentAttributeValue(newParentValInput);
                                setNewParentValInput("");
                              }}
                              className="px-3.5 py-1.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer shrink-0"
                            >
                              ➕ Add {parentAttr.name}
                            </button>
                          </div>
                        </div>
                        
                        <div className="space-y-5">
                        {parentAttr.values.map((parentVal) => {
                          // Find all variants belonging to this parent value
                          const groupVariants = (formData.variants || []).filter(
                            (v: any) => v.combination && v.combination[parentAttr.name] === parentVal
                          );

                          return (
                            <div key={parentVal} className="border border-gray-150 rounded-2xl p-4.5 bg-white shadow-xs">
                              <div className="flex items-center justify-between border-b pb-3 mb-3">
                                <h4 className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                                  <span className="h-2 w-2 rounded-full bg-orange-500"></span>
                                  {parentAttr.name}: <span className="text-orange-600">{parentVal}</span>
                                </h4>
                                <div className="flex items-center gap-2">
                                  {childAttrs.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => addVariantForParent(parentVal)}
                                      className="px-2.5 py-1 bg-orange-55 hover:bg-orange-100 text-orange-600 font-bold rounded-xl text-[10px] transition-colors border border-orange-100 cursor-pointer flex items-center gap-1"
                                    >
                                      <span>➕</span> Add Variant Option
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => deleteChildAttributeValue(parentAttr.name, parentVal)}
                                    className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl text-[10px] transition-colors border border-red-100 cursor-pointer flex items-center gap-1"
                                    title={`Delete ${parentVal}`}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>Delete</span>
                                  </button>
                                </div>
                              </div>

                              {/* Group Content */}
                              <div className="space-y-3.5">
                                {childAttrs.length === 0 ? (
                                  /* Case 1: No child attributes configured yet */
                                  <div>
                                    {(() => {
                                      const v = groupVariants[0];
                                      if (!v) {
                                        return (
                                          <button
                                            type="button"
                                            onClick={() => addVariantForParent(parentVal)}
                                            className="w-full py-2.5 bg-orange-50/50 hover:bg-orange-50 border border-dashed border-orange-200 text-orange-600 font-bold rounded-xl text-[10px] transition-colors cursor-pointer flex items-center justify-center gap-1"
                                          >
                                            Activate Variant Configuration for {parentVal}
                                          </button>
                                        );
                                      }

                                      const globalIdx = formData.variants!.findIndex((x) => x === v);
                                      if (globalIdx === -1) return null;

                                      return (
                                        <div className="flex flex-wrap items-center gap-3 bg-gray-50 border border-gray-150 rounded-xl p-3 relative group">
                                          {/* Stock */}
                                          <div className="flex flex-col gap-0.5 w-[110px]">
                                            <span className="text-[9px] text-gray-400 font-bold uppercase">Qty / Stock</span>
                                            <div className="flex items-center border border-gray-200 rounded-lg bg-white overflow-hidden w-full">
                                              <button
                                                type="button"
                                                onClick={() => updateVariantField(globalIdx, "stock", Math.max(0, (v.stock || 0) - 1))}
                                                className="px-2.5 py-1 text-xs text-gray-550 hover:text-orange-600 font-bold hover:bg-gray-55 border-r border-gray-200 cursor-pointer"
                                              >
                                                -
                                              </button>
                                              <input
                                                type="number"
                                                value={v.stock === undefined ? 10 : v.stock}
                                                onChange={(e) => updateVariantField(globalIdx, "stock", parseInt(e.target.value) || 0)}
                                                className="w-12 text-center text-xs focus:outline-none border-none py-1 font-semibold outline-none"
                                              />
                                              <button
                                                type="button"
                                                onClick={() => updateVariantField(globalIdx, "stock", (v.stock || 0) + 1)}
                                                className="px-2.5 py-1 text-xs text-gray-550 hover:text-orange-600 font-bold hover:bg-gray-55 border-l border-gray-200 cursor-pointer"
                                              >
                                                +
                                              </button>
                                            </div>
                                          </div>

                                          {/* SKU */}
                                          <div className="flex flex-col gap-0.5 w-[145px]">
                                            <span className="text-[9px] text-gray-400 font-bold uppercase">SKU (Auto-Generated)</span>
                                            <input
                                              placeholder="Sub-SKU"
                                              value={v.sku || ""}
                                              onChange={(e) => updateVariantField(globalIdx, "sku", e.target.value)}
                                              className="border border-gray-200 bg-white rounded-lg px-2.5 py-1 text-xs focus:border-orange-500 outline-none w-full font-mono text-[10px]"
                                            />
                                          </div>

                                          {/* Selling Price */}
                                          <div className="flex flex-col gap-0.5 w-[85px]">
                                            <span className="text-[9px] text-gray-400 font-bold uppercase">Selling Price</span>
                                            <input
                                              type="number"
                                              step="0.01"
                                              placeholder="Override"
                                              value={v.price || ""}
                                              onChange={(e) => updateVariantField(globalIdx, "price", e.target.value ? parseFloat(e.target.value) : "")}
                                              className="border border-gray-200 bg-white rounded-lg px-2.5 py-1 text-xs focus:border-orange-500 outline-none w-full text-center font-semibold text-gray-700"
                                            />
                                          </div>

                                          {/* Original Price */}
                                          <div className="flex flex-col gap-0.5 w-[85px]">
                                            <span className="text-[9px] text-gray-400 font-bold uppercase">Original Price</span>
                                            <input
                                              type="number"
                                              step="0.01"
                                              placeholder="Override"
                                              value={v.old_price || ""}
                                              onChange={(e) => updateVariantField(globalIdx, "old_price", e.target.value ? parseFloat(e.target.value) : "")}
                                              className="border border-gray-200 bg-white rounded-lg px-2.5 py-1 text-xs focus:border-orange-500 outline-none w-full text-center font-semibold text-gray-700"
                                            />
                                          </div>

                                          {/* Image Upload/Thumbnail */}
                                          <div className="flex flex-col gap-0.5">
                                            <span className="text-[9px] text-gray-400 font-bold uppercase">Variant Image</span>
                                            <div className="flex items-center gap-2">
                                              {v.images && v.images[0] ? (
                                                <div className="relative h-7 w-7 rounded-lg border bg-white overflow-hidden group/img">
                                                  <img src={v.images[0]} className="h-full w-full object-contain" />
                                                  <button
                                                    type="button"
                                                    onClick={() => updateVariantField(globalIdx, "images", [])}
                                                    className="absolute inset-0 bg-black/60 text-white flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity text-[8px] border-none cursor-pointer"
                                                  >
                                                    ❌
                                                  </button>
                                                </div>
                                              ) : (
                                                <label className="h-7 px-2 border border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-white cursor-pointer hover:bg-gray-50 text-[10px] text-gray-500 font-bold gap-1 transition-colors">
                                                  📁 Upload
                                                  <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={(e) => handleVariantImageUpload(globalIdx, e)}
                                                  />
                                                </label>
                                              )}
                                            </div>
                                          </div>

                                          {/* Delete */}
                                          <button
                                            type="button"
                                            onClick={() => deleteVariantRow(globalIdx)}
                                            className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-55 transition-colors ml-auto cursor-pointer border border-gray-200"
                                            title="Delete Variant"
                                          >
                                            <X className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                      );
                                    })()}

                                    {/* Inline Add Child Attribute Input */}
                                    <div className="mt-4 pt-4 border-t border-dashed border-gray-150 flex flex-wrap items-center justify-between gap-3">
                                      <span className="text-[10px] text-gray-400 font-bold uppercase">Want to add sub-options (e.g. Size, Storage) for {parentVal}?</span>
                                      <div className="flex gap-2 items-center">
                                        <input
                                          placeholder="Sub-attribute name (e.g. Size)"
                                          value={subAttrInputs[parentVal] || ""}
                                          onChange={(e) => setSubAttrInputs(prev => ({ ...prev, [parentVal]: e.target.value }))}
                                          className="border border-gray-200 bg-white rounded-lg px-2.5 py-1 text-xs focus:border-orange-500 outline-none w-44"
                                        />
                                        <button
                                          type="button"
                                          onClick={() => {
                                            addSubAttribute(subAttrInputs[parentVal]);
                                            setSubAttrInputs(prev => ({ ...prev, [parentVal]: "" }));
                                          }}
                                          className="px-3.5 py-1.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer shrink-0"
                                        >
                                          Create Sub-Attribute
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                ) : childAttrs.length === 1 ? (
                                  /* Case 2: Exactly one child attribute (e.g., Color -> Size) */
                                  (() => {
                                    const childAttr = childAttrs[0];
                                    const childAttrValues = childAttr.values || [];

                                    return (
                                      <div className="space-y-3">
                                        {/* Inline Add Value Input for the Child Attribute */}
                                        <div className="flex items-center justify-between mb-4 bg-gray-55 border border-gray-200 rounded-xl p-2.5 gap-3 flex-wrap shadow-2xs">
                                          <span className="text-[10px] text-gray-500 font-bold uppercase">Add Value to {childAttr.name} (e.g. 128GB, S):</span>
                                          <div className="flex gap-2 items-center">
                                            <input
                                              placeholder={`e.g. 128GB, 256GB`}
                                              value={childValInputs[parentVal] || ""}
                                              onChange={(e) => setChildValInputs(prev => ({ ...prev, [parentVal]: e.target.value }))}
                                              className="border border-gray-200 bg-white rounded-lg px-2.5 py-1 text-xs focus:border-orange-500 outline-none w-36"
                                            />
                                            <div className="flex items-center gap-1">
                                              <span className="text-[9px] text-gray-400 font-bold uppercase">Qty:</span>
                                              <input
                                                type="number"
                                                placeholder="10"
                                                value={childValQtyInputs[parentVal] === undefined ? "" : childValQtyInputs[parentVal]}
                                                onChange={(e) => {
                                                  const val = e.target.value ? parseInt(e.target.value) : 10;
                                                  setChildValQtyInputs(prev => ({ ...prev, [parentVal]: val }));
                                                }}
                                                className="border border-gray-200 bg-white rounded-lg px-2 py-1 text-xs focus:border-orange-500 outline-none w-14 text-center"
                                              />
                                            </div>
                                            <button
                                              type="button"
                                              onClick={() => {
                                                const qty = childValQtyInputs[parentVal] === undefined ? 10 : childValQtyInputs[parentVal];
                                                addChildAttributeValue(childAttr.name, childValInputs[parentVal], parentVal, qty);
                                                setChildValInputs(prev => ({ ...prev, [parentVal]: "" }));
                                                setChildValQtyInputs(prev => {
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

                                        {/* Loop through each configured value of child attribute */}
                                        <div className="space-y-2">
                                          {childAttrValues.map((childVal) => {
                                            const v = groupVariants.find(
                                              (x: any) => x.combination && x.combination[childAttr.name] === childVal
                                            );

                                            if (!v) {
                                              /* Sub-variant combo not created yet */
                                              return (
                                                <div key={childVal} className="flex items-center justify-between bg-gray-55/50 border border-dashed border-gray-200 rounded-xl p-3.5">
                                                  <span className="text-xs font-semibold text-gray-400">{childAttr.name}: <b className="text-gray-500">{childVal}</b> (Inactive)</span>
                                                  <div className="flex items-center gap-2">
                                                    <button
                                                      type="button"
                                                      onClick={() => activateSubVariant(parentVal, childAttr.name, childVal)}
                                                      className="px-3 py-1 bg-white border border-gray-200 hover:bg-orange-50 hover:border-orange-200 text-gray-600 hover:text-orange-600 font-bold rounded-lg text-[10px] transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                                                    >
                                                      ➕ Activate Option
                                                    </button>
                                                    <button
                                                      type="button"
                                                      onClick={() => deleteChildAttributeValue(childAttr.name, childVal)}
                                                      className="p-1.5 text-gray-450 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer border border-gray-200"
                                                      title={`Delete ${childVal}`}
                                                    >
                                                      <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                  </div>
                                                </div>
                                              );
                                            }

                                            const globalIdx = formData.variants!.findIndex((x) => x === v);
                                            if (globalIdx === -1) return null;

                                            return (
                                              <div key={childVal} className="flex flex-wrap items-center gap-3 bg-gray-55 border border-gray-150 rounded-xl p-3 relative group">
                                                {/* Child option label */}
                                                <div className="flex flex-col gap-0.5 min-w-[90px]">
                                                  <span className="text-[9px] text-gray-400 font-bold uppercase">{childAttr.name}</span>
                                                  <span className="text-xs font-bold text-gray-800 py-1">{childVal}</span>
                                                </div>

                                                {/* Stock */}
                                                <div className="flex flex-col gap-0.5 w-[110px]">
                                                  <span className="text-[9px] text-gray-400 font-bold uppercase">Qty / Stock</span>
                                                  <div className="flex items-center border border-gray-200 rounded-lg bg-white overflow-hidden w-full">
                                                    <button
                                                      type="button"
                                                      onClick={() => updateVariantField(globalIdx, "stock", Math.max(0, (v.stock || 0) - 1))}
                                                      className="px-2.5 py-1 text-xs text-gray-500 hover:text-orange-600 font-bold hover:bg-gray-50 border-r border-gray-200 cursor-pointer"
                                                    >
                                                      -
                                                    </button>
                                                    <input
                                                      type="number"
                                                      value={v.stock === undefined ? 10 : v.stock}
                                                      onChange={(e) => updateVariantField(globalIdx, "stock", parseInt(e.target.value) || 0)}
                                                      className="w-12 text-center text-xs focus:outline-none border-none py-1 font-semibold outline-none"
                                                    />
                                                    <button
                                                      type="button"
                                                      onClick={() => updateVariantField(globalIdx, "stock", (v.stock || 0) + 1)}
                                                      className="px-2.5 py-1 text-xs text-gray-550 hover:text-orange-600 font-bold hover:bg-gray-50 border-l border-gray-200 cursor-pointer"
                                                    >
                                                      +
                                                    </button>
                                                  </div>
                                                </div>

                                                {/* SKU */}
                                                <div className="flex flex-col gap-0.5 w-[145px]">
                                                  <span className="text-[9px] text-gray-400 font-bold uppercase">SKU (Auto-Generated)</span>
                                                  <input
                                                    placeholder="Sub-SKU"
                                                    value={v.sku || ""}
                                                    onChange={(e) => updateVariantField(globalIdx, "sku", e.target.value)}
                                                    className="border border-gray-200 bg-white rounded-lg px-2.5 py-1 text-xs focus:border-orange-500 outline-none w-full font-mono text-[10px]"
                                                  />
                                                </div>

                                                {/* Selling Price */}
                                                <div className="flex flex-col gap-0.5 w-[85px]">
                                                  <span className="text-[9px] text-gray-400 font-bold uppercase">Selling Price</span>
                                                  <input
                                                    type="number"
                                                    step="0.01"
                                                    placeholder="Override"
                                                    value={v.price || ""}
                                                    onChange={(e) => updateVariantField(globalIdx, "price", e.target.value ? parseFloat(e.target.value) : "")}
                                                    className="border border-gray-200 bg-white rounded-lg px-2.5 py-1 text-xs focus:border-orange-500 outline-none w-full text-center font-semibold text-gray-700"
                                                  />
                                                </div>

                                                {/* Original Price */}
                                                <div className="flex flex-col gap-0.5 w-[85px]">
                                                  <span className="text-[9px] text-gray-400 font-bold uppercase">Original Price</span>
                                                  <input
                                                    type="number"
                                                    step="0.01"
                                                    placeholder="Override"
                                                    value={v.old_price || ""}
                                                    onChange={(e) => updateVariantField(globalIdx, "old_price", e.target.value ? parseFloat(e.target.value) : "")}
                                                    className="border border-gray-200 bg-white rounded-lg px-2.5 py-1 text-xs focus:border-orange-500 outline-none w-full text-center font-semibold text-gray-700"
                                                  />
                                                </div>

                                                {/* Image Upload/Thumbnail */}
                                                <div className="flex flex-col gap-0.5">
                                                  <span className="text-[9px] text-gray-400 font-bold uppercase">Variant Image</span>
                                                  <div className="flex items-center gap-2">
                                                    {v.images && v.images[0] ? (
                                                      <div className="relative h-7 w-7 rounded-lg border bg-white overflow-hidden group/img">
                                                        <img src={v.images[0]} className="h-full w-full object-contain" />
                                                        <button
                                                          type="button"
                                                          onClick={() => updateVariantField(globalIdx, "images", [])}
                                                          className="absolute inset-0 bg-black/60 text-white flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity text-[8px] border-none cursor-pointer"
                                                        >
                                                          ❌
                                                        </button>
                                                      </div>
                                                    ) : (
                                                      <label className="h-7 px-2 border border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-white cursor-pointer hover:bg-gray-50 text-[10px] text-gray-500 font-bold gap-1 transition-colors">
                                                        📁 Upload
                                                        <input
                                                          type="file"
                                                          accept="image/*"
                                                          className="hidden"
                                                          onChange={(e) => handleVariantImageUpload(globalIdx, e)}
                                                        />
                                                      </label>
                                                    )}
                                                  </div>
                                                </div>

                                                {/* Delete */}
                                                <button
                                                  type="button"
                                                  onClick={() => deleteVariantRow(globalIdx)}
                                                  className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-55 transition-colors ml-auto cursor-pointer border border-gray-200"
                                                  title="Delete Variant"
                                                >
                                                  <X className="w-3.5 h-3.5" />
                                                </button>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    );
                                  })()
                                ) : (
                                  /* Case 3: Multiple child attributes (e.g. Color -> Size -> Storage) */
                                  <div className="space-y-3.5">
                                    {groupVariants.length > 0 ? (
                                      groupVariants.map((v: any) => {
                                        const globalIdx = formData.variants!.findIndex((x) => x === v);
                                        if (globalIdx === -1) return null;

                                        return (
                                          <div key={globalIdx} className="flex flex-wrap items-center gap-3 bg-gray-55 border border-gray-150 rounded-xl p-3 relative group">
                                            {/* Dropdowns for child attributes */}
                                            <div className="flex flex-wrap gap-2.5">
                                              {childAttrs.map((cAttr) => (
                                                <div key={cAttr.name} className="flex flex-col gap-0.5 min-w-[90px]">
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

                                            {/* Stock */}
                                            <div className="flex flex-col gap-0.5 w-[110px]">
                                              <span className="text-[9px] text-gray-400 font-bold uppercase">Qty / Stock</span>
                                              <div className="flex items-center border border-gray-200 rounded-lg bg-white overflow-hidden w-full">
                                                <button
                                                  type="button"
                                                  onClick={() => updateVariantField(globalIdx, "stock", Math.max(0, (v.stock || 0) - 1))}
                                                  className="px-2.5 py-1 text-xs text-gray-550 hover:text-orange-600 font-bold hover:bg-gray-55 border-r border-gray-200 cursor-pointer"
                                                >
                                                  -
                                                </button>
                                                <input
                                                  type="number"
                                                  value={v.stock === undefined ? 10 : v.stock}
                                                  onChange={(e) => updateVariantField(globalIdx, "stock", parseInt(e.target.value) || 0)}
                                                  className="w-12 text-center text-xs focus:outline-none border-none py-1 font-semibold outline-none"
                                                />
                                                <button
                                                  type="button"
                                                  onClick={() => updateVariantField(globalIdx, "stock", (v.stock || 0) + 1)}
                                                  className="px-2.5 py-1 text-xs text-gray-550 hover:text-orange-600 font-bold hover:bg-gray-55 border-l border-gray-200 cursor-pointer"
                                                >
                                                  +
                                                </button>
                                              </div>
                                            </div>

                                            {/* SKU */}
                                            <div className="flex flex-col gap-0.5 w-[145px]">
                                              <span className="text-[9px] text-gray-400 font-bold uppercase">SKU (Auto-Generated)</span>
                                              <input
                                                placeholder="Sub-SKU"
                                                value={v.sku || ""}
                                                onChange={(e) => updateVariantField(globalIdx, "sku", e.target.value)}
                                                className="border border-gray-200 bg-white rounded-lg px-2.5 py-1 text-xs focus:border-orange-500 outline-none w-full font-mono text-[10px]"
                                              />
                                            </div>

                                            {/* Selling Price */}
                                            <div className="flex flex-col gap-0.5 w-[85px]">
                                              <span className="text-[9px] text-gray-400 font-bold uppercase">Selling Price</span>
                                              <input
                                                type="number"
                                                step="0.01"
                                                placeholder="Override"
                                                value={v.price || ""}
                                                onChange={(e) => updateVariantField(globalIdx, "price", e.target.value ? parseFloat(e.target.value) : "")}
                                                className="border border-gray-200 bg-white rounded-lg px-2.5 py-1 text-xs focus:border-orange-500 outline-none w-full text-center font-semibold text-gray-700"
                                              />
                                            </div>

                                            {/* Original Price */}
                                            <div className="flex flex-col gap-0.5 w-[85px]">
                                              <span className="text-[9px] text-gray-400 font-bold uppercase">Original Price</span>
                                              <input
                                                type="number"
                                                step="0.01"
                                                placeholder="Override"
                                                value={v.old_price || ""}
                                                onChange={(e) => updateVariantField(globalIdx, "old_price", e.target.value ? parseFloat(e.target.value) : "")}
                                                className="border border-gray-200 bg-white rounded-lg px-2.5 py-1 text-xs focus:border-orange-500 outline-none w-full text-center font-semibold text-gray-700"
                                              />
                                            </div>

                                            {/* Image Upload/Thumbnail */}
                                            <div className="flex flex-col gap-0.5">
                                              <span className="text-[9px] text-gray-400 font-bold uppercase">Variant Image</span>
                                              <div className="flex items-center gap-2">
                                                {v.images && v.images[0] ? (
                                                  <div className="relative h-7 w-7 rounded-lg border bg-white overflow-hidden group/img">
                                                    <img src={v.images[0]} className="h-full w-full object-contain" />
                                                    <button
                                                      type="button"
                                                      onClick={() => updateVariantField(globalIdx, "images", [])}
                                                      className="absolute inset-0 bg-black/60 text-white flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity text-[8px] border-none cursor-pointer"
                                                    >
                                                      ❌
                                                    </button>
                                                  </div>
                                                ) : (
                                                  <label className="h-7 px-2 border border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-white cursor-pointer hover:bg-gray-50 text-[10px] text-gray-500 font-bold gap-1 transition-colors">
                                                    📁 Upload
                                                    <input
                                                      type="file"
                                                      accept="image/*"
                                                      className="hidden"
                                                      onChange={(e) => handleVariantImageUpload(globalIdx, e)}
                                                    />
                                                  </label>
                                                )}
                                              </div>
                                            </div>

                                            {/* Delete */}
                                            <button
                                              type="button"
                                              onClick={() => deleteVariantRow(globalIdx)}
                                              className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-55 transition-colors ml-auto cursor-pointer border border-gray-200"
                                              title="Delete Variant"
                                            >
                                              <X className="w-3.5 h-3.5" />
                                            </button>
                                          </div>
                                        );
                                      })
                                    ) : (
                                      <div className="text-center py-5 border-2 border-dashed border-gray-200 rounded-xl text-[10px] text-gray-400 font-semibold">
                                        No variants created for {parentVal}. Click "+ Add Variant Option" to configure one.
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })()}

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