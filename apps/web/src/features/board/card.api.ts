import { apiClient } from '@/lib/api';
import type { CreateCardDto, UpdateCardDto, MoveCardDto } from '@boardflow/shared';
import type { Card } from './board.types';

export async function createCard(laneId: string, dto: Omit<CreateCardDto, 'laneId'>): Promise<Card> {
  const res = await apiClient.post<Card>(`/api/lanes/${laneId}/cards`, dto);
  return res.data;
}

export async function updateCard(cardId: string, dto: UpdateCardDto): Promise<Card> {
  const res = await apiClient.patch<Card>(`/api/cards/${cardId}`, dto);
  return res.data;
}

export async function deleteCard(cardId: string): Promise<void> {
  await apiClient.delete(`/api/cards/${cardId}`);
}

export async function moveCard(dto: MoveCardDto): Promise<Card> {
  const res = await apiClient.patch<Card>('/api/cards/move', dto);
  return res.data;
}
