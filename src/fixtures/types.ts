import { RequestHandler } from '../utils/requestHandler';
import { config } from '../../api-test.config';
import { SignIn } from '../pages/signinPage';
import { HeaderComponent } from '../components/headerComponent';
// import { SignUp } from '../pages/signupPage';
import { HomePage } from '../pages/homePage';
import { EditArticlePage } from '../pages/editArticlePage';


export type ApiFixtures = {
    api: RequestHandler;
    config: typeof config;
};


export type AuthFixtures = {
    authToken: string;
};

export type UIFixtures = {

    header: HeaderComponent;

    signInPage: SignIn;

    // signUpPage: SignUp;

    homePage: HomePage;

    editArticlePage: EditArticlePage;

    loginViaToken: void;

};