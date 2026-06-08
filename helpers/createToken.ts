import { RequestHandler } from "../src/utils/requestHandler";
import { config } from "../api-test.config";
import { APILogger } from "../src/utils/logger";
import { request } from "@playwright/test";
import fs from 'fs';

export async function createToken(email: string, password: string) {
    const context = await request.newContext();
    const logger = new APILogger();
    const api = new RequestHandler(context, config.apiUrl, logger);

    try{
    const tokenResponse = await api
        .path('/users/login')
        .setBodyType('json')
        .body({"user": {"email": config.userEmail, "password": config.userPassword}})
        .postRequest(200);
    fs.writeFileSync('./test-data/auth.txt', tokenResponse.user.token);
    return 'Token ' + tokenResponse.user.token;
    } catch (error) {
        Error.captureStackTrace(error!, createToken);
        throw error;
    } finally {
        await context.dispose();
    }
    
}
