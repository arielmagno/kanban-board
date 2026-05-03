'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRegister } from '../hooks/use-auth';
import { registerSchema } from '@boardflow/shared';

export function RegisterForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const register = useRegister();

  function validate() {
    const result = registerSchema.safeParse({ email, password });
    if (!result.success) {
      const errs: Record<string, string> = {};
      for (const [k, v] of Object.entries(result.error.flatten().fieldErrors)) {
        errs[k] = (v as string[])[0];
      }
      setFieldErrors(errs);
      return false;
    }
    setFieldErrors({});
    return true;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    register.mutate({ email, password });
  }

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
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#4a9e7f] transition"
          placeholder="you@example.com"
        />
        {fieldErrors.email && <p className="mt-1 text-xs text-red-500">{fieldErrors.email}</p>}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          Password
          <span className="ml-1 text-xs text-gray-400 font-normal">(min 8 characters)</span>
        </label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#4a9e7f] transition"
          placeholder="••••••••"
        />
        {fieldErrors.password && (
          <p className="mt-1 text-xs text-red-500">{fieldErrors.password}</p>
        )}
      </div>

      {register.error && (
        <p className="text-sm text-red-500 text-center">
          {(register.error as { response?: { data?: { error?: string } } }).response?.data
            ?.error ?? 'Registration failed. Please try again.'}
        </p>
      )}

      <button
        type="submit"
        disabled={register.isPending}
        className="w-full py-2.5 rounded-xl bg-[#f5c842] text-gray-900 font-semibold text-sm hover:bg-[#f0ba1a] active:scale-[0.98] transition disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {register.isPending ? 'Creating account…' : 'Create account'}
      </button>

      <p className="text-center text-sm text-gray-500">
        Already have an account?{' '}
        <Link href="/login" className="text-[#4a9e7f] font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
