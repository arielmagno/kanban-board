'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getSocket } from '@/lib/socket';
import { boardKeys } from './use-board';

export function useSocketBoards() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const socket = getSocket();

    socket.emit('boards:join');

    function onBoardsUpdate() {
      void queryClient.invalidateQueries({ queryKey: boardKeys.all });
    }

    socket.on('boards:update', onBoardsUpdate);

    return () => {
      socket.off('boards:update', onBoardsUpdate);
      socket.emit('boards:leave');
    };
  }, [queryClient]);
}
