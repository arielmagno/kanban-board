import { ReactQueryProvider } from '@/lib/query-client';
import { AppSidebar } from '@/features/board/components/app-sidebar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ReactQueryProvider>
      <div className="flex min-h-screen bg-[#f4f6f8]">
        <AppSidebar />
        <main className="flex-1 md:ml-16 min-h-screen overflow-auto">
          {children}
        </main>
      </div>
    </ReactQueryProvider>
  );
}
