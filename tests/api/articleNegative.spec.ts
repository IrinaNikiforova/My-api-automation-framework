import { test } from '../../src/fixtures/fixture';
import { expect } from '../../src/utils/custom-expect';
import { faker } from '@faker-js/faker';
import { createArticle, deleteArticle} from '../../src/api/articles';
import { CreateArticleRequest } from '../../src/api/schemas/schemaRequest/articleRequest.schema';
import { CreateArticleRequestSchema } from '../../src/api/schemas/schemaRequest/articleRequest.schema'
import { ArticleResponseSchema } from '../../src/api/schemas/schemaResponse/articleResponse.schema'


test('create new article with tags', async ({ api }) => {   

    const articleData: CreateArticleRequest = {
        article: {
            title: faker.lorem.sentences(1),
            description: faker.lorem.sentences(2),
            body: faker.lorem.paragraphs(2),
            tagList: [
                faker.lorem.word(),
                faker.lorem.word()
            ]
        }
    };

    CreateArticleRequestSchema.parse(articleData);

    const response = await createArticle(api, 201, articleData);
    ArticleResponseSchema.parse(response);
    const slug = response.article.slug;

    expect(response.article.title).toBe(articleData.article.title);
    expect(response.article.description).toBe(articleData.article.description);
    expect(response.article.body).toBe(articleData.article.body);

    await deleteArticle(api, 204, slug)
})
