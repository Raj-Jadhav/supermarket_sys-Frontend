'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuthStore();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    password_confirm: '',
    role: 'customer',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.password_confirm) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await register(formData);
      router.push('/');
    } catch (err: any) {
      const data = err.response?.data;
      if (data && typeof data === 'object') {
        const messages = Object.values(data).flat().join(', ');
        setError(messages || 'Registration failed');
      } else {
        setError('Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-brand-700">🛒 SMMS</h1>
          <p className="mt-2 text-gray-600">Create a new account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 bg-white p-8 rounded-xl shadow-sm border">
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">{error}</div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input name="first_name" value={formData.first_name} onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input name="last_name" value={formData.last_name} onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input name="username" value={formData.username} onChange={handleChange} required
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input name="email" type="email" value={formData.email} onChange={handleChange} required
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select name="role" value={formData.role} onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500">
              <option value="customer">Customer</option>
              <option value="staff">Staff</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input name="password" type="password" value={formData.password} onChange={handleChange}
              required minLength={8}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <input name="password_confirm" type="password" value={formData.password_confirm}
              onChange={handleChange} required
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500" />
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-2 px-4 bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50 font-medium">
            {loading ? 'Creating account...' : 'Create Account'}
          </button>

          <p className="text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="text-brand-600 hover:underline font-medium">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}