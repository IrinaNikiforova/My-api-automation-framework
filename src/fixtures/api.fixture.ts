import { test as base } from './auth.fixture';
import { RequestHandler } from '../utils/requestHandler';
import { APILogger } from '../utils/logger';
import { setCustomExpectLogger } from '../utils/custom-expect';
import { config } from '../../api-test.config';
import { ApiFixtures } from './types';

export const test = base.extend<ApiFixtures>({
    
    api: async ({ request, authToken }, use) => {

        const logger = new APILogger();

        setCustomExpectLogger(logger);

        const requestHandler = new RequestHandler(
            request,
            config.apiUrl,
            logger,
            authToken
        );

        await use(requestHandler);
    },

    config: async ({}, use) => {
        await use(config);
    }
});