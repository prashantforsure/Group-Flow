import { z } from 'zod';
export const CommentCreateSchema = z.object({
    content: z.string().min(1),
  });