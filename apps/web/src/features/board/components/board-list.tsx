'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useBoards, useUpdateBoard } from '../hooks/use-board';
import { useSocketBoards } from '../hooks/use-socket-boards';
import { CreateBoardModal } from './create-board-modal';
import { useAuthStore } from '@/stores/auth.store';
import { useOnClickOutside } from '@/lib/use-on-click-outside';
import { LayoutGrid, Plus, Clock, Pencil, Check, X, Globe, Lock, User } from 'lucide-react';
import type { BoardSummary } from '../board.types';

function BoardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
      <div className="h-3 bg-gray-100 rounded w-1/2" />
    </div>
  );
}

function BoardCard({
  board,
  currentUserId,
  isRenaming,
  onRenamingChange,
}: {
  board: BoardSummary;
  currentUserId: string | undefined;
  isRenaming: boolean;
  onRenamingChange: (boardId: string | null) => void;
}) {
  const [draft, setDraft] = useState(board.title);
  const inputRef = useRef<HTMLInputElement>(null);
  const renamePanelRef = useRef<HTMLDivElement>(null);
  const updateBoard = useUpdateBoard(board.id);
  const isOwner = board.owner.id === currentUserId;

  useOnClickOutside(renamePanelRef, () => {
    if (!isRenaming) return;
    submit();
  }, isRenaming);

  const ownerLabel = isOwner
    ? 'You'
    : (board.owner.fullName?.trim() || board.owner.email);

  useEffect(() => {
    setDraft(board.title);
  }, [board.title, isRenaming]);

  useEffect(() => {
    if (isRenaming) setTimeout(() => inputRef.current?.select(), 0);
  }, [isRenaming]);

  function startEdit(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDraft(board.title);
    onRenamingChange(board.id);
  }

  function cancel() {
    setDraft(board.title);
    onRenamingChange(null);
  }

  function submit() {
    const trimmed = draft.trim();
    if (!trimmed || trimmed === board.title) { cancel(); return; }
    updateBoard.mutate({ title: trimmed }, { onSuccess: () => onRenamingChange(null), onError: cancel });
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') { e.preventDefault(); submit(); }
    if (e.key === 'Escape') cancel();
  }

  if (isRenaming) {
    return (
      <div ref={renamePanelRef} className="group bg-white rounded-2xl border-2 border-[#4a9e7f] p-5 shadow-sm">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#d6ede2] mb-3">
          <LayoutGrid size={18} className="text-[#4a9e7f]" />
        </div>
        <input
          ref={inputRef}
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          className="w-full text-sm font-semibold text-gray-900 bg-transparent border-b border-[#4a9e7f] focus:outline-none mb-2"
        />
        <div className="flex gap-1.5 mt-2">
          <button
            onMouseDown={(e) => { e.preventDefault(); submit(); }}
            disabled={updateBoard.isPending}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#4a9e7f] text-white text-xs font-medium hover:bg-[#3d8a6d] transition disabled:opacity-60"
          >
            <Check size={12} /> Save
          </button>
          <button
            onMouseDown={(e) => { e.preventDefault(); cancel(); }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-gray-500 text-xs hover:bg-gray-100 transition"
          >
            <X size={12} /> Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative group">
      <Link
        href={`/boards/${board.id}`}
        className="block bg-white rounded-2xl border border-gray-100 hover:border-[#4a9e7f] hover:shadow-md transition-all overflow-hidden"
      >
        {/* Color stripe */}
        {board.color && (
          <div className="h-2 w-full" style={{ backgroundColor: board.color }} />
        )}
        <div className="p-5">
          <div className="flex items-start justify-between">
            <div className={`flex items-center justify-center w-10 h-10 rounded-xl mb-3 transition
              ${board.color ? 'bg-black/8' : 'bg-[#d6ede2] group-hover:bg-[#c5e5d5]'}`}>
              <LayoutGrid size={18} className="text-[#4a9e7f]" />
            </div>
            <div className="flex items-center gap-1">
              {/* Visibility badge */}
              {board.isPublic ? (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-medium">
                  <Globe size={9} />
                  Public
                </span>
              ) : (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 text-[10px] font-medium">
                  <Lock size={9} />
                  Private
                </span>
              )}
              {/* Rename — owner only */}
              {isOwner && (
                <button
                  onClick={startEdit}
                  title="Rename board"
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
                >
                  <Pencil size={14} />
                </button>
              )}
            </div>
          </div>
          <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-2 pr-2">
            {board.title}
          </h3>
          {/* Meta: date + author */}
          <div className="flex items-center gap-2 text-xs text-gray-400 flex-wrap" suppressHydrationWarning>
            <span className="flex items-center gap-1">
              <Clock size={11} />
              {new Date(board.createdAt).toLocaleDateString(undefined, {
                year: 'numeric', month: 'short', day: 'numeric',
              })}
            </span>
            <span className="text-gray-200">·</span>
            <span className="flex items-center gap-1">
              <User size={11} />
              {ownerLabel}
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}

export function BoardList() {
  const { data: boards, isLoading, isError, refetch } = useBoards();
  const [showCreate, setShowCreate] = useState(false);
  const [renamingBoardId, setRenamingBoardId] = useState<string | null>(null);
  const user = useAuthStore((s) => s.user);
  useSocketBoards();
  const firstName = user?.fullName?.split(' ')[0] ?? null;

  function openCreateModal() {
    setRenamingBoardId(null);
    setShowCreate(true);
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-8 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {firstName ? `Welcome, ${firstName}! 👋` : 'My Boards'}
            </h1>
            <p className="text-sm text-gray-500 mt-1">Select a board to get started</p>
          </div>
          <button
            onClick={openCreateModal}
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
              onClick={openCreateModal}
              className="px-5 py-2.5 rounded-xl bg-[#f5c842] text-gray-900 font-semibold text-sm hover:bg-[#f0ba1a] transition"
            >
              Create board
            </button>
          </div>
        )}

        {!isLoading && !isError && boards && boards.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {boards.map((board) => (
              <BoardCard
                key={board.id}
                board={board}
                currentUserId={user?.id}
                isRenaming={renamingBoardId === board.id}
                onRenamingChange={setRenamingBoardId}
              />
            ))}
          </div>
        )}

        {showCreate && <CreateBoardModal onClose={() => setShowCreate(false)} />}
      </div>
    </div>
  );
}
