import { test as base } from './api.fixture';

import { HeaderComponent } from '../components/headerComponent';
import { SignIn } from '../pages/signinPage';
// import { SignUp } from '../pages/signUpPage';
import { HomePage } from '../pages/homePage';
import { EditArticlePage } from '../pages/editArticlePage';


type Pages = {
    header: HeaderComponent;
    signInPage: SignIn;
    // signUpPage: SignUp;
    homePage: HomePage;
    editArticlePage: EditArticlePage;
    loginViaToken: void;
};


export const test = base.extend<Pages>({

    // Authenticates the browser session with the worker auth token.
    // List it in a UI test's fixtures to start that test already logged in.
    loginViaToken: async ({page, authToken}, use) => {
        const token = authToken.replace('Token ', '');
        await page.addInitScript(value => {
            window.localStorage.setItem('jwtToken', value);
        }, token);
        await use();
    },

    header: async ({page}, use) => {
        await use(new HeaderComponent(page));
    },


    signInPage: async ({page}, use) => {
        await use(new SignIn(page));
    },


    // signUpPage: async ({page}, use) => {
    //     await use(new SignUp(page));
    // },


    homePage: async ({page}, use) => {
        await use(new HomePage(page));
    },


    editArticlePage: async ({page}, use) => {
        await use(new EditArticlePage(page));
    },


});
