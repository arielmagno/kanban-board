'use client';

import { useEffect, useRef } from 'react';
import { apiClient } from '@/lib/api';
import { useAuthStore } from '@/stores/auth.store';

/**
 * Attempts to restore the session from the httpOnly refresh cookie on mount.
 * This lets the user stay logged in after a page refresh without storing
 * the access token in localStorage.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const setAuth = useAuthStore((s) => s.setAuth);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const attempted = useRef(false);

  useEffect(() => {
    if (isAuthenticated || attempted.current) return;
    attempted.current = true;

    apiClient
      .post<{ accessToken: string; user: { id: string; email: string } }>('/api/auth/refresh')
      .then(({ data }) => setAuth(data.user, data.accessToken))
      .catch(() => {
        // No valid refresh cookie — user must log in
      });
  }, [isAuthenticated, setAuth]);

  return <>{children}</>;
}
