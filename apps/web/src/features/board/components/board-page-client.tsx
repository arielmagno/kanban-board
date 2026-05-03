'use client';

import { useBoard } from '../hooks/use-board';
import { BoardHeader } from './board-header';
import { BoardClient } from './board-client';

export function BoardPageClient({ boardId }: { boardId: string }) {
  const { data: board } = useBoard(boardId);

  return (
    <div className="min-h-screen flex flex-col">
      {board && <BoardHeader board={board} />}
      <BoardClient boardId={boardId} />
    </div>
  );
}
