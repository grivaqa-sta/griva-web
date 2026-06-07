import React, { useState } from 'react';
import {
  Search, Plus, Trash2, Edit, ToggleLeft, ToggleRight, Image as ImageIcon
} from 'lucide-react';

interface ProductsTabProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  filterCategory: string;
  setFilterCategory: (val: string) => void;
  categories: string[];
  setIsAddModalOpen: (val: boolean) => void;
  filteredProducts: any[];
  handleStockAdjustment: (id: number, delta: number) => void;
  setProductsList: any;
}

export default function ProductsTab(props: ProductsTabProps) {
  const {
    searchQuery, setSearchQuery,
    filterCategory, setFilterCategory,
    categories, setIsAddModalOpen,
    filteredProducts, handleStockAdjustment, setProductsList
  } = props;

  const [stockPromptProductId, setStockPromptProductId] = useState<number | null>(null);
  const [stockPromptValue, setStockPromptValue] = useState<string>('');

  const handleConfirmAddStock = () => {
    const num = parseInt(stockPromptValue);
    if (!isNaN(num) && num > 0 && stockPromptProductId !== null) {
      handleStockAdjustment(stockPromptProductId, num);
    }
    setStockPromptProductId(null);
    setStockPromptValue('');
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border border-orange-500/30">
        <div className="flex flex-1 gap-3 w-full sm:w-auto">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search product title, tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-orange-500/30 rounded-xl pl-9 pr-4 py-2 text-xs text-gray-800 focus:outline-none"
            />
          </div>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-white border border-orange-500/30 rounded-xl px-3 py-2 text-xs text-gray-400 focus:outline-none focus:border-orange-500 cursor-pointer"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-orange-500-white rounded-xl cursor-pointer w-full sm:w-auto justify-center"
        >
          <Plus className="h-4.5 w-4.5" />
          Add Catalog Product
        </button>
      </div>

      {/* Products Table */}
      <div className="bg-white border border-orange-500/30 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-orange-500/30 text-[10px] text-gray-400 font-bold uppercase tracking-wider bg-gray-50">
              <th className="p-4">Product Details</th>
              <th className="p-4">Category</th>
              <th className="p-4">Price</th>
              <th className="p-4 text-center">Stock Inventory</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-xs text-gray-400">No products matched the active filters.</td>
              </tr>
            ) : (
              filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors group">
                  {/* Product Details */}
                  <td className="p-4 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-white p-1 flex items-center justify-center shrink-0 border border-orange-500/30">
                      {p.image && typeof p.image === 'object' ? (
                        <span className="text-[10px] font-black text-orange-500">GRIVA</span>
                      ) : (
                        <img src={p.image as string} alt="" className="h-full w-full object-contain" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-gray-900 block truncate max-w-sm group-hover:text-orange-400 transition-colors">{p.title}</span>
                      <div className="flex gap-2 items-center mt-1">
                        {p.badge && (
                          <span className="text-[8px] font-bold text-orange-500 px-1.5 py-0.5 rounded uppercase">{p.badge}</span>
                        )}
                        <span className="text-[9px] text-gray-400 font-semibold">ID: #{p.id}</span>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="p-4">
                    <span className="text-xs text-gray-700 font-semibold bg-white border border-orange-500/30 px-2.5 py-1 rounded-lg">
                      {p.category}
                    </span>
                  </td>

                  {/* Price */}
                  <td className="p-4">
                    <div>
                      <span className="text-xs font-black text-gray-900">{p.price}</span>
                      {p.oldPrice && (
                        <span className="text-[10px] text-gray-400 line-through block mt-0.5">{p.oldPrice}</span>
                      )}
                    </div>
                  </td>

                  {/* Stock Inventory */}
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-4">
                      {/* Available count — editable by typing */}
                      <div className="flex flex-col items-center">
                        <input
                          type="number"
                          className={`w-14 text-center text-sm font-black bg-transparent border-none p-0 focus:outline-none focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${p.stock && p.stock <= 5 ? 'text-orange-500' : 'text-gray-800'}`}
                          value={p.stock || 0}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 0;
                            setProductsList((prev: any[]) =>
                              prev.map((item: any) => item.id === p.id ? { ...item, stock: val } : item)
                            );
                          }}
                        />
                        <span className="text-[9px] text-gray-400 font-semibold uppercase">Available</span>
                      </div>

                      {/* Divider */}
                      <div className="h-8 w-px bg-orange-500/20"></div>

                      {/* Add Stock Button */}
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

                  {/* Actions */}
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2.5">
                      <button
                        onClick={() => alert('Loading Product ID: #' + p.id + ' inside details editor...')}
                        className="p-2 text-gray-400 hover:text-gray-900 bg-white hover:bg-gray-100 rounded-lg transition-colors cursor-pointer border border-orange-500/30"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Delete product?')) {
                            setProductsList((prev: any[]) => prev.filter((productItem: any) => productItem.id !== p.id));
                          }
                        }}
                        className="p-2 text-gray-400 hover:text-red-400 bg-white hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer border border-orange-500/30"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Custom Add Stock Modal */}
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

    </div>
  );
}
