import { test } from '../../src/fixtures/api.fixture';
import { faker } from '@faker-js/faker';
import { CreateUserRequest } from '../../src/api/schemas/schemaRequest/createUserRequest.schema';
import { createUser } from '../../src/api/user';
import { expect } from '@playwright/test';

const testCases = [
  {
    username: "AB",
    usernameErrorMessage: 'is too short (minimum is 3 characters)',
  },
  {
    username: "sdlkfmndskjmdflkddsas",
    usernameErrorMessage: 'is too long (maximum is 20 characters)',
  },
];

test.describe('Create user negative tests', () => {
  for (const { username, usernameErrorMessage } of testCases) {
    
    test(`verify error message for username: ${username}`, async ({ api }) => {
      
      const userData: CreateUserRequest = {
        user: {
          email: faker.internet.email(),
          password: faker.string.alphanumeric({ length: { min: 8, max: 16 } }) + '!',
          username,
        },
      };

      const responseJSON = await createUser(api, 422, userData);
      expect(responseJSON.errors.username[0]).toEqual(usernameErrorMessage)
    });

  }
});