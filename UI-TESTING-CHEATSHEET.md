# UI Testing Cheat Sheet

Quick reference for UI automation best practices based on your framework's instructions.

---

## 📍 Locator Priority

```
1. [data-testid="..."]              ✅ BEST (stable, explicit)
2. [role="..."]                     ✅ GOOD (semantic, accessibility)
3. [aria-label="..."]               ✅ GOOD (accessibility)
4. button, input[type="email"]      ✅ ACCEPTABLE (semantic HTML)
5. text matching :has-text("...")   ⚠️ OK (with context)
6. .class-name                      ❌ NO (breaks with CSS changes)
7. xpath with positions             ❌ NO (brittle position)
8. :nth-child(3)                    ❌ NO (breaks with reordering)
```

---

## 🏗️ Page Object Structure

### Basic Template
```typescript
export class PageName {
    constructor(private page: Page) {}

    // Locators (private)
    private readonly element = this.page.locator('[data-testid="..."]');

    // Navigation
    async goto(path = '/') {
        await this.page.goto(path);
        await this.page.waitForLoadState('networkidle');
    }

    // Actions
    async clickButton() {
        await this.page.locator('[data-testid="button"]').click();
    }

    // Getters
    async getText(): Promise<string | null> {
        return this.page.locator('[data-testid="text"]').textContent();
    }

    // Wait/Sync
    async waitForLoad() {
        await this.page.waitForSelector('[data-testid="loaded"]');
    }
}
```

---

## ✍️ Test Template

```typescript
test('user can perform action', async ({api, page}) => {
    // ARRANGE - Setup test data via API
    const testData = DataFactory.create();
    const response = await createResource(api, 201, testData);
    const resourceId = response.resource.id;

    try {
        // ACT - User interaction via UI
        const pageObj = new PageObject(page);
        await pageObj.goto(`/resource/${resourceId}`);
        await pageObj.performAction();

        // ASSERT - Verify UI state
        const result = await pageObj.getResult();
        expect(result).toBe(expectedValue);

    } finally {
        // CLEANUP - Delete via API
        await deleteResource(api, 204, resourceId);
    }
});
```

---

## 🎯 Assertions Cheatsheet

### Visibility
```typescript
expect(element).toBeVisible();
expect(element).toBeHidden();
expect(element).not.toBeVisible();
```

### Text Content
```typescript
expect(element).toHaveText('Exact text');
expect(element).toContainText('Partial');
expect(element).toHaveText(/regex/);
```

### Form Elements
```typescript
expect(input).toHaveValue('value');
expect(button).toBeEnabled();
expect(button).toBeDisabled();
expect(checkbox).toBeChecked();
```

### Attributes
```typescript
expect(element).toHaveAttribute('data-testid', 'value');
expect(element).toHaveAttribute('aria-label', /label/);
expect(element).toHaveClass('active');
```

### Count/List
```typescript
expect(items).toHaveCount(5);
expect(items).toHaveLength(5);
const titles = await page.locator('[data-testid="title"]').allTextContents();
expect(titles).toContain('Expected');
```

---

## 🏭 Component Pattern

### Form Component
```typescript
export class FormComponent {
    constructor(private page: Page) {}

    async fill(data: FormData) {
        await this.page.locator('[data-testid="title"]').fill(data.title);
        await this.page.locator('[data-testid="description"]').fill(data.description);
    }

    async submit() {
        await this.page.locator('[data-testid="submit"]').click();
        await this.page.waitForLoadState('networkidle');
    }

    async getError(): Promise<string | null> {
        return this.page.locator('[data-testid="error"]').textContent();
    }
}
```

### Modal Component
```typescript
export class ModalComponent {
    constructor(private page: Page) {}

    async confirm() {
        await this.page.locator('[data-testid="confirm-button"]').click();
        await this.page.locator('[data-testid="modal"]').waitFor({state: 'hidden'});
    }

    async cancel() {
        await this.page.locator('[data-testid="cancel-button"]').click();
        await this.page.locator('[data-testid="modal"]').waitFor({state: 'hidden'});
    }
}
```

### Table Component
```typescript
export class TableComponent {
    constructor(private page: Page) {}

    async getRowCount(): Promise<number> {
        return this.page.locator('[data-testid="row"]').count();
    }

    async getCellValue(row: number, col: string): Promise<string | null> {
        return this.page.locator(
            `[data-testid="row"]:nth-of-type(${row}) [data-col="${col}"]`
        ).textContent();
    }
}
```

---

## 🔧 Dynamic Locators

```typescript
// Parameterized locator
getArticleCard(slug: string): Locator {
    return this.page.locator(`[data-testid="article-${slug}"]`);
}

// With multiple conditions
getButton(section: string, action: string): Locator {
    return this.page.locator(
        `[data-section="${section}"] button[data-action="${action}"]`
    );
}

// Nested selector
getFormInput(formId: string, fieldName: string): Locator {
    return this.page.locator(
        `[data-testid="form-${formId}"] [data-testid="input-${fieldName}"]`
    );
}
```

