import * as Sentry from "@sentry/node";
import process from "process";
import dotenv from "dotenv";


dotenv.config();

if (process.env.SENTRY_DSN && process.env.SENTRY_DSN.length > 40) {
    Sentry.init({
        dsn: process.env.SENTRY_DSN,
        environment: process.env.TEST_MODE ? "test" : "production",
        tracesSampleRate: 1.0,
    });
}

/**
 * Logs a message with a timestamp.
 *
 * @param {any} message - the message to be logged
 */
const logger = (message: any) => console.log(`[${new Date().toLocaleString()}]`,message);

/**
 * Asynchronously pauses the execution for a specified time.
 *
 * @param {number} ms - The number of milliseconds to sleep.
 * @return {Promise<void>} A promise that resolves after the specified time.
 */
 const sleep = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Replaces newline characters in the input text with an empty string.
 *
 * @param {string} text - the input text with newline characters
 * @return {string} the input text with newline characters removed
 */
 const removeNewlines = (text: string): string => text.replace(/\r?\n|\r/g, "");

/**
 * Converts a snake_case or snake-case string to camelCase.
 *
 * @param {string} str - the input snake_case or snake-case string
 * @return {string} the camelCase string
 */
 const snakeToCamel = (str: string): string =>
    str.toLowerCase().replace(/([-_][a-z])/g, group =>
        group
            .toUpperCase()
            .replace('-', '')
            .replace('_', '')
    );

export {
    Sentry,
    sleep,
    removeNewlines,
    snakeToCamel,
    logger
}