import { test, expect } from '@playwright/test';
import { HeaderComponent } from '../../src/components/headerComponent';
import { before, beforeEach } from 'node:test';
import { SignIn} from '../../src/pages/signinPage'
import { config } from '../../api-test.config';

test.beforeEach(async ({ page }) => {

    await page.goto(
        'https://conduit.bondaracademy.com/'
    );
    
});

test('check header locators', async ({ page }) => {

    const header = new HeaderComponent(page);

    await header.clickSignIn()
    
    await header.clickHome()
    
    await header.clickSingOut()
    
});

test('login', async ({ page }) =>{

    const header = new HeaderComponent(page);
    const signInPage = new SignIn(page)

    await header.clickSignIn();
    await signInPage.waitForPageLoaded();
    await signInPage.fillEmail(config.userEmail);
    await signInPage.fillPassword(config.userPassword);
    await signInPage.clickSignInButton();

    
})