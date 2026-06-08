import { z } from "zod";
import { AuthorSchema } from "./authorResponse.schema";

export const CreateOrUpdateArticleResponseSchema = z.object({
  article: z.object({
    slug: z.string(),
    title: z.string(),
    description: z.string(),
    tagList: z.array(z.string()),
    createdAt: z.string(),
    updatedAt: z.string(),
    favorited: z.boolean(),
    favoritesCount: z.number(),
    author: AuthorSchema
  })
});

export const ArticleResponseSchema = CreateOrUpdateArticleResponseSchema.extend({
  body: z.string()
});

