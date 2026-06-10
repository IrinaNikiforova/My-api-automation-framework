# Zod Schema Validation

Apply these rules whenever generating API tests, API wrappers, request models, response models, or schema validations.

## Request Validation

All request payloads must be validated using the corresponding Zod request schema before the API call is executed.

Preferred pattern:

```typescript
CreateArticleRequestSchema.parse(articleData);

const response = await createArticle(api, 201, articleData);
```

Rules:

* Every request model should have a matching request schema.
* Validate request payloads before sending requests.
* Use `.parse()` instead of manual validation.
* Validation failures should fail the test immediately.

## Response Validation

All API responses must be validated using the corresponding Zod response schema immediately after receiving the response.

Preferred pattern:

```typescript
const response = await createArticle(api, 201, articleData);

ArticleResponseSchema.parse(response);
```

Rules:

* Validate responses before assertions.
* Every endpoint should have a corresponding response schema.
* Use `.parse()` instead of custom validation logic.
* Validation failures should fail the test immediately.

## Schema Locations

Request schemas:

```text
src/api/schemas/schemaRequest
```

Response schemas:

```text
src/api/schemas/schemaResponse
```

## Test Workflow

Always follow this sequence:

1. Create typed test data.
2. Validate request payload using a request schema.
3. Execute API wrapper function.
4. Validate response using a response schema.
5. Perform assertions.
6. Clean up created test data.

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

## Naming Convention

Request schemas:

```text
<CreateEntity>RequestSchema
<UpdateEntity>RequestSchema
```

Examples:

```text
CreateArticleRequestSchema
UpdateArticleRequestSchema
CreateUserRequestSchema
```

Response schemas:

```text
<Entity>ResponseSchema
<ListOfEntitiesResponseSchema
<CreateOrUpdateEntityResponseSchema
```

Examples:

```text
ArticleResponseSchema
ListOfArticlesResponseSchema
CreateOrUpdateArticleResponseSchema
```

## Type Safety

* Request schemas must match request models.
* Response schemas must match response contracts.
* Avoid `Object`.
* Avoid `any`.
* Prefer strongly typed request and response models.
