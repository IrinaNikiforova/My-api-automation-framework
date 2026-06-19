import { test as base } from '@playwright/test';

import { HeaderComponent } from '../components/headerComponent';
import { SignIn } from '../pages/signinPage';
// import { SignUp } from '../pages/signUpPage';
// import { HomePage } from '../pages/homePage';
// import { EditArticlePage } from '../src/pages/editArticlePage';

import { config } from '../../api-test.config';


type Pages = {
    header: HeaderComponent;
    signInPage: SignIn;
    // signUpPage: SignUp;
    // homePage: HomePage;
    // editArticlePage: EditArticlePage;
};


export const test = base.extend<Pages>({

    header: async ({page}, use) => {
        await use(new HeaderComponent(page));
    },


    signInPage: async ({page}, use) => {
        await use(new SignIn(page));
    },


    // signUpPage: async ({page}, use) => {
    //     await use(new SignUp(page));
    // },


    // homePage: async ({page}, use) => {
    //     await use(new HomePage(page));
    // },


    // editArticlePage: async ({page}, use) => {
    //     await use(new EditArticlePage(page));
    // },


});