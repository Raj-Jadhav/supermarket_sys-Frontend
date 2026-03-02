'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useCartStore } from '@/store/cartStore';
import type { SearchResult, Store } from '@/types';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState('all');
  const [stores, setStores] = useState<Store[]>([]);
  const [storeId, setStoreId] = useState<number | null>(null);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [storesLoading, setStoresLoading] = useState(true);
  const [showCart, setShowCart] = useState(false);

  const { items, addItem, removeItem, updateQuantity, clearCart, getTotalPrice, getTotalItems } = useCartStore();

  // Fetch stores on mount
  useEffect(() => {
    const fetchStores = async () => {
      try {
        const res = await api.get('/stores/');
        const storeData = res.data.results || res.data;
        setStores(storeData);
        if (storeData.length > 0) setStoreId(storeData[0].id);
      } catch (err) {
        console.error('Failed to fetch stores', err);
      } finally {
        setStoresLoading(false);
      }
    };
    fetchStores();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || !storeId) return;

    setLoading(true);
    try {
      const res = await api.get(`/stores/${storeId}/search/`, {
        params: { q: query, type: searchType },
      });
      setResults(res.data.results);
      setSearched(true);
    } catch (err) {
      console.error('Search failed', err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (result: SearchResult, location: any) => {
    addItem({
      id: Math.random(),
      product_id: result.product.id,
      product_name: result.product.name,
      price: result.product.price,
      quantity: 1,
      store_id: storeId!,
      store_name: stores.find((s) => s.id === storeId)?.name || 'Unknown',
      aisle_id: location.aisle_id || 0,
      aisle_name: location.aisle_name || 'N/A',
      aisle_number: location.aisle_number || 0,
    });
  };

  if (storesLoading) {
    return <div className="text-center py-12">Loading stores...</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Search Section */}
      <div className="lg:col-span-2">
        <div className="max-w-4xl space-y-6">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold text-gray-900">🛒 Find Items in Store</h1>
            <p className="text-gray-600">
              Search by product name, nutrient type, or category to find where items are located in your store
            </p>
          </div>

          <form onSubmit={handleSearch} className="bg-white rounded-xl border shadow-sm p-6 space-y-4">
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Search for products, nutrients, categories..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 px-4 py-3 border rounded-lg text-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50 font-medium"
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>

            <div className="flex flex-wrap gap-4 items-center">
              <div>
                <label className="text-sm text-gray-600 block mb-1">Store:</label>
                <select
                  value={storeId || ''}
                  onChange={(e) => setStoreId(Number(e.target.value))}
                  className="px-3 py-2 border rounded-lg text-sm"
                >
                  {stores.map((store) => (
                    <option key={store.id} value={store.id}>
                      {store.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm text-gray-600 block mb-1">Search by:</label>
                <div className="flex gap-2">
                  {['all', 'product', 'nutrient', 'category'].map((type) => (
                    <label key={type} className="flex items-center gap-1 text-sm">
                      <input
                        type="radio"
                        name="searchType"
                        value={type}
                        checked={searchType === type}
                        onChange={() => setSearchType(type)}
                        className="text-brand-600"
                      />
                      <span className="capitalize">{type}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </form>

          {/* Results */}
          {searched && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">
                {results.length} {results.length === 1 ? 'result' : 'results'} found
              </h2>

              {results.length === 0 ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
                  <p className="text-yellow-800">
                    No items found matching &quot;{query}&quot;. Try a different search term.
                  </p>
                </div>
              ) : (
                results.map((result, i) => (
                  <div key={i} className="bg-white rounded-xl border shadow-sm p-6 space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold">{result.product.name}</h3>
                        <p className="text-brand-600 font-medium text-lg">${result.product.price}</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {result.product.categories.map((cat) => (
                            <span
                              key={cat}
                              className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs"
                            >
                              {cat}
                            </span>
                          ))}
                          {result.product.nutrients.map((nut) => (
                            <span
                              key={nut}
                              className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs"
                            >
                              {nut}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="block text-sm text-gray-500 font-medium">
                          {result.total_quantity} in stock
                        </span>
                      </div>
                    </div>

                    {/* Locations */}
                    <div className="space-y-2 border-t pt-4">
                      {result.locations.map((loc, j) => (
                        <div
                          key={j}
                          className="flex items-center justify-between gap-3 bg-brand-50 rounded-lg px-4 py-3"
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <span className="text-2xl">📍</span>
                            <div>
                              <p className="font-medium text-brand-800">{loc.message}</p>
                              <p className="text-xs text-gray-600">{loc.quantity} units available</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleAddToCart(result, loc)}
                            className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium whitespace-nowrap"
                          >
                            Add to Cart
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Cart Sidebar */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-xl border shadow-sm p-6 sticky top-20 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">🛒 Cart</h2>
            <span className="px-3 py-1 bg-brand-100 text-brand-700 rounded-full text-sm font-semibold">
              {getTotalItems()}
            </span>
          </div>

          {items.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm">Your cart is empty</p>
            </div>
          ) : (
            <>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {items.map((item) => (
                  <div
                    key={`${item.product_id}-${item.store_id}`}
                    className="border rounded-lg p-3 space-y-2"
                  >
                    <div className="text-sm">
                      <p className="font-semibold text-gray-900">{item.product_name}</p>
                      <p className="text-xs text-gray-600">
                        Store: {item.store_name} | Aisle {item.aisle_number}
                      </p>
                      <p className="text-brand-600 font-medium">${item.price}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            updateQuantity(item.product_id, item.store_id, item.quantity - 1)
                          }
                          className="px-2 py-1 bg-gray-200 rounded text-xs font-bold"
                        >
                          −
                        </button>
                        <span className="text-sm font-semibold w-6 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.product_id, item.store_id, item.quantity + 1)
                          }
                          className="px-2 py-1 bg-gray-200 rounded text-xs font-bold"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.product_id, item.store_id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="text-right font-semibold text-sm">
                      ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-brand-600">${getTotalPrice().toFixed(2)}</span>
                </div>
                <button className="w-full px-4 py-3 bg-brand-600 text-white rounded-lg hover:bg-brand-700 font-semibold">
                  Proceed to Checkout
                </button>
                <button
                  onClick={() => clearCart()}
                  className="w-full px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 text-sm font-medium"
                >
                  Clear Cart
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}