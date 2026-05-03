import { create } from 'zustand';
import { setAccessToken } from '@/lib/api';

interface AuthUser {
  id: string;
  email: string;
  fullName: string | null;
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: AuthUser, token: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,

  setAuth: (user, token) => {
    setAccessToken(token);
    set({ user, accessToken: token, isAuthenticated: true });
  },

  clearAuth: () => {
    setAccessToken(null);
    set({ user: null, accessToken: null, isAuthenticated: false });
  },
}));
