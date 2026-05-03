import { useMutation, useQueryClient } from '@tanstack/react-query';
import { boardKeys } from './use-board';
import { useBoardStore } from '@/stores/board.store';
import { createCard, updateCard, deleteCard, moveCard } from '../card.api';
import type { UpdateCardDto, MoveCardDto } from '@boardflow/shared';
import type { Board } from '../board.types';

export function useCreateCard(boardId: string, laneId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (title: string) => createCard(laneId, { title }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: boardKeys.detail(boardId) }),
  });
}

export function useUpdateCard(boardId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ cardId, dto }: { cardId: string; dto: UpdateCardDto }) =>
      updateCard(cardId, dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: boardKeys.detail(boardId) }),
  });
}

export function useDeleteCard(boardId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (cardId: string) => deleteCard(cardId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: boardKeys.detail(boardId) }),
  });
}

export function useMoveCard(boardId: string) {
  const queryClient = useQueryClient();
  const { snapshot, rollback } = useBoardStore();

  return useMutation({
    mutationFn: (dto: MoveCardDto) => moveCard(dto),
    // Capture board snapshot before mutation fires — used for rollback
    onMutate: () => snapshot(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: boardKeys.detail(boardId) });
    },
    onError: (_err, _dto, context) => {
      rollback((context as Board | null) ?? null);
      queryClient.invalidateQueries({ queryKey: boardKeys.detail(boardId) });
    },
  });
}
