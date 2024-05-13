export enum RateLimitType{
    REQUEST_WEIGHT = "REQUEST_WEIGHT",
    ORDERS = "ORDERS"
}

/**
 * Checks if the given value is of type RateLimitType.
 *
 * @param {any} value - the value to be checked
 * @return {boolean} true if the value is of type RateLimitType, false otherwise
 */
export const isRateLimitType = (value: any): value is RateLimitType => {
    return Object.values(RateLimitType).includes(value);
}