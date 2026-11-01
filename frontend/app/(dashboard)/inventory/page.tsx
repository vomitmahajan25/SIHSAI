'use client';

import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  AlertTriangle,
  ArrowUpDown,
  Archive,
  RefreshCw,
  Search,
  CheckCircle,
  TrendingUp,
} from 'lucide-react';
import { api } from '@/lib/api';
import { Product } from '@/types';
import Modal from '@/components/ui/Modal';
import { formatINR } from '@/lib/formatters';

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [movementProduct, setMovementProduct] = useState<Product | null>(null);

  // Form states
  const [addForm, setAddForm] = useState({
    name: '',
    sku: '',
    category: 'Grains & Flours',
    purchase_cost: '',
    selling_price: '',
    current_stock: '',
    min_stock_threshold: '5',
    supplier_details: '',
  });

  const [movForm, setMovForm] = useState({
    movement_type: 'received',
    quantity: '',
    notes: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const data = await api.getInventory();
      setProducts(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const totalValuation = products.reduce(
    (sum, p) => sum + p.current_stock * p.purchase_cost,
    0
  );
  const lowStockCount = products.filter((p) => p.is_low_stock).length;

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.name || !addForm.purchase_cost || !addForm.selling_price) {
      setFormError('Please enter product name, purchase cost, and selling price.');
      return;
    }

    setSubmitting(true);
    setFormError(null);
    try {
      await api.createProduct({
        ...addForm,
        purchase_cost: parseFloat(addForm.purchase_cost),
        selling_price: parseFloat(addForm.selling_price),
        current_stock: parseFloat(addForm.current_stock) || 0,
        min_stock_threshold: parseFloat(addForm.min_stock_threshold) || 5,
        sku: addForm.sku || undefined,
        supplier_details: addForm.supplier_details || undefined,
      });

      setIsAddOpen(false);
      setAddForm({
        name: '',
        sku: '',
        category: 'Grains & Flours',
        purchase_cost: '',
        selling_price: '',
        current_stock: '',
        min_stock_threshold: '5',
        supplier_details: '',
      });
      fetchInventory();
    } catch (err: any) {
      setFormError(err.message || 'Failed to create product.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStockMovement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!movementProduct) return;
    if (!movForm.quantity || parseFloat(movForm.quantity) <= 0) {
      setFormError('Please enter a valid quantity.');
      return;
    }

    setSubmitting(true);
    setFormError(null);
    try {
      await api.recordStockMovement(movementProduct.id, {
        movement_type: movForm.movement_type,
        quantity: parseFloat(movForm.quantity),
        notes: movForm.notes || undefined,
      });

      setMovementProduct(null);
      setMovForm({ movement_type: 'received', quantity: '', notes: '' });
      fetchInventory();
    } catch (err: any) {
      setFormError(err.message || 'Failed to update stock.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-ink-primary tracking-tight">
            Inventory & Stock Control (स्टॉक प्रबंधन)
          </h2>
          <p className="text-xs text-ink-secondary mt-0.5">
            Monitor real-time stock levels, prevent stockouts, and protect your working capital
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-forest hover:bg-forest-light text-white text-xs font-semibold shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4 text-lime" />
          <span>Add Product</span>
        </button>
      </div>

      {/* Snapshot Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface p-4 rounded-2xl border border-stroke shadow-sm">
          <p className="text-xs text-ink-secondary">Total Inventory Valuation</p>
          <p className="text-xl font-bold text-forest mt-1">{formatINR(totalValuation)}</p>
        </div>
        <div className="bg-surface p-4 rounded-2xl border border-stroke shadow-sm">
          <p className="text-xs text-ink-secondary">Active Stock Keeping Units (SKUs)</p>
          <p className="text-xl font-bold text-ink-primary mt-1">{products.length} Products</p>
        </div>
        <div className="bg-surface p-4 rounded-2xl border border-stroke shadow-sm">
          <p className="text-xs text-ink-secondary">Low-Stock Warnings</p>
          <p
            className={`text-xl font-bold mt-1 ${
              lowStockCount > 0 ? 'text-amber-600' : 'text-emerald-700'
            }`}
          >
            {lowStockCount} Products Need Restock
          </p>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3.5 top-3 text-ink-secondary" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search items by name, SKU, or category..."
          className="w-full pl-10 pr-4 py-2 bg-surface border border-stroke rounded-xl text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage shadow-xs"
        />
      </div>

      {/* Products Table */}
      <div className="bg-surface rounded-2xl border border-stroke shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs md:text-sm">
            <thead className="bg-canvas border-b border-stroke text-ink-secondary font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-5 py-3">Product Name & SKU</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Purchase Cost</th>
                <th className="px-5 py-3">Selling Price</th>
                <th className="px-5 py-3">Gross Margin</th>
                <th className="px-5 py-3">Stock Level</th>
                <th className="px-5 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stroke">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-ink-secondary">
                    Loading inventory catalog...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-ink-secondary">
                    No products found. Click "Add Product" to create your inventory catalog.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-canvas/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-ink-primary">{p.name}</p>
                      {p.sku && (
                        <p className="text-[10px] text-ink-secondary uppercase tracking-wider">
                          SKU: {p.sku}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-ink-secondary">
                      {p.category}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap font-medium text-ink-secondary">
                      {formatINR(p.purchase_cost)}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap font-semibold text-ink-primary">
                      {formatINR(p.selling_price)}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      {p.estimated_gross_margin_pct !== null && p.estimated_gross_margin_pct !== undefined ? (
                        <span className="font-semibold text-sage">
                          {p.estimated_gross_margin_pct}%
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-bold ${
                            p.is_low_stock ? 'text-amber-700' : 'text-forest'
                          }`}
                        >
                          {p.current_stock}
                        </span>
                        {p.is_low_stock && (
                          <span className="flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300">
                            <AlertTriangle className="w-3 h-3" />
                            Low Stock
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-center">
                      <button
                        onClick={() => {
                          setMovementProduct(p);
                          setMovForm({ movement_type: 'received', quantity: '', notes: '' });
                        }}
                        className="flex items-center gap-1 mx-auto px-2.5 py-1 rounded-lg bg-canvas border border-stroke text-xs font-semibold text-ink-primary hover:bg-stroke transition-colors"
                      >
                        <ArrowUpDown className="w-3.5 h-3.5 text-sage" />
                        <span>Update Stock</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add New Inventory Item"
      >
        <form onSubmit={handleCreateProduct} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-50 text-rose-800 border border-rose-200 rounded-xl text-xs">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-ink-primary mb-1">
              Product Name *
            </label>
            <input
              type="text"
              required
              value={addForm.name}
              onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
              placeholder="e.g. Fortune Mustard Oil 1L"
              className="w-full px-3.5 py-2 bg-canvas border border-stroke rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-ink-primary mb-1">
                Category *
              </label>
              <input
                type="text"
                required
                value={addForm.category}
                onChange={(e) => setAddForm({ ...addForm, category: e.target.value })}
                placeholder="Category"
                className="w-full px-3 py-2 bg-canvas border border-stroke rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-primary mb-1">
                SKU / Code (Optional)
              </label>
              <input
                type="text"
                value={addForm.sku}
                onChange={(e) => setAddForm({ ...addForm, sku: e.target.value })}
                placeholder="e.g. OIL-01"
                className="w-full px-3 py-2 bg-canvas border border-stroke rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-ink-primary mb-1">
                Purchase Cost (₹) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={addForm.purchase_cost}
                onChange={(e) => setAddForm({ ...addForm, purchase_cost: e.target.value })}
                placeholder="110"
                className="w-full px-3 py-2 bg-canvas border border-stroke rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-primary mb-1">
                Selling Price (₹) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={addForm.selling_price}
                onChange={(e) => setAddForm({ ...addForm, selling_price: e.target.value })}
                placeholder="130"
                className="w-full px-3 py-2 bg-canvas border border-stroke rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-ink-primary mb-1">
                Initial Stock Units
              </label>
              <input
                type="number"
                value={addForm.current_stock}
                onChange={(e) => setAddForm({ ...addForm, current_stock: e.target.value })}
                placeholder="20"
                className="w-full px-3 py-2 bg-canvas border border-stroke rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-primary mb-1">
                Low Stock Warning Level
              </label>
              <input
                type="number"
                value={addForm.min_stock_threshold}
                onChange={(e) => setAddForm({ ...addForm, min_stock_threshold: e.target.value })}
                className="w-full px-3 py-2 bg-canvas border border-stroke rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-stroke flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="px-4 py-2 rounded-xl border border-stroke text-ink-secondary text-xs font-semibold hover:bg-canvas"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-forest hover:bg-forest-light text-white text-xs font-semibold shadow-sm disabled:opacity-50"
            >
              {submitting ? 'Adding...' : 'Save Product'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Stock Movement Modal */}
      <Modal
        isOpen={movementProduct !== null}
        onClose={() => setMovementProduct(null)}
        title={`Adjust Stock: ${movementProduct?.name || ''}`}
      >
        <form onSubmit={handleStockMovement} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-50 text-rose-800 border border-rose-200 rounded-xl text-xs">
              {formError}
            </div>
          )}

          <p className="text-xs text-ink-secondary">
            Current Stock in Store: <strong className="text-forest text-sm">{movementProduct?.current_stock}</strong>
          </p>

          <div>
            <label className="block text-xs font-semibold text-ink-primary mb-1">
              Movement Action *
            </label>
            <select
              value={movForm.movement_type}
              onChange={(e) => setMovForm({ ...movForm, movement_type: e.target.value })}
              className="w-full px-3 py-2 bg-canvas border border-stroke rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage"
            >
              <option value="received">Restock / Received from Wholesaler (+)</option>
              <option value="sold">Manual Sale / Dispatch (-)</option>
              <option value="damaged">Damaged / Expired Goods (-)</option>
              <option value="returned">Customer Return (+)</option>
              <option value="manual_adjustment">Set Exact Physical Count</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink-primary mb-1">
              Quantity *
            </label>
            <input
              type="number"
              step="1"
              required
              value={movForm.quantity}
              onChange={(e) => setMovForm({ ...movForm, quantity: e.target.value })}
              placeholder="e.g. 10"
              className="w-full px-3.5 py-2 bg-canvas border border-stroke rounded-xl text-sm font-bold text-ink-primary focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink-primary mb-1">
              Notes (Optional)
            </label>
            <input
              type="text"
              value={movForm.notes}
              onChange={(e) => setMovForm({ ...movForm, notes: e.target.value })}
              placeholder="e.g. Weekly wholesale restock from mandi"
              className="w-full px-3 py-2 bg-canvas border border-stroke rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage"
            />
          </div>

          <div className="pt-3 border-t border-stroke flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setMovementProduct(null)}
              className="px-4 py-2 rounded-xl border border-stroke text-ink-secondary text-xs font-semibold hover:bg-canvas"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-forest hover:bg-forest-light text-white text-xs font-semibold shadow-sm disabled:opacity-50"
            >
              {submitting ? 'Updating...' : 'Update Stock Level'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
