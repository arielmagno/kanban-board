import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAuthStore } from '@/stores/auth.store';

const mockSetAccessToken = vi.hoisted(() => vi.fn());

vi.mock('@/lib/api', () => ({
  setAccessToken: mockSetAccessToken,
  getAccessToken: vi.fn(),
  apiClient: {},
}));

const emptyState = { user: null, accessToken: null, isAuthenticated: false };

describe('useAuthStore', () => {
  beforeEach(() => {
    useAuthStore.setState(emptyState);
    mockSetAccessToken.mockClear();
  });

  describe('setAuth', () => {
    it('sets user, accessToken, and isAuthenticated to true', () => {
      const user = { id: 'u1', email: 'a@b.com', fullName: 'Alice' };
      useAuthStore.getState().setAuth(user, 'tok-123');

      const state = useAuthStore.getState();
      expect(state.user).toEqual(user);
      expect(state.accessToken).toBe('tok-123');
      expect(state.isAuthenticated).toBe(true);
    });

    it('calls setAccessToken with the provided token', () => {
      const user = { id: 'u1', email: 'a@b.com', fullName: null };
      useAuthStore.getState().setAuth(user, 'my-token');
      expect(mockSetAccessToken).toHaveBeenCalledWith('my-token');
    });

    it('overwrites a previous auth state with new user', () => {
      const userA = { id: 'u1', email: 'a@b.com', fullName: 'Alice' };
      const userB = { id: 'u2', email: 'b@b.com', fullName: 'Bob' };
      useAuthStore.getState().setAuth(userA, 'tok-a');
      useAuthStore.getState().setAuth(userB, 'tok-b');

      const state = useAuthStore.getState();
      expect(state.user).toEqual(userB);
      expect(state.accessToken).toBe('tok-b');
    });
  });

  describe('clearAuth', () => {
    it('resets user, accessToken, and isAuthenticated to defaults', () => {
      const user = { id: 'u1', email: 'a@b.com', fullName: null };
      useAuthStore.getState().setAuth(user, 'tok');
      useAuthStore.getState().clearAuth();

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.accessToken).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });

    it('calls setAccessToken(null)', () => {
      useAuthStore.getState().clearAuth();
      expect(mockSetAccessToken).toHaveBeenCalledWith(null);
    });

    it('is idempotent — calling twice leaves state the same', () => {
      useAuthStore.getState().clearAuth();
      useAuthStore.getState().clearAuth();

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });
  });
});
