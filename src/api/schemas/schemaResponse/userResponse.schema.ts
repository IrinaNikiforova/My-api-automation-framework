import { z } from 'zod';

export const UserSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  username: z.string(),
  bio: z.string().nullable(),
  image: z.string().url(),
  token: z.string(),
});

export const UserResponseSchema = z.object({
  user: UserSchema,
});

export type User = z.infer<typeof UserSchema>;
export type UserResponse = z.infer<typeof UserResponseSchema>;