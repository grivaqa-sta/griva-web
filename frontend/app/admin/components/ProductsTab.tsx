import React, { useState, useEffect } from 'react';
import {
  Search, Plus, Trash2, Edit, Check, X, ChevronDown, Package, CheckCircle, AlertTriangle, XCircle, ShoppingBag
} from 'lucide-react';
import { ProductRequest, Category, SubCategory } from '@/app/types/types';
import { productService } from '@/app/services/product.service';
import { useToast } from '@/app/context/ToastContext';
import { categoryService } from '@/app/services/category.service';
import { subCategoryService } from '@/app/services/subCategory.service';
import AddProductModal from './AddProductModal';

export default function ProductsTab() {
  const { toast, confirm } = useToast();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [activeSubCategories, setActiveSubCategories] = useState<SubCategory[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [openCategoryFilter, setOpenCategoryFilter] = useState(false);
  const [quickFilter, setQuickFilter] = useState<string>("all");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  const [stockPromptProductId, setStockPromptProductId] = useState<number | null>(null);
  const [stockPromptValue, setStockPromptValue] = useState<string>('');
  const [deleteConfirmProductId, setDeleteConfirmProductId] = useState<number | null>(null);

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
      toast.success("Stock updated successfully");
    } catch (err) {
      toast.error("Failed to update stock");
      loadData(); // Revert on failure
    }
  };

  const handleDirectStockEdit = async (id: number, val: number) => {
    setProducts((prev) => prev.map((p) => p.id === id ? { ...p, stock: val } : p));
    try {
      await productService.updateProductStock(id, val);
      toast.success("Stock updated successfully");
    } catch (err) {
      toast.error("Failed to update stock");
      loadData();
    }
  };

  const handleDeleteProduct = (id: number) => {
    setDeleteConfirmProductId(id);
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

  const counts = {
    total: products.length,
    active: products.filter(p => p.is_active).length,
    inactive: products.filter(p => !p.is_active).length,
    lowStock: products.filter(p => p.stock !== undefined && p.stock > 0 && p.stock <= 5).length,
    outOfStock: products.filter(p => !p.stock || p.stock === 0).length,
  };

  const filteredProducts = products.filter((p) => {
    // 1. Search Query
    const ms = (p.title?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
               (p.slug?.toLowerCase() || "").includes(searchQuery.toLowerCase());
    if (!ms) return false;
    
    // 2. Category Filter
    if (filterCategory !== "all") {
      const sub = subCategories.find(s => s.id === p.subcategory_id);
      if (!sub) return false;
      const cat = categories.find(c => c.id === sub.category_id);
      if (!cat || cat.id.toString() !== filterCategory) return false;
    }
    
    // 3. Quick Status Filter
    if (quickFilter === 'active') {
      return p.is_active;
    }
    if (quickFilter === 'inactive') {
      return !p.is_active;
    }
    if (quickFilter === 'lowStock') {
      return p.stock > 0 && p.stock <= 5;
    }
    if (quickFilter === 'outOfStock') {
      return !p.stock || p.stock === 0;
    }
    
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      {/* Top Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Products */}
        <div className="bg-white border border-orange-500/20 rounded-2xl p-5 shadow-sm relative overflow-hidden group hover:border-orange-500/40 transition-all duration-300">
          <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-5 text-orange-500 pointer-events-none group-hover:scale-110 transition-transform duration-300">
            <ShoppingBag className="h-28 w-28" />
          </div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-orange-100 rounded-xl text-orange-500">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total Products</span>
          </div>
          <h3 className="text-2xl font-black text-gray-900 tracking-tight">{counts.total}</h3>
          <span className="text-[9px] text-gray-500 font-semibold block mt-1">
            Active: <span className="text-green-500 font-bold">{counts.active}</span> | Inactive: <span className="text-red-500 font-bold">{counts.inactive}</span>
          </span>
        </div>

        {/* Active Products */}
        <div className="bg-white border border-orange-500/20 rounded-2xl p-5 shadow-sm relative overflow-hidden group hover:border-orange-500/40 transition-all duration-300">
          <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-5 text-green-500 pointer-events-none group-hover:scale-110 transition-transform duration-300">
            <CheckCircle className="h-28 w-28" />
          </div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-green-100 rounded-xl text-green-600">
              <CheckCircle className="h-5 w-5" />
            </div>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Active Products</span>
          </div>
          <h3 className="text-2xl font-black text-gray-900 tracking-tight">{counts.active}</h3>
          <span className="text-[9px] text-gray-500 font-semibold block mt-1">
            Enabled catalog listings
          </span>
        </div>

        {/* Low Stock Products */}
        <div className="bg-white border border-orange-500/20 rounded-2xl p-5 shadow-sm relative overflow-hidden group hover:border-orange-500/40 transition-all duration-300">
          <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-5 text-orange-500 pointer-events-none group-hover:scale-110 transition-transform duration-300">
            <AlertTriangle className="h-28 w-28" />
          </div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-orange-100 rounded-xl text-orange-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Low Stock Products</span>
          </div>
          <h3 className="text-2xl font-black text-gray-900 tracking-tight">{counts.lowStock}</h3>
          <span className="text-[9px] text-gray-500 font-semibold block mt-1">
            Threshold: <span className="text-orange-500 font-bold">&le; 5 units</span>
          </span>
        </div>

        {/* Out Of Stock Products */}
        <div className="bg-white border border-orange-500/20 rounded-2xl p-5 shadow-sm relative overflow-hidden group hover:border-orange-500/40 transition-all duration-300">
          <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-5 text-red-500 pointer-events-none group-hover:scale-110 transition-transform duration-300">
            <XCircle className="h-28 w-28" />
          </div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-red-100 rounded-xl text-red-650">
              <XCircle className="h-5 w-5" />
            </div>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Out of Stock</span>
          </div>
          <h3 className="text-2xl font-black text-gray-900 tracking-tight">{counts.outOfStock}</h3>
          <span className="text-[9px] text-gray-500 font-semibold block mt-1">
            Requires immediate reorder
          </span>
        </div>
      </div>

      {/* Search & Action Bar */}
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

      {/* Quick Status Filters */}
      <div className="flex flex-wrap gap-2 bg-white p-3 rounded-xl border border-orange-500/30">
        {([
          { key: 'all', label: 'All Products', count: counts.total, icon: <ShoppingBag className="h-3.5 w-3.5" /> },
          { key: 'active', label: 'Active', count: counts.active, icon: <CheckCircle className="h-3.5 w-3.5 text-green-500" /> },
          { key: 'inactive', label: 'Inactive', count: counts.inactive, icon: <XCircle className="h-3.5 w-3.5 text-red-500" /> },
          { key: 'lowStock', label: 'Low Stock', count: counts.lowStock, icon: <AlertTriangle className="h-3.5 w-3.5 text-orange-500" /> },
          { key: 'outOfStock', label: 'Out of Stock', count: counts.outOfStock, icon: <XCircle className="h-3.5 w-3.5 text-red-650 animate-pulse" /> },
        ] as const).map((tab) => {
          const isActive = quickFilter === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setQuickFilter(tab.key)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer border ${
                isActive
                  ? 'bg-orange-500 text-white border-orange-500 shadow-sm shadow-orange-500/30'
                  : 'bg-white text-gray-500 border-orange-500/20 hover:border-orange-500/50'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/20' : 'bg-gray-100'}`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Products Table */}
      <div className="bg-white border border-orange-500/30 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b border-orange-500/30 text-[10px] text-gray-400 font-bold uppercase tracking-wider bg-gray-50">
              <th className="p-4 pl-6">Product Details</th>
              <th className="p-4">Category / Sub</th>
              <th className="p-4">Price</th>
              <th className="p-4">Stock Status</th>
              <th className="p-4 text-right pr-6">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-150">
            {loading ? (
              <tr>
                <td colSpan={5} className="p-10 text-center text-xs text-gray-400">Loading products...</td>
              </tr>
            ) : filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-10 text-center text-xs text-gray-400">No products matched the active filters.</td>
              </tr>
            ) : (
              filteredProducts.map((p) => {
                const isLowStock = p.stock !== undefined && p.stock > 0 && p.stock <= 5;
                const isOutOfStock = !p.stock || p.stock === 0;

                return (
                  <tr key={p.id} className="hover:bg-orange-500/3 transition-colors group">
                    {/* Details: Product Title, ID & Status Badge */}
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl bg-white p-1 flex items-center justify-center shrink-0 border border-orange-500/30 overflow-hidden shadow-xs">
                          {p.main_image_url ? (
                            <img src={p.main_image_url} alt={p.title} className="h-full w-full object-contain" />
                          ) : (
                            <span className="text-[10px] font-black text-orange-500">GRIVA</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-gray-800 block truncate max-w-[200px] hover:text-orange-500 transition-colors" title={p.title}>
                            {p.title}
                          </span>
                          <div className="flex gap-2 items-center mt-1">
                            <span className="text-[9px] text-gray-400 font-semibold">ID: #{p.id}</span>
                            <span className="text-gray-300">•</span>
                            {p.is_active ? (
                              <span className="inline-flex items-center text-[8px] font-black uppercase tracking-wider text-green-600 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded-sm">
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center text-[8px] font-black uppercase tracking-wider text-red-500 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded-sm">
                                Inactive
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Category & Subcategory */}
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-bold text-gray-750">
                          {getCategoryNameForSub(p.subcategory_id)}
                        </span>
                        <span className="text-[10px] text-gray-400 font-semibold">
                          {getSubCategoryName(p.subcategory_id)}
                        </span>
                      </div>
                    </td>

                    {/* Price */}
                    <td className="p-4">
                      <div>
                        <span className="text-xs font-black text-gray-900">QAR {Number(p.price).toFixed(2)}</span>
                        {p.old_price && (
                          <span className="text-[10px] text-gray-400 line-through block mt-0.5">QAR {Number(p.old_price).toFixed(2)}</span>
                        )}
                      </div>
                    </td>

                    {/* Stock Status Badge */}
                    <td className="p-4">
                      {isOutOfStock ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-lg border bg-red-50 border-red-200 text-red-500">
                          <XCircle className="h-3.5 w-3.5 text-red-500 animate-pulse" />
                          Out of Stock
                        </span>
                      ) : isLowStock ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-lg border bg-orange-50 border-orange-200 text-orange-600">
                          <AlertTriangle className="h-3.5 w-3.5 text-orange-500" />
                          Low Stock ({p.stock})
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-lg border bg-green-50 border-green-200 text-green-600">
                          <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                          In Stock ({p.stock})
                        </span>
                      )}
                    </td>

                    {/* Actions: Edit, Add Stock icon-button, Delete */}
                    <td className="p-4 text-right pr-6" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        {/* Adjust / Add Stock */}
                        <button
                          onClick={() => {
                            setStockPromptValue('');
                            setStockPromptProductId(p.id);
                          }}
                          title="Add Stock"
                          className="p-1.5 rounded-lg text-orange-500 hover:text-white bg-white hover:bg-orange-500 border border-orange-500/20 cursor-pointer shadow-xs transition-colors"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                        
                        {/* Direct Stock Edit Mode */}
                        <div className="flex items-center border border-gray-250/60 rounded-lg overflow-hidden h-[29px] bg-gray-50/50">
                          <button
                            onClick={() => handleStockAdjustment(p.id, -1)}
                            className="px-1.5 h-full text-gray-500 hover:bg-gray-100 active:bg-gray-200 border-r border-gray-200 font-bold"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            className="w-10 text-center text-xs font-black bg-transparent border-none p-0 focus:outline-none focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none text-gray-800"
                            value={p.stock || 0}
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || 0;
                              handleDirectStockEdit(p.id, val);
                            }}
                          />
                          <button
                            onClick={() => handleStockAdjustment(p.id, 1)}
                            className="px-1.5 h-full text-gray-500 hover:bg-gray-100 active:bg-gray-200 border-l border-gray-200 font-bold"
                          >
                            +
                          </button>
                        </div>

                        <button
                          onClick={() => handleOpenEdit(p)}
                          title="Edit Details"
                          className="p-1.5 text-gray-400 hover:text-gray-900 bg-white hover:bg-gray-100 rounded-lg transition-colors cursor-pointer border border-orange-500/20"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id)}
                          title="Delete Product"
                          className="p-1.5 text-gray-400 hover:text-red-500 bg-white hover:bg-red-50 rounded-lg transition-colors cursor-pointer border border-orange-500/20"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
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

      {deleteConfirmProductId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white p-6 rounded-2xl w-full max-w-sm border border-orange-500/20 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-red-500 mb-3">
              <div className="p-2 bg-red-50 rounded-xl">
                <Trash2 className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Delete Product</h3>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed mb-6">
              Are you sure you want to delete this product? This action cannot be undone and will permanently remove it from the catalog.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmProductId(null)}
                className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors cursor-pointer border-none outline-none"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  const id = deleteConfirmProductId;
                  setDeleteConfirmProductId(null);
                  try {
                    await productService.deleteProduct(id);
                    setProducts(prev => prev.filter(c => c.id !== id));
                    toast.success("Product deleted successfully");
                  } catch (err) {
                    toast.error("Failed to delete product");
                  }
                }}
                className="px-5 py-2.5 bg-red-500 text-white text-xs font-bold rounded-xl hover:bg-red-600 transition-colors cursor-pointer shadow-md shadow-red-500/10 border-none outline-none"
              >
                Delete Product
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
