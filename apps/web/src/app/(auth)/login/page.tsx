import type { Metadata } from 'next';
import { LoginForm } from '@/features/auth/components/login-form';

export const metadata: Metadata = { title: 'Sign in — BoardFlow' };

export default function LoginPage() {
  return (
    <>
      <h2 className="text-xl font-bold text-gray-900 mb-6">Sign in</h2>
      <LoginForm />
    </>
  );
}
