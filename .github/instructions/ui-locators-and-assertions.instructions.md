# UI Locators & Assertions

This file defines locator strategies, assertion patterns, and best practices for reliable UI tests.

Brittle selectors are the #1 cause of test flakiness. Stable, semantic locators are essential.

---

# 1. Core Principle

❗ Locators MUST be stable and semantic.

* Prioritize test attributes and accessibility roles
* Avoid implementation details (classes, inline styles)
* Use combinations for context and uniqueness
* Keep selectors in Page Objects, never in tests

---

# 2. Locator Strategy Priority (In Order)

### 1️⃣ Test Attributes (HIGHEST PRIORITY)

```typescript id="ul1"
// MOST STABLE - Explicit test identifiers
private readonly submitButton = this.page.locator('[data-testid="submit-button"]');
private readonly userEmail = this.page.locator('[data-testid="user-email"]');
private readonly errorMessage = this.page.locator('[data-testid="error-message"]');
```

### 2️⃣ Accessibility Roles (RECOMMENDED)

```typescript id="ul2"
// STABLE - Semantic HTML roles
private readonly mainButton = this.page.locator('button:has-text("Submit")');
private readonly textInput = this.page.locator('input[type="text"]');
private readonly heading = this.page.locator('h1');
private readonly navigationList = this.page.locator('[role="navigation"] ul');
```

### 3️⃣ ARIA Attributes

```typescript id="ul3"
// STABLE - Accessibility markers
private readonly activeTab = this.page.locator('[role="tab"][aria-selected="true"]');
private readonly ariaLabel = this.page.locator('[aria-label="Search"]');
private readonly alertDialog = this.page.locator('[role="alertdialog"]');
```

### 4️⃣ Semantic HTML Selectors

```typescript id="ul4"
// RELATIVELY STABLE - HTML structure
private readonly buttons = this.page.locator('button');
private readonly inputs = this.page.locator('input[type="email"]');
private readonly heading = this.page.locator('h1');
```

### 5️⃣ Combination Selectors (For Context)

```typescript id="ul5"
// STABLE - Combining selectors for uniqueness
private readonly deleteButton = this.page.locator(
    '[data-testid="article-card"]:has-text("Test Article") button[aria-label="Delete"]'
);

private readonly secondTabContent = this.page.locator(
    '[role="tab"]:nth-of-type(2)[aria-selected="true"] + [role="tabpanel"]'
);

private readonly errorInEmailField = this.page.locator(
    'input[data-testid="email-input"]',
    {has: this.page.locator('[data-testid="email-error"]')}
);
```

---

# 3. FORBIDDEN Locator Patterns

### ❌ Do NOT Use: Hard-Coded XPath with Positions

```typescript id="ul6"
// BRITTLE - Position-dependent, breaks with UI reordering
private readonly element = this.page.locator('xpath=//div[1]/button[2]');
private readonly element = this.page.locator('xpath=//table/tr[3]/td[2]');
```

### ❌ Do NOT Use: nth-child Selectors

```typescript id="ul7"
// BRITTLE - Breaks if siblings are reordered or added
private readonly thirdButton = this.page.locator('button:nth-child(3)');
private readonly secondRow = this.page.locator('tbody tr:nth-child(2)');
```

### ❌ Do NOT Use: Styling-Dependent Selectors

```typescript id="ul8"
// BRITTLE - Changes with CSS refactoring
private readonly primaryButton = this.page.locator('.btn-primary');
private readonly activeElement = this.page.locator('.active');
private readonly hiddenElement = this.page.locator('.hidden');
```

### ❌ Do NOT Use: Text Matching Without Context

```typescript id="ul9"
// BRITTLE - Breaks if text changes, ambiguous with similar text
private readonly deleteButton = this.page.locator('button:has-text("Delete")');
// If there are multiple "Delete" buttons, this is ambiguous!

// BETTER
private readonly articleDeleteButton = this.page.locator(
    '[data-testid="article-card"] button:has-text("Delete")'
);
```

### ❌ Do NOT Use: Complex Descendant Selectors

