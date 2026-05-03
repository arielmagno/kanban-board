import type { Metadata } from 'next';
import { CheckSquare } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Tasks — BoardFlow' };

export default function TasksPage() {
  return (
    <div className="flex-1 overflow-y-auto flex items-center justify-center min-h-full p-8">
      <div className="text-center max-w-sm">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-[#d6ede2] mb-6">
          <CheckSquare size={36} className="text-[#4a9e7f]" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">My Tasks</h1>
        <p className="text-gray-500 text-sm mb-2">
          A unified view of all your cards across every board — coming soon.
        </p>
        <p className="text-xs text-gray-400 mb-8">
          You'll be able to filter by due date, assignee, and priority.
        </p>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f5c842]/20 text-[#b8860b] text-xs font-medium mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-[#f5c842] animate-pulse" />
          Coming soon
        </div>
        <div>
          <Link
            href="/boards"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#4a9e7f] text-white text-sm font-semibold hover:bg-[#3d8a6d] transition"
          >
            Go to Boards
          </Link>
        </div>
      </div>
    </div>
  );
}
