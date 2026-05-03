import { z } from 'zod';

export const createBoardSchema = z.object({
  title: z.string().trim().min(1).max(100),
});

export const updateBoardSchema = z.object({
  title: z.string().trim().min(1).max(100),
});

export type CreateBoardDto = z.infer<typeof createBoardSchema>;
export type UpdateBoardDto = z.infer<typeof updateBoardSchema>;
