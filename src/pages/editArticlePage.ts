import { expect, Locator, Page } from '@playwright/test';
import { basePage } from './basePage';

export class EditArticlePage extends basePage {
    private readonly titleField: Locator;
    private readonly descriptionField: Locator;
    private readonly bodyField: Locator;
    private readonly tagsField: Locator;
    private readonly publishArticleButton: Locator 

    constructor (page: Page){

        super(page);
        this.titleField = page.getByPlaceholder("Article Title");
        this.descriptionField = page.getByPlaceholder("What's this article about?");
        this.bodyField = page.getByPlaceholder("Write your article (in markdown)");
        this.tagsField = page.getByPlaceholder("Enter tags");
        this.publishArticleButton =  page.getByRole('button', { name : ' Publish Article '})

    }

    async waitUntilLoaded(){
        await expect(this.titleField).toBeVisible();
    }

    async expectEditorNotAvailable(){
        await expect(this.titleField).toBeHidden();
    }

    async fillTitle(title:string){
        await this.titleField.fill(title);
    }

    async fillDescription(description:string){
        await this.descriptionField.fill(description);
    }
    
    async fillBody(body:string){
        await this.bodyField.fill(body);
    }

    async fillTags(tags: string[]) {
        await this.tagsField.fill(tags.join(', '));
    }

    async clickPublishArticleButton(){
        await this.publishArticleButton.click();
    }

    async getPublishedArticleSlug(){
        await this.page.waitForURL(/\/article\//);
        return this.page.url().split('/article/')[1];
    }
}