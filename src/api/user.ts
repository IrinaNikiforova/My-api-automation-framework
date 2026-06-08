import { RequestHandler } from '../utils/requestHandler';
import { UpdateArticleRequest } from './schemas/schemaRequest/updateArticleRequest.schema';

export async function createUser(api: RequestHandler, statusCode: number, userBody: Object) {
        const newUserResponse = await api
                .path('/users')
                .body(userBody)
                .clearAuth()
                .postRequest(statusCode)
    return newUserResponse
}