# UI Page Objects & Architecture

This file defines the Page Object Model (POM) pattern and folder structure for UI automation tests.

Page Objects are the foundation of maintainable and scalable UI tests.

---

# 1. Core Principle

Page Objects MUST:

* Encapsulate all locators and interactions for a page
* Provide high-level methods that represent user actions
* Hide implementation details from tests
* Be reusable across multiple test scenarios
* Have no direct assertions (assertions stay in tests)

---

# 2. Page Object Naming Convention

### File Naming

```
src/ui/pages/<PageName>.page.ts
```

Examples:

* `HomePage.page.ts`
* `ArticleDetailPage.page.ts`
* `LoginPage.page.ts`

### Class Naming

```
<PageName>Page
```

Examples:

* `HomePage`
* `ArticleDetailPage`
* `LoginPage`

---

# 3. Page Object Structure

### Basic Page Object Template

```typescript id="po1"
import { Page, Locator } from '@playwright/test';

export class HomePage {
    private page: Page;

    // Locators
    private readonly searchInput: Locator;
    private readonly searchButton: Locator;
    private readonly articleList: Locator;

    constructor(page: Page) {
        this.page = page;
        this.searchInput = page.locator('[data-testid="search-input"]');
        this.searchButton = page.locator('[data-testid="search-button"]');
        this.articleList = page.locator('[data-testid="article-list"]');
    }

    // Navigation
    async goto() {
        await this.page.goto('/');
        await this.page.waitForLoadState('networkidle');
    }

    // User Actions
    async searchArticles(query: string) {
        await this.searchInput.fill(query);
        await this.searchButton.click();
    }

    // Getters
    async getArticleCount(): Promise<number> {
        return this.articleList.locator('li').count();
    }

    async getFirstArticleTitle(): Promise<string | null> {
        return this.articleList.locator('li').first().locator('h2').textContent();
    }
}
```

---

# 4. Locator Rules

### Rule: Use Stable Selectors

✅ Preferred (in order of reliability):

1. `[data-testid="..."]` - test-specific attributes
2. `[role="..."]` - accessibility attributes
3. Semantic selectors like `button`, `input[type="text"]`
4. Combination of multiple stable selectors

### Rule: AVOID Brittle Selectors

❌ FORBIDDEN:

* XPath with position indexes: `//div[1]/button[2]`
* CSS with nth-child: `.container > div:nth-child(3)`
* Direct class selectors: `.btn-primary` (prone to styling changes)
* Partial text matches without context

### Correct Selector Examples

```typescript id="po2"
// ✅ Good - test attribute
private readonly addButton = this.page.locator('[data-testid="add-article-button"]');

// ✅ Good - role + text
private readonly submitButton = this.page.locator('button:has-text("Submit")');

// ✅ Good - combination
private readonly activeTab = this.page.locator('[role="tab"][aria-selected="true"]');

// ❌ Bad - brittle
private readonly element = this.page.locator('xpath=//div[1]/button[2]');

// ❌ Bad - styling-dependent
private readonly element = this.page.locator('.sidebar-btn-red-hover');
```

---

# 5. Page Object Methods

### Method Categories

**Navigation Methods**

```typescript id="po3"
async goto(path: string = '/') {
    await this.page.goto(path);
    await this.page.waitForLoadState('networkidle');
}

async goBack() {
    await this.page.goBack();
}
```

**Action Methods (User Interactions)**

```typescript id="po4"
async fillSearchInput(text: string) {
    await this.searchInput.fill(text);
}

async clickSearchButton() {
    await this.searchButton.click();
}

async selectDropdownOption(optionText: string) {
    await this.page.selectOption('[data-testid="dropdown"]', optionText);
}
```

**Getter Methods (State Queries)**

```typescript id="po5"
async isElementVisible(): Promise<boolean> {
    return this.submitButton.isVisible();
}

async getInputValue(): Promise<string | null> {
    return this.searchInput.inputValue();
}

async getErrorMessage(): Promise<string | null> {
    return this.page.locator('[data-testid="error-message"]').textContent();
}

async getTableRowCount(): Promise<number> {
    return this.page.locator('[data-testid="table-row"]').count();
}
```

