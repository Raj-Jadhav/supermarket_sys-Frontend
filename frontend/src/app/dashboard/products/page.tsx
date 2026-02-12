'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import type { Product, Category, NutrientType } from '@/types';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [nutrients, setNutrients] = useState<NutrientType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '', sku: '', description: '', price: '',
    categories: [] as number[], nutrients: [] as number[],
    shelf_life_days: '30',
  });
  const [formError, setFormError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pRes, cRes, nRes] = await Promise.all([
        api.get('/products/'),
        api.get('/categories/'),
        api.get('/nutrients/'),
      ]);
      setProducts(pRes.data.results || pRes.data);
      setCategories(cRes.data.results || cRes.data);
      setNutrients(nRes.data.results || nRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    try {
      await api.post('/products/', {
        ...form,
        price: parseFloat(form.price),
        shelf_life_days: parseInt(form.shelf_life_days),
      });
      setShowForm(false);
      setForm({ name: '', sku: '', description: '', price: '', categories: [], nutrients: [], shelf_life_days: '30' });
      fetchData();
    } catch (err: any) {
      setFormError(JSON.stringify(err.response?.data) || 'Failed to create product');
    }
  };

  const toggleSelection = (arr: number[], id: number) =>
    arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id];

  if (loading) return <div className="text-center py-12">Loading products...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Products</h1>
        <button onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 text-sm font-medium">
          + Add Product
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border p-6 space-y-4">
          {formError && <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">{formError}</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                required className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">SKU</label>
              <input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })}
                required className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Price</label>
              <input type="number" step="0.01" value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                required className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Shelf Life (days)</label>
              <input type="number" value={form.shelf_life_days}
                onChange={(e) => setForm({ ...form, shelf_life_days: e.target.value })}
                required className="w-full px-3 py-2 border rounded-lg" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Categories</label>
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <button key={c.id} type="button"
                  onClick={() => setForm({ ...form, categories: toggleSelection(form.categories, c.id) })}
                  className={`px-3 py-1 rounded-full text-xs font-medium border ${
                    form.categories.includes(c.id) ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'
                  }`}>
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Nutrients</label>
            <div className="flex flex-wrap gap-2">
              {nutrients.map((n) => (
                <button key={n.id} type="button"
                  onClick={() => setForm({ ...form, nutrients: toggleSelection(form.nutrients, n.id) })}
                  className={`px-3 py-1 rounded-full text-xs font-medium border ${
                    form.nutrients.includes(n.id) ? 'bg-green-600 text-white' : 'bg-white text-gray-700'
                  }`}>
                  {n.name} ({n.category_display})
                </button>
              ))}
            </div>
          </div>

          <button type="submit" className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 text-sm font-medium">
            Create Product
          </button>
        </form>
      )}

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="text-left text-gray-500">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Categories</th>
              <th className="px-4 py-3">Nutrients</th>
              <th className="px-4 py-3">Shelf Life</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{p.name}</td>
                <td className="px-4 py-3 text-gray-500">{p.sku}</td>
                <td className="px-4 py-3">${p.price}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {p.category_names?.map((c) => (
                      <span key={c} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">{c}</span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {p.nutrient_names?.map((n) => (
                      <span key={n} className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs">{n}</span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3">{p.shelf_life_days}d</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}