import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
  fetchBoards, fetchBoard, createBoard, updateBoard, deleteBoard,
  createLane, updateLane, deleteLane, reorderLanes,
} from '../board.api';
import type { CreateBoardDto, UpdateBoardDto, CreateLaneDto, ReorderLanesDto } from '@boardflow/shared';

export const boardKeys = {
  all: ['boards'] as const,
  detail: (id: string) => ['boards', id] as const,
};

export function useBoards() {
  return useQuery({
    queryKey: boardKeys.all,
    queryFn: fetchBoards,
  });
}

export function useBoard(boardId: string) {
  return useQuery({
    queryKey: boardKeys.detail(boardId),
    queryFn: () => fetchBoard(boardId),
    enabled: !!boardId,
  });
}

export function useCreateBoard() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (dto: CreateBoardDto) => createBoard(dto),
    onSuccess: (board) => {
      queryClient.invalidateQueries({ queryKey: boardKeys.all });
      router.push(`/boards/${board.id}`);
    },
  });
}

export function useUpdateBoard(boardId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: UpdateBoardDto) => updateBoard(boardId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: boardKeys.all });
      queryClient.invalidateQueries({ queryKey: boardKeys.detail(boardId) });
    },
  });
}

export function useDeleteBoard() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (boardId: string) => deleteBoard(boardId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: boardKeys.all });
      router.push('/boards');
    },
  });
}

export function useCreateLane(boardId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateLaneDto) => createLane(boardId, dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: boardKeys.detail(boardId) }),
  });
}

export function useUpdateLane(boardId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ laneId, title }: { laneId: string; title: string }) =>
      updateLane(laneId, { title }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: boardKeys.detail(boardId) }),
  });
}

export function useDeleteLane(boardId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (laneId: string) => deleteLane(laneId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: boardKeys.detail(boardId) }),
  });
}

export function useReorderLanes(boardId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: ReorderLanesDto) => reorderLanes(boardId, dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: boardKeys.detail(boardId) }),
  });
}
