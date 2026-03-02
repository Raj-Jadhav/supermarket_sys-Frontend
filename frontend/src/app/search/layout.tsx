'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import ProfileDropdown from '@/components/ProfileDropdown';

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, loadUser } = useAuthStore();
  const cartItems = useCartStore((state) => state.getTotalItems());

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar - Amazon Style */}
      <nav className="bg-white border-b shadow-sm sticky top-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-8">
              <Link href="/search" className="text-2xl font-bold text-brand-700">
                🛒 SMMS
              </Link>
              <span className="text-gray-600">Customer Portal</span>
            </div>

            <div className="flex items-center space-x-6">
              {/* Cart Icon */}
              <Link
                href="/search"
                className="relative flex items-center space-x-2 text-gray-700 hover:text-brand-600"
              >
                <span className="text-2xl">🛒</span>
                {cartItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {cartItems}
                  </span>
                )}
              </Link>

              {/* Profile Dropdown */}
              <ProfileDropdown />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="overflow-auto">
        {children}
      </main>
    </div>
  );
}
