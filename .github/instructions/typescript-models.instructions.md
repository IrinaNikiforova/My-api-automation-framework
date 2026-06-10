# TypeScript Models & Data Contracts

This project uses strict TypeScript models to define API contracts for requests and responses.

Models are the source of truth for all test data structures.

---

# 1. Purpose of Models

TypeScript models are used to:

* Define API request structure
* Ensure type safety in tests
* Provide consistent test data creation
* Align with Zod schemas (same contract)

Models must always reflect real API contracts.

---

# 2. Core Rule

❗ NEVER use `Object`, `any`, or inline untyped structures.

❗ ALWAYS use existing TypeScript models.

---

# 3. Models Structure

### Article Model Example

```typescript id="m1"
export interface Article {
  title: string;
  description: string;
  body: string;
  tagList: string[];
}
```

### CreateArticleRequest Model

```typescript id="m2"
export interface CreateArticleRequest {
  article: Article;
}
```

---

# 4. Usage in Tests

All test data must be created using models.

### Example

```typescript id="m3"
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

---

# 5. Model Usage Rules

* Always use models for request payloads
* Always use models for API wrapper inputs
* Models must match Zod schemas one-to-one
* Do not redefine structures inside tests
* Do not duplicate model definitions

---

# 6. Naming Convention

### Request Models

Must follow pattern:

```
Create<Entity>Request
Update<Entity>Request
```

Examples:

* CreateArticleRequest
* UpdateArticleRequest
* CreateUserRequest

---

### Response Models

Must follow pattern:

```
<Entity>Response
<CreateOrUpdateEntityResponse>
<ListOfEntitiesResponse>
```

Examples:

* ArticleResponse
* CreateOrUpdateArticleResponse
* ListOfArticlesResponse

---

# 7. Relationship with Zod Schemas

Models and Zod schemas must always match:

* Models define TypeScript structure
* Zod schemas validate runtime data

Example mapping:

```
CreateArticleRequest (TypeScript model)
CreateArticleRequestSchema (Zod schema)
```

They MUST represent the same contract.

---

# 8. Relationship with API Wrappers

API wrappers MUST use models as input types.

Example:

```typescript id="m4"
createArticle(api, statusCode, articleData: CreateArticleRequest)
```

---

# 9. Type Safety Rules

* Do not use `any`
* Do not use `Object`
* Do not use partial or untyped objects
* Always prefer explicit interfaces
* Always reuse existing models instead of redefining types

---

# 10. Test Data Generation Rule

When generating test data:

* Use models first
* Then apply faker values
* Ensure structure fully satisfies the model contract

---

# 11. Critical Principle

Models are the foundation of the testing framework.

If a structure is not defined as a model:
→ it should be added to the models layer before use
