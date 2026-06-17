"use client";
import React, { useState } from "react";
import { Sparkles, X } from "lucide-react";
import { Product } from "@/app/types/types";
import { createProductApi } from "@/app/utils/api";
// import { createProductApi } from "../utils/api";
// import { Product } from "../types/types";

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductAdded: (product: Product) => void;
}

const CATEGORIES = ["Gadgets", "Laptops", "Television", "Speakers", "Headphones", "Gaming"];

export default function AddProductModal({ isOpen, onClose, onProductAdded }: AddProductModalProps) {
  const [newTitle, setNewTitle]           = useState("");
  const [newPrice, setNewPrice]           = useState("");
  const [newOldPrice, setNewOldPrice]     = useState("");
  const [newStock, setNewStock]           = useState(10);
  const [newCategory, setNewCategory]     = useState("Gadgets");
  const [newDesc, setNewDesc]             = useState("");
  const [newBadge, setNewBadge]           = useState("");
  const [newMainImage, setNewMainImage]   = useState(
    "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=800"
  );

  const [galleryImages, setGalleryImages]     = useState<string[]>([]);
  const [newGalleryImage, setNewGalleryImage] = useState("");

  const [specsList, setSpecsList]       = useState<{ label: string; value: string }[]>([]);
  const [newSpecLabel, setNewSpecLabel] = useState("");
  const [newSpecValue, setNewSpecValue] = useState("");

  const [colorsList, setColorsList]       = useState<{ name: string; hex: string }[]>([]);
  const [newColorName, setNewColorName]   = useState("");
  const [newColorHex, setNewColorHex]     = useState("#000000");

  const resetForm = () => {
    setNewTitle(""); setNewPrice(""); setNewOldPrice(""); setNewStock(10);
    setNewDesc(""); setNewBadge(""); setNewMainImage(
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=800"
    );
    setGalleryImages([]); setNewGalleryImage("");
    setSpecsList([]); setNewSpecLabel(""); setNewSpecValue("");
    setColorsList([]); setNewColorName(""); setNewColorHex("#000000");
  };

  const handleClose = () => { resetForm(); onClose(); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newPrice) return;

    const item = {
      title: newTitle,
      category: newCategory,
      image: newMainImage,
      images: [newMainImage, ...galleryImages],
      price: `$${parseFloat(newPrice).toFixed(2)}`,
      oldPrice: newOldPrice ? `$${parseFloat(newOldPrice).toFixed(2)}` : undefined,
      badge: newBadge || undefined,
      stock: newStock,
      description: newDesc,
      specs: specsList,
      colors: colorsList,
      storageOptions: [],
    };

    const saved = await createProductApi(item);
    if (saved) {
      onProductAdded(saved);
      resetForm();
      onClose();
    }
  };

  const handleAddGalleryImage = () => {
    if (newGalleryImage) {
      setGalleryImages((p) => [...p, newGalleryImage]);
      setNewGalleryImage("");
    }
  };

  const handleAddSpec = () => {
    if (newSpecLabel && newSpecValue) {
      setSpecsList((p) => [...p, { label: newSpecLabel, value: newSpecValue }]);
      setNewSpecLabel(""); setNewSpecValue("");
    }
  };

  const handleAddColor = () => {
    if (newColorName) {
      setColorsList((p) => [...p, { name: newColorName, hex: newColorHex }]);
      setNewColorName(""); setNewColorHex("#000000");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-orange-500/30 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-5">

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-orange-500" />
            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
              Add Catalog Product
            </h4>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 hover:bg-orange-500/10 rounded-lg cursor-pointer"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Title & Category */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">
                Product Title
              </label>
              <input
                required
                placeholder="e.g. DJI Mini 4 Pro"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full border border-orange-500/30 rounded-xl px-4 py-2.5 text-xs text-gray-800 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">
                Category
              </label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full border border-orange-500/30 rounded-xl px-4 py-2.5 text-xs text-gray-500 focus:outline-none cursor-pointer"
              >
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>

            {/* Main Image */}
            <div className="col-span-2">
              <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">
                Main Image URL
              </label>
              <input
                type="url"
                placeholder="https://..."
                value={newMainImage}
                onChange={(e) => setNewMainImage(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-gray-800 focus:outline-none"
              />
            </div>

            {/* Gallery Images */}
            <div className="col-span-2">
              <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">
                Additional Gallery Images
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="Add image URL..."
                  value={newGalleryImage}
                  onChange={(e) => setNewGalleryImage(e.target.value)}
                  className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddGalleryImage}
                  className="px-3 bg-orange-500/10 text-xs font-bold text-gray-900 rounded-xl cursor-pointer"
                >
                  Add
                </button>
              </div>
              {galleryImages.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {galleryImages.map((img, i) => (
                    <span key={i} className="text-[9px] font-bold text-gray-500 bg-white border border-gray-200 px-2 py-1 rounded-lg flex items-center gap-1">
                      {img.slice(0, 30)}...
                      <X
                        className="h-3 w-3 text-red-500 cursor-pointer"
                        onClick={() => setGalleryImages((p) => p.filter((_, j) => j !== i))}
                      />
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Pricing & Stock */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">
                Sale Price ($)
              </label>
              <input
                type="number" step="0.01" required placeholder="699.99"
                value={newPrice} onChange={(e) => setNewPrice(e.target.value)}
                className="w-full border border-orange-500/30 rounded-xl px-4 py-2.5 text-xs focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">
                Original Price ($)
              </label>
              <input
                type="number" step="0.01" placeholder="949.99"
                value={newOldPrice} onChange={(e) => setNewOldPrice(e.target.value)}
                className="w-full border border-orange-500/30 rounded-xl px-4 py-2.5 text-xs focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">
                Initial Stock
              </label>
              <input
                type="number" required placeholder="12"
                value={newStock} onChange={(e) => setNewStock(parseInt(e.target.value))}
                className="w-full border border-orange-500/30 rounded-xl px-4 py-2.5 text-xs focus:outline-none"
              />
            </div>
          </div>

          {/* Description & Badge */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">
                Description
              </label>
              <textarea
                rows={3} placeholder="High power device..."
                value={newDesc} onChange={(e) => setNewDesc(e.target.value)}
                className="w-full border border-orange-500/30 rounded-xl px-4 py-2 text-xs focus:outline-none resize-none"
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">
                Promo Badge
              </label>
              <input
                type="text" placeholder="-26% or HOT"
                value={newBadge} onChange={(e) => setNewBadge(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none"
              />
            </div>
          </div>

          {/* Technical Specs */}
          <div>
            <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">
              Technical Specs
            </label>
            <div className="flex gap-2">
              <input
                type="text" placeholder="Label: Display"
                value={newSpecLabel} onChange={(e) => setNewSpecLabel(e.target.value)}
                className="flex-1 border border-orange-500/30 rounded-xl px-3 py-2 text-xs focus:outline-none"
              />
              <input
                type="text" placeholder="Value: 6.8 inch"
                value={newSpecValue} onChange={(e) => setNewSpecValue(e.target.value)}
                className="flex-1 border border-orange-500/30 rounded-xl px-3 py-2 text-xs focus:outline-none"
              />
              <button
                type="button" onClick={handleAddSpec}
                className="px-3 bg-orange-500/10 text-xs font-bold text-orange-500 rounded-xl cursor-pointer"
              >
                Add
              </button>
            </div>
            {specsList.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {specsList.map((s, i) => (
                  <span key={i} className="text-[9px] font-bold text-gray-500 bg-white border border-orange-500/30 px-2 py-1 rounded-lg flex items-center gap-1">
                    {s.label}: {s.value}
                    <X
                      className="h-3 w-3 text-red-500 cursor-pointer"
                      onClick={() => setSpecsList((p) => p.filter((_, j) => j !== i))}
                    />
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Colors */}
          <div>
            <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">
              Colors
            </label>
            <div className="flex gap-2">
              <input
                type="text" placeholder="Color Name"
                value={newColorName} onChange={(e) => setNewColorName(e.target.value)}
                className="flex-1 border border-orange-500/30 rounded-xl px-3 py-2 text-xs focus:outline-none"
              />
              <input
                type="color" value={newColorHex}
                onChange={(e) => setNewColorHex(e.target.value)}
                className="h-8 w-12 border-0 cursor-pointer p-0"
              />
              <button
                type="button" onClick={handleAddColor}
                className="px-3 bg-orange-500/10 text-xs font-bold text-orange-500 rounded-xl cursor-pointer"
              >
                Add
              </button>
            </div>
            {colorsList.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {colorsList.map((c, i) => (
                  <span key={i} className="text-[9px] font-bold text-gray-500 bg-white border border-orange-500/30 px-2 py-1 rounded-lg flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: c.hex }} />
                    {c.name}
                    <X
                      className="h-3 w-3 text-red-500 cursor-pointer"
                      onClick={() => setColorsList((p) => p.filter((_, j) => j !== i))}
                    />
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button
              type="button" onClick={handleClose}
              className="flex-1 py-3 bg-white border border-gray-200 hover:bg-gray-50 text-xs font-bold text-gray-500 rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-xs font-bold text-white rounded-xl cursor-pointer shadow-lg shadow-orange-500/10"
            >
              Save to Catalog
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}