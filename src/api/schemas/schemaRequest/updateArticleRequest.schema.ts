import { z } from "zod"
import { ArticleRequestSchema } from "./articleRequest.schema";

export const UpdateArticleRequestSchema = z.object({
  article: ArticleRequestSchema.extend({
    slug: z.string()
  })
});

export type UpdateArticleRequest =
  z.infer<typeof UpdateArticleRequestSchema>;