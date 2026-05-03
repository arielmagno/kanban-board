'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { registerUser, loginUser, logoutUser } from '../auth.api';
import type { RegisterDto, LoginDto } from '@boardflow/shared';

export function useRegister() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const router = useRouter();

  return useMutation({
    mutationFn: (dto: RegisterDto) => registerUser(dto),
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken);
      router.push('/boards');
    },
  });
}

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const router = useRouter();

  return useMutation({
    mutationFn: (dto: LoginDto) => loginUser(dto),
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken);
      router.push('/boards');
    },
  });
}

export function useLogout() {
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const router = useRouter();

  return useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      clearAuth();
      router.push('/login');
    },
  });
}
