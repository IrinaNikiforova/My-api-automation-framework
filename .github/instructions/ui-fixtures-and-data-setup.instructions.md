# UI Fixtures & Test Data Setup

This file defines fixtures, test data patterns, and API integration for UI tests.

UI tests must use API-driven setup for consistent, fast, and maintainable test data.

---

# 1. Core Principle

❗ UI tests MUST use API for test data setup.

* Create data via API (fast)
* Delete data via API (cleanup)
* Test only UI functionality, not API contract
* Avoid manual UI form filling for data creation

---

# 2. UI Test Fixtures Extension

### UI-Specific Fixtures

```typescript id="uf1"
import {test as base} from '@playwright/test';
import { RequestHandler } from '../utils/requestHandler';
import { Page } from '@playwright/test';

export type UITestOptions = {
    api: RequestHandler;
    page: Page;
    config: typeof config;
}

export type UIWorkerFixture = {
    authToken: string;
}

export const test = base.extend<UITestOptions, UIWorkerFixture>({
    authToken: [async ({}, use) => {
        const authToken = await createToken(config.userEmail, config.userPassword);
        await use(authToken);
    }, {scope: 'worker'}],

    api: async ({request, authToken}, use) => {
        const logger = new APILogger();
        const requestHandler = new RequestHandler(
            request, 
            config.apiUrl, 
            logger, 
            authToken
        );
        await use(requestHandler);
    },

    page: async ({browser}, use) => {
        const context = await browser.newContext();
        const page = await context.newPage();
        await page.goto(config.appUrl);
        await use(page);
        await context.close();
    },

    config: async ({}, use) => {
        await use(config);
    }
});
```

---

# 3. Test Data Setup Pattern

### API-Driven Setup (Recommended)

```typescript id="uf2"
import { test } from '../../src/fixtures/fixture';
import { createArticle, deleteArticle } from '../../src/api/articles';
import { CreateArticleRequest } from '../../src/api/models/requestModules/article.module';
import { CreateArticleRequestSchema } from '../../src/api/schemas/schemaRequest/articleRequest.schema';
import { faker } from '@faker-js/faker';

test('verify article details page displays correct data', async ({api, page}) => {
    // Arrange - Create data via API
    const articleData: CreateArticleRequest = {
        article: {
            title: faker.lorem.sentences(1),
            description: faker.lorem.sentences(2),
            body: faker.lorem.paragraphs(3),
            tagList: [faker.lorem.word(), faker.lorem.word()]
        }
    };

    CreateArticleRequestSchema.parse(articleData);
    
    const createdArticle = await createArticle(api, 201, articleData);
    const slug = createdArticle.article.slug;

    // Act - Navigate and verify UI
    await page.goto(`/article/${slug}`);
    const articleTitle = await page.locator('[data-testid="article-title"]').textContent();
    const articleBody = await page.locator('[data-testid="article-body"]').textContent();

    // Assert
    expect(articleTitle).toBe(articleData.article.title);
    expect(articleBody).toContain(articleData.article.body);

    // Cleanup - Delete via API
    await deleteArticle(api, 204, slug);
});
```

---

# 4. Test Data Factory Pattern

### Create Reusable Data Factories

```typescript id="uf3"
import { faker } from '@faker-js/faker';
import { CreateArticleRequest } from '../../src/api/models/requestModules/article.module';

export class ArticleTestDataFactory {
    static createValidArticle(overrides?: Partial<CreateArticleRequest>): CreateArticleRequest {
        return {
            article: {
                title: faker.lorem.sentences(1),
                description: faker.lorem.sentences(2),
                body: faker.lorem.paragraphs(3),
                tagList: [faker.lorem.word(), faker.lorem.word()],
                ...overrides?.article
            }
        };
    }

    static createArticleWithTitle(title: string): CreateArticleRequest {
        return this.createValidArticle({ article: { title } });
    }

    static createArticleWithTags(tags: string[]): CreateArticleRequest {
        return this.createValidArticle({ article: { tagList: tags } });
    }

    static createMultipleArticles(count: number): CreateArticleRequest[] {
        return Array.from({ length: count }, () => this.createValidArticle());
    }
}
```

### Usage in Tests

```typescript id="uf4"
const articleData = ArticleTestDataFactory.createArticleWithTitle('Test Article');
const createdArticle = await createArticle(api, 201, articleData);
```

---

# 5. Fixture Setup & Cleanup Pattern

### Setup Fixture

```typescript id="uf5"
export const test = base.extend<UITestOptions>({
    setupArticles: async ({api}, use) => {
        // Setup - create articles before test
        const articles = [];
        
        for (let i = 0; i < 3; i++) {
            const articleData = ArticleTestDataFactory.createValidArticle();
            const response = await createArticle(api, 201, articleData);
            articles.push(response.article);
        }

        // Use articles in test
        await use(articles);

        // Cleanup - delete articles after test
        for (const article of articles) {
            await deleteArticle(api, 204, article.slug);
        }
    }
});
```

### Test Using Setup Fixture

```typescript id="uf6"
test('verify article list page displays all articles', async ({page, setupArticles}) => {
    // setupArticles are already created
    await page.goto('/articles');
    
    const articleCount = await page.locator('[data-testid="article-card"]').count();
    expect(articleCount).toBeGreaterThanOrEqual(3);
});
```

---

# 6. Authenticated State Fixture

