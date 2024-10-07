import { z } from 'zod';
export const TaskCreateSchema = z.object({
    title: z.string().min(1).max(255),
    description: z.string().optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
    status: z.enum(['PENDING', 'IN_PROGRESS', 'IN_REVIEW', 'COMPLETED', 'ON_HOLD', 'CANCELLED']).default('PENDING'),
    dueDate: z.string().datetime().optional(),
    groupId: z.string(),
    assigneeIds: z.array(z.string()).optional(),
    estimatedHours: z.number().optional(),
    tags: z.array(z.string()).optional(),
  });