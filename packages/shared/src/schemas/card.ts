import { z } from 'zod';

export const createCardSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(100_000).optional(),
  laneId: z.string().uuid(),
});

export const updateCardSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().max(100_000).optional(),
});

export const moveCardSchema = z.object({
  cardId: z.string().uuid(),
  toLaneId: z.string().uuid(),
  position: z.number().int().min(0),
});

export type CreateCardDto = z.infer<typeof createCardSchema>;
export type UpdateCardDto = z.infer<typeof updateCardSchema>;
export type MoveCardDto = z.infer<typeof moveCardSchema>;
