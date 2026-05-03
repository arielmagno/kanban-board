import { ReactQueryProvider } from '@/lib/query-client';
import { AppSidebar } from '@/features/board/components/app-sidebar';
import { AuthProvider } from '@/features/auth/components/auth-provider';
import { ToastContainer } from '@/components/toast';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ReactQueryProvider>
      <AuthProvider>
        <div className="flex h-screen bg-[#f4f6f8]">
          <AppSidebar />
          <main className="flex-1 md:ml-16 flex flex-col overflow-hidden">
            {children}
          </main>
        </div>
        <ToastContainer />
      </AuthProvider>
    </ReactQueryProvider>
  );
}
