import { expect, Locator, Page } from '@playwright/test';
import { basePage } from './basePage';

export class HomePage extends basePage {
    private readonly feedToggle: Locator;
    private readonly globalFeedTab: Locator;
    private readonly articlePreviews: Locator;

    constructor (page: Page){

        super(page);
        this.feedToggle = page.locator('.feed-toggle');
        this.globalFeedTab = this.feedToggle.getByText('Global Feed');
        this.articlePreviews = page.locator('.article-preview');

    }

    async waitUntilLoaded(){
        await expect(this.feedToggle).toBeVisible();
    }

    async clickGlobalFeedTab(){
        await this.globalFeedTab.click();
    }

    async expectArticleVisible(title: string){
        await expect(this.articlePreviews.filter({ hasText: title })).toBeVisible();
    }
}
