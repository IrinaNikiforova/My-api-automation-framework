import { z } from 'zod';

// Base user schema for request validation
export const UserSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(20),
  username: z.string().min(3, 'Username must be at least 3 characters').max(20),
});

// Wrapper schema for create user endpoint
export const CreateUserRequestSchema = z.object({
  user: UserSchema,
});

export type User = z.infer<typeof UserSchema>;
export type CreateUserRequest = z.infer<typeof CreateUserRequestSchema>;