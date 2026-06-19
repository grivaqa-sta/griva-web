import React, { useState, useEffect } from 'react';
import {
  Search, Plus, Trash2, Edit, Check, X, ChevronDown
} from 'lucide-react';
import { ProductRequest, Category, SubCategory } from '@/app/types/types';
import { productService } from '@/app/services/product.service';
import { categoryService } from '@/app/services/category.service';
import { subCategoryService } from '@/app/services/subCategory.service';
import AddProductModal from './AddProductModal';

export default function ProductsTab() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [activeSubCategories, setActiveSubCategories] = useState<SubCategory[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [openCategoryFilter, setOpenCategoryFilter] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  const [stockPromptProductId, setStockPromptProductId] = useState<number | null>(null);
  const [stockPromptValue, setStockPromptValue] = useState<string>('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes, subRes, activeSubRes] = await Promise.all([
        productService.getProducts(),
        categoryService.getCategories(),
        subCategoryService.getSubCategories(),
        subCategoryService.getAllActiveSubCategories()
      ]);
      const pData = prodRes?.data || prodRes;
      const cData = catRes?.data || catRes;
      const sData = subRes?.data || subRes;
      const activeSData = activeSubRes?.data || activeSubRes;
      setProducts(Array.isArray(pData) ? pData : []);
      setCategories(Array.isArray(cData) ? cData : []);
      setSubCategories(Array.isArray(sData) ? sData : []);
      setActiveSubCategories(Array.isArray(activeSData) ? activeSData : []);
    } catch (err) {
      console.error("Failed to load products data", err);
    }
    setLoading(false);
  };

  const handleStockAdjustment = async (id: number, delta: number) => {
    const p = products.find((x) => x.id === id); 
    if (!p) return;
    const next = Math.max(0, (p.stock || 0) + delta);
    setProducts((prev) => prev.map((x) => x.id === id ? { ...x, stock: next } : x));
    try {
      await productService.updateProductStock(id, next);
    } catch (err) {
      alert("Failed to update stock");
      loadData(); // Revert on failure
    }
  };

  const handleDirectStockEdit = async (id: number, val: number) => {
    setProducts((prev) => prev.map((p) => p.id === id ? { ...p, stock: val } : p));
    try {
      await productService.updateProductStock(id, val);
    } catch (err) {
      alert("Failed to update stock");
      loadData();
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        await productService.deleteProduct(id);
        setProducts(prev => prev.filter(c => c.id !== id));
      } catch (err) {
        alert("Failed to delete product");
      }
    }
  };

  const handleConfirmAddStock = () => {
    const num = parseInt(stockPromptValue);
    if (!isNaN(num) && num > 0 && stockPromptProductId !== null) {
      handleStockAdjustment(stockPromptProductId, num);
    }
    setStockPromptProductId(null);
    setStockPromptValue('');
  };

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product: any) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const getSubCategoryName = (id: number) => {
    const sub = subCategories.find(s => s.id === id);
    if (!sub) return "Unknown";
    return sub.title;
  };

  const getCategoryNameForSub = (subId: number) => {
    const sub = subCategories.find(s => s.id === subId);
    if (!sub) return "Unknown";
    const cat = categories.find(c => c.id === sub.category_id);
    return cat ? cat.title : "Unknown";
  };

  const filteredProducts = products.filter((p) => {
    const ms = (p.title?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
               (p.slug?.toLowerCase() || "").includes(searchQuery.toLowerCase());
    if (!ms) return false;
    
    if (filterCategory !== "all") {
      const sub = subCategories.find(s => s.id === p.subcategory_id);
      if (!sub) return false;
      const cat = categories.find(c => c.id === sub.category_id);
      if (!cat || cat.id.toString() !== filterCategory) return false;
    }
    
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border border-orange-500/30">
        <div className="flex flex-1 gap-3 w-full sm:w-auto">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search product title, slug..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-orange-500/30 rounded-xl pl-9 pr-4 py-2 text-xs text-gray-800 focus:outline-none"
            />
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenCategoryFilter(!openCategoryFilter)}
              className="bg-white border border-orange-500/30 rounded-xl px-3 py-2 text-xs font-semibold text-gray-700 hover:border-orange-500/50 transition-all cursor-pointer flex items-center justify-between gap-1.5 outline-none h-[34px] min-w-[130px]"
            >
              <span>
                {filterCategory === "all"
                  ? "All Categories"
                  : categories.find(c => c.id.toString() === filterCategory)?.title || "All Categories"}
              </span>
              <ChevronDown size={14} className={`text-gray-400 shrink-0 transition-transform ${openCategoryFilter ? "rotate-180 text-orange-500" : ""}`} />
            </button>

            {openCategoryFilter && (
              <>
                <div
                  className="fixed inset-0 z-40 bg-transparent cursor-default"
                  onClick={() => setOpenCategoryFilter(false)}
                />
                <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-100 rounded-xl shadow-xl z-50 py-1 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 max-h-48 overflow-y-auto min-w-[150px]">
                  <button
                    type="button"
                    onClick={() => {
                      setFilterCategory("all");
                      setOpenCategoryFilter(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs font-semibold transition-colors ${
                      filterCategory === "all" ? "text-orange-500 bg-orange-50/50 font-bold" : "text-gray-700 hover:bg-orange-50 hover:text-orange-500"
                    }`}
                  >
                    All Categories
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setFilterCategory(cat.id.toString());
                        setOpenCategoryFilter(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs font-semibold transition-colors ${
                        filterCategory === cat.id.toString() ? "text-orange-500 bg-orange-50/50 font-bold" : "text-gray-700 hover:bg-orange-50 hover:text-orange-500"
                      }`}
                    >
                      {cat.title}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors cursor-pointer w-full sm:w-auto justify-center font-semibold text-sm shadow-md"
        >
          <Plus className="h-4.5 w-4.5" />
          Add Catalog Product
        </button>
      </div>

      <div className="bg-white border border-orange-500/30 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b border-orange-500/30 text-[10px] text-gray-400 font-bold uppercase tracking-wider bg-gray-50">
              <th className="p-3">Product Details</th>
              <th className="p-3">Category / Sub</th>
              <th className="p-3">Price</th>
              <th className="p-3 text-center">Stock Inventory</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-xs text-gray-400">Loading products...</td>
              </tr>
            ) : filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-xs text-gray-400">No products matched the active filters.</td>
              </tr>
            ) : (
              filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="p-3 flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-white p-1 flex items-center justify-center shrink-0 border border-orange-500/30 overflow-hidden">
                      {p.main_image_url ? (
                        <img src={p.main_image_url} alt={p.title} className="h-full w-full object-contain" />
                      ) : (
                        <span className="text-[10px] font-black text-orange-500">GRIVA</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-gray-900 block truncate max-w-[180px] group-hover:text-orange-400 transition-colors">{p.title}</span>
                      <div className="flex gap-2 items-center mt-1">
                        {p.is_active ? (
                          <span className="text-[8px] font-bold text-green-500 px-1.5 py-0.5 rounded uppercase bg-green-50 border border-green-200">Active</span>
                        ) : (
                          <span className="text-[8px] font-bold text-red-500 px-1.5 py-0.5 rounded uppercase bg-red-50 border border-red-200">Inactive</span>
                        )}
                        <span className="text-[9px] text-gray-400 font-semibold">ID: #{p.id}</span>
                      </div>
                    </div>
                  </td>

                  <td className="p-3">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-gray-700 font-semibold bg-white border border-orange-500/30 px-2 py-0.5 rounded w-fit">
                        {getCategoryNameForSub(p.subcategory_id)}
                      </span>
                      <span className="text-[10px] text-gray-500 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded w-fit">
                        {getSubCategoryName(p.subcategory_id)}
                      </span>
                    </div>
                  </td>

                  <td className="p-3">
                    <div>
                      <span className="text-xs font-black text-gray-900">${Number(p.price).toFixed(2)}</span>
                      {p.old_price && (
                        <span className="text-[10px] text-gray-400 line-through block mt-0.5">${Number(p.old_price).toFixed(2)}</span>
                      )}
                    </div>
                  </td>

                  <td className="p-3">
                    <div className="flex items-center justify-center gap-4">
                      <div className="flex flex-col items-center">
                        <input
                          type="number"
                          className={`w-14 text-center text-sm font-black bg-transparent border-none p-0 focus:outline-none focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${p.stock && p.stock <= 5 ? 'text-orange-500' : 'text-gray-800'}`}
                          value={p.stock || 0}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 0;
                            handleDirectStockEdit(p.id, val);
                          }}
                        />
                        <span className="text-[9px] text-gray-400 font-semibold uppercase">Available</span>
                      </div>

                      <div className="h-8 w-px bg-orange-500/20"></div>

                      <button
                        onClick={() => {
                          setStockPromptValue('');
                          setStockPromptProductId(p.id);
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-orange-50 hover:bg-orange-100 text-xs font-bold text-orange-600 border border-orange-200 transition-colors cursor-pointer whitespace-nowrap"
                      >
                        + Add Stock
                      </button>
                    </div>
                  </td>

                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-2.5">
                      <button
                        onClick={() => handleOpenEdit(p)}
                        className="p-2 text-gray-400 hover:text-gray-900 bg-white hover:bg-gray-100 rounded-lg transition-colors cursor-pointer border border-orange-500/30"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(p.id)}
                        className="p-1.5 text-gray-400 hover:text-red-400 bg-white hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer border border-orange-500/30"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
      </div>

      {stockPromptProductId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-2xl w-full max-w-sm border border-orange-500/20 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Add Stock Quantity</h3>
            <p className="text-xs text-gray-400 mb-5">Enter the quantity you want to add to the current stock level.</p>
            <input
              type="number"
              value={stockPromptValue}
              autoFocus
              onChange={(e) => setStockPromptValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleConfirmAddStock();
                if (e.key === 'Escape') { setStockPromptProductId(null); setStockPromptValue(''); }
              }}
              className="w-full text-sm p-3 border border-gray-200 focus:border-orange-500 outline-none rounded-xl mb-6"
              placeholder="e.g. 10, 50, 100"
              min="1"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => { setStockPromptProductId(null); setStockPromptValue(''); }}
                className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAddStock}
                className="px-5 py-2 bg-orange-500 text-white text-sm font-bold rounded-xl hover:bg-orange-600 transition-colors cursor-pointer"
              >
                Add Stock
              </button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <AddProductModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={loadData}
          productToEdit={editingProduct}
          categories={categories}
          subCategories={activeSubCategories}
        />
      )}
    </div>
  );
}
