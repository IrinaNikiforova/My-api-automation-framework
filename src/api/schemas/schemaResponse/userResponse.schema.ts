import { z } from 'zod';

// User response schema with profile information
export const UserResponseDataSchema = z.object({
  id: z.number().int().positive(),
  email: z.string().email('Invalid email format'),
  username: z.string().min(1),
  bio: z.string().nullable().default(null),
  image: z.string().url('Invalid image URL'),
  token: z.string().min(1),
});

// User response wrapper
export const UserResponseSchema = z.object({
  user: UserResponseDataSchema,
});

export type UserResponseData = z.infer<typeof UserResponseDataSchema>;
export type UserResponse = z.infer<typeof UserResponseSchema>;