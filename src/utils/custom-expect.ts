import { expect as baseExpect } from '@playwright/test';
import { APILogger } from './logger';
import '@playwright/test';

declare module '@playwright/test' {
  interface Matchers<R, T> {
    shouldEqual(expected: T): R;
  }
}

export {};

let apiLogger: APILogger | undefined;

export const setCustomExpectLogger = (logger: APILogger) => {
    apiLogger = logger;
}

export const expect = baseExpect.extend({
    shouldEqual(received: any, expected: any) {
        let pass = false;
        let logs = '';

        try {
            baseExpect(received).toEqual(expected);
            pass = true;

            if (this.isNot && apiLogger) {
                logs = apiLogger.getRecentLogs();
            }
        } catch (e) {
            pass = false;

            if (apiLogger) {
                logs = apiLogger.getRecentLogs();
            }
        }

        const hint = this.isNot ? 'not' : '';

        const message =
            this.utils.matcherHint('shouldEqual', undefined, undefined, {
                isNot: this.isNot
            }) +
            '\n\n' +
        `Expected: ${hint} ${this.utils.printExpected(expected)}\n` +
        `Received: ${this.utils.printReceived(received)}\n\n` +
        `Recent API Activity:\n${logs}`;

    return {
        pass,
        message: () => message
    };
}
});