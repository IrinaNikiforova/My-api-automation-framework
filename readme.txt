# Playwright Automation Framework (UI + API)

## Overview

This is an automation testing framework built using Playwright and TypeScript.

It includes:
- UI testing
- API testing
- Schema validation with Zod
- Test data generation with Faker

---

## Tech Stack

- Playwright
- TypeScript
- Zod
- Faker.js
- Node.js

---

## Project Structure

src/
 ├── api/        # API clients
 ├── fixtures/   # custom fixtures
 ├── models/     # interfaces
 ├── schemas/    # Zod schemas
 ├── utils/      # helpers

tests/
 ├── api/
 ├── ui/

---

## Installation

git clone <repo-url>
cd project
npm install

---

## Running Tests

Run all tests:
npm test

Run API tests:
npx playwright test tests/api

Run UI tests:
npx playwright test tests/ui

Run headed mode:
npx playwright test --headed

---

## Environment Variables

Create .env file:

BASE_URL=https://conduit-api.bondaracademy.com

---

## Test Data Strategy

- Faker.js for dynamic data
- Controlled data for negative tests
- Zod schemas for validation

---

## API Testing

All API responses are validated using Zod schemas to ensure contract correctness.

---

## Reporting

Generate HTML report:

npx playwright show-report