export enum OrderStatus{
    NEW = "NEW",
    PARTIALLY_FILLED = "PARTIALLY_FILLED",
    FILLED = "FILLED",
    CANCELED = "CANCELED",
    REJECTED = "REJECTED",
    EXPIRED = "EXPIRED",
    EXPIRED_IN_MATCH = "EXPIRED_IN_MATCH"
}

/**
 * Checks if the given value is a valid OrderStatus.
 *
 * @param {any} value - the value to check
 * @return {boolean} true if the value is a valid OrderStatus, false otherwise
 */
export const isOrderStatus = (value: any): value is OrderStatus => {
    return Object.values(OrderStatus).includes(value);
}