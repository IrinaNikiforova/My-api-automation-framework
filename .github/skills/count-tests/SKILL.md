# Test Metrics Analyzer

Analyze a Playwright TypeScript project and generate test suite statistics.

## Responsibilities

1. Execute `scripts/countTests.ts`.
2. Collect test metrics.
3. Populate `Template.md`.
4. Return the completed report.

## Metrics

Calculate:

* Total test files
* Total test cases
* Total E2E test files
* Total E2E test cases

## Test File Rules

Test files include:

```text
*.spec.ts
*.test.ts
```

Exclude:

```text
node_modules
dist
build
coverage
playwright-report
test-results
```

## Test Case Rules

Count:

```ts
test(...)
test.only(...)
test.skip(...)
test.fixme(...)
```

Do not count:

```ts
test.describe(...)
test.beforeEach(...)
test.afterEach(...)
test.beforeAll(...)
test.afterAll(...)
```

## E2E Rules

E2E tests are files located in folders named:

```text
e2e
tests/e2e
end-to-end
```

or any folder containing:

```text
e2e
```

Use the results from `scripts/countTests.ts` to populate the report template.
