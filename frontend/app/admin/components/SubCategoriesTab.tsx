import React, { useState, useEffect } from 'react';
import { Search, Plus, Trash2, Edit, Check, X, ChevronDown } from 'lucide-react';
import { SubCategory, SubCategoryRequest, Category } from '@/app/types/types';
import { subCategoryService } from '@/app/services/subCategory.service';
import { categoryService } from '@/app/services/category.service';
import { uploadService } from '@/app/services/upload.service';

export default function SubCategoriesTab() {
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategories, setActiveCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubCategory, setEditingSubCategory] = useState<SubCategory | null>(null);
  
  const [formData, setFormData] = useState<SubCategoryRequest>({
    category_id: 0,
    title: '',
    slug: '',
    href: '',
    image_url: '',
    is_active: true
  });
  
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openCategorySelect, setOpenCategorySelect] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [subRes, catRes, activeCatRes] = await Promise.all([
        subCategoryService.getSubCategories(),
        categoryService.getCategories(),
        categoryService.getAllActiveCategories()
      ]);
      const subData = subRes?.data || subRes;
      const catData = catRes?.data || catRes;
      const activeCatData = activeCatRes?.data || activeCatRes;
      setSubCategories(Array.isArray(subData) ? subData : []);
      setCategories(Array.isArray(catData) ? catData : []);
      setActiveCategories(Array.isArray(activeCatData) ? activeCatData : []);
    } catch (err) {
      console.error("Failed to load data", err);
    }
    setLoading(false);
  };

  const handleOpenAdd = () => {
    setEditingSubCategory(null);
    setFormData({ 
      category_id: activeCategories.length > 0 ? activeCategories[0].id : 0, 
      title: '', 
      slug: '', 
      href: '', 
      image_url: '', 
      is_active: true 
    });
    setError('');
    setSuccess('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (subCat: SubCategory) => {
    setEditingSubCategory(subCat);
    const cat = categories.find(c => c.id === subCat.category_id);
    const catSlug = cat ? cat.slug : '';
    const subSlug = subCat.slug || '';
    const computedHref = catSlug && subSlug ? `/category/${catSlug}?sub=${subSlug}` : subCat.href || '';
    setFormData({
      category_id: subCat.category_id,
      title: subCat.title,
      slug: subCat.slug,
      href: computedHref,
      image_url: subCat.image_url || '',
      is_active: subCat.is_active
    });
    setError('');
    setSuccess('');
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this sub category?")) {
      try {
        await subCategoryService.deleteSubCategory(id);
        setSubCategories(prev => prev.filter(c => c.id !== id));
      } catch (err) {
        alert("Failed to delete sub category");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.slug || !formData.category_id) {
      setError("Category and Title are required.");
      return;
    }

    setFormLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const payload = { ...formData, category_id: Number(formData.category_id) };
      if (editingSubCategory) {
        await subCategoryService.updateSubCategory(editingSubCategory.id, payload);
        setSuccess("Sub Category updated successfully!");
        loadData();
      } else {
        await subCategoryService.createSubCategory(payload);
        setSuccess("Sub Category created successfully!");
        loadData();
      }
      setTimeout(() => {
        setIsModalOpen(false);
      }, 1000);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Something went wrong.");
    }
    setFormLoading(false);
  };



  const filteredSubCategories = subCategories.filter((c) =>
    (c.title?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
    (c.slug?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  );

  const getCategoryName = (id: number) => {
    const cat = categories.find(c => c.id === id);
    return cat ? cat.title : "Unknown";
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      {/* Search & Action Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border border-orange-500/30">
        <div className="flex flex-1 gap-3 w-full sm:w-auto">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search sub category title or slug..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-orange-500/30 rounded-xl pl-9 pr-4 py-2 text-xs text-gray-800 focus:outline-none"
            />
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors cursor-pointer w-full sm:w-auto justify-center font-semibold text-sm shadow-md"
        >
          <Plus className="h-4.5 w-4.5" />
          Add Sub Category
        </button>
      </div>

      {/* SubCategories Table */}
      <div className="bg-white border border-orange-500/30 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-orange-500/30 text-[10px] text-gray-400 font-bold uppercase tracking-wider bg-gray-50">
                <th className="p-3">Title</th>
                <th className="p-3">Category</th>
                <th className="p-3">Slug</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3">Created</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-xs text-gray-400">Loading sub categories...</td>
                </tr>
              ) : filteredSubCategories.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-xs text-gray-400">No sub categories found.</td>
                </tr>
              ) : (
                filteredSubCategories.map((subCat) => (
                  <tr key={subCat.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="p-3">
                      <div className="min-w-0">
                        <span className="text-sm font-bold text-gray-900 block truncate group-hover:text-orange-500 transition-colors">
                          {subCat.title}
                        </span>
                        <span className="text-[9px] text-gray-400 font-semibold">ID: #{subCat.id}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="text-xs font-semibold text-gray-700 bg-orange-50 px-2 py-1 rounded-md border border-orange-100">
                        {getCategoryName(subCat.category_id)}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="text-xs text-gray-700 bg-gray-100 px-2 py-1 rounded-md">{subCat.slug}</span>
                    </td>
                    <td className="p-3 text-center">
                      {subCat.is_active ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-md text-[10px] font-bold">
                          <Check className="w-3 h-3" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-md text-[10px] font-bold">
                          <X className="w-3 h-3" /> Inactive
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      <span className="text-xs text-gray-500">
                        {new Date(subCat.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(subCat)}
                          className="p-2 text-gray-400 hover:text-gray-900 bg-white hover:bg-gray-100 rounded-lg transition-colors cursor-pointer border border-orange-500/30"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(subCat.id)}
                          className="p-1.5 text-gray-400 hover:text-red-500 bg-white hover:bg-red-50 rounded-lg transition-colors cursor-pointer border border-orange-500/30"
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
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-md border border-orange-500/20 shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center shrink-0">
              <h3 className="text-lg font-bold text-gray-900">
                {editingSubCategory ? "Edit Sub Category" : "Add Sub Category"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-900">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">{error}</div>}
              {success && <div className="mb-4 p-3 bg-green-50 text-green-600 text-sm rounded-lg border border-green-100">{success}</div>}
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Parent Category *</label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setOpenCategorySelect(!openCategorySelect)}
                      className="w-full flex items-center justify-between text-sm p-2.5 border border-gray-200 focus:border-orange-500 outline-none rounded-xl bg-white hover:border-gray-300 transition-colors text-left"
                    >
                      <span className={formData.category_id === 0 ? "text-gray-400" : "text-gray-900 font-semibold"}>
                        {formData.category_id === 0
                          ? "Select a category"
                          : categories.find(c => c.id === formData.category_id)?.title || "Select a category"}
                      </span>
                      <ChevronDown size={16} className={`text-gray-400 shrink-0 transition-transform ${openCategorySelect ? "rotate-180 text-orange-500" : ""}`} />
                    </button>

                    {openCategorySelect && (
                      <>
                        <div
                          className="fixed inset-0 z-40 bg-transparent cursor-default"
                          onClick={() => setOpenCategorySelect(false)}
                        />
                        <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-100 rounded-xl shadow-xl z-50 py-1 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 max-h-48 overflow-y-auto">
                          <button
                            type="button"
                            disabled
                            className="w-full text-left px-3 py-2 text-sm font-semibold text-gray-300 bg-gray-50/50 cursor-not-allowed"
                          >
                            Select a category
                          </button>
                          {activeCategories.map((cat) => (
                            <button
                              key={cat.id}
                              type="button"
                              onClick={() => {
                                const newCatId = cat.id;
                                const catSlug = cat.slug || '';
                                const subSlug = formData.slug || '';
                                const newHref = catSlug && subSlug ? `/category/${catSlug}?sub=${subSlug}` : formData.href;
                                setFormData({...formData, category_id: newCatId, href: newHref});
                                setOpenCategorySelect(false);
                              }}
                              className={`w-full text-left px-3 py-2 text-sm font-semibold transition-colors ${
                                formData.category_id === cat.id ? "text-orange-500 bg-orange-50/50 font-bold" : "text-gray-700 hover:bg-orange-50 hover:text-orange-500"
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

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => {
                      const newTitle = e.target.value;
                      const newSlug = newTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
                      const cat = categories.find(c => c.id === formData.category_id);
                      const catSlug = cat ? cat.slug : '';
                      const newHref = catSlug ? `/category/${catSlug}?sub=${newSlug}` : `/category/${newSlug}`;
                      setFormData({...formData, title: newTitle, slug: newSlug, href: newHref});
                    }}
                    className="w-full text-sm p-2.5 border border-gray-200 focus:border-orange-500 outline-none rounded-xl"
                    placeholder="e.g. Laptops"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Slug *</label>
                  <input
                    type="text"
                    required
                    disabled
                    value={formData.slug}
                    onChange={(e) => setFormData({...formData, slug: e.target.value})}
                    className="w-full text-sm p-2.5 border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed outline-none rounded-xl"
                    placeholder="e.g. laptops"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Href</label>
                  <input
                    type="text"
                    disabled
                    value={formData.href}
                    className="w-full text-sm p-2.5 border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed outline-none rounded-xl"
                    placeholder="Auto-generated from category & slug"
                  />
                </div>



                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_active_sub"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                    className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                  />
                  <label htmlFor="is_active_sub" className="text-sm font-semibold text-gray-700 cursor-pointer">
                    Is Active
                  </label>
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 mt-4 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="px-5 py-2 mt-4 bg-orange-500 text-white text-sm font-bold rounded-xl hover:bg-orange-600 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {formLoading ? "Saving..." : "Save Sub Category"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
