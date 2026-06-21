import { expect, Locator, Page } from '@playwright/test';
import { basePage } from './basePage';

export class ArticleDetailsPage extends basePage {
    private readonly commentField: Locator;
    private readonly publishCommentButton: Locator;
    private readonly comments: Locator = this.page.locator('.card-text');

comment(text: string) {
    return this.comments.filter({ hasText: text });
}
    

    constructor (page: Page){

        super(page);
        this.commentField = page.getByPlaceholder("Write a comment...");
        this.publishCommentButton =  page.getByRole('button', { name : ' Post Comment '})
        this.comments = this.page.locator('.card-text');
    }

    async waitUntilLoaded(){
        await expect(this.commentField).toBeVisible();
    }

    async fillNewCommentField(text: string){
        await this.commentField.fill(text);
    }

    async clickPostCommentButton(){
        await this.publishCommentButton.click();
    }

    filterCommentsForArticleByTest(text: string) {
        return this.comments.filter({ hasText: text });
    }
}