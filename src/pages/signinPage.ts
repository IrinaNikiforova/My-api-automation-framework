import { expect, Locator, Page } from '@playwright/test';
import { basePage } from './basePage';


export class SignIn extends basePage {
    private readonly emailInput: Locator;
    private readonly passwordInput: Locator;
    private readonly signInButton: Locator;

    constructor (page: Page){

        super(page);
        this.emailInput = page.getByPlaceholder('Email');
        this.passwordInput = page.getByPlaceholder('Password');
        this.signInButton = page.getByRole('button', { name : 'Sign in'})

    }

    async waitUntilLoaded(){

        await expect(this.emailInput).toBeVisible();

    }

    async clickSignInButton(){
        await this.signInButton.click();
    }

    async fillEmail(email: string){
        await this.emailInput.fill(email);
    }

    async fillPassword(password: string){
        await this.passwordInput.fill(password)
    }

}