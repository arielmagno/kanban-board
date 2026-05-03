'use client';

import { useBoard } from '../hooks/use-board';
import { BoardHeader } from './board-header';
import { BoardClient } from './board-client';

export function BoardPageClient({ boardId }: { boardId: string }) {
  const { data: board } = useBoard(boardId);

  return (
    <div
      className="flex-1 flex flex-col overflow-hidden transition-colors duration-300"
      style={{ background: board?.color ?? undefined }}
    >
      {board && <BoardHeader board={board} />}
      <BoardClient boardId={boardId} />
    </div>
  );
}
