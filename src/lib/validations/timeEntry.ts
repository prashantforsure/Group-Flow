import { z } from 'zod'
export const createTimeEntrySchema = z.object({
    taskId: z.string(),
    startTime: z.string().datetime(),
    endTime: z.string().datetime().optional(),
    description: z.string().optional()
  })
  
 export const updateTimeEntrySchema = z.object({
    startTime: z.string().datetime().optional(),
    endTime: z.string().datetime().optional(),
    description: z.string().optional()
  })