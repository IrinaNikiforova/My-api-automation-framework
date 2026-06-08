import { z } from 'zod';

// Author schema for article responses
export const AuthorSchema = z.object({
  username: z.string().min(1),
  bio: z.string().nullable().default(null),
  image: z.string().url('Invalid image URL'),
  following: z.boolean(),
});

export type Author = z.infer<typeof AuthorSchema>;