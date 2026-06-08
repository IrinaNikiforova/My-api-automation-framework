import { z } from 'zod';

export const ArticleRequestSchema = z.object({
  title: z.string(),
  description: z.string(),
  body: z.string(),
  tagList: z.array(z.string())
});

export const CreateArticleRequestSchema = z.object({
  article: ArticleRequestSchema
});

export type CreateArticleRequest =
  z.infer<typeof CreateArticleRequestSchema>;