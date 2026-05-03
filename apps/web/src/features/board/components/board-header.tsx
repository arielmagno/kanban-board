'use client';

import Link from 'next/link';
import { ChevronLeft, Settings } from 'lucide-react';
import type { Board } from '../board.types';

export function BoardHeader({ board }: { board: Board }) {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <Link
          href="/boards"
          className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition"
        >
          <ChevronLeft size={18} />
        </Link>
        <div>
          <h1 className="font-bold text-gray-900 text-base leading-tight">{board.title}</h1>
          <p className="text-xs text-gray-400" suppressHydrationWarning>
            Created {new Date(board.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>
      <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm text-gray-500 hover:bg-gray-100 transition">
        <Settings size={15} />
        Settings
      </button>
    </div>
  );
}