### Browser Context with Auth

```typescript id="uf7"
export const test = base.extend<UITestOptions, UIWorkerFixture>({
    authenticatedPage: async ({browser, authToken, config}, use) => {
        const context = await browser.newContext();
        const page = await context.newPage();
        
        // Set auth token in localStorage or cookies
        await page.goto(config.appUrl);
        await page.evaluate((token) => {
            localStorage.setItem('authToken', token);
        }, authToken);
        
        // Navigate after auth setup
        await page.reload();
        await page.waitForLoadState('networkidle');
        
        await use(page);
        await context.close();
    }
});
```

### Test with Authenticated State

```typescript id="uf8"
test('verify user can create article when authenticated', 
    async ({authenticatedPage, api}) => {
        
    const articleData = ArticleTestDataFactory.createValidArticle();
    const createdArticle = await createArticle(api, 201, articleData);
    
    await authenticatedPage.goto(`/articles/${createdArticle.article.slug}`);
    const editButton = authenticatedPage.locator('[data-testid="edit-button"]');
    
    expect(editButton).toBeVisible();
});
```

---

# 7. Dynamic Test Data

### Parameterized Tests

```typescript id="uf9"
const testCases = [
    {title: 'Short Title', shouldSucceed: true},
    {title: 'A'.repeat(200), shouldSucceed: true},
    {title: '', shouldSucceed: false}
];

testCases.forEach(({title, shouldSucceed}) => {
    test(`verify article creation with title: "${title.substring(0, 20)}..."`,
        async ({api, page}) => {
            
        const articleData = ArticleTestDataFactory.createArticleWithTitle(title);
        
        if (shouldSucceed) {
            const response = await createArticle(api, 201, articleData);
            expect(response.article.title).toBe(title);
            await deleteArticle(api, 204, response.article.slug);
        } else {
            // Expect API to fail
            try {
                await createArticle(api, 400, articleData);
            } catch (error) {
                expect(error).toBeDefined();
            }
        }
    });
});
```

---

# 8. Test Data Cleanup Rules

### Rule: Always Cleanup Test Data

```typescript id="uf10"
test('example test', async ({api, page}) => {
    // Arrange
    const articleData = ArticleTestDataFactory.createValidArticle();
    const response = await createArticle(api, 201, articleData);
    const slug = response.article.slug;

    // Act
    await page.goto(`/articles/${slug}`);
    // ... assertions ...

    // Cleanup (REQUIRED)
    await deleteArticle(api, 204, slug);
});
```

### Rule: Use Try-Finally for Guaranteed Cleanup

```typescript id="uf11"
test('example with guaranteed cleanup', async ({api, page}) => {
    const articleData = ArticleTestDataFactory.createValidArticle();
    const response = await createArticle(api, 201, articleData);
    const slug = response.article.slug;

    try {
        await page.goto(`/articles/${slug}`);
        // ... assertions ...
    } finally {
        // Cleanup runs even if test fails
        await deleteArticle(api, 204, slug);
    }
});
```

---

# 9. Avoiding Manual Data Entry

### ❌ AVOID: Manual Form Filling for Data Creation

```typescript id="uf12"
// DON'T do this
const articleTitle = faker.lorem.sentences(1);
await page.fill('[name="title"]', articleTitle);
await page.fill('[name="description"]', faker.lorem.sentences(2));
await page.click('button[type="submit"]');
```

### ✅ CORRECT: API-Driven Setup

```typescript id="uf13"
// DO this instead
const articleData = ArticleTestDataFactory.createValidArticle();
const response = await createArticle(api, 201, articleData);
const slug = response.article.slug;

await page.goto(`/articles/${slug}`);
// Now verify the UI displays correct data
```

---

# 10. Test Data Isolation

### Each Test Must Be Independent

```typescript id="uf14"
// ✅ GOOD - independent data per test
test('test 1', async ({api, page}) => {
    const article1 = await createArticle(api, 201, ArticleTestDataFactory.createValidArticle());
    // ... test logic ...
    await deleteArticle(api, 204, article1.article.slug);
});

test('test 2', async ({api, page}) => {
    const article2 = await createArticle(api, 201, ArticleTestDataFactory.createValidArticle());
    // ... test logic ...
    await deleteArticle(api, 204, article2.article.slug);
});

// ❌ BAD - tests depending on shared data
let sharedArticleId;
test('setup', async ({api}) => {
    const response = await createArticle(api, 201, ArticleTestDataFactory.createValidArticle());
    sharedArticleId = response.article.slug;
});

test('uses shared data', async ({page}) => {
    // Depends on 'setup' test - WRONG!
    await page.goto(`/articles/${sharedArticleId}`);
});
```

---

# 11. Critical Rules

### Rule: API for Creation, UI for Verification

* Use API to CREATE test data
* Use API to DELETE test data
* Use UI only to VERIFY and INTERACT with data

### Rule: Type-Safe Test Data

* Always use TypeScript models
* Always validate with Zod before API call
* Never use `any` or untyped objects

### Rule: Fixtures Over Manual Setup

* Use custom fixtures for common setup
* Avoid duplicating setup logic in tests
* Make fixtures reusable and composable

---

# 12. Final Principle

UI tests are for testing USER EXPERIENCE.

API is for SETTING UP TEST STATE.

Never confuse the two:
→ API setup = fast + reliable
→ UI testing = comprehensive coverage
