import { test } from '../../src/fixtures/fixture';
import { expect } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { CreateUserRequest, UserSchema } from '../../src/api/schemas/schemaRequest/createUserRequest.schema';
import { createUser } from '../../src/api/user';
import { UserResponseSchema } from '../../src/api/schemas/schemaResponse/userResponse.schema';
import { CreateUserRequestSchema } from '../../src/api/schemas/schemaRequest/createUserRequest.schema';

test('verify creation valid new user', async ({ api }) => {
    const userData: CreateUserRequest = {
        "user":{
            "email": faker.internet.email(),
            "password": faker.string.alphanumeric({length: { min: 8, max: 16 }}) + '!',
            "username": faker.string.alpha({length: { min: 3, max: 20 }}),
        }
    }
    CreateUserRequestSchema.parse(userData);

    const responseJSON = await createUser(api, 201, userData) 
    
    UserResponseSchema.parse(responseJSON)
    expect(responseJSON.user.email).toEqual(userData.user.email)
    expect(responseJSON.user.username).toEqual(userData.user.username)
    console.log(responseJSON)
     
})



