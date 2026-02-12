import { create } from 'zustand';
import api from '@/lib/api';
import type { User, LoginResponse } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  login: (username: string, password: string) => Promise<void>;
  register: (data: {
    username: string;
    email: string;
    password: string;
    password_confirm: string;
    first_name: string;
    last_name: string;
    role: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (username, password) => {
    const { data } = await api.post<LoginResponse>('/auth/login/', {
      username,
      password,
    });
    localStorage.setItem('access_token', data.tokens.access);
    localStorage.setItem('refresh_token', data.tokens.refresh);
    set({ user: data.user, isAuthenticated: true });
  },

  register: async (formData) => {
    const { data } = await api.post<LoginResponse>('/auth/register/', formData);
    localStorage.setItem('access_token', data.tokens.access);
    localStorage.setItem('refresh_token', data.tokens.refresh);
    set({ user: data.user, isAuthenticated: true });
  },

  logout: async () => {
    try {
      const refresh = localStorage.getItem('refresh_token');
      if (refresh) {
        await api.post('/auth/logout/', { refresh });
      }
    } catch {
      // ignore
    }
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    set({ user: null, isAuthenticated: false });
  },

  loadUser: async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        set({ isLoading: false });
        return;
      }
      const { data } = await api.get<User>('/auth/me/');
      set({ user: data, isAuthenticated: true, isLoading: false });
    } catch {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));