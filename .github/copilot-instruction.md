#Copilot Instructions for Playwright API and UI Testing Framework

## Project Overview
This is a Playwright-based API testing framework designed for testing REST APIs and UI with features including custom matchers, schema validation, authentication handling and models as type of object.

## Key Technologies & Dependencies
- **Playwright Test**: Main testing framework (`@playwright/test`)
- **TypeScript**: Primary language
- **Zod**: schema validation

## Project Structure

```
├── helpers/                                                          # Utility helper functions
│   └── createToken.ts                                                # Authentication token creation
│──src/                                                               # src folder
│   └── api/                                                          # api folder
│   │   └── models/                                                   # type-safe request and response models
│.  │   │    └── requestModules/                                      # request payload models folder
│   │   │    │     └── article.module.ts                              # request model for Post/Put '/articles' APIs
│   │   │    │     └── user.module.ts                                 # user request model for Post '/user' API
│.  │   │    └── responseModule/                                      # API response models folder
│   │   │    │     └── articleResponse.module.ts                      # article response model for Post/Put '/articles' APIs
│.  │   │    │     └── userResponse.module.ts                         # user response model for Post '/users' API
│.  │   └── schemas/                                                  # Zod schemas for API request/response validation
│   │   │    └── schemaRequest/                                       # Zod schemas for API request validation
│   │   │    │     └── articleRequest.schema.ts                       # Post '/articles' request schema validation
│   │   │    │     └── createUserRequest.schema.ts                    # Post '/users' request schema validation
│   │   │    │     └── updateArticleRuest.schema.ts                   # Put '/articles' request schema validation
│   │   │    └── schemaResponse/                                      # Zod schemas for API response validation
│   │   │          └── articleResponse.schema.ts                      # base article response schema with common article fields
│   │   │          └── authorResponse.schema.ts                       # zod author schema for article responses
│   │   │          └── createOrUpdateArticleResponse.schema.ts        # Post/Put '/articles' response schema validation
│   │   │          └── listOfArticlesResponse.schema.ts               # Get '/articles' response schema validation
│   │   │          └── userResponse.schema.ts                         # Post '/users' response schema validation
│.  │   └── articles.ts                                               # articles API CRUD helpers using RequestHandler abstraction
│   │   └── user.ts                                                   # users API CRUD helpers using RequestHandler abstraction
│.  └── fixtures/                                                     # Core fixtures folder
│.  │     └── fixture.ts                                              # Test fixtures and setup
│.  └── types/                                                        # Types folder
│   │.    └── playwright.d.ts                                         # Extends Playwright TypeScript matchers with custom assertion `shouldEqual()
│.  └── utils/                                                        # Core utilities
│.        └── custom-expect.ts                                        # Custom Playwright matchers
│.        └── logger.ts                                               # API request/response logging
│.        └── requestHandler.ts                                       # Fluent API request builder
│.  
│
├── test-data/                                                        # test-data folder
│   └── 
├── test-results/                                                     # test-results folder
├── tests/                                                            # tests folder
│.  └── api/                                                          # api tests folder
│   │    └── article.spec.ts                                          # API tests for articles CRUD with Zod schema validation and request helpers
│   │    └── articleNegative.spec.ts                                  # negative API tests for articles with request helpers
│   │    └── createNewUser.spec.ts                                    # API tests for user CRUD with Zod schema validation and request helpers
│   │.   └── createUserNegative.spec.ts                               # negative API tests for user with request helpers
│   └── ui/                                                           # ui tests folder
│
│
└── api-test.config.ts                                                # Environment configuration

## Core Patterns & Conventions

### 1. Request Handler Pattern
The `RequestHandler` class provides a fluent API for building HTTP requests:

```typescript
// Standard pattern for API calls
const response = await api
    .path('/endpoint')
    .body({ data: 'value' })
    .headers({ 'Custom-Header': 'value' })
    .params({ limit: 10 })
    .postRequest(201)
```

**Key methods:**
- `.path(string)` - Set API endpoint path
- `.body(object)` - Set request body
- `.headers(object)` - Set custom headers
- `.params(object)` - Set query parameters
- `.url(string)` - Override base URL
- `.clearAuth()` - Remove authentication
- `.getRequest(expectedStatus)` - Execute GET
- `.postRequest(expectedStatus)` - Execute POST
- `.putRequest(expectedStatus)` - Execute PUT
- `.deleteRequest(expectedStatus)` - Execute DELETE

If a wrapper does not exist for an endpoint:
1. Create a new API wrapper first
2. Do NOT use RequestHandler directly in tests

### 2. Custom Expect Matchers
Use custom matchers for assertions.

