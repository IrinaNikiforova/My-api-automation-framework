import '@playwright/test';

declare global {
    namespace PlaywrightTest {
        interface Matchers<R, T> {
            shouldEqual(expected: T): R;
        }
    }
}
export {};