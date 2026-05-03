'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useBoards } from '../hooks/use-board';
import { CreateBoardModal } from './create-board-modal';
import { LayoutGrid, Plus, Clock } from 'lucide-react';

function BoardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
      <div className="h-3 bg-gray-100 rounded w-1/2" />
    </div>
  );
}

export function BoardList() {
  const { data: boards, isLoading, isError, refetch } = useBoards();
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Boards</h1>
          <p className="text-sm text-gray-500 mt-1">Select a board to get started</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#f5c842] text-gray-900 font-semibold text-sm hover:bg-[#f0ba1a] active:scale-[0.98] transition"
        >
          <Plus size={16} />
          New board
        </button>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <BoardSkeleton key={i} />)}
        </div>
      )}

      {isError && (
        <div className="text-center py-16">
          <p className="text-gray-500 mb-3">Failed to load boards.</p>
          <button onClick={() => refetch()} className="text-sm text-[#4a9e7f] hover:underline">
            Try again
          </button>
        </div>
      )}

      {!isLoading && !isError && boards?.length === 0 && (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#d6ede2] mb-4">
            <LayoutGrid size={28} className="text-[#4a9e7f]" />
          </div>
          <p className="text-gray-600 font-medium mb-1">No boards yet</p>
          <p className="text-sm text-gray-400 mb-6">Create your first board to get started</p>
          <button
            onClick={() => setShowCreate(true)}
            className="px-5 py-2.5 rounded-xl bg-[#f5c842] text-gray-900 font-semibold text-sm hover:bg-[#f0ba1a] transition"
          >
            Create board
          </button>
        </div>
      )}

      {!isLoading && !isError && boards && boards.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {boards.map((board) => (
            <Link
              key={board.id}
              href={`/boards/${board.id}`}
              className="group bg-white rounded-2xl border border-gray-100 p-5 hover:border-[#4a9e7f] hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#d6ede2] mb-3 group-hover:bg-[#c5e5d5] transition">
                  <LayoutGrid size={18} className="text-[#4a9e7f]" />
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-2">
                {board.title}
              </h3>
              <div className="flex items-center gap-1 text-xs text-gray-400" suppressHydrationWarning>
                <Clock size={11} />
                <span>{new Date(board.createdAt).toLocaleDateString()}</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {showCreate && <CreateBoardModal onClose={() => setShowCreate(false)} />}
    </div>
  );
}
