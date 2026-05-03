import type { Metadata } from 'next';
import { RegisterForm } from '@/features/auth/components/register-form';

export const metadata: Metadata = { title: 'Create account — BoardFlow' };

export default function RegisterPage() {
  return (
    <>
      <h2 className="text-xl font-bold text-gray-900 mb-6">Create account</h2>
      <RegisterForm />
    </>
  );
}
