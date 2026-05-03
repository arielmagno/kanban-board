'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, Pencil, Check, X, Palette } from 'lucide-react';
import { useUpdateBoard } from '../hooks/use-board';
import { BoardColorPicker } from './board-color-picker';
import { useOnClickOutside } from '@/lib/use-on-click-outside';
import type { Board } from '../board.types';

export function BoardHeader({
  board,
  dismissOverlays = false,
  isOwner = true,
}: {
  board: Board;
  dismissOverlays?: boolean;
  isOwner?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(board.title);
  const [showColors, setShowColors] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const colorRef = useRef<HTMLDivElement>(null);
  const editRef = useRef<HTMLDivElement>(null);
  const updateBoard = useUpdateBoard(board.id);

  useOnClickOutside(editRef, () => {
    if (!editing) return;
    submit();
  }, editing);

  useEffect(() => {
    if (!dismissOverlays) return;
    setEditing(false);
    setShowColors(false);
    setDraft(board.title);
  }, [dismissOverlays, board.title]);

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
    setShowColors(false);
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
    <div className="flex items-center justify-between px-6 py-3 border-b border-bf-border bg-white/80 backdrop-blur-sm sticky top-0 z-20 flex-shrink-0 transition-colors duration-[var(--bf-motion-duration)]">
      <div className="flex items-center gap-3 min-w-0">
        <Link
          href="/boards"
          className="p-1.5 rounded-lg text-bf-muted hover:bg-black/5 transition duration-[var(--bf-motion-duration)] flex-shrink-0"
        >
          <ChevronLeft size={18} />
        </Link>

        {editing ? (
          <div ref={editRef} className="flex items-center gap-2 min-w-0">
            <input
              ref={inputRef}
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={onKeyDown}
              className="font-bold text-heading text-base bg-transparent border-b-2 border-[#4a9e7f] focus:outline-none min-w-0 w-48 sm:w-72"
            />
            <button onMouseDown={(e) => { e.preventDefault(); submit(); }}
              className="p-1 rounded-lg text-[#4a9e7f] hover:bg-[#d6ede2] transition flex-shrink-0">
              <Check size={15} />
            </button>
            <button onMouseDown={(e) => { e.preventDefault(); cancel(); }}
              className="p-1 rounded-lg text-gray-400 hover:bg-black/5 transition flex-shrink-0">
              <X size={15} />
            </button>
          </div>
        ) : isOwner ? (
          <button onClick={startEdit} className="group flex items-center gap-1.5 text-left min-w-0" title="Click to rename">
            <h1 className="font-bold text-heading text-base leading-tight truncate">{board.title}</h1>
            <Pencil size={13} className="text-muted group-hover:text-bf-muted transition flex-shrink-0" />
          </button>
        ) : (
          <h1 className="font-bold text-heading text-base leading-tight truncate">{board.title}</h1>
        )}
      </div>

      {/* Background color picker */}
      {isOwner && (
        <div ref={colorRef} className="relative">
          <button
            onClick={() => {
              if (editing) submit();
              setShowColors((s) => !s);
            }}
            title="Board background color"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm text-bf-text hover:bg-black/5 transition duration-[var(--bf-motion-duration)]"
          >
          <Palette size={15} />
          <span className="hidden sm:inline text-xs font-medium">Background</span>
          {board.color && (
            <span className="w-3 h-3 rounded-full border border-bf-border ml-0.5 flex-shrink-0"
              style={{ backgroundColor: board.color }} />
          )}
        </button>

        {showColors && (
          <div className="absolute right-0 top-10 bg-bf-surface rounded-2xl shadow-xl border border-bf-border p-4 w-64 z-30">
            <p className="text-xs font-semibold text-bf-muted mb-3 uppercase tracking-wide">Board background</p>
            <BoardColorPicker value={board.color} onChange={(c) => { handleColorChange(c); setShowColors(false); }} />
          </div>
        )}
        </div>
      )}
    </div>
  );
}
