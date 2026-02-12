'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isLoading, loadUser, user } = useAuthStore();

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.push('/login');
    } else {
      const isStaff = user?.roles.some((r) => ['admin', 'staff'].includes(r.role));
      router.push(isStaff ? '/dashboard' : '/search');
    }
  }, [isAuthenticated, isLoading, router, user]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="animate-spin h-8 w-8 border-4 border-brand-500 border-t-transparent rounded-full" />
    </div>
  );
}