import { z } from 'zod';

// Base article schema for request validation
export const ArticleRequestSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().min(1, 'Description is required').max(500),
  body: z.string().min(1, 'Body is required'),
  tagList: z.array(z.string().min(1)).default([]),
});

// Wrapper schema for create article endpoint
export const CreateArticleRequestSchema = z.object({
  article: ArticleRequestSchema,
});

export type Article = z.infer<typeof ArticleRequestSchema>;
export type CreateArticleRequest = z.infer<typeof CreateArticleRequestSchema>;