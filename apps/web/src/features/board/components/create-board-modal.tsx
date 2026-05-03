'use client';

import { useState } from 'react';
import { useCreateBoard } from '../hooks/use-board';
import { createBoardSchema } from '@boardflow/shared';
import { BoardColorPicker } from './board-color-picker';

export function CreateBoardModal({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState('');
  const [color, setColor] = useState<string | null>(null);
  const [error, setError] = useState('');
  const createBoard = useCreateBoard();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = createBoardSchema.safeParse({ title });
    if (!result.success) {
      setError(result.error.flatten().fieldErrors.title?.[0] ?? 'Invalid title');
      return;
    }
    createBoard.mutate({ title, color: color ?? undefined });
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">New board</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              autoFocus
              type="text"
              value={title}
              onChange={(e) => { setTitle(e.target.value); setError(''); }}
              placeholder="Board name"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a9e7f] transition"
            />
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Background color</p>
            {/* Preview swatch + picker */}
            {color && (
              <div className="w-full h-10 rounded-xl mb-2 transition-colors" style={{ backgroundColor: color }} />
            )}
            <BoardColorPicker value={color} onChange={setColor} />
          </div>

          {createBoard.error && (
            <p className="text-xs text-red-500">
              {(createBoard.error as { response?: { data?: { error?: string } } }).response?.data?.error ?? 'Failed to create board'}
            </p>
          )}
          <div className="flex gap-2 justify-end pt-1">
            <button type="button" onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition">
              Cancel
            </button>
            <button type="submit" disabled={createBoard.isPending}
              className="px-4 py-2 rounded-xl bg-[#f5c842] text-gray-900 text-sm font-semibold hover:bg-[#f0ba1a] transition disabled:opacity-60">
              {createBoard.isPending ? 'Creating…' : 'Create board'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
