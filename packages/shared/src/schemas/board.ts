import { z } from 'zod';

export const createBoardSchema = z.object({
  title: z.string().trim().min(1).max(100),
  color: z.string().max(20).nullable().optional(),
});

export const updateBoardSchema = z.object({
  title: z.string().trim().min(1).max(100).optional(),
  color: z.string().max(20).nullable().optional(),
});

export type CreateBoardDto = z.infer<typeof createBoardSchema>;
export type UpdateBoardDto = z.infer<typeof updateBoardSchema>;
