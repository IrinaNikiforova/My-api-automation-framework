import { test } from '../../src/fixtures/fixture';
import { expect } from '../../src/utils/custom-expect';
import { faker } from '@faker-js/faker';
import { createArticle, deleteArticle, updateArticle, getArticle } from '../../src/api/articles';
import { CreateArticleRequest } from '../../src/api/schemas/schemaRequest/articleRequest.schema';
import { CreateArticleRequestSchema } from '../../src/api/schemas/schemaRequest/articleRequest.schema'
import { ArticleResponseSchema } from '../../src/api/schemas/schemaResponse/articleResponse.schema'
import { ListOfArticlesResponseSchema } from '../../src/api/schemas/schemaResponse/listOfArticlesResponse.schema';
import { UpdateArticleRequest } from '../../src/api/schemas/schemaRequest/updateArticleRequest.schema';
import { CreateOrUpdateArticleResponseSchema } from '../../src/api/schemas/schemaResponse/createOrUpdateArticleResponse.schema';


test('verify schema response of list of articles', async ({ api }) => {
    const response = await api
        .path('/articles')
        .getRequest(200);
    expect(response.articlesCount).toBe(10);
    ListOfArticlesResponseSchema.parse(response);
})

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


test('get article by slug', async ({ api }) => {
    // Arrange
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

    // Act
    const createResponse = await createArticle(api, 201, articleData);
    const slug = createResponse.article.slug;

    const getResponse = await getArticle(api, 304, slug);

    // Assert
    ArticleResponseSchema.parse(getResponse);

    expect(getResponse.article.slug).toBe(slug);
    expect(getResponse.article.title).toBe(articleData.article.title);
    expect(getResponse.article.description).toBe(articleData.article.description);
    expect(getResponse.article.body).toBe(articleData.article.body);
    expect(getResponse.article.tagList).toHaveLength(articleData.article.tagList.length);
    articleData.article.tagList.forEach(tag => {
        expect(getResponse.article.tagList).toContain(tag);
    });

    // Cleanup
    await deleteArticle(api, 204, slug)
})


test('update new article', async ({ api }) => {
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


    const responseNewArticle = await createArticle(api, 201, articleData);
    
    const slug = responseNewArticle.article.slug;
    const articleUpdateData: UpdateArticleRequest = {
        "article":{
            "title": faker.lorem.sentences(1),
            "description": faker.lorem.sentences(2),
            "body": faker.lorem.paragraphs(2),
            "tagList":[
                faker.lorem.word(),
                faker.lorem.word(),
                faker.lorem.word(),
            ],
            "slug":slug
        }}

    const responseUpdatedArticle = await updateArticle(api, 200, articleUpdateData);
    CreateOrUpdateArticleResponseSchema.parse(responseUpdatedArticle)
    const updatedSlug = responseUpdatedArticle.article.slug;
   
    expect(responseUpdatedArticle.article.title).toBe(articleUpdateData.article.title);
    expect(responseUpdatedArticle.article.description).toBe(articleUpdateData.article.description);
    expect(responseUpdatedArticle.article.body).toBe(articleUpdateData.article.body);
    
    await deleteArticle(api, 204, updatedSlug)
})
