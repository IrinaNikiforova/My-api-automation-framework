import { z } from 'zod';
import { ArticleRequestSchema } from './articleRequest.schema';

// Update article schema with slug requirement
export const UpdateArticleRequestSchema = z.object({
  article: ArticleRequestSchema.extend({
    slug: z.string().min(1, 'Slug is required'),
  }),
});

export type UpdateArticleRequest = z.infer<typeof UpdateArticleRequestSchema>;