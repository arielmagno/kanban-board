'use client';

import { useState } from 'react';
import { useBoard } from '../hooks/use-board';
import { useSocketBoard } from '../hooks/use-socket-board';
import { useAuthStore } from '@/stores/auth.store';
import { BoardHeader } from './board-header';
import { BoardClient } from './board-client';

export function BoardPageClient({ boardId }: { boardId: string }) {
  const { data: board } = useBoard(boardId);
  useSocketBoard(boardId);
  const [cardModalOpen, setCardModalOpen] = useState(false);
  const currentUser = useAuthStore((s) => s.user);
  const isOwner = currentUser?.id === board?.owner.id;

  return (
    <div
      className="flex-1 flex flex-col overflow-hidden transition-colors duration-300"
      style={{ background: board?.color ?? undefined }}
    >
      {board && <BoardHeader board={board} dismissOverlays={cardModalOpen} isOwner={isOwner} />}
      <BoardClient boardId={boardId} onCardModalOpenChange={setCardModalOpen} />
    </div>
  );
}