**Wait Methods (Synchronization)**

```typescript id="po6"
async waitForArticlesLoad() {
    await this.page.waitForSelector('[data-testid="article-list"]');
}

async waitForLoadingComplete() {
    await this.page.waitForSelector('[data-testid="loading-spinner"]', 
        { state: 'hidden' });
}

async waitForNavigationAfterSubmit() {
    await Promise.all([
        this.page.waitForNavigation(),
        this.submitButton.click()
    ]);
}
```

---

# 6. Page Object Folder Structure

### Recommended Structure

```
src/ui/
├── pages/
│   ├── common/
│   │   ├── Header.page.ts
│   │   ├── Sidebar.page.ts
│   │   └── Navigation.page.ts
│   ├── HomePage.page.ts
│   ├── ArticleListPage.page.ts
│   ├── ArticleDetailPage.page.ts
│   ├── LoginPage.page.ts
│   └── ProfilePage.page.ts
├── components/
│   ├── ArticleCard.component.ts
│   ├── CommentForm.component.ts
│   └── Modal.component.ts
└── utils/
    ├── pageFactory.ts
    └── locatorHelpers.ts
```

---

# 7. Page Inheritance (Optional)

### Base Page Class Pattern

```typescript id="po7"
export class BasePage {
    protected page: Page;
    protected readonly header: Locator;
    protected readonly sidebar: Locator;

    constructor(page: Page) {
        this.page = page;
        this.header = page.locator('[data-testid="header"]');
        this.sidebar = page.locator('[data-testid="sidebar"]');
    }

    async waitForPageLoad() {
        await this.page.waitForLoadState('networkidle');
    }

    async getCurrentUrl(): Promise<string> {
        return this.page.url();
    }
}

export class ArticleDetailPage extends BasePage {
    private readonly articleTitle: Locator;

    constructor(page: Page) {
        super(page);
        this.articleTitle = page.locator('[data-testid="article-title"]');
    }

    async getTitle(): Promise<string | null> {
        return this.articleTitle.textContent();
    }
}
```

---

# 8. Critical Rules

### Rule: No Assertions in Page Objects

❌ FORBIDDEN:

```typescript id="po8"
// DO NOT do this in Page Object
async verifyTitleIsPresent() {
    expect(this.articleTitle).toBeVisible();
}
```

✅ CORRECT (in test file):

```typescript id="po9"
const title = await articlePage.getTitle();
expect(title).toBe(expectedTitle);
```

### Rule: Page Objects Are Stateless

* No internal state or context beyond the `page` object
* Each method call is independent
* No global variables or shared state

---

# 9. Best Practices

### Multiple Elements Handling

```typescript id="po10"
export class ArticleListPage {
    private page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    // For a list of articles
    async getArticleByTitle(title: string): Promise<Locator> {
        return this.page.locator(`[data-testid="article-card"]:has-text("${title}")`);
    }

    async getArticleCount(): Promise<number> {
        return this.page.locator('[data-testid="article-card"]').count();
    }

    async getTitlesOfAllArticles(): Promise<string[]> {
        const titles = await this.page
            .locator('[data-testid="article-card"] h2')
            .allTextContents();
        return titles;
    }
}
```

### Complex Actions Composition

```typescript id="po11"
async createAndPublishArticle(title: string, content: string) {
    await this.fillTitle(title);
    await this.fillContent(content);
    await this.addTag('technology');
    await this.clickPublish();
    await this.waitForPublishSuccess();
}
```

---

# 10. Page Object Design Principles

All Page Objects MUST follow:

* Single Responsibility - one page per file
* No duplication - reuse common actions
* Clear naming - method names describe user intent
* Stable selectors - no brittle or environment-dependent selectors
* Locator encapsulation - no locators exposed to tests
* No test logic - only actions and state queries
* Readable and maintainable - easy to understand at a glance

---

# 11. Final Principle

Page Objects are the TEST MAINTENANCE LAYER.

If a UI change breaks tests:
→ Update ONLY the Page Object
→ Tests themselves should NOT need changes
→ This is the core benefit of the POM pattern
