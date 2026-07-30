import { z } from 'zod';

export const createTaskSchema = z.object({
  title: z.string().min(2, 'Task title is required'),
  description: z.string().optional(),
  status: z.string().default('TODO'),
  priority: z.string().default('MEDIUM'),
  dueDate: z.string().or(z.date()).optional(),
  clientId: z.string().optional(),
  assigneeId: z.string().optional(),
});

export const updateTaskSchema = createTaskSchema.partial().extend({
  id: z.string(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
