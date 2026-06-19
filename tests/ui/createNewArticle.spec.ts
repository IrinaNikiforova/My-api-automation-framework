import { test } from '../../src/fixtures/ui.fixture';
import { faker } from '@faker-js/faker';
import { deleteArticle } from '../../src/api/articles';
import { CreateArticleRequest } from '../../src/api/schemas/schemaRequest/articleRequest.schema';

// Authenticated case: requesting `loginViaToken` starts the test already logged in.
test('logged in user can create a new Article', async ({ api, loginViaToken, header, editArticlePage, homePage }) => {
    // Arrange — `loginViaToken` authenticates the browser session via the worker token
    const articleData: CreateArticleRequest = {
        article: {
            title: faker.lorem.sentence(4),
            description: faker.lorem.sentence(6),
            body: faker.lorem.paragraphs(2),
            tagList: [
                faker.lorem.word(),
                faker.lorem.word()
            ]
        }
    };

    // Act — create the article through the editor UI
    await editArticlePage.navigate('/editor');
    await editArticlePage.waitUntilLoaded();
    await editArticlePage.fillTitle(articleData.article.title);
    await editArticlePage.fillDescription(articleData.article.description);
    await editArticlePage.fillBody(articleData.article.body);
    await editArticlePage.fillTags(articleData.article.tagList);
    await editArticlePage.clickPublishArticleButton();

    const slug = await editArticlePage.getPublishedArticleSlug();

    // Assert — the user is logged in and the new article shows in the home page global feed
    await homePage.navigate('/');
    await homePage.waitUntilLoaded();
    await header.expectUserLoggedIn();
    await homePage.clickGlobalFeedTab();
    await homePage.expectArticleVisible(articleData.article.title);

    // Cleanup — remove the created article via API
    await deleteArticle(api, 204, slug);
});


// Anonymous case: omitting `loginViaToken` leaves the session unauthenticated.
// Playwright gives each test a fresh browser context, so no token leaks in from other tests.
test('not logged in user is not allowed to create an Article', async ({ header, editArticlePage }) => {
    // Act — a guest opens the home page, then tries to reach the article editor
    await editArticlePage.navigate('/');
    await header.expectUserLoggedOut();

    await editArticlePage.navigate('/editor');

    // Assert — the editor never loads for a guest; they stay logged out
    await editArticlePage.expectEditorNotAvailable();
    await header.expectUserLoggedOut();
});
