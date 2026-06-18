import { Page } from '@playwright/test'

export abstract class basePage {
    constructor(protected readonly page: Page) {
        
    }

    async navigate(path:string){
        await this.page.goto(path)
    }

    async reload(){
        await this.page.reload();
    }

    async waitForPageLoaded(){
        await this.page.waitForLoadState('networkidle');
    }

    async getCurrentUrl(){
        return this.page.url()
    }

    async takeScreenshot(name:string){
        await this.page.screenshot({
            path:`screenshots/${name}.png`,
            fullPage:true
        })    
    }
}
