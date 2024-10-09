import { z } from 'zod'
export const createDocumentSchema = z.object({
    title: z.string().min(1, 'Title is required').max(255),
    content: z.string(),
    groupId: z.string(),
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
  
export  const updateDocumentSchema = z.object({
    title: z.string().min(1, 'Title is required').max(255).optional(),
    content: z.string().optional(),
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
  