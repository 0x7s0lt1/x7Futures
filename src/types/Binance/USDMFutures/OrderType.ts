export enum OrderType{
    LIMIT = "LIMIT",
    MARKET = "MARKET",
    STOP = "STOP",
    STOP_MARKET = "STOP_MARKET",
    TAKE_PROFIT = "TAKE_PROFIT",
    TAKE_PROFIT_MARKET = "TAKE_PROFIT_MARKET",
    TRAILING_STOP_MARKET = "TRAILING_STOP_MARKET"
}

/**
 * Checks if the given value is of type OrderType.
 *
 * @param {any} value - the value to check
 * @return {boolean} true if the value is of type OrderType, otherwise false
 */
export const isOrderType = (value: any): value is OrderType => {
    return Object.values(OrderType).includes(value);
}