import { z } from 'zod';

export const createProjectSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1, 'Name required').max(100),
    description: z.string().max(500).optional().default(''),
    emoji: z.string().emoji('Invalid emoji').optional().default('📋'),
  }),
});

export const updateProjectSchema = z.object({
  params: z.object({ projectId: z.string().min(1) }),
  body: z.object({
    name: z.string().trim().min(1).max(100).optional(),
    description: z.string().max(500).optional(),
    status: z.enum(['active', 'archived', 'completed']).optional(),
    emoji: z.string().optional(),
  }),
});

export const createEpicSchema = z.object({
  body: z.object({
    title: z.string().trim().min(1, 'Title required').max(150),
    description: z.string().max(1000).optional().default(''),
    color: z
      .string()
      .regex(/^#[0-9a-fA-F]{6}$/, 'Invalid hex color')
      .optional()
      .default('#6366f1'),
    startDate: z.string().datetime().optional().nullable(),
    endDate: z.string().datetime().optional().nullable(),
  }),
});

export const updateEpicSchema = z.object({
  params: z.object({ epicId: z.string().min(1) }),
  body: z.object({
    title: z.string().trim().min(1).max(150).optional(),
    description: z.string().max(1000).optional(),
    status: z.enum(['planned', 'in_progress', 'completed', 'cancelled']).optional(),
    color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
    startDate: z.string().datetime().optional().nullable(),
    endDate: z.string().datetime().optional().nullable(),
  }),
});