```typescript id="ul10"
// BRITTLE - Assumes specific HTML structure
private readonly element = this.page.locator('.sidebar > .menu > ul > li > a');

// BETTER
private readonly navLink = this.page.locator('[data-testid="nav-link"]');
```

---

# 4. Locator Best Practices

### Use Multiple Conditions for Specificity

```typescript id="ul11"
// When one selector is not unique enough, combine selectors
private readonly articleCard = (articleTitle: string) => 
    this.page.locator('[data-testid="article-card"]', {
        has: this.page.locator('text=' + articleTitle)
    });

async getArticleByTitle(title: string): Promise<Locator> {
    return this.page.locator('[data-testid="article-card"]:has-text("' + title + '")');
}
```

### Use Logical Operators

```typescript id="ul12"
// Combine locators with logical operators
private readonly visibleButtons = this.page.locator('button:visible');
private readonly disabledInputs = this.page.locator('input:disabled');

// Filter multiple conditions
private readonly validEmails = this.page.locator(
    'input[type="email"][aria-invalid="false"]'
);
```

### Create Helper Methods for Complex Locators

```typescript id="ul13"
private getTableCell(row: number, column: string): Locator {
    return this.page.locator(
        `[data-testid="table"] [data-row="${row}"] [data-col="${column}"]`
    );
}

private getModalButton(modalTitle: string, buttonText: string): Locator {
    return this.page.locator(
        `[data-testid="modal"]:has-text("${modalTitle}") button:has-text("${buttonText}")`
    );
}
```

---

# 5. Dynamic Locators in Page Objects

### Parameterized Locators

```typescript id="ul14"
export class ArticleListPage {
    constructor(private page: Page) {}

    getArticleCard(slug: string): Locator {
        return this.page.locator(`[data-testid="article-${slug}"]`);
    }

    getArticleTitle(slug: string): Locator {
        return this.getArticleCard(slug).locator('h2');
    }

    getArticleDeleteButton(slug: string): Locator {
        return this.getArticleCard(slug).locator('[data-testid="delete-button"]');
    }

    async deleteArticle(slug: string) {
        await this.getArticleDeleteButton(slug).click();
        await this.page.locator('[data-testid="confirm-delete"]').click();
    }
}
```

### Usage in Tests

```typescript id="ul15"
test('delete article from list', async ({page}) => {
    const articleList = new ArticleListPage(page);
    await articleList.deleteArticle('my-article-slug');
});
```

---

# 6. Assertion Patterns

### Rule: Use Appropriate Assertion Methods

```typescript id="ul16"
// Visibility assertions
expect(submitButton).toBeVisible();
expect(errorMessage).toBeHidden();
expect(loadingSpinner).not.toBeVisible();

// Content assertions
expect(articleTitle).toContainText('Expected Title');
expect(paragraph).toHaveText('Exact text');

// Attribute assertions
expect(input).toHaveAttribute('type', 'email');
expect(checkbox).toBeChecked();
expect(button).toBeEnabled();

// Count assertions
expect(items).toHaveCount(5);
expect(listItems).toHaveCount(10);

// Value assertions
expect(textInput).toHaveValue('example@test.com');
expect(select).toHaveValue('option-1');
```

---

# 7. Common Assertion Patterns

### Verify Element Visibility

```typescript id="ul17"
// Wait for and verify visibility
await expect(successMessage).toBeVisible();

// Verify hidden state
await expect(errorModal).not.toBeVisible();

// With timeout
await expect(loadingSpinner).not.toBeVisible({timeout: 5000});
```

### Verify Text Content

```typescript id="ul18"
// Exact text match
expect(heading).toHaveText('Article Title');

// Partial text match
expect(paragraph).toContainText('Lorem ipsum');

// Case-insensitive (if using custom assertion)
expect(label).toContainText('Email', {ignoreCase: true});
```

### Verify Form State

```typescript id="ul19"
// Check input value
expect(emailInput).toHaveValue('user@example.com');

// Check button disabled
expect(submitButton).toBeDisabled();

// Check checkbox selected
expect(termsCheckbox).toBeChecked();

// Check radio selected
expect(optionRadio).toBeChecked();
```

### Verify Element Attributes

