You are a Senior Test Automation Engineer working in this framework.

Before generating code, follow all project instructions from:

* `.github/copilot-instruction.md`
* `.github/instructions/api-wrapper.instructions.md`
* `.github/instructions/testing-patterns.instructions.md`
* `.github/instructions/zod-schema-validation.instruction.md`
* `.github/instructions/typescript-models.instructions.md`

## Goal

Create a positive API test scenario for the following GET endpoint:

```http
<GET_ENDPOINT>
```

Base URL:

```http
<BASE_URL>
```

Expected successful response status:

```text
<SUCCESS_STATUS_CODE>
```

Notes:

* The success status code is endpoint-specific.
* Do NOT assume success status is always 200.
* Use the provided `<SUCCESS_STATUS_CODE>` value in the test implementation.

---

## Input Data

### GET Endpoint

```http
<GET_ENDPOINT>
```

### Resource Identifier Source

The endpoint requires a resource identifier.

Identifier field:

```text
<IDENTIFIER_FIELD>
```

Example:

```text
slug
id
username
articleId
```

### Resource Creation Strategy

If the resource must exist before GET execution:

Use existing framework wrappers to create test data.

Example:

```typescript
const createResponse = await createEntity(api, 201, requestData);
const identifier = createResponse.<IDENTIFIER_PATH>;
```

Identifier extraction path:

```typescript
<IDENTIFIER_PATH>
```

Example:

```typescript
response.article.slug
response.user.id
response.profile.username
```

---

## Response Schema

Create a new Zod schema based on the provided response example.

Response example:

```json
<RESPONSE_JSON>
```

Schema requirements:

* Use Zod.
* Place schema in the appropriate `schemaResponse` folder.
* Follow project naming conventions.
* Export schema.
* Infer TypeScript type from schema if project convention supports it.
* Use nullable() where API response contains null values.
* Use arrays where API response contains collections.

---

## API Wrapper Usage

Use existing framework wrappers whenever available.

Rules:

* Do not create test data using raw RequestHandler calls.
* Use existing create/update/delete wrappers.
* Follow API wrapper architecture rules.
* Use explicit identifiers.
* Do not extract identifiers from payloads.

Required flow:

1. Create prerequisite test data (if required).
2. Extract identifier from create response.
3. Execute GET request using extracted identifier.
4. Validate response using newly created Zod schema.
5. Cleanup created data (if applicable).

---

## Test Requirements

Create one positive test covering the complete API flow.

### Arrange

* Generate test data using faker when applicable.
* Use existing request models.
* Validate request payload using existing request schemas.
* Create prerequisite entity if required.

### Act

* Extract identifier from creation response.
* Execute GET request.
* Use the provided success status code:

```typescript
.getRequest(<SUCCESS_STATUS_CODE>)
```

### Assert

* Validate GET response using the newly created Zod schema.
* Verify all business-critical fields from the GET response match the originally created data.

Examples:

* id
* slug
* title
* name
* description
* email
* username
* status
* tags

Only assert fields that are relevant for the specific endpoint.

### Cleanup

* Delete created test data using existing wrapper functions when applicable.

---

## Framework Rules

Must follow:

* Arrange → Act → Assert pattern.
* Strong typing.
* No `any`.
* No `Object`.
* Use existing models.
* Use existing Zod validation pattern.
* Use existing custom expect implementation.
* Use existing fixture pattern.
* Use existing API wrapper pattern.
* Response validation must happen before assertions.
* Use wrapper functions instead of direct RequestHandler calls whenever wrappers exist.

---

## Output

Generate:

### 1. New Zod Schema File

Include:

* file name
* full schema code

### 2. Required Imports

Show all imports required for the implementation.

### 3. Test Implementation

Add test to:

```text
<TARGET_TEST_FILE>
```

Generate complete ready-to-use code following existing project conventions.

### 4. Explanation

Briefly explain:

* why the schema was created this way
* why wrapper usage follows project architecture
* how identifier extraction is handled
* how cleanup is handled
* why the selected success status code is used
