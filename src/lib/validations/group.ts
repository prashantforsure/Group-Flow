import { z } from 'zod';

export const createGroupSchema = z.object({
  name: z.string().min(3).max(50),
  description: z.string().max(500).optional(),
  visibility: z.enum(['PUBLIC', 'PRIVATE', 'ORGANIZATION']),
  maxMembers: z.number().min(2).max(1000).optional(),
  settings: z.record(z.any()).optional(),
});

export const updateGroupSchema = createGroupSchema.partial().extend({
  isArchived: z.boolean().optional(),
});

export const updateMemberRoleSchema = z.object({
  role: z.enum(['ADMIN', 'MODERATOR', 'MEMBER', 'GUEST']),
});

export const createInviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(['ADMIN', 'MODERATOR', 'MEMBER', 'GUEST']).optional(),
  message: z.string().max(500).optional(),
});

export const respondToInviteSchema = z.object({
  status: z.enum(['ACCEPTED', 'REJECTED']),
});