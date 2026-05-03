'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import { useLogin } from '../hooks/use-auth';
import { loginSchema } from '@boardflow/shared';

type FieldErrors = Partial<Record<'email' | 'password', string>>;

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const login = useLogin();

  function validate() {
    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      const errs: FieldErrors = {};
      for (const [k, v] of Object.entries(result.error.flatten().fieldErrors)) {
        errs[k as keyof FieldErrors] = (v as string[])[0];
      }
      setFieldErrors(errs);
      return false;
    }
    setFieldErrors({});
    return true;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError(null);
    if (!validate()) return;
    login.mutate(
      { email, password },
      {
        onError: (err) => {
          const message =
            (err as { response?: { data?: { error?: string } } }).response?.data?.error ??
            'Sign in failed. Please try again.';
          setServerError(message);
        },
      },
    );
  }

  const inputClass = (hasError: boolean) =>
    `w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#4a9e7f] transition bg-white ${
      hasError ? 'border-red-400' : 'border-gray-200'
    }`;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setFieldErrors((prev) => ({ ...prev, email: undefined }));
            if (serverError) setServerError(null);
          }}
          className={inputClass(!!fieldErrors.email)}
          placeholder="you@example.com"
        />
        {fieldErrors.email && <p className="mt-1 text-xs text-red-500">{fieldErrors.email}</p>}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setFieldErrors((prev) => ({ ...prev, password: undefined }));
              if (serverError) setServerError(null);
            }}
            className={`${inputClass(!!fieldErrors.password || !!serverError)} pr-10`}
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {fieldErrors.password && (
          <p className="mt-1 text-xs text-red-500">{fieldErrors.password}</p>
        )}
      </div>

      {serverError && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {serverError}
        </div>
      )}

      <button
        type="submit"
        disabled={login.isPending}
        className="w-full py-2.5 rounded-xl bg-[#f5c842] text-gray-900 font-semibold text-sm hover:bg-[#f0ba1a] active:scale-[0.98] transition disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {login.isPending ? 'Signing in…' : 'Sign in'}
      </button>

      <p className="text-center text-sm text-gray-500">
        No account?{' '}
        <Link href="/register" className="text-[#4a9e7f] font-medium hover:underline">
          Create one
        </Link>
      </p>
    </form>
  );
}
