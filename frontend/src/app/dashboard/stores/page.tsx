'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import type { Store, Aisle, Category } from '@/types';

export default function StoresPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState<number | null>(null);
  const [aisles, setAisles] = useState<Aisle[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Add store form
  const [showStoreForm, setShowStoreForm] = useState(false);
  const [storeForm, setStoreForm] = useState({ name: '', location: '' });
  const [storeFormError, setStoreFormError] = useState('');

  // Add aisle form
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ number: '', name: '', allowed_categories: [] as number[] });

  useEffect(() => {
    const fetch = async () => {
      try {
        const [storeRes, catRes] = await Promise.all([
          api.get('/stores/'),
          api.get('/categories/'),
        ]);
        const storeData = storeRes.data.results || storeRes.data;
        setStores(storeData);
        setCategories(catRes.data.results || catRes.data);
        if (storeData.length > 0) setSelectedStore(storeData[0].id);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  useEffect(() => {
    if (!selectedStore) return;
    api.get(`/stores/${selectedStore}/aisles/`).then((res) => {
      setAisles(res.data.results || res.data);
    });
  }, [selectedStore]);

  const handleCreateAisle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStore) return;
    try {
      await api.post(`/stores/${selectedStore}/aisles/`, {
        number: parseInt(form.number),
        name: form.name,
        allowed_categories: form.allowed_categories,
      });
      setShowForm(false);
      setForm({ number: '', name: '', allowed_categories: [] });
      const res = await api.get(`/stores/${selectedStore}/aisles/`);
      setAisles(res.data.results || res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    setStoreFormError('');
    try {
      const newStore = await api.post('/stores/', {
        name: storeForm.name,
        location: storeForm.location,
      });
      setStores([...stores, newStore.data]);
      setShowStoreForm(false);
      setStoreForm({ name: '', location: '' });
      setSelectedStore(newStore.data.id);
    } catch (err: any) {
      setStoreFormError(err.response?.data?.error || 'Failed to create store');
    }
  };

  if (loading) return <div className="text-center py-12">Loading stores...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Stores & Aisles</h1>

      {/* Create Store Button */}
      <button onClick={() => setShowStoreForm(!showStoreForm)}
        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium">
        + Create New Store
      </button>

      {showStoreForm && (
        <form onSubmit={handleCreateStore} className="bg-white rounded-xl border p-6 space-y-4">
          <h2 className="text-lg font-semibold">Create New Store</h2>
          {storeFormError && <div className="text-red-600 text-sm">{storeFormError}</div>}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Store Name</label>
              <input type="text" value={storeForm.name}
                onChange={(e) => setStoreForm({ ...storeForm, name: e.target.value })}
                required className="w-full px-3 py-2 border rounded-lg"
                placeholder="e.g. Downtown Store, Mall Branch" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Location</label>
              <input type="text" value={storeForm.location}
                onChange={(e) => setStoreForm({ ...storeForm, location: e.target.value })}
                required className="w-full px-3 py-2 border rounded-lg"
                placeholder="e.g. 123 Main St" />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium">
              Create Store
            </button>
            <button type="button" onClick={() => setShowStoreForm(false)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Store Selector */}
      <div className="flex gap-3">
        {stores.map((store) => (
          <button key={store.id}
            onClick={() => setSelectedStore(store.id)}
            className={`px-4 py-2 rounded-lg border text-sm font-medium ${
              selectedStore === store.id ? 'bg-brand-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}>
            {store.name} ({store.aisle_count} aisles)
          </button>
        ))}
      </div>

      {/* Add Aisle */}
      <button onClick={() => setShowForm(!showForm)}
        className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 text-sm font-medium">
        + Add Aisle
      </button>

      {showForm && (
        <form onSubmit={handleCreateAisle} className="bg-white rounded-xl border p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Aisle Number</label>
              <input type="number" value={form.number}
                onChange={(e) => setForm({ ...form, number: e.target.value })}
                required className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required className="w-full px-3 py-2 border rounded-lg"
                placeholder="e.g. Fruit Aisle, Meat Section" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Allowed Categories</label>
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <button key={c.id} type="button"
                  onClick={() => {
                    const arr = form.allowed_categories;
                    setForm({
                      ...form,
                      allowed_categories: arr.includes(c.id) ? arr.filter((x) => x !== c.id) : [...arr, c.id],
                    });
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-medium border ${
                    form.allowed_categories.includes(c.id) ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'
                  }`}>
                  {c.name}
                </button>
              ))}
            </div>
          </div>
          <button type="submit" className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium">
            Create Aisle
          </button>
        </form>
      )}

      {/* Aisles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {aisles.map((aisle) => (
          <div key={aisle.id} className="bg-white rounded-xl border shadow-sm p-5">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-semibold text-lg">Aisle {aisle.number}</h3>
                <p className="text-gray-600 text-sm">{aisle.name}</p>
              </div>
              <span className="px-2 py-1 bg-gray-100 rounded-full text-xs font-medium">
                {aisle.stock_count} items
              </span>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Allowed categories:</p>
              <div className="flex flex-wrap gap-1">
                {aisle.allowed_category_names?.length > 0 ? (
                  aisle.allowed_category_names.map((cat) => (
                    <span key={cat} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">
                      {cat}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-gray-400">All categories accepted</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}