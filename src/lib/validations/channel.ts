import { z } from 'zod'
export const createChannelSchema = z.object({
    name: z.string().min(1, 'Channel name is required').max(255),
    description: z.string().optional(),
    type: z.enum(['GENERAL', 'ANNOUNCEMENTS', 'TASK_UPDATES', 'SOCIAL']),
    groupId: z.string()
  })