---

## 🧪 Data Factory Pattern

```typescript
export class ArticleFactory {
    static createValid(): ArticleData {
        return {
            title: faker.lorem.sentences(1),
            description: faker.lorem.sentences(2),
            body: faker.lorem.paragraphs(3)
        };
    }

    static createWithTitle(title: string): ArticleData {
        return {...this.createValid(), title};
    }

    static createMultiple(count: number): ArticleData[] {
        return Array.from({length: count}, () => this.createValid());
    }
}

// Usage
const data = ArticleFactory.createWithTitle('Test Title');
const articles = ArticleFactory.createMultiple(5);
```

---

## 🔄 Wait Patterns

### Wait for Element
```typescript
// Implicit wait (30s default)
await expect(element).toBeVisible();

// Custom timeout
await expect(element).toBeVisible({timeout: 5000});

// Explicit wait
await page.waitForSelector('[data-testid="loaded"]');

// Wait for condition
await page.waitForFunction(() => document.querySelectorAll('[data-testid="item"]').length === 5);

// Wait after navigation
await Promise.all([
    page.waitForNavigation(),
    page.locator('[data-testid="link"]').click()
]);
```

---

## 🛡️ Error Handling

### Verify Errors
```typescript
// Check error message
const error = await page.locator('[data-testid="error"]').textContent();
expect(error).toContainText('Invalid email');

// Verify error visibility
expect(page.locator('[data-testid="error"]')).toBeVisible();

// Handle API failures in test
try {
    await createArticle(api, 201, invalidData);
    // Should not reach here
    expect(true).toBeFalsy();
} catch (error) {
    expect(error).toBeDefined();
}
```

---

## 📊 Common Patterns

### Search & Verify
```typescript
test('search results', async ({page}) => {
    const search = new SearchPage(page);
    await search.goto();
    await search.search('query');

    const results = await page.locator('[data-testid="result"]').allTextContents();
    expect(results.length).toBeGreaterThan(0);
    expect(results).toContain('expected result');
});
```

### Create & Verify
```typescript
test('create and verify', async ({api, page}) => {
    const data = DataFactory.create();
    const response = await createResource(api, 201, data);

    await page.goto(`/resource/${response.id}`);
    const title = await page.locator('[data-testid="title"]').textContent();
    expect(title).toBe(data.title);

    await deleteResource(api, 204, response.id);
});
```

### Edit & Verify
```typescript
test('edit resource', async ({api, page}) => {
    const resource = await createResource(api, 201, DataFactory.create());
    
    const form = new EditPage(page);
    await form.goto(`/edit/${resource.id}`);
    await form.updateTitle('New Title');
    await form.submit();

    const updated = await getResource(api, 200, resource.id);
    expect(updated.title).toBe('New Title');

    await deleteResource(api, 204, resource.id);
});
```

---

## ❌ Common Mistakes

```typescript
// ❌ DON'T - Locator in test
expect(page.locator('button:nth-child(2)')).toBeVisible();

// ✅ DO - Locator in page object
expect(await myPage.getSubmitButton()).toBeVisible();

// ❌ DON'T - Assertion in page object
async verify() {
    expect(this.element).toBeVisible();
}

// ✅ DO - Getter in page object
async isVisible(): Promise<boolean> {
    return this.element.isVisible();
}

// ❌ DON'T - Manual UI data creation
await page.fill('input[name="title"]', 'Test');
await page.fill('input[name="body"]', 'Content');
await page.click('button');

// ✅ DO - API data creation
const response = await createResource(api, 201, data);

// ❌ DON'T - Shared state between tests
let sharedData;
test('setup', () => { sharedData = {...}; });
test('uses shared', () => { use(sharedData); });

// ✅ DO - Independent tests
test('test 1', async ({api, page}) => {
    const data = await createResource(api, 201, DataFactory.create());
    // use data
    await deleteResource(api, 204, data.id);
});
```

---

## 🚀 Quick Commands

```typescript
// Navigate
await page.goto('/path');

// Fill input
await page.locator('[data-testid="input"]').fill('value');

// Click
await page.locator('[data-testid="button"]').click();

// Select dropdown
await page.selectOption('[data-testid="select"]', 'option-value');

// Get text
const text = await element.textContent();

// Get all text contents
const texts = await page.locator('.item').allTextContents();

// Count elements
const count = await page.locator('.item').count();

// Wait for load
await page.waitForLoadState('networkidle');

// Close browser
await context.close();
```

---

## 📚 Related Instructions

- **ui-page-objects.instructions.md** - Page Object design patterns
- **ui-fixtures-and-data-setup.instructions.md** - Data setup & fixtures
- **ui-locators-and-assertions.instructions.md** - Detailed locator strategies
- **ui-components-and-structure.instructions.md** - Component reuse patterns
- **testing-patterns.instructions.md** - General test structure (AAA pattern)

---

**Remember:** Page Objects → Components → Tests. Keep locators encapsulated, use API for data, verify UI only.
