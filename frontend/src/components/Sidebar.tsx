'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const isStaff = user?.roles.some((r) => ['admin', 'staff'].includes(r.role));
  const isCustomer = user?.roles.some((r) => r.role === 'customer');

  const isActive = (path: string) => pathname === path;

  const navItems = [
    { href: '/dashboard', label: '📊 Dashboard', staffOnly: true },
    { href: '/dashboard/stores', label: '🏪 Stores & Aisles', staffOnly: true },
    { href: '/dashboard/products', label: '📦 Products', staffOnly: true },
    { href: '/dashboard/inventory', label: '📋 Inventory', staffOnly: true },
    { href: '/search', label: '🔍 Find Items', staffOnly: false, customerOnly: true },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-4rem)] overflow-y-auto">
      <nav className="px-4 py-6 space-y-2">
        {navItems.map((item) => {
          // Skip staff-only items if not staff
          if (item.staffOnly && !isStaff) return null;
          // Skip customer-only items if not customer
          if ('customerOnly' in item && item.customerOnly && !isCustomer) return null;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-4 py-3 rounded-lg font-medium transition-all ${
                isActive(item.href)
                  ? 'bg-brand-50 text-brand-700 border-l-4 border-brand-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Analytics Section */}
      {isStaff && (
        <div className="border-t px-4 py-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">Analytics</h3>
          <div className="space-y-2 text-sm">
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-gray-600">Most Requested</p>
              <p className="font-semibold text-brand-700">View Insights →</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="text-gray-600">Stock Alerts</p>
              <p className="font-semibold text-green-700">View Status →</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
