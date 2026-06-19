import { RequestHandler } from '../utils/requestHandler';
import { config } from '../../api-test.config';


export type ApiFixtures = {
    api: RequestHandler;
    config: typeof config;
};


export type AuthFixtures = {
    authToken: string;
};