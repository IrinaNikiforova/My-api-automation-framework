import { z } from 'zod';
import { AuthorSchema } from './authorResponse.schema';

// Base article response schema with common article fields
export const BaseArticleSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  body: z.string().min(1),
  tagList: z.array(z.string()),
  createdAt: z.string(),
  updatedAt: z.string(),
  favorited: z.boolean(),
  favoritesCount: z.number().int().nonnegative(),
  author: AuthorSchema,
});

// Single article response wrapper
export const ArticleResponseSchema = z.object({
  article: BaseArticleSchema,
});

export type BaseArticle = z.infer<typeof BaseArticleSchema>;
export type ArticleResponse = z.infer<typeof ArticleResponseSchema>;