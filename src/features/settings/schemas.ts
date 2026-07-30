import { z } from 'zod';

export const UpdateProfileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
});

export const UpdateRbacSchema = z.object({
  targetUserId: z.string().min(1, 'Target user is required'),
  customPermissions: z.record(z.string(), z.string()),
});

export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;
export type UpdateRbacInput = z.infer<typeof UpdateRbacSchema>;
