# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npx playwright test                          # Run all tests
npx playwright test --project=api-test       # Run only API tests (tests/api)
npx playwright test --project=ui-test        # Run only UI tests (tests/ui)
npx playwright test tests/api/article.spec.ts          # Run a single test file
npx playwright test -g "create new article with tags"  # Run a single test by title
npx playwright test --headed                 # Run with a visible browser
npx playwright show-report                   # Open the last HTML report
TEST_ENV=prod npx playwright test            # Select environment (dev | qa | prod)
```

There is no build/lint step — tests are run directly via the Playwright TypeScript runner. `package.json` has no scripts; always invoke `npx playwright test`.

## Environment

`api-test.config.ts` resolves config from `TEST_ENV` (default `dev`). It loads `.env` via dotenv. `prod` reads credentials from `PROD_USERNAME` / `PROD_PASSWORD`. The target system under test is the Conduit API at `https://conduit-api.bondaracademy.com/api`.

## Architecture

This is a Playwright API-testing framework (UI tests are scaffolded but largely empty). The design enforces a strict layering — tests never touch HTTP directly.

**Layered request flow:**
1. **Fixtures** ([src/fixtures/fixture.ts](src/fixtures/fixture.ts)) — extends Playwright's `test` with an `api` fixture (a `RequestHandler`) and a worker-scoped `authToken`. The token is created once per worker via [helpers/createToken.ts](helpers/createToken.ts) (logs in, writes token to `test-data/auth.txt`) and injected into every request. Always import `test` from this fixture, not from `@playwright/test`.
2. **API service wrappers** ([src/api/articles.ts](src/api/articles.ts), [src/api/user.ts](src/api/user.ts)) — one function per endpoint operation (`createArticle`, `updateArticle`, `deleteArticle`, `getArticle`, `createUser`). Tests MUST call these, never `RequestHandler` directly (exception: testing `RequestHandler` itself). The expected status code is always an explicit argument so wrappers serve both positive and negative tests — wrappers must never assume success.
3. **RequestHandler** ([src/utils/requestHandler.ts](src/utils/requestHandler.ts)) — a chainable fluent builder: `.path()`, `.body()`, `.headers()`, `.params()`, `.url()`, `.clearAuth()`, then a terminal `.getRequest(status)` / `.postRequest(status)` / `.putRequest(status)` / `.deleteRequest(status)`. Auth header is auto-attached unless `.clearAuth()` is called (used for anonymous user creation). Each terminal call validates the status code, logs via `APILogger`, then calls `cleanUpFields()` to reset builder state — so an instance is safely reusable across calls.

**Validation & error reporting:**
- [src/utils/custom-expect.ts](src/utils/custom-expect.ts) extends Playwright's `expect` with `shouldEqual()`, which appends recent API request/response logs to failure messages. Import `expect` from this file (not `@playwright/test`) to get it.
- [src/utils/logger.ts](src/utils/logger.ts) (`APILogger`) buffers recent request/response details; both `RequestHandler` status assertions and the custom matcher pull these logs into error output so failures show the full API exchange.

**Contracts (models + schemas):**
- Zod schemas in `src/api/schemas/schemaRequest/` and `src/api/schemas/schemaResponse/` are the runtime contracts. Response schemas compose smaller pieces (e.g. `articleResponse.schema.ts` builds on `authorResponse.schema.ts`).
- TypeScript types are derived from schemas via `z.infer` and re-exported from the schema files (e.g. `CreateArticleRequest`, `ArticleResponse`). `src/api/models/` holds parallel model modules. Models and schemas must represent the same contract.

## Conventions

The `.github/instructions/` directory contains detailed rules followed throughout the codebase. Key ones:

- **AAA test structure** — Arrange (build typed data with `@faker-js/faker`), Act (call wrapper), Assert (`Schema.parse(response)` then assertions). Clean up created data with `deleteArticle`.
- **Validate at the boundaries** — `RequestSchema.parse(payload)` before the call, `ResponseSchema.parse(response)` after. Schema validation lives in test files only; wrappers never validate.
- **No `any` / `Object`** — use existing request/response models for all test data and wrapper params (note: current wrappers in `articles.ts`/`user.ts` still use `Object` in places — prefer typed models in new code).
- **Naming** — `Create<Entity>Request` / `Update<Entity>Request` models with matching `<Name>RequestSchema`; responses `<Entity>Response` / `ListOf<Entities>Response` / `CreateOrUpdate<Entity>Response`.

### Known deviation

[.github/instructions/api-wrapper.instructions.md](.github/instructions/api-wrapper.instructions.md) mandates that `slug` (identity) be passed to `updateArticle` as an explicit argument and never extracted from the request body. The current [src/api/articles.ts](src/api/articles.ts) `updateArticle` still derives `slug` from `articleUpdatedData.article.slug`, which that rule forbids. When touching `updateArticle`, prefer refactoring to the explicit-slug signature `updateArticle(api, expectedStatusCode, slug, articleData)`.
