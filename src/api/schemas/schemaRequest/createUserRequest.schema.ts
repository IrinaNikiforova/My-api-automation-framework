import { z } from 'zod';

export const UserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(20),
  username: z.string().min(3).max(20),
});

export const CreateUserRequestSchema = z.object({
  user: UserSchema,
});

export type User = z.infer<typeof UserSchema>;
export type CreateUserRequest = z.infer<typeof CreateUserRequestSchema>;