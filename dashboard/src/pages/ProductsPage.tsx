import { useEffect, useState, useCallback } from 'react';
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  CubeIcon,
  PhotoIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { productsService, type Product, type CreateProductData } from '../services/products';
import { TableSkeleton } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';

interface CategoryOption {
  id: string;
  label: string;
}

const DEFAULT_CATEGORIES: CategoryOption[] = [
  { id: '', label: 'Select category' },
];

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>(DEFAULT_CATEGORIES);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  // Form state
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formImage, setFormImage] = useState<File | null>(null);
  const [formImagePreview, setFormImagePreview] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    try {
      const data = await productsService.getProducts();
      setProducts(data);

      // Build category dropdown from actual product data
      const catMap = new Map<string, string>();
      data.forEach((p) => {
        if (p.category_id && p.categories?.name) {
          catMap.set(p.category_id, p.categories.name);
        }
      });
      const dynamicCats: CategoryOption[] = [
        { id: '', label: 'Select category' },
        ...Array.from(catMap.entries()).map(([id, label]) => ({ id, label })),
      ];
      if (dynamicCats.length > 1) setCategoryOptions(dynamicCats);
    } catch {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormName('');
    setFormDescription('');
    setFormPrice('');
    setFormCategory('');
    setFormImage(null);
    setFormImagePreview(null);
    setModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormName(product.name);
    setFormDescription(product.description);
    setFormPrice(String(product.price));
    setFormCategory(product.category_id || '');
    setFormImage(null);
    setFormImagePreview(product.image_url);
    setModalOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setFormImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    const payload: CreateProductData = {
      name: formName,
      description: formDescription,
      price: Number(formPrice),
      category_id: formCategory,
      image: formImage || undefined,
    };

    try {
      if (editingProduct) {
        await productsService.updateProduct(editingProduct.id, payload);
        toast.success('Product updated successfully');
      } else {
        await productsService.createProduct(payload);
        toast.success('Product created successfully');
      }
      setModalOpen(false);
      fetchProducts();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Operation failed';
      toast.error(msg);
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggleActive = async (product: Product) => {
    try {
      await productsService.toggleActive(product.id, !product.is_active);
      toast.success(`Product ${product.is_active ? 'deactivated' : 'activated'}`);
      fetchProducts();
    } catch {
      toast.error('Failed to update product status');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await productsService.deleteProduct(deleteTarget.id);
      toast.success('Product deleted');
      // Remove from local list immediately
      setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch {
      toast.error('Failed to delete product');
    } finally {
      setDeleteLoading(false);
    }
  };

  const getCategoryName = (product: Product) => {
    return product.categories?.name || '—';
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Products</h1>
          <p className="mt-1 text-sm text-slate-500">Manage your product catalog</p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-700"
        >
          <PlusIcon className="h-4 w-4" />
          Add Product
        </button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-surface-border bg-surface shadow-sm">
        {loading ? (
          <TableSkeleton rows={6} cols={6} />
        ) : products.length === 0 ? (
          <EmptyState
            icon={<CubeIcon className="h-16 w-16" />}
            title="No products yet"
            description="Get started by adding your first product."
            action={
              <button
                onClick={openCreateModal}
                className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-700"
              >
                <PlusIcon className="h-4 w-4" />
                Add Product
              </button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-surface-border bg-slate-50">
                  <th className="px-6 py-3.5 font-semibold text-slate-600">Image</th>
                  <th className="px-6 py-3.5 font-semibold text-slate-600">Name</th>
                  <th className="px-6 py-3.5 font-semibold text-slate-600">Category</th>
                  <th className="px-6 py-3.5 font-semibold text-slate-600">Price</th>
                  <th className="px-6 py-3.5 font-semibold text-slate-600">Status</th>
                  <th className="px-6 py-3.5 font-semibold text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {products.map((product) => (
                  <tr key={product.id} className="transition-colors hover:bg-slate-50">
                    <td className="px-6 py-4">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="h-10 w-10 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                          <PhotoIcon className="h-5 w-5 text-slate-400" />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-900">{product.name}</p>
                      <p className="mt-0.5 max-w-xs truncate text-xs text-slate-500">
                        {product.description}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{getCategoryName(product)}</td>
                    <td className="px-6 py-4 font-medium text-slate-900">
                      ${product.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleActive(product)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                          product.is_active ? 'bg-emerald-500' : 'bg-slate-300'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm ring-0 transition-transform duration-200 ease-in-out ${
                            product.is_active ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(product)}
                          className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-primary-600"
                          title="Edit"
                        >
                          <PencilSquareIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(product)}
                          className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                          title="Delete"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingProduct ? 'Edit Product' : 'Create Product'}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Name</label>
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              required
              className="w-full rounded-lg border border-surface-border px-4 py-2.5 text-sm outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
              placeholder="Product name"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Description</label>
            <textarea
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              required
              rows={3}
              className="w-full rounded-lg border border-surface-border px-4 py-2.5 text-sm outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 resize-none"
              placeholder="Product description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Price ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formPrice}
                onChange={(e) => setFormPrice(e.target.value)}
                required
                className="w-full rounded-lg border border-surface-border px-4 py-2.5 text-sm outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Category</label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                required
                className="w-full rounded-lg border border-surface-border px-4 py-2.5 text-sm outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
              >
                {categoryOptions.map((c) => (
                  <option key={c.id} value={c.id} disabled={c.id === ''}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Image</label>
            <div className="flex items-center gap-4">
              {formImagePreview && (
                <img
                  src={formImagePreview}
                  alt="Preview"
                  className="h-20 w-20 rounded-lg object-cover border border-surface-border"
                />
              )}
              <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-slate-300 px-4 py-3 text-sm text-slate-500 transition-colors hover:border-primary-400 hover:text-primary-600">
                <PhotoIcon className="h-5 w-5" />
                {formImage ? formImage.name : 'Choose file'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="flex-1 rounded-lg border border-surface-border px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formLoading}
              className="flex-1 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700 disabled:opacity-50"
            >
              {formLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Saving...
                </span>
              ) : editingProduct ? (
                'Update Product'
              ) : (
                'Create Product'
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Product"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        loading={deleteLoading}
      />
    </div>
  );
}
