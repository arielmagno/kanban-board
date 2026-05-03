'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, Pencil, Check, X, Palette } from 'lucide-react';
import { useUpdateBoard } from '../hooks/use-board';
import { BoardColorPicker } from './board-color-picker';
import type { Board } from '../board.types';

export function BoardHeader({ board }: { board: Board }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(board.title);
  const [showColors, setShowColors] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const colorRef = useRef<HTMLDivElement>(null);
  const updateBoard = useUpdateBoard(board.id);

  useEffect(() => {
    if (!editing) setDraft(board.title);
  }, [board.title, editing]);

  // Close color picker on outside click
  useEffect(() => {
    if (!showColors) return;
    function onOutside(e: MouseEvent) {
      if (colorRef.current && !colorRef.current.contains(e.target as Node)) setShowColors(false);
    }
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, [showColors]);

  function startEdit() {
    setDraft(board.title);
    setEditing(true);
    setTimeout(() => inputRef.current?.select(), 0);
  }

  function cancel() {
    setDraft(board.title);
    setEditing(false);
  }

  function submit() {
    const trimmed = draft.trim();
    if (!trimmed || trimmed === board.title) { cancel(); return; }
    updateBoard.mutate({ title: trimmed }, { onSuccess: () => setEditing(false), onError: cancel });
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') submit();
    if (e.key === 'Escape') cancel();
  }

  function handleColorChange(color: string | null) {
    updateBoard.mutate({ color });
  }

  return (
    <div className="flex items-center justify-between px-6 py-3 border-b border-black/10 bg-white/70 backdrop-blur-sm sticky top-0 z-20 flex-shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        <Link
          href="/boards"
          className="p-1.5 rounded-lg text-gray-400 hover:bg-black/10 transition flex-shrink-0"
        >
          <ChevronLeft size={18} />
        </Link>

        {editing ? (
          <div className="flex items-center gap-2 min-w-0">
            <input
              ref={inputRef}
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={submit}
              onKeyDown={onKeyDown}
              className="font-bold text-gray-900 text-base bg-transparent border-b-2 border-[#4a9e7f] focus:outline-none min-w-0 w-48 sm:w-72"
            />
            <button onMouseDown={(e) => { e.preventDefault(); submit(); }}
              className="p-1 rounded-lg text-[#4a9e7f] hover:bg-[#d6ede2] transition flex-shrink-0">
              <Check size={15} />
            </button>
            <button onMouseDown={(e) => { e.preventDefault(); cancel(); }}
              className="p-1 rounded-lg text-gray-400 hover:bg-black/10 transition flex-shrink-0">
              <X size={15} />
            </button>
          </div>
        ) : (
          <button onClick={startEdit} className="group flex items-center gap-1.5 text-left min-w-0" title="Click to rename">
            <h1 className="font-bold text-gray-900 text-base leading-tight truncate">{board.title}</h1>
            <Pencil size={13} className="text-gray-300 group-hover:text-gray-500 transition flex-shrink-0" />
          </button>
        )}
      </div>

      {/* Background color picker */}
      <div ref={colorRef} className="relative">
        <button
          onClick={() => setShowColors((s) => !s)}
          title="Board background color"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm text-gray-600 hover:bg-black/10 transition"
        >
          <Palette size={15} />
          <span className="hidden sm:inline text-xs font-medium">Background</span>
          {board.color && (
            <span className="w-3 h-3 rounded-full border border-gray-300 ml-0.5 flex-shrink-0"
              style={{ backgroundColor: board.color }} />
          )}
        </button>

        {showColors && (
          <div className="absolute right-0 top-10 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 w-64 z-30">
            <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">Board background</p>
            <BoardColorPicker value={board.color} onChange={(c) => { handleColorChange(c); setShowColors(false); }} />
          </div>
        )}
      </div>
    </div>
  );
}
