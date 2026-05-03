import { useMutation, useQueryClient } from '@tanstack/react-query';
import { boardKeys } from './use-board';
import { useBoardStore } from '@/stores/board.store';
import { useToastStore } from '@/stores/toast.store';
import { getCardErrorMessage } from '@/lib/error-message';
import { createCard, updateCard, deleteCard, moveCard } from '../card.api';
import type { CreateCardDto, UpdateCardDto, MoveCardDto } from '@boardflow/shared';
import type { Board } from '../board.types';

function addErrorToast(err: unknown, action: 'move' | 'create' | 'edit' | 'delete') {
  const { title, message } = getCardErrorMessage(err, action);
  useToastStore.getState().add({ type: 'error', title, message });
}

export function useCreateCard(boardId: string, laneId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: Omit<CreateCardDto, 'laneId'>) => createCard(laneId, dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: boardKeys.detail(boardId) }),
    onError: (err) => addErrorToast(err, 'create'),
  });
}

export function useUpdateCard(boardId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ cardId, dto }: { cardId: string; dto: UpdateCardDto }) =>
      updateCard(cardId, dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: boardKeys.detail(boardId) }),
    onError: (err) => addErrorToast(err, 'edit'),
  });
}

export function useDeleteCard(boardId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (cardId: string) => deleteCard(cardId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: boardKeys.detail(boardId) }),
    onError: (err) => addErrorToast(err, 'delete'),
  });
}

export function useMoveCard(boardId: string) {
  const queryClient = useQueryClient();
  const { snapshot, rollback } = useBoardStore();

  return useMutation({
    mutationFn: (dto: MoveCardDto) => moveCard(dto),
    onMutate: () => snapshot(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: boardKeys.detail(boardId) });
    },
    onError: (err, _dto, context) => {
      rollback((context as Board | null) ?? null);
      queryClient.invalidateQueries({ queryKey: boardKeys.detail(boardId) });
      addErrorToast(err, 'move');
    },
  });
}
