import { ReactQueryProvider } from '@/lib/query-client';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <ReactQueryProvider>
      <div className="min-h-screen flex items-center justify-center bg-[#f4f6f8] px-4">
        <div className="w-full max-w-sm">
          {/* Logo / branding */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#d6ede2] mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="7" height="18" rx="2" fill="#4a9e7f" />
                <rect x="13" y="3" width="8" height="10" rx="2" fill="#4a9e7f" opacity="0.6" />
                <rect x="13" y="16" width="8" height="5" rx="2" fill="#4a9e7f" opacity="0.3" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">BoardFlow</h1>
            <p className="text-sm text-gray-500 mt-1">Collaborative Kanban for your team</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            {children}
          </div>
        </div>
      </div>
    </ReactQueryProvider>
  );
}
