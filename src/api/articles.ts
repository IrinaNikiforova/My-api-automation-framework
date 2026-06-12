import { RequestHandler } from '../utils/requestHandler';
import { UpdateArticleRequest } from './schemas/schemaRequest/updateArticleRequest.schema';

export async function createArticle(api: RequestHandler, expectedStatusCode: number, articleData: Object) {
        const response = await api
        .path('/articles')
        .body(articleData)
        .postRequest(expectedStatusCode);
    console.log(response);
return response;
}

export async function deleteArticle(api: RequestHandler, statusCode: number, slug: string) {
        await api
        .path(`/articles/${slug}`)
        .deleteRequest(statusCode);
}

export async function updateArticle(api: RequestHandler,expectedStatusCode: number, articleUpdatedData: UpdateArticleRequest) {
    const slug = articleUpdatedData.article.slug
       const response = await api
        .path(`/articles/${articleUpdatedData.article.slug}`)
        .body(articleUpdatedData)
        .putRequest(expectedStatusCode);
    console.log(response);
return response;
}

export async function getArticle(api: RequestHandler, statusCode: number, slug: string) {
    const response = await api
        .path(`/articles/${slug}`)
        .getRequest(statusCode);
    console.log(response);
    return response;
}