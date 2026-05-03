import { apiClient } from '@/lib/api';
import type { Board, BoardSummary } from './board.types';
import type { CreateBoardDto, UpdateBoardDto, CreateLaneDto, ReorderLanesDto } from '@boardflow/shared';

// Boards
export async function fetchBoards(): Promise<BoardSummary[]> {
  const res = await apiClient.get<BoardSummary[]>('/api/boards');
  return res.data;
}

export async function fetchBoard(boardId: string): Promise<Board> {
  const res = await apiClient.get<Board>(`/api/boards/${boardId}`);
  return res.data;
}

export async function createBoard(dto: CreateBoardDto): Promise<BoardSummary> {
  const res = await apiClient.post<BoardSummary>('/api/boards', dto);
  return res.data;
}

export async function updateBoard(boardId: string, dto: UpdateBoardDto): Promise<BoardSummary> {
  const res = await apiClient.patch<BoardSummary>(`/api/boards/${boardId}`, dto);
  return res.data;
}

export async function deleteBoard(boardId: string): Promise<void> {
  await apiClient.delete(`/api/boards/${boardId}`);
}

// Lanes
export async function createLane(boardId: string, dto: CreateLaneDto) {
  const res = await apiClient.post(`/api/boards/${boardId}/lanes`, dto);
  return res.data;
}

export async function updateLane(laneId: string, dto: { title: string }) {
  const res = await apiClient.patch(`/api/lanes/${laneId}`, dto);
  return res.data;
}

export async function deleteLane(laneId: string): Promise<void> {
  await apiClient.delete(`/api/lanes/${laneId}`);
}

export async function reorderLanes(boardId: string, dto: ReorderLanesDto): Promise<void> {
  await apiClient.patch(`/api/boards/${boardId}/lanes/reorder`, dto);
}
