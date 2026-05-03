import { z } from 'zod';

export const createLaneSchema = z.object({
  title: z.string().trim().min(1).max(100),
});

export const updateLaneSchema = z.object({
  title: z.string().trim().min(1).max(100),
});

export const reorderLanesSchema = z.object({
  orderedIds: z.array(z.string().uuid()).min(1),
});

export type CreateLaneDto = z.infer<typeof createLaneSchema>;
export type UpdateLaneDto = z.infer<typeof updateLaneSchema>;
export type ReorderLanesDto = z.infer<typeof reorderLanesSchema>;
