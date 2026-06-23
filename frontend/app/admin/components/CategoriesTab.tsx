import React, { useState, useEffect } from 'react';
import { Search, Plus, Trash2, Edit, Check, X, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Category, CategoryRequest } from '@/app/types/types';
import { categoryService } from '@/app/services/category.service';
import { productService } from '@/app/services/product.service';
import { subCategoryService } from '@/app/services/subCategory.service';
import { useToast } from '@/app/context/ToastContext';
import { uploadService } from '@/app/services/upload.service';

export default function CategoriesTab() {
  const { toast, confirm } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [formData, setFormData] = useState<CategoryRequest>({
    title: '',
    slug: '',
    href: '',
    image_url: '',
    mobile_image_url: '',
    is_active: true
  });

  const [formLoading, setFormLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [mobileImageUploading, setMobileImageUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const [catRes, prodRes, subRes] = await Promise.all([
        categoryService.getCategories(),
        productService.getProducts(),
        subCategoryService.getSubCategories()
      ]);
      const catData = catRes?.data || catRes;
      const prodData = prodRes?.data || prodRes;
      const subData = subRes?.data || subRes;
      
      setCategories(Array.isArray(catData) ? catData : []);
      setProducts(Array.isArray(prodData) ? prodData : []);
      setSubCategories(Array.isArray(subData) ? subData : []);
    } catch (err) {
      console.error("Failed to load categories data", err);
    }
    setLoading(false);
  };

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setFormData({ title: '', slug: '', href: '', image_url: '', mobile_image_url: '', is_active: true });
    setError('');
    setSuccess('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    setFormData({
      title: cat.title,
      slug: cat.slug,
      href: `/category/${cat.slug}`,
      image_url: cat.image_url || '',
      mobile_image_url: cat.mobile_image_url || '',
      is_active: cat.is_active
    });
    setError('');
    setSuccess('');
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    const isConfirmed = await confirm(
      "Are you sure you want to delete this category? All subcategories and products belonging to this category will lose their parent category references.",
      "Delete Category"
    );
    if (isConfirmed) {
      try {
        await categoryService.deleteCategory(id);
        setCategories(prev => prev.filter(c => c.id !== id));
        toast.success("Category deleted successfully");
      } catch (err) {
        toast.error("Failed to delete category");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.slug) {
      setError("Title is required.");
      return;
    }

    setFormLoading(true);
    setError('');
    setSuccess('');

    try {
      if (editingCategory) {
        await categoryService.updateCategory(editingCategory.id, formData);
        setSuccess("Category updated successfully!");
        loadCategories();
      } else {
        await categoryService.createCategory(formData);
        setSuccess("Category created successfully!");
        loadCategories();
      }
      setTimeout(() => {
        setIsModalOpen(false);
      }, 1000);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Something went wrong.");
    }
    setFormLoading(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageUploading(true);
    setError('');
    try {
      const data = await uploadService.uploadImage(file);
      if (data && data.imageUrl) {
        setFormData(prev => ({ ...prev, image_url: data.imageUrl }));
      } else {
        setError('Failed to upload image. No URL returned.');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to upload image');
    }
    setImageUploading(false);
  };

  const handleMobileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMobileImageUploading(true);
    setError('');
    try {
      const data = await uploadService.uploadImage(file);
      if (data && data.imageUrl) {
        setFormData(prev => ({ ...prev, mobile_image_url: data.imageUrl }));
      } else {
        setError('Failed to upload mobile image. No URL returned.');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to upload mobile image');
    }
    setMobileImageUploading(false);
  };

  const filteredCategories = categories.filter((c) =>
    (c.title?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
    (c.slug?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  );

  const getProductCountForCategory = (categoryId: number) => {
    const subIds = subCategories
      .filter(sub => sub.category_id === categoryId)
      .map(sub => sub.id);
    return products.filter(p => subIds.includes(p.subcategory_id)).length;
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
              placeholder="Search category title or slug..."
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
          Add Category
        </button>
      </div>

      {/* Categories Table */}
      <div className="bg-white border border-orange-500/30 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-orange-500/30 text-[10px] text-gray-400 font-bold uppercase tracking-wider bg-gray-50">
                <th className="p-4 pl-6">Category Details</th>
                <th className="p-4">Products Count</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4">Created Date</th>
                <th className="p-4 text-right pr-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-150">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-xs text-gray-400">Loading categories...</td>
                </tr>
              ) : filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-xs text-gray-400">No categories found.</td>
                </tr>
              ) : (
                filteredCategories.map((cat) => {
                  const prodCount = getProductCountForCategory(cat.id);
                  return (
                    <tr key={cat.id} className="hover:bg-orange-500/3 transition-colors group">
                      <td className="p-4 pl-6 flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl bg-white p-1 flex items-center justify-center shrink-0 border border-orange-500/30 overflow-hidden shadow-xs">
                          {cat.image_url ? (
                            <img src={cat.image_url} alt={cat.title} className="h-full w-full object-cover" />
                          ) : (
                            <span className="text-[10px] font-black text-orange-500">GRIVA</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-gray-800 block truncate max-w-[200px] group-hover:text-orange-500 transition-colors">
                            {cat.title}
                          </span>
                          <span className="text-[9px] text-gray-400 font-semibold mt-1 block">ID: #{cat.id}</span>
                        </div>
                      </td>

                      <td className="p-4 text-xs font-bold text-gray-700">
                        {prodCount} product{prodCount !== 1 ? 's' : ''}
                      </td>

                      <td className="p-4 text-center">
                        {cat.is_active ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 border border-green-200 text-green-700 rounded-lg text-[10px] font-bold">
                            <CheckCircle className="w-3.5 h-3.5 text-green-500" /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 border border-red-200 text-red-700 rounded-lg text-[10px] font-bold">
                            <XCircle className="w-3.5 h-3.5 text-red-500" /> Inactive
                          </span>
                        )}
                      </td>

                      <td className="p-4 text-xs text-gray-500 font-medium">
                        {new Date(cat.createdAt).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>

                      <td className="p-4 text-right pr-6" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2.5">
                          <button
                            onClick={() => handleOpenEdit(cat)}
                            title="Edit Category"
                            className="p-1.5 text-gray-400 hover:text-gray-900 bg-white hover:bg-gray-100 rounded-lg transition-colors cursor-pointer border border-orange-500/20"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(cat.id)}
                            title="Delete Category"
                            className="p-1.5 text-gray-400 hover:text-red-550 bg-white hover:bg-red-50 rounded-lg transition-colors cursor-pointer border border-orange-500/20"
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-md border border-orange-500/20 shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center shrink-0">
              <h3 className="text-lg font-bold text-gray-900">
                {editingCategory ? "Edit Category" : "Add Category"}
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
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => {
                      const newTitle = e.target.value;
                      const newSlug = newTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
                      const newHref = `/category/${newSlug}`;
                      setFormData({ ...formData, title: newTitle, slug: newSlug, href: newHref });
                    }}
                    className="w-full text-sm p-2.5 border border-gray-200 focus:border-orange-500 outline-none rounded-xl"
                    placeholder="e.g. Electronics"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Slug *</label>
                  <input
                    type="text"
                    required
                    disabled
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full text-sm p-2.5 border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed outline-none rounded-xl"
                    placeholder="e.g. electronics"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Href</label>
                  <input
                    type="text"
                    disabled
                    value={formData.href}
                    className="w-full text-sm p-2.5 border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed outline-none rounded-xl"
                    placeholder="Auto-generated from slug"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Image URL</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.image_url || ''}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      className="flex-1 text-sm p-2.5 border border-gray-200 focus:border-orange-500 outline-none rounded-xl"
                      placeholder="https://..."
                    />
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={imageUploading}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                      />
                      <button
                        type="button"
                        disabled={imageUploading}
                        className="h-full px-4 bg-orange-50 text-orange-600 font-bold rounded-xl text-sm hover:bg-orange-100 transition-colors disabled:opacity-50 flex items-center justify-center pointer-events-none min-w-[80px]"
                      >
                        {imageUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Upload'}
                      </button>
                    </div>
                  </div>
                  {formData.image_url && (
                    <div className="mt-2 flex flex-col items-start gap-1">
                      <div className="h-20 w-20 rounded-lg overflow-hidden border border-gray-200">
                        <img src={formData.image_url} alt="Preview" className="h-full w-full object-cover" />
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, image_url: '' })}
                        className="text-[10px] text-red-400 hover:text-red-600 font-semibold"
                      >
                        Remove image
                      </button>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Mobile Image URL</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={formData.mobile_image_url || ''}
                        onChange={(e) => setFormData({ ...formData, mobile_image_url: e.target.value })}
                        className="flex-1 text-sm p-2.5 border border-gray-200 focus:border-orange-500 outline-none rounded-xl"
                        placeholder="https://..."
                      />
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleMobileImageUpload}
                          disabled={mobileImageUploading}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                        />
                        <button
                          type="button"
                          disabled={mobileImageUploading}
                          className="h-full px-4 bg-orange-50 text-orange-600 font-bold rounded-xl text-sm hover:bg-orange-100 transition-colors disabled:opacity-50 flex items-center justify-center pointer-events-none min-w-[80px]"
                        >
                          {mobileImageUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Upload'}
                        </button>
                      </div>
                    </div>

                    {formData.mobile_image_url && (
                      <div className="mt-2 flex flex-col items-start gap-1">
                        <div className="h-20 w-20 rounded-lg overflow-hidden border border-gray-200">
                          <img src={formData.mobile_image_url} alt="Preview" className="h-full w-full object-cover" />
                        </div>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, mobile_image_url: '' })}
                          className="text-[10px] text-red-400 hover:text-red-600 font-semibold"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>

                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                  />
                  <label htmlFor="is_active" className="text-sm font-semibold text-gray-700 cursor-pointer">
                    Is Active
                  </label>
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="px-5 py-2 bg-orange-500 text-white text-sm font-bold rounded-xl hover:bg-orange-600 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {formLoading ? "Saving..." : "Save Category"}
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
