import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '.env') });

const processEnv = process.env.TEST_ENV
const env = processEnv || 'dev'
console.log(`Test environment: ${env}`)

const config ={
    apiUrl: 'https://conduit-api.bondaracademy.com/api',
    userEmail: 'user@qa.com',
    userPassword: 'wpassword'
}
if(env === 'qa') {
    config.userEmail = ''
    config.userPassword = ''
}
if(env === 'prod') {
    config.userEmail = process.env.PROD_USERNAME as string,
    config.userPassword = process.env.PROD_PASSWORD as string
}

export {config}