```typescript id="ul20"
// Check class
expect(activeTab).toHaveAttribute('class', /active/);

// Check data attribute
expect(card).toHaveAttribute('data-status', 'published');

// Check placeholder
expect(input).toHaveAttribute('placeholder', 'Enter title');

// Check aria attributes
expect(alertDialog).toHaveAttribute('role', 'alertdialog');
```

### Verify List/Table Content

```typescript id="ul21"
// Count items
expect(listItems).toHaveCount(5);

// Verify text in all items
const titles = await page.locator('[data-testid="article-title"]').allTextContents();
expect(titles).toContain('Expected Article');

// Verify specific row content
const firstRow = await page.locator('tbody tr').first();
expect(firstRow).toContainText('John Doe');
```

---

# 8. Soft Assertions Pattern

### Use Soft Assertions for Multiple Checks

```typescript id="ul22"
// Collect all assertion failures before failing
test('verify article details', async ({page}) => {
    const article = new ArticleDetailPage(page);

    // Soft assertions - test continues even if one fails
    expect.soft(article.getTitle()).toContainText('Article Title');
    expect.soft(article.getAuthor()).toHaveText('John Doe');
    expect.soft(article.getPublishedDate()).toContainText('2024');
    
    // Test fails at the end with all failures reported
});
```

---

# 9. Waiting & Synchronization Patterns

### Wait for Visibility

```typescript id="ul23"
// Wait for element to be visible (default timeout 30s)
await expect(element).toBeVisible();

// With custom timeout
await expect(element).toBeVisible({timeout: 5000});

// Multiple elements
await expect(listItems).toHaveCount(5);
```

### Wait for Conditions

```typescript id="ul24"
// Wait for button to be enabled
await expect(submitButton).toBeEnabled();

// Wait for input to have value
await expect(emailInput).toHaveValue(/user.*@example.com/);

// Wait for text change
await expect(statusText).toHaveText('Completed');
```

### Explicit Waits (When Needed)

```typescript id="ul25"
// Wait for network idle
await page.waitForLoadState('networkidle');

// Wait for specific selector
await page.waitForSelector('[data-testid="article-loaded"]');

// Wait with custom condition
await page.waitForFunction(() => {
    return document.querySelectorAll('[data-testid="item"]').length === 5;
});
```

---

# 10. Error Message Assertions

### Verify Error States

```typescript id="ul26"
test('verify validation errors', async ({page}) => {
    const form = new ArticleForm(page);
    
    // Leave required field empty
    await form.submitWithoutTitle();
    
    // Verify error message
    const errorMessage = await form.getTitleErrorMessage();
    expect(errorMessage).toContainText('Title is required');
});
```

### Custom Error Matching

```typescript id="ul27"
// Verify specific error format
expect(errorText).toMatch(/^Error: .*/);

// Verify error contains helpful text
expect(errorText).toContainText('Please enter a valid email');

// Case-insensitive error check
expect(message.toUpperCase()).toContain('SUCCESS');
```

---

# 11. No Assertions in Page Objects

### ❌ WRONG - Assertions in Page Object

```typescript id="ul28"
export class ArticlePage {
    async verifyTitleIsVisible() {
        // DON'T DO THIS
        expect(this.title).toBeVisible();
    }
}
```

### ✅ CORRECT - Return State, Assert in Test

```typescript id="ul29"
export class ArticlePage {
    async getTitleLocator(): Locator {
        return this.title;
    }
}

// In test file
const titleElement = await articlePage.getTitleLocator();
expect(titleElement).toBeVisible();
```

---

# 12. Critical Locator Rules

### Rule: All Locators Encapsulated

* Define locators in Page Objects only
* Never use locators directly in tests
* Return locators from methods when needed

### Rule: Stable Over Clever

* Prefer explicit test attributes
* Avoid complex selectors
* When in doubt, add a test attribute to the app

### Rule: Meaningful Names

* Locator names should describe the element
* Use domain language, not technical terms
* Examples: `submitButton`, not `btn1`

---

# 13. Final Principles

Locators and assertions are the GLUE between tests and UI.

If UI tests are flaky:
→ First suspect: brittle locators
→ Second suspect: timing/synchronization
→ Use Page Objects to centralize fixes
→ Never duplicate locators across tests
