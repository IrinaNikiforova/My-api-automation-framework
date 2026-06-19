import { test as base } from '@playwright/test';
import { config } from '../../api-test.config';
import { createToken } from '../../helpers/createToken';
import { AuthFixtures } from './types';


export const test = base.extend<{}, AuthFixtures>({

    authToken: [
        async ({}, use) => {

            const authToken = await createToken(
                config.userEmail,
                config.userPassword
            );

            await use(authToken);
        },
        {
            scope: 'worker'
        }
    ]

});