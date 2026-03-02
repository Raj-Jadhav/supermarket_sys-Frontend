'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export default function ProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { user, logout } = useAuthStore();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const avatarColor = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500'][
    (user?.id || 0) % 5
  ];
  const initials = `${user?.first_name || 'U'}${user?.last_name || ''}`
    .split('')
    .filter((c) => c === c.toUpperCase())
    .slice(0, 2)
    .join('');

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors"
      >
        <div className={`w-10 h-10 ${avatarColor} rounded-full flex items-center justify-center text-white font-bold text-sm`}>
          {initials || 'U'}
        </div>
        <div className="hidden sm:block text-left">
          <p className="text-sm font-semibold text-gray-900">{user?.first_name || user?.username}</p>
          <p className="text-xs text-gray-500 capitalize">{user?.roles[0]?.role || 'user'}</p>
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-900">{user?.first_name} {user?.last_name}</p>
            <p className="text-xs text-gray-600">{user?.email}</p>
            {user?.phone && <p className="text-xs text-gray-600">{user?.phone}</p>}
          </div>

          <button
            onClick={() => {
              setIsOpen(false);
              // Navigate to profile page when implemented
            }}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            👤 View Profile
          </button>

          <button
            onClick={() => {
              setIsOpen(false);
              // Navigate to settings when implemented
            }}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            ⚙️ Settings
          </button>

          <div className="border-t border-gray-100 my-1" />

          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
          >
            🚪 Logout
          </button>
        </div>
      )}
    </div>
  );
}
