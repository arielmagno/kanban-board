'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getSocket } from '@/lib/socket';
import { boardKeys } from './use-board';

export function useSocketBoard(boardId: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const socket = getSocket();

    socket.emit('board:join', boardId);

    function onBoardUpdate() {
      void queryClient.invalidateQueries({ queryKey: boardKeys.detail(boardId) });
    }

    socket.on('board:update', onBoardUpdate);

    return () => {
      socket.off('board:update', onBoardUpdate);
      socket.emit('board:leave', boardId);
    };
  }, [boardId, queryClient]);
}
