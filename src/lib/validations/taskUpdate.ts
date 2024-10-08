import { z } from 'zod';
export const TaskUpdateSchema = z.object({
    title: z.string().min(1).max(255).optional(),
    description: z.string().optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
    status: z.enum(['PENDING', 'IN_PROGRESS', 'IN_REVIEW', 'COMPLETED', 'ON_HOLD', 'CANCELLED']).optional(),
    dueDate: z.string().datetime().optional(),
    estimatedHours: z.number().optional(),
    tags: z.array(z.string()).optional(),
  });