Examples:
```typescript
// Schema validation
await expect(response).shouldMatchSchema('articles', 'GET_articles')

// Value comparison with API logging
expect(response.title).shouldEqual('Expected Title')
expect(response.count).shouldBeLessThanOrEqual(100)

## 2. API Service Layer (Endpoint Wrappers)

The project uses a service layer abstraction on top of RequestHandler.

All API calls in tests MUST use these wrapper functions instead of direct RequestHandler usage.

This ensures:
- consistent API usage
- reusable test setup
- cleaner Arrange-Act-Assert structure
- reduced duplication in tests

## Articles API

These functions encapsulate all `/articles` endpoint interactions.
They must be used instead of direct RequestHandler calls in tests.

createArticle(api, expectedStatusCode, articleData) - Creates a new article via POST /articles.
api: RequestHandler instance
expectedStatusCode: expected HTTP status 
articleData: CreateArticleRequest payload
returns: ArticleResponse
Usage: creating new artical via API

updateArticle(api, expectedStatusCode, articleUpdatedData) - Updates an existing article via PUT /articles/{slug}.
extracts slug from articleUpdatedData.article.slug or (need updates)
sends request to /articles/{slug}
returns updated article response
api: RequestHandler instance
expectedStatusCode: expected HTTP status
articleUpdatedData: UpdateArticleRequest payload
returns: ArticleResponse
Usage: update an artical via API by slug

deleteArticle(api, statusCode, slug) - Deletes an article via DELETE /articles/{slug}
api: RequestHandler instance
statusCode: expected HTTP status (usually 204)
slug: article identifier
returns: void
Usage: test cleanup (Teardown phase)

createUser(api, statusCode, userBody) - Creates a new user via POST /users
calls .clearAuth() before request (anonymous user creation)
api: RequestHandler instance
statusCode: expected HTTP status (usually 201)
userBody: CreateUser payload
returns: UserResponse

ALWAYS prefer using API service wrappers (createArticle, updateArticle, deleteArticle, createUser)
instead of direct RequestHandler usage inside tests.

Only use RequestHandler directly when testing the RequestHandler itself.

API wrappers are used for both positive and negative test cases.

Wrappers MUST NOT assume success.
Expected status code must always be passed explicitly.

Example:
await createArticle(api, 422, invalidData);

### 3. Custom Expect Matchers
Use custom matchers for assertions.

Examples:
```typescript
// Value comparison with API logging
expect(response.article.title).shouldEqual(articleData.article.title);
```

### 4. Test Structure Pattern
```typescript
import { test } from '../utils/fixtures';
import { expect } from '../utils/custom-expect';

test('Test Description', async ({ api }) => {
    // Test implementation using the api fixture
});

### 4. Authentication Pattern
- Authentication token is automatically created as a worker-scoped fixture
- Token is included in all requests by default
- Use `.clearAuth()` to remove authentication for specific requests

### 5. Zod Schema Validation Pattern

* All request and response contracts are validated using Zod schemas.
* Request schemas are stored in:

  * `src/api/schemas/schemaRequest`
* Response schemas are stored in:

  * `src/api/schemas/schemaResponse`
* Use `.parse()` to validate request payloads before sending API requests.
* Use `.parse()` to validate API responses before performing assertions.
* Validation failures should fail the test immediately.

#### Request Validation

Zod validation MUST be performed in test files only.
API wrappers MUST NOT perform schema validation.

Validate request bodies before calling API wrappers:

```typescript
CreateArticleRequestSchema.parse(articleData);
```

#### Response Validation

Validate responses immediately after receiving them:

```typescript
const response = await createArticle(api, 201, articleData);

ArticleResponseSchema.parse(response);
```

#### Preferred Pattern

```typescript
CreateArticleRequestSchema.parse(articleData);

const response = await createArticle(api, 201, articleData);

ArticleResponseSchema.parse(response);

expect(response.article.title).toBe(articleData.article.title);
```

#### Rules

* Every request payload should have a corresponding request schema.
* Every API response should have a corresponding response schema.
* Always validate requests before sending them.
* Always validate responses before assertions.
* Use schema names that match the endpoint and operation being tested.

### 6. Models and Type Safety Pattern

#### Models

* Use TypeScript interfaces and models for all request payloads.
* Models define API contracts and provide strong typing.
* Models should be used when creating test data and when defining API wrapper parameters.
* Avoid inline object types when a model already exists.

Example:

```typescript
export interface Article {
  title: string;
  description: string;
  body: string;
  tagList: string[];
}

export interface CreateArticleRequest {
  article: Article;
}
```

#### Creating Test Data

Always create typed test data using existing models.

Preferred pattern:

```typescript
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
```

#### Integration with Zod Validation

Request models and Zod schemas must represent the same contract.

Preferred workflow:

1. Create typed test data using a model.
2. Validate request payload using a Zod request schema.
3. Execute API wrapper function.
4. Validate response using a Zod response schema.
5. Perform assertions.
6. Clean up test data if needed.

Example:

```typescript
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

expect(response.article.title).shouldEqual(articleData.article.title);

await deleteArticle(api, 204, response.article.slug);
```

#### Type Safety Rules

* Always use existing request and response models.
* Prefer strongly typed interfaces over generic types.
* Do not use `Object`.
* Do not use `any`.
* Do not create inline request types if a model already exists.
* API wrapper parameters should always use specific request models.
* Generate test data that satisfies the model contract.
* Use a single model per entity unless API structures differ significantly.

Good:

```typescript
const articleData: CreateArticleRequest = { ... }
```

Bad:

```typescript
const articleData: Object = { ... }
```

Bad:

```typescript
const articleData: any = { ... }
```







