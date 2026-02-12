'use client';

import { useState } from 'react';
import api from '@/lib/api';
import type { SearchResult } from '@/types';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState('all');
  const [storeId, setStoreId] = useState(1);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const res = await api.get(`/stores/${storeId}/search/`, {
        params: { q: query, type: searchType },
      });
      setResults(res.data.results);
      setSearched(true);
    } catch (err) {
      console.error('Search failed', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="text-center space-y-4 mb-12">
        <h1 className="text-3xl font-bold text-gray-900">🔍 Find Items in Store</h1>
        <p className="text-gray-600">
          Search by product name, nutrient type, or category to find where items are located
        </p>
      </div>

      <form onSubmit={handleSearch} className="bg-white rounded-xl border shadow-sm p-6 space-y-4">
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Search for products, nutrients, categories..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 px-4 py-3 border rounded-lg text-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
          <button type="submit" disabled={loading}
            className="px-6 py-3 bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50 font-medium">
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>

        <div className="flex gap-4 items-center">
          <label className="text-sm text-gray-600">Search by:</label>
          {['all', 'product', 'nutrient', 'category'].map((type) => (
            <label key={type} className="flex items-center gap-1.5 text-sm">
              <input type="radio" name="searchType" value={type}
                checked={searchType === type}
                onChange={() => setSearchType(type)}
                className="text-brand-600" />
              <span className="capitalize">{type}</span>
            </label>
          ))}

          <select value={storeId} onChange={(e) => setStoreId(Number(e.target.value))}
            className="ml-auto px-3 py-1.5 border rounded-lg text-sm">
            <option value={1}>Store 1</option>
            <option value={2}>Store 2</option>
          </select>
        </div>
      </form>

      {/* Results */}
      {searched && (
        <div className="mt-8 space-y-4">
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
              <div key={i} className="bg-white rounded-xl border shadow-sm p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">{result.product.name}</h3>
                    <p className="text-brand-600 font-medium">${result.product.price}</p>
                    <div className="flex gap-2 mt-2">
                      {result.product.categories.map((cat) => (
                        <span key={cat} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">
                          {cat}
                        </span>
                      ))}
                      {result.product.nutrients.map((nut) => (
                        <span key={nut} className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs">
                          {nut}
                        </span>
                      ))}
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">
                    {result.total_quantity} in stock
                  </span>
                </div>

                <div className="mt-4 space-y-2">
                  {result.locations.map((loc, j) => (
                    <div key={j} className="flex items-center gap-3 bg-brand-50 rounded-lg px-4 py-2">
                      <span className="text-2xl">📍</span>
                      <span className="font-medium text-brand-800">{loc.message}</span>
                      <span className="ml-auto text-sm text-gray-600">{loc.quantity} units</span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}