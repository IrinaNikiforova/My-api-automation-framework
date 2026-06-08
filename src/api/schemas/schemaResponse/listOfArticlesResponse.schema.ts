import { z } from 'zod';
import { BaseArticleSchema } from './articleResponse.schema';

// List of articles response with pagination
export const ListOfArticlesResponseSchema = z.object({
  articles: z.array(BaseArticleSchema),
  articlesCount: z.number().int().nonnegative(),
});

export type ListOfArticlesResponse = z.infer<typeof ListOfArticlesResponseSchema>;