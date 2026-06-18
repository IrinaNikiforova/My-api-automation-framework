import { Page, Locator } from '@playwright/test';


export class HeaderComponent {


    private readonly homeLink: Locator;

    private readonly signInLink: Locator;

    private readonly signOutLink: Locator;


    constructor(private readonly page: Page) {

        this.homeLink = page.getByRole('link',{name: 'Home'});


        this.signInLink = page.getByRole('link',{ name: 'Sign in'});


        this.signOutLink = page.getByRole('link',{name: 'Sign up'});

    }



    async clickHome(): Promise<void> {

        await this.homeLink.click();

    }



    async clickSignIn(): Promise<void> {

        await this.signInLink.click();

    }



    async clickSingOut(): Promise<void> {

        await this.signOutLink.click();

    }


}