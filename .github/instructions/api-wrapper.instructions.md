# API Design Rules (Critical Architecture Rules)

This file defines strict rules for API wrapper design and endpoint contracts.

These rules exist to eliminate ambiguity in API signatures and ensure consistent test architecture.

---

# 1. Core Principle

Each API wrapper MUST clearly separate:

* Identity (resource identifier)
* Payload (resource data)
* Transport layer (HTTP request)

---

# 2. Slug Handling Rule (IMPORTANT)

❗ The `slug` is ALWAYS an identity field.

It MUST:

* Be passed explicitly as a function argument when required
* NEVER be extracted from request payload inside the wrapper
* NEVER be duplicated inside request body unless explicitly required by API

---

# 3. Correct updateArticle Design

### Recommended Signature

```typescript id="u1"
updateArticle(
  api: RequestHandler,
  expectedStatusCode: number,
  slug: string,
  articleData: UpdateArticleRequest
)
```

---

### Correct Usage

```typescript id="u2"
const response = await updateArticle(
  api,
  200,
  slug,
  articleUpdateData
);
```

---

### Correct Wrapper Behavior

* Uses slug ONLY for URL construction
* Does NOT read slug from request body
* Sends payload as-is in request body

```typescript id="u3"
.path(`/articles/${slug}`)
.body(articleData)
```

---

# 4. Incorrect Patterns (FORBIDDEN)

### ❌ Do NOT extract slug from payload

```typescript id="u4"
const slug = articleUpdatedData.article.slug;
```

### ❌ Do NOT mix identity and payload

```typescript id="u5"
updateArticle(api, 200, articleUpdateData);
```

(where slug is hidden inside object)

---

# 5. createArticle Rule

* createArticle returns the created entity
* slug must be taken ONLY from response

```typescript id="u6"
const response = await createArticle(api, 201, articleData);
const slug = response.article.slug;
```

---

# 6. deleteArticle Rule

* Requires explicit slug
* No payload involved

```typescript id="u7"
deleteArticle(api, 204, slug);
```

---

# 7. API Wrapper Design Principles

All API wrappers must follow:

* Explicit inputs (no hidden dependencies)
* No data extraction from payloads
* No coupling between request body and URL params
* Clear separation of responsibilities

---

# 8. Data Flow Standard

### Create Flow

1. Build payload (model + faker)
2. Validate with Zod
3. Call createArticle
4. Extract slug from response

---

### Update Flow

1. Use existing slug (from create response)
2. Build update payload
3. Validate with Zod
4. Call updateArticle with explicit slug
5. Validate response

---

### Delete Flow

1. Use explicit slug
2. Call deleteArticle
3. Validate status code

---

# 9. Critical Rule

If a wrapper hides or derives `slug` internally:

→ The design is INVALID
→ It must be refactored

---

# 10. Final Principle

API wrappers MUST be:

* predictable
* stateless
* explicit
* side-effect free (except HTTP call)
