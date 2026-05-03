import { describe, it, expect, vi, beforeEach } from 'vitest';
import { registerUser, loginUser, logoutUser } from '@/features/auth/auth.api';
import { apiClient } from '@/lib/api';

vi.mock('@/lib/api', () => ({
  apiClient: {
    post: vi.fn(),
    get: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
  setAccessToken: vi.fn(),
  getAccessToken: vi.fn(),
}));

const mockPost = vi.mocked(apiClient.post);

const fakeAuthResponse = {
  accessToken: 'access-token',
  user: { id: 'u1', email: 'a@b.com', fullName: 'Alice' },
};

beforeEach(() => {
  mockPost.mockReset();
});

describe('registerUser', () => {
  it('POSTs to /api/auth/register and returns response data', async () => {
    mockPost.mockResolvedValue({ data: fakeAuthResponse });

    const result = await registerUser({ email: 'a@b.com', password: 'password123', fullName: 'Alice' });

    expect(mockPost).toHaveBeenCalledWith('/api/auth/register', {
      email: 'a@b.com',
      password: 'password123',
      fullName: 'Alice',
    });
    expect(result).toEqual(fakeAuthResponse);
  });

  it('propagates errors thrown by apiClient', async () => {
    mockPost.mockRejectedValue({ response: { status: 409 } });

    await expect(
      registerUser({ email: 'dup@test.com', password: 'password123', fullName: 'Dup' }),
    ).rejects.toMatchObject({ response: { status: 409 } });
  });
});

describe('loginUser', () => {
  it('POSTs to /api/auth/login and returns response data', async () => {
    mockPost.mockResolvedValue({ data: fakeAuthResponse });

    const result = await loginUser({ email: 'a@b.com', password: 'password123' });

    expect(mockPost).toHaveBeenCalledWith('/api/auth/login', {
      email: 'a@b.com',
      password: 'password123',
    });
    expect(result.accessToken).toBe('access-token');
  });

  it('propagates 401 errors from apiClient', async () => {
    mockPost.mockRejectedValue({ response: { status: 401 } });

    await expect(loginUser({ email: 'x@y.com', password: 'wrong' })).rejects.toMatchObject({
      response: { status: 401 },
    });
  });
});

describe('logoutUser', () => {
  it('POSTs to /api/auth/logout', async () => {
    mockPost.mockResolvedValue({ data: undefined });

    await logoutUser();

    expect(mockPost).toHaveBeenCalledWith('/api/auth/logout');
  });

  it('propagates errors from apiClient', async () => {
    mockPost.mockRejectedValue(new Error('network error'));
    await expect(logoutUser()).rejects.toThrow('network error');
  });
});
