import { apiClient } from '@/lib/api';
import type { RegisterDto, LoginDto } from '@boardflow/shared';

interface AuthResponse {
  accessToken: string;
  user: { id: string; email: string; fullName: string | null };
}

export async function registerUser(dto: RegisterDto): Promise<AuthResponse> {
  const res = await apiClient.post<AuthResponse>('/api/auth/register', dto);
  return res.data;
}

export async function loginUser(dto: LoginDto): Promise<AuthResponse> {
  const res = await apiClient.post<AuthResponse>('/api/auth/login', dto);
  return res.data;
}

export async function logoutUser(): Promise<void> {
  await apiClient.post('/api/auth/logout');
}
