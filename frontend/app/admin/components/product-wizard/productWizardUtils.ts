import { ProductRequest, ProductSpecification } from "@/app/types/types";

export const normalizeVariants = (variants: any[]): any[] => {
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

export const calculateDiscount = (sellingPrice: number, originalPrice: number): number => {
  if (!originalPrice || !sellingPrice || originalPrice <= sellingPrice) {
    return 0;
  }
  return Math.round(((originalPrice - sellingPrice) / originalPrice) * 100);
};

export const generateVariantSKU = (
  combo: Record<string, string>,
  index: number,
  currentVariants: any[],
  productSku: string = "PROD"
): string => {
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

export const syncAttributesFromVariants = (
  updatedVariants: any[],
  currentAttributes: { name: string; values: string[] }[] = []
): { name: string; values: string[] }[] => {
  const parentAttr = currentAttributes[0];
  if (!parentAttr) return [];

  const otherKeys = new Set<string>();
  
  updatedVariants.forEach((v) => {
    if (v.combination) {
      Object.keys(v.combination).forEach((k) => {
        if (k.toLowerCase() !== parentAttr.name.toLowerCase()) {
          otherKeys.add(k);
        }
      });
    }
  });

  currentAttributes.forEach((attr, idx) => {
    if (idx > 0) {
      otherKeys.add(attr.name);
    }
  });

  const newChildAttrs = Array.from(otherKeys).map((k) => {
    const values = new Set<string>();
    
    const existingAttr = currentAttributes.find(a => a.name.toLowerCase() === k.toLowerCase());
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

  return [parentAttr, ...newChildAttrs];
};

// LocalStorage helpers
const LOCAL_STORAGE_KEY = "griva_product_wizard_draft";

export const saveDraft = (data: Partial<ProductRequest>) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Failed to save product draft to localStorage", e);
  }
};

export const loadDraft = (): Partial<ProductRequest> | null => {
  if (typeof window === "undefined") return null;
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error("Failed to load product draft from localStorage", e);
    return null;
  }
};

export const clearDraft = () => {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  } catch (e) {
    console.error("Failed to clear product draft from localStorage", e);
  }
};

// Warranty parsing helpers
// Warranty details are stored inside Specifications as name="Warranty Title" and name="Warranty Description"
export interface WarrantyData {
  enabled: boolean;
  title: string;
  description: string;
}

export const extractWarranty = (specs: ProductSpecification[] = []): WarrantyData => {
  const titleSpec = specs.find(s => s.name === "Warranty Title");
  const descSpec = specs.find(s => s.name === "Warranty Description");
  
  return {
    enabled: !!(titleSpec || descSpec),
    title: titleSpec ? titleSpec.value : "",
    description: descSpec ? descSpec.value : ""
  };
};

export const updateWarrantyInSpecs = (
  specs: ProductSpecification[] = [],
  warranty: WarrantyData
): ProductSpecification[] => {
  // Filter out any existing warranty specifications
  const filtered = specs.filter(s => s.name !== "Warranty Title" && s.name !== "Warranty Description");
  
  if (warranty.enabled) {
    if (warranty.title.trim()) {
      filtered.push({ name: "Warranty Title", value: warranty.title.trim() });
    }
    if (warranty.description.trim()) {
      filtered.push({ name: "Warranty Description", value: warranty.description.trim() });
    }
  }
  
  return filtered;
};

// Validations per step
export const validateStep = (step: number, data: Partial<ProductRequest>): string | null => {
  switch (step) {
    case 1:
      if (!data.title?.trim()) return "Product Name is required.";
      if (!data.slug?.trim()) return "Slug is required.";
      if (!data.subcategory_id) return "Category is required.";
      break;
    case 2:
      if (data.price === undefined || data.price === null || Number(data.price) <= 0) {
        return "A valid Selling Price is required.";
      }
      if (!data.main_image_url) {
        return "Main Image is required.";
      }
      break;
    case 3:
      // Details step is entirely optional
      break;
    case 4:
      // Option values duplicate checking or incomplete option name check
      if (data.attributes && data.attributes.length > 0) {
        for (const attr of data.attributes) {
          if (!attr.name.trim()) return "Option name cannot be empty.";
          if (!attr.values || attr.values.length === 0) {
            return `Option '${attr.name}' must have at least one value.`;
          }
        }
      }
      break;
    case 5:
      // SEO & Publish is optional
      break;
  }
  return null;
};
