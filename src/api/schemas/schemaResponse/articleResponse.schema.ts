import { z } from 'zod';

export const ArticleResponseSchema = z.object({
  article: z.object({
    title: z.string(),
    description: z.string(),
    body: z.string(),
    tagList: z.array(z.string()),
    slug: z.string()
  })
});

export type ArticleResponse =
  z.infer<typeof ArticleResponseSchema>;