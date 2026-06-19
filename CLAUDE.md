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

`api-test.config.ts` resolves config from `TEST_ENV` (default `dev`). It loads `.env` via dotenv. `prod` reads credentials from `PROD_USERNAME` / `PROD_PASSWORD`. The system under test is the Conduit demo app:
- **API** — `https://conduit-api.bondaracademy.com/api` (`config.apiUrl`, used by API tests).
- **Web UI** — `https://conduit.bondaracademy.com` (`baseURL` in `playwright.config.ts`, used by UI tests via `page.goto('/')`).

`playwright.config.ts` defines two projects: `api-test` (`tests/api`) and `ui-test` (`tests/ui`, chromium).

## Architecture

This is primarily a Playwright API-testing framework, with a growing UI (Page Object) layer. The API side enforces strict layering — tests never touch HTTP directly.

### Fixtures (composed, multiple `test` exports)

Fixtures are split across [src/fixtures/](src/fixtures/) and composed by extension. Pick the right `test` import for the kind of test you write:
- [auth.fixture.ts](src/fixtures/auth.fixture.ts) — base layer; worker-scoped `authToken`, created once per worker via [helpers/createToken.ts](helpers/createToken.ts) (logs in, writes token to `test-data/auth.txt`).
- [api.fixture.ts](src/fixtures/api.fixture.ts) — extends `auth.fixture`; adds `api` (a `RequestHandler` wired with the auth token + logger) and `config`. **API tests import `test` from here.**
- [ui.fixture.ts](src/fixtures/ui.fixture.ts) — extends base `@playwright/test`; provides Page Object / component fixtures (`header`, `signInPage`, `editArticlePage`, …). **UI tests import `test` from here.**
- [types.ts](src/fixtures/types.ts) — the `ApiFixtures` / `AuthFixtures` / `UIFixtures` type definitions backing the above.

Never import `test` from `@playwright/test` directly in a test file.

### API layered request flow
1. **API service wrappers** ([src/api/articles.ts](src/api/articles.ts), [src/api/user.ts](src/api/user.ts)) — one function per endpoint operation (`createArticle`, `updateArticle`, `deleteArticle`, `getArticle`, `createUser`). Tests MUST call these, never `RequestHandler` directly (exception: testing `RequestHandler` itself). The expected status code is always an explicit argument so wrappers serve both positive and negative tests — wrappers must never assume success.
2. **RequestHandler** ([src/utils/requestHandler.ts](src/utils/requestHandler.ts)) — a chainable fluent builder: `.path()`, `.body()`, `.headers()`, `.params()`, `.url()`, `.clearAuth()`, then a terminal `.getRequest(status)` / `.postRequest(status)` / `.putRequest(status)` / `.deleteRequest(status)`. Auth header is auto-attached unless `.clearAuth()` is called (used for anonymous user creation). Each terminal call validates the status code, logs via `APILogger`, then calls `cleanUpFields()` to reset builder state — so an instance is safely reusable across calls.

### UI Page Object layer
- [src/pages/](src/pages/) — Page Objects (`SignIn`, `EditArticlePage`, `HomePage`, …) extend the abstract [basePage](src/pages/basePage.ts), which holds the `Page` and shared navigation helpers (`navigate`, `reload`, `waitForPageLoaded`, `takeScreenshot`). Each page keeps its `Locator`s `private readonly`, defined in the constructor, and exposes intent-named action methods (`fillEmail`, `clickPublishArticleButton`) plus a `waitUntilLoaded()` visibility check. Tests never reach into locators directly.
- [src/components/](src/components/) — reusable cross-page widgets (e.g. [HeaderComponent](src/components/headerComponent.ts)) following the same pattern.
- Page Objects/components are exposed to UI tests as fixtures from `ui.fixture.ts` — request them by name in the test signature rather than constructing them.

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
