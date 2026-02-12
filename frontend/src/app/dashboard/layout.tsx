'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, loadUser, logout } = useAuthStore();

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-brand-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const isStaff = user?.roles.some((r) => ['admin', 'staff'].includes(r.role));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-8">
              <Link href="/dashboard" className="text-xl font-bold text-brand-700">
                🛒 SMMS
              </Link>
              <div className="hidden md:flex space-x-4">
                {isStaff && (
                  <>
                    <Link href="/dashboard" className="text-gray-700 hover:text-brand-600 px-3 py-2 text-sm font-medium">
                      Dashboard
                    </Link>
                    <Link href="/dashboard/inventory" className="text-gray-700 hover:text-brand-600 px-3 py-2 text-sm font-medium">
                      Inventory
                    </Link>
                    <Link href="/dashboard/stores" className="text-gray-700 hover:text-brand-600 px-3 py-2 text-sm font-medium">
                      Stores & Aisles
                    </Link>
                    <Link href="/dashboard/products" className="text-gray-700 hover:text-brand-600 px-3 py-2 text-sm font-medium">
                      Products
                    </Link>
                  </>
                )}
                <Link href="/search" className="text-gray-700 hover:text-brand-600 px-3 py-2 text-sm font-medium">
                  Find Items
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {user?.first_name || user?.username}
                {user?.roles[0] && (
                  <span className="ml-2 px-2 py-0.5 bg-brand-100 text-brand-700 rounded-full text-xs">
                    {user.roles[0].role}
                  </span>
                )}
              </span>
              <button
                onClick={() => { logout(); router.push('/login'); }}
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}