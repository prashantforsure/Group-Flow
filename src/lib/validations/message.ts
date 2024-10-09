import { z } from 'zod'
export const createMessageSchema = z.object({
    content: z.string().min(1, 'Message content is required'),
    receiverId: z.string(),
    attachments: z
      .array(
        z.object({
          filename: z.string(),
          fileType: z.string(),
          fileSize: z.number(),
          url: z.string()
        })
      )
      .optional()
  })