import { z } from "zod"
import { AuthorSchema } from "./authorResponse.schema";

export const ListOfArticlesResponseSchema = z.object({
  articles: z.array(
    z.object({
      slug: z.string(),
      title: z.string(),
      description: z.string(),
      body: z.string(),
      tagList: z.array(z.string()),
      createdAt: z.string(),
      updatedAt: z.string(),
      favorited: z.boolean(),
      favoritesCount: z.number(),
      author: AuthorSchema
    })
  ),
  articlesCount: z.number()
})
export type ListOfArticlesResponse =
  z.infer<typeof ListOfArticlesResponseSchema>;