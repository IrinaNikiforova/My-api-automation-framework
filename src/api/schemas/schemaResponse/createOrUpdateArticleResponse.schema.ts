import { z } from 'zod';
import { BaseArticleSchema } from './articleResponse.schema';

// Create or update article response uses the base article schema
export const CreateOrUpdateArticleResponseSchema = z.object({
  article: BaseArticleSchema,
});

export type CreateOrUpdateArticleResponse = z.infer<typeof CreateOrUpdateArticleResponseSchema>;

