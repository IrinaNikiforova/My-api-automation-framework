// import { test, expect } from '@playwright/test';
import { config } from '../../api-test.config';
import { test } from '../../src/fixtures/ui.fixture'

test.beforeEach(async ({ page }) => {

    await page.goto('/');
    
});

test('check header locators', async ({ header }) => {

    await header.clickSignIn();  
    await header.clickHome();
    await header.clickSingOut();
    
});

test('login', async ({ header, signInPage }) =>{

    await header.clickSignIn();
    await signInPage.waitForPageLoaded();
    await signInPage.fillEmail(config.userEmail);
    await signInPage.fillPassword(config.userPassword);
    await signInPage.clickSignInButton();

})