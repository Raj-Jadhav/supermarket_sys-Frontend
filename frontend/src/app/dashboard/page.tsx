'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import type { DashboardData } from '@/types';

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [storeId, setStoreId] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/stores/${storeId}/analytics/dashboard/`);
        setData(res.data);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [storeId]);

  if (loading) return <div className="text-center py-12">Loading dashboard...</div>;
  if (error) return <div className="text-red-600 text-center py-12">{error}</div>;
  if (!data) return null;

  const { stock_alerts, aisle_overview, popular_products, popular_nutrients, unfulfilled_searches } = data;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Store Dashboard</h1>
        <select
          value={storeId}
          onChange={(e) => setStoreId(Number(e.target.value))}
          className="px-3 py-2 border rounded-lg text-sm"
        >
          <option value={1}>Store 1</option>
          <option value={2}>Store 2</option>
        </select>
      </div>

      {/* Alert Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <h3 className="text-red-800 font-semibold text-lg">⚠️ Expired Stock</h3>
          <p className="text-3xl font-bold text-red-600 mt-2">{stock_alerts.expired.count}</p>
          <ul className="mt-3 space-y-1">
            {stock_alerts.expired.items.slice(0, 5).map((item, i) => (
              <li key={i} className="text-sm text-red-700">
                {item.product} — {item.aisle} ({item.quantity} units)
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <h3 className="text-yellow-800 font-semibold text-lg">⏰ Expiring Soon</h3>
          <p className="text-3xl font-bold text-yellow-600 mt-2">{stock_alerts.expiring_soon.count}</p>
          <ul className="mt-3 space-y-1">
            {stock_alerts.expiring_soon.items.slice(0, 5).map((item, i) => (
              <li key={i} className="text-sm text-yellow-700">
                {item.product} — {item.days_left}d left ({item.quantity} units)
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
          <h3 className="text-orange-800 font-semibold text-lg">📦 Low Stock</h3>
          <p className="text-3xl font-bold text-orange-600 mt-2">{stock_alerts.low_stock.count}</p>
          <ul className="mt-3 space-y-1">
            {stock_alerts.low_stock.items.slice(0, 5).map((item, i) => (
              <li key={i} className="text-sm text-orange-700">
                {item.product} — {item.aisle} ({item.quantity} left)
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Aisle Overview */}
      <div className="bg-white rounded-xl border shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">Aisle Overview</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="pb-3 pr-4">Aisle</th>
                <th className="pb-3 pr-4">Name</th>
                <th className="pb-3 pr-4">Products</th>
                <th className="pb-3">Total Items</th>
              </tr>
            </thead>
            <tbody>
              {aisle_overview.map((aisle) => (
                <tr key={aisle.number} className="border-b last:border-0">
                  <td className="py-3 pr-4 font-medium">Aisle {aisle.number}</td>
                  <td className="py-3 pr-4">{aisle.name}</td>
                  <td className="py-3 pr-4">{aisle.product_count}</td>
                  <td className="py-3">{aisle.total_items}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Popular Searches */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">🔥 Popular Product Searches</h2>
          {popular_products.length === 0 ? (
            <p className="text-gray-500 text-sm">No search data yet</p>
          ) : (
            <ul className="space-y-2">
              {popular_products.map((item, i) => (
                <li key={i} className="flex justify-between text-sm">
                  <span>{item.search_query}</span>
                  <span className="font-semibold text-brand-600">{item.count} searches</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white rounded-xl border shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">🥗 Popular Nutrient Searches</h2>
          {popular_nutrients.length === 0 ? (
            <p className="text-gray-500 text-sm">No search data yet</p>
          ) : (
            <ul className="space-y-2">
              {popular_nutrients.map((item, i) => (
                <li key={i} className="flex justify-between text-sm">
                  <span>{item.search_query}</span>
                  <span className="font-semibold text-brand-600">{item.count} searches</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Unfulfilled Searches */}
      {unfulfilled_searches.length > 0 && (
        <div className="bg-white rounded-xl border shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">❌ Unfulfilled Searches (Items Not Found)</h2>
          <ul className="space-y-2">
            {unfulfilled_searches.map((item, i) => (
              <li key={i} className="flex justify-between text-sm">
                <span>
                  &quot;{item.search_query}&quot;{' '}
                  <span className="text-gray-400">({item.search_type})</span>
                </span>
                <span className="font-semibold text-red-600">{item.count}x</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}