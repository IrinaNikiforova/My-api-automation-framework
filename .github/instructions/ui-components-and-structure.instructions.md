# UI Component Architecture & Test Structure

This file defines the folder structure, component reuse patterns, and test organization for UI automation.

Scalable UI testing requires clear separation of concerns and reusable components.

---

# 1. Core Principle

❗ UI automation MUST follow component-driven architecture.

* Reusable components for common UI patterns
* Organized folder structure for maintainability
* Clear separation between Page Objects, Components, and Tests
* Type-safe component interactions

---

# 2. Recommended Folder Structure

```
src/
├── ui/
│   ├── pages/
│   │   ├── common/
│   │   │   ├── BasePage.ts
│   │   │   ├── Header.page.ts
│   │   │   ├── Sidebar.page.ts
│   │   │   ├── Footer.page.ts
│   │   │   └── Navigation.page.ts
│   │   ├── HomePage.page.ts
│   │   ├── LoginPage.page.ts
│   │   ├── ArticleListPage.page.ts
│   │   ├── ArticleDetailPage.page.ts
│   │   ├── CreateArticlePage.page.ts
│   │   └── ProfilePage.page.ts
│   ├── components/
│   │   ├── ArticleCard.component.ts
│   │   ├── CommentForm.component.ts
│   │   ├── Modal.component.ts
│   │   ├── PaginationControl.component.ts
│   │   ├── TagInput.component.ts
│   │   └── LoginForm.component.ts
│   ├── fixtures/
│   │   ├── ui.fixture.ts
│   │   └── dataFactory.ts
│   └── utils/
│       ├── locatorHelpers.ts
│       ├── pageFactory.ts
│       └── waitHelpers.ts

tests/
├── ui/
│   ├── auth/
│   │   ├── login.spec.ts
│   │   ├── logout.spec.ts
│   │   └── signup.spec.ts
│   ├── articles/
│   │   ├── createArticle.spec.ts
│   │   ├── editArticle.spec.ts
│   │   ├── deleteArticle.spec.ts
│   │   ├── viewArticles.spec.ts
│   │   └── searchArticles.spec.ts
│   ├── profile/
│   │   ├── viewProfile.spec.ts
│   │   └── editProfile.spec.ts
│   └── e2e/
│       ├── completeUserJourney.spec.ts
│       └── articleLifecycle.spec.ts
```

---

# 3. Component Architecture

### What Are Components?

Components are reusable UI patterns that appear in multiple Page Objects.

Examples:
* Form elements (login form, comment form, article form)
* Cards (article card, user card, comment card)
* Dialogs and Modals
* Data tables with pagination
* Tag inputs and dropdowns

### Component Structure

```typescript id="uc1"
import { Page, Locator } from '@playwright/test';

export class ArticleCard {
    private page: Page;
    private cardLocator: Locator;

    constructor(page: Page, articleSlug: string) {
        this.page = page;
        this.cardLocator = page.locator(`[data-testid="article-card-${articleSlug}"]`);
    }

    // Locators
    private getTitle(): Locator {
        return this.cardLocator.locator('[data-testid="card-title"]');
    }

    private getDescription(): Locator {
        return this.cardLocator.locator('[data-testid="card-description"]');
    }

    private getAuthor(): Locator {
        return this.cardLocator.locator('[data-testid="card-author"]');
    }

    private getEditButton(): Locator {
        return this.cardLocator.locator('[data-testid="edit-button"]');
    }

    private getDeleteButton(): Locator {
        return this.cardLocator.locator('[data-testid="delete-button"]');
    }

    // Actions
    async getTitle(): Promise<string | null> {
        return this.getTitle().textContent();
    }

    async getAuthorName(): Promise<string | null> {
        return this.getAuthor().textContent();
    }

    async clickEdit() {
        await this.getEditButton().click();
    }

    async delete() {
        await this.getDeleteButton().click();
    }

    async isVisible(): Promise<boolean> {
        return this.cardLocator.isVisible();
    }
}
```

### Using Components in Page Objects

```typescript id="uc2"
import { ArticleCard } from '../components/ArticleCard.component';

export class ArticleListPage {
    private page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    getArticleCard(slug: string): ArticleCard {
        return new ArticleCard(this.page, slug);
    }

    async deleteArticleFromList(slug: string) {
        const card = this.getArticleCard(slug);
        await card.delete();
        await this.page.locator('[data-testid="confirm-delete"]').click();
    }

    async getArticleTitleFromCard(slug: string): Promise<string | null> {
        const card = this.getArticleCard(slug);
        return card.getTitle();
    }
}
```

---

# 4. Form Component Pattern

### Create Reusable Form Components

```typescript id="uc3"
export class ArticleForm {
    private page: Page;
    private formLocator: Locator;

    // Locators
    private readonly titleInput = this.page.locator('[data-testid="title-input"]');
    private readonly descriptionInput = this.page.locator('[data-testid="description-input"]');
    private readonly bodyTextarea = this.page.locator('[data-testid="body-textarea"]');
    private readonly submitButton = this.page.locator('[data-testid="submit-button"]');
    private readonly titleError = this.page.locator('[data-testid="title-error"]');

    constructor(page: Page) {
        this.page = page;
        this.formLocator = page.locator('[data-testid="article-form"]');
    }

    // Fill form
    async fillTitle(title: string) {
        await this.titleInput.fill(title);
    }

    async fillDescription(description: string) {
        await this.descriptionInput.fill(description);
    }

    async fillBody(body: string) {
        await this.bodyTextarea.fill(body);
    }

    async fillForm(articleData: ArticleFormData) {
        await this.fillTitle(articleData.title);
        await this.fillDescription(articleData.description);
        await this.fillBody(articleData.body);
    }

    // Validate
    async getTitle(): Promise<string | null> {
        return this.titleInput.inputValue();
    }

    async getTitleErrorMessage(): Promise<string | null> {
        return this.titleError.textContent();
    }

    async isTitleErrorVisible(): Promise<boolean> {
        return this.titleError.isVisible();
    }

    // Submit
    async submit() {
        await this.submitButton.click();
        await this.page.waitForLoadState('networkidle');
    }

    async isFormValid(): Promise<boolean> {
        return this.submitButton.isEnabled();
    }
}
```

### Using Form Component in Tests

```typescript id="uc4"
test('verify article creation form validation', async ({page}) => {
    const createPage = new CreateArticlePage(page);
    const form = createPage.getForm();

    // Leave title empty
    await form.fillDescription('Description');
    await form.fillBody('Body');

    // Verify error
    const errorMessage = await form.getTitleErrorMessage();
    expect(errorMessage).toContainText('Title is required');
});
```

---

# 5. Modal/Dialog Component Pattern

### Reusable Modal Component

```typescript id="uc5"
export class ConfirmDialog {
    private page: Page;
    private dialogLocator: Locator;

    private readonly title = this.page.locator('[data-testid="dialog-title"]');
    private readonly message = this.page.locator('[data-testid="dialog-message"]');
    private readonly confirmButton = this.page.locator('[data-testid="confirm-button"]');
    private readonly cancelButton = this.page.locator('[data-testid="cancel-button"]');

    constructor(page: Page) {
        this.page = page;
        this.dialogLocator = page.locator('[data-testid="confirm-dialog"]');
    }

    async getTitle(): Promise<string | null> {
        return this.title.textContent();
    }

    async getMessage(): Promise<string | null> {
        return this.message.textContent();
    }

    async confirm() {
        await this.confirmButton.click();
        await this.dialogLocator.waitFor({state: 'hidden'});
    }

    async cancel() {
        await this.cancelButton.click();
        await this.dialogLocator.waitFor({state: 'hidden'});
    }

    async isVisible(): Promise<boolean> {
        return this.dialogLocator.isVisible();
    }
}
```

### Using Modal in Tests

```typescript id="uc6"
test('verify delete article confirmation dialog', async ({page}) => {
    const dialog = new ConfirmDialog(page);

    const message = await dialog.getMessage();
    expect(message).toContainText('Are you sure you want to delete this article?');

    await dialog.confirm();

    // Verify deletion happened
    expect(dialog.isVisible()).toBeFalsy();
});
```

---

# 6. Data Table Component Pattern

### Reusable Table Component

```typescript id="uc7"
export class DataTable {
    private page: Page;
    private tableLocator: Locator;

    private readonly rows = this.page.locator('[data-testid="table-row"]');
    private readonly headers = this.page.locator('[data-testid="table-header"]');
    private readonly nextPageButton = this.page.locator('[data-testid="next-page-button"]');

    constructor(page: Page, testId: string = 'data-table') {
        this.page = page;
        this.tableLocator = page.locator(`[data-testid="${testId}"]`);
    }

    async getRowCount(): Promise<number> {
        return this.rows.count();
    }

    async getRowByIndex(index: number): Promise<Locator> {
        return this.rows.nth(index);
    }

    async getCellValue(rowIndex: number, columnName: string): Promise<string | null> {
        const row = this.rows.nth(rowIndex);
        return row.locator(`[data-col="${columnName}"]`).textContent();
    }

    async getRowsByCellValue(columnName: string, value: string): Promise<Locator[]> {
        const matchingRows = [];
        const count = await this.getRowCount();
        
        for (let i = 0; i < count; i++) {
            const cellValue = await this.getCellValue(i, columnName);
            if (cellValue?.includes(value)) {
                matchingRows.push(this.getRowByIndex(i));
            }
        }
        
        return matchingRows;
    }

    async goToNextPage() {
        await this.nextPageButton.click();
        await this.page.waitForLoadState('networkidle');
    }

    async isNextPageAvailable(): Promise<boolean> {
        return this.nextPageButton.isEnabled();
    }

    async getAllData(): Promise<Record<string, string>[]> {
        const data = [];
        const count = await this.getRowCount();
        
        for (let i = 0; i < count; i++) {
            const row = await this.getRowByIndex(i);
            const cells = await row.locator('[data-testid*="cell"]').all();
            const rowData: Record<string, string> = {};
            
            for (const cell of cells) {
                const colName = await cell.getAttribute('data-col');
                const value = await cell.textContent();
                if (colName && value) {
                    rowData[colName] = value;
                }
            }
            
            data.push(rowData);
        }
        
        return data;
    }
}
```

### Using Table Component in Tests

```typescript id="uc8"
test('verify articles displayed in table', async ({page}) => {
    const table = new DataTable(page, 'articles-table');

    const rowCount = await table.getRowCount();
    expect(rowCount).toBeGreaterThan(0);

    const titleCell = await table.getCellValue(0, 'title');
    expect(titleCell).toContainText('Expected Title');

    // Get all data
    const allData = await table.getAllData();
    expect(allData).toHaveLength(rowCount);
});
```

---

# 7. UI Test File Organization

### Test File Naming

```
<Feature>.<action>.spec.ts
```

Examples:
* `articles.create.spec.ts`
* `articles.edit.spec.ts`
* `articles.delete.spec.ts`
* `articles.search.spec.ts`
* `auth.login.spec.ts`

### Test File Structure

```typescript id="uc9"
import { test } from '../src/fixtures/ui.fixture';
import { HomePage } from '../src/ui/pages/HomePage.page';
import { ArticleDetailPage } from '../src/ui/pages/ArticleDetailPage.page';
import { ArticleTestDataFactory } from '../src/ui/fixtures/dataFactory';
import { createArticle, deleteArticle } from '../../src/api/articles';

test.describe('Article Display', () => {
    let articleSlug: string;

    test.beforeEach(async ({api}) => {
        // Setup test data via API
        const articleData = ArticleTestDataFactory.createValidArticle();
        const response = await createArticle(api, 201, articleData);
        articleSlug = response.article.slug;
    });

    test.afterEach(async ({api}) => {
        // Cleanup test data via API
        if (articleSlug) {
            await deleteArticle(api, 204, articleSlug);
        }
    });

    test('display article on detail page', async ({page}) => {
        const detailPage = new ArticleDetailPage(page);
        
        await detailPage.goto(articleSlug);
        const title = await detailPage.getTitle();
        
        expect(title).toBeTruthy();
    });

    test('verify article title matches created data', async ({page}) => {
        const homePage = new HomePage(page);
        
        await homePage.goto();
        const articleTitle = await homePage.searchAndGetArticleTitle(articleSlug);
        
        expect(articleTitle).toBe(expectedTitle);
    });
});
```

---

# 8. Utility Functions & Helpers

### Locator Helper Functions

```typescript id="uc10"
export class LocatorHelpers {
    static async waitForTableLoad(page: Page, timeout = 5000) {
        await page.waitForSelector('[data-testid="table-row"]', {timeout});
    }

    static async clickAndWaitForNavigation(
        page: Page,
        locator: Locator,
        timeout = 5000
    ) {
        await Promise.all([
            page.waitForNavigation({waitUntil: 'networkidle', timeout}),
            locator.click()
        ]);
    }

    static async fillAndValidate(
        input: Locator,
        value: string,
        expectedError?: Locator
    ) {
        await input.fill(value);
        
        if (expectedError) {
            await expect(expectedError).toBeVisible();
        }
    }
}
```

### Page Factory Pattern

```typescript id="uc11"
export class PageFactory {
    constructor(private page: Page) {}

    getHomePage(): HomePage {
        return new HomePage(this.page);
    }

    getArticleListPage(): ArticleListPage {
        return new ArticleListPage(this.page);
    }

    getArticleDetailPage(): ArticleDetailPage {
        return new ArticleDetailPage(this.page);
    }

    getCreateArticlePage(): CreateArticlePage {
        return new CreateArticlePage(this.page);
    }
}
```

### Usage with PageFactory

```typescript id="uc12"
test('navigate between pages', async ({page}) => {
    const pages = new PageFactory(page);
    
    const homePage = pages.getHomePage();
    await homePage.goto();
    
    await homePage.clickCreateArticle();
    
    const createPage = pages.getCreateArticlePage();
    // ... fill form and create article ...
});
```

---

# 9. Component Composition Patterns

### Nested Components Example

```typescript id="uc13"
export class CreateArticlePage {
    private page: Page;
    private form: ArticleForm;
    private submitDialog: ConfirmDialog;

    constructor(page: Page) {
        this.page = page;
        this.form = new ArticleForm(page);
        this.submitDialog = new ConfirmDialog(page);
    }

    async createArticle(articleData: ArticleFormData) {
        // Use form component
        await this.form.fillForm(articleData);
        await this.form.submit();
        
        // Verify confirmation dialog
        const title = await this.submitDialog.getTitle();
        expect(title).toContainText('Confirm');
        
        // Use dialog component
        await this.submitDialog.confirm();
    }
}
```

---

# 10. Critical Architecture Rules

### Rule: One Responsibility Per File

* Page Object = manage one page
* Component = manage one UI pattern
* Test = verify one user scenario
* Never mix concerns

### Rule: Composition Over Inheritance

* Use composition for component reuse
* Avoid deep inheritance chains
* Keep it simple and flexible

### Rule: Testable Structure

* Easy to locate files by feature
* Easy to understand test structure
* Easy to maintain and extend

---

# 11. Final Principles

UI automation at scale requires:

* ✅ Clear folder structure
* ✅ Reusable components
* ✅ Type-safe interactions
* ✅ Organized test files
* ✅ Proper separation of concerns

This architecture enables:
→ Fast test maintenance
→ Easy feature addition
→ Reduced test duplication
→ Better test readability
