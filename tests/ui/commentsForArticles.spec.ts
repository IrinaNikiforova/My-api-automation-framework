import { test } from '../../src/fixtures/ui.fixture';
import { faker } from '@faker-js/faker';
import { CreateArticleRequest } from '../../src/api/schemas/schemaRequest/articleRequest.schema';
import { createArticle, deleteArticle} from '../../src/api/articles';
import { expect } from '@playwright/test';

test('add comment for existed article', async ({ api, loginViaToken, articleDetailsPage }) => {
//Create Article by API    
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

    const comment = faker.lorem.text();
    
    const response = await createArticle(api, 201, articleData);
    const slug = response.article.slug;

//Open Edit Article page, add comment
await articleDetailsPage.navigate(`/article/${slug}`);
await articleDetailsPage.waitUntilLoaded();
await articleDetailsPage.fillNewCommentField(comment);
await articleDetailsPage.clickPostCommentButton();
await expect(
    articleDetailsPage.filterCommentsForArticleByTest(comment)
).toBeVisible();

await deleteArticle(api, 204, slug);

})