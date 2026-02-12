'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import type { StockItem, Product, Aisle } from '@/types';

export default function InventoryPage() {
  const [stock, setStock] = useState<StockItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [aisles, setAisles] = useState<Aisle[]>([]);
  const [storeId, setStoreId] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Add stock form
  const [form, setForm] = useState({
    product_id: '',
    aisle_id: '',
    quantity: '',
    expiry_date: '',
    batch_number: '',
  });
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [stockRes, productsRes, aislesRes] = await Promise.all([
        api.get(`/stores/${storeId}/stock/`),
        api.get('/products/'),
        api.get(`/stores/${storeId}/aisles/`),
      ]);
      setStock(stockRes.data);
      setProducts(productsRes.data.results || productsRes.data);
      setAisles(aislesRes.data.results || aislesRes.data);
    } catch (err) {
      console.error('Failed to fetch inventory data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [storeId]);

  const handleAddStock = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);

    try {
      await api.post(`/stores/${storeId}/stock/`, {
        product_id: Number(form.product_id),
        aisle_id: Number(form.aisle_id),
        quantity: Number(form.quantity),
        expiry_date: form.expiry_date || undefined,
        batch_number: form.batch_number,
      });
      setShowForm(false);
      setForm({ product_id: '', aisle_id: '', quantity: '', expiry_date: '', batch_number: '' });
      fetchData();
    } catch (err: any) {
      const errorData = err.response?.data?.error;
      if (typeof errorData === 'object' && errorData.aisle) {
        setFormError(errorData.aisle);
      } else if (typeof errorData === 'string') {
        setFormError(errorData);
      } else {
        setFormError('Failed to add stock. Check category constraints.');
      }
    } finally {
      setFormLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'expired': return 'bg-red-100 text-red-700';
      case 'expiring': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-green-100 text-green-700';
    }
  };

  if (loading) return <div className="text-center py-12">Loading inventory...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Inventory Management</h1>
        <div className="flex items-center gap-4">
          <select value={storeId} onChange={(e) => setStoreId(Number(e.target.value))}
            className="px-3 py-2 border rounded-lg text-sm">
            <option value={1}>Store 1</option>
            <option value={2}>Store 2</option>
          </select>
          <button onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 text-sm font-medium">
            + Add Stock
          </button>
        </div>
      </div>

      {/* Add Stock Form */}
      {showForm && (
        <form onSubmit={handleAddStock} className="bg-white rounded-xl border p-6 space-y-4">
          <h2 className="text-lg font-semibold">Add Stock Item</h2>

          {formError && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm border border-red-200">
              ⚠️ {formError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Product</label>
              <select value={form.product_id} onChange={(e) => setForm({ ...form, product_id: e.target.value })}
                required className="w-full px-3 py-2 border rounded-lg">
                <option value="">Select product...</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.category_names?.join(', ')})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Aisle</label>
              <select value={form.aisle_id} onChange={(e) => setForm({ ...form, aisle_id: e.target.value })}
                required className="w-full px-3 py-2 border rounded-lg">
                <option value="">Select aisle...</option>
                {aisles.map((a) => (
                  <option key={a.id} value={a.id}>
                    Aisle {a.number} - {a.name} (allows: {a.allowed_category_names?.join(', ')})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Quantity</label>
              <input type="number" min="1" value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                required className="w-full px-3 py-2 border rounded-lg" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Expiry Date (optional)</label>
              <input type="date" value={form.expiry_date}
                onChange={(e) => setForm({ ...form, expiry_date: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Batch Number (optional)</label>
              <input type="text" value={form.batch_number}
                onChange={(e) => setForm({ ...form, batch_number: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg" />
            </div>
          </div>

          <div className="flex gap-2">
            <button type="submit" disabled={formLoading}
              className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50 text-sm font-medium">
              {formLoading ? 'Adding...' : 'Add Stock'}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Stock Table */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="text-left text-gray-500">
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Aisle</th>
              <th className="px-4 py-3">Quantity</th>
              <th className="px-4 py-3">Expiry Date</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Days Left</th>
              <th className="px-4 py-3">Batch</th>
            </tr>
          </thead>
          <tbody>
            {stock.map((item) => (
              <tr key={item.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{item.product_name}</td>
                <td className="px-4 py-3">Aisle {item.aisle_number} ({item.aisle_name})</td>
                <td className="px-4 py-3">{item.quantity}</td>
                <td className="px-4 py-3">{item.expiry_date}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.expiry_status)}`}>
                    {item.expiry_status}
                  </span>
                </td>
                <td className="px-4 py-3">{item.days_until_expiry}d</td>
                <td className="px-4 py-3 text-gray-500">{item.batch_number || '—'}</td>
              </tr>
            ))}
            {stock.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                  No stock items found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}