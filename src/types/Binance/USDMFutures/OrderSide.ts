export enum OrderSide{
    BUY  = "BUY",
    SELL = "SELL",
}

/**
 * Check if the given value is an OrderSide.
 *
 * @param {any} value - The value to check
 * @return {boolean} Whether the value is an OrderSide
 */
export const isOrderSide = (value: any): value is OrderSide => {
    return Object.values(OrderSide).includes(value);
}