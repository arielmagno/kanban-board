'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import { useRegister } from '../hooks/use-auth';
import { registerSchema } from '@boardflow/shared';

type FieldErrors = Partial<Record<'fullName' | 'email' | 'password', string>>;

function isDuplicateEmail(
  err: unknown,
): err is { response: { status: number; data: { error: string } } } {
  const e = err as { response?: { status?: number } };
  return e?.response?.status === 409;
}

export function RegisterForm() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const register = useRegister();

  function validate() {
    const result = registerSchema.safeParse({ fullName, email, password });
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
    register.mutate(
      { fullName, email, password },
      {
        onError: (err) => {
          if (isDuplicateEmail(err)) {
            setServerError('duplicate_email');
          } else {
            setServerError('generic');
          }
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
        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
          Full name
        </label>
        <input
          id="fullName"
          type="text"
          autoComplete="name"
          value={fullName}
          onChange={(e) => {
            setFullName(e.target.value);
            setFieldErrors((prev) => ({ ...prev, fullName: undefined }));
          }}
          className={inputClass(!!fieldErrors.fullName)}
          placeholder="Ariel Magno"
        />
        {fieldErrors.fullName && (
          <p className="mt-1 text-xs text-red-500">{fieldErrors.fullName}</p>
        )}
      </div>

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
            if (serverError === 'duplicate_email') setServerError(null);
          }}
          className={inputClass(!!fieldErrors.email || serverError === 'duplicate_email')}
          placeholder="you@example.com"
        />
        {fieldErrors.email && <p className="mt-1 text-xs text-red-500">{fieldErrors.email}</p>}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          Password
          <span className="ml-1 text-xs text-gray-400 font-normal">(min 8 characters)</span>
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setFieldErrors((prev) => ({ ...prev, password: undefined }));
            }}
            className={`${inputClass(!!fieldErrors.password)} pr-10`}
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

      {serverError === 'duplicate_email' && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
          It looks like you&apos;ve already got an account associated with this email.{' '}
          <Link href="/login" className="font-semibold underline underline-offset-2 hover:text-amber-900">
            Use the Log In link instead.
          </Link>
        </div>
      )}

      {serverError === 'generic' && (
        <p className="text-sm text-red-500 text-center">
          Something went wrong. Please try again.
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
