# Testing Patterns (API + UI)

This project follows unified testing patterns for both API and UI tests.

All tests MUST follow these principles:

* Arrange → Act → Assert structure
* Strong typing using models
* Schema validation using Zod
* Reusable API/UI abstractions
* No duplication of logic inside tests

---

# 1. Test Structure Pattern (AAA)

All tests must follow:

## Arrange

* Create test data using faker
* Use TypeScript models
* Validate request payload using Zod schema

## Act

* Call API wrapper or UI abstraction
* Never implement raw logic inside tests

## Assert

* Validate response using Zod schema
* Perform business assertions

---

# 2. API Test Pattern

### Standard API test flow

```typescript id="ap1"
const articleData: CreateArticleRequest = {
  article: {
    title: faker.lorem.sentences(1),
    description: faker.lorem.sentences(2),
    body: faker.lorem.paragraphs(2),
    tagList: [faker.lorem.word()]
  }
};

CreateArticleRequestSchema.parse(articleData);

const response = await createArticle(api, 201, articleData);

ArticleResponseSchema.parse(response);

expect(response.article.title).toBe(articleData.article.title);

await deleteArticle(api, 204, response.article.slug);
```

---

### Rules for API tests

* Always use API wrapper functions (createArticle, updateArticle, deleteArticle)
* Never use RequestHandler directly in tests
* Always validate request with Zod schema before API call
* Always validate response with Zod schema after API call
* Always cleanup created test data when needed

---

# 3. Schema Validation Rule

* Request schemas must validate payload BEFORE request execution
* Response schemas must validate API response BEFORE assertions
* Schema validation must use `.parse()`
* Schema failure must immediately fail the test

---

# 4. Type Safety Rule

* Always use TypeScript models for test data
* Never use `Object` or `any`
* Never use inline untyped objects
* Models and schemas must represent the same contract

---

# 5. API Wrapper Rule

* Tests MUST use service layer functions instead of raw API calls
* Exception: only when testing RequestHandler itself

Example:

❌ Bad:

```typescript
api.path('/articles').body(data).postRequest(201);
```

✅ Good:

```typescript
createArticle(api, 201, data);
```

---

# 6. UI Test Pattern (Future)

UI tests must follow the same structure:

* Page Object Model (POM)
* No direct locators inside tests
* Reusable page actions
* Clear Arrange → Act → Assert structure
* Stable selectors only (no brittle selectors)

---

# 7. Unified Principle

All tests (API + UI) must follow:

* Readability over complexity
* Reusability over duplication
* Abstraction over raw implementation
* Strong typing everywhere
* Schema validation for all API contracts
