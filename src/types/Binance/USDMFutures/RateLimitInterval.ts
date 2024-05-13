export enum RateLimitInterval{
    MINUTE = "MINUTE"
}

/**
 * Check if the value is a RateLimitInterval.
 *
 * @param {any} value - The value to check.
 * @return {boolean} Whether the value is a RateLimitInterval.
 */
export const isRateLimitInterval = (value: any): value is RateLimitInterval => {
    return Object.values(RateLimitInterval).includes(value);
}