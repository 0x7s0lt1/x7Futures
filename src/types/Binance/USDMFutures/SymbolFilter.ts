export enum SymbolFilter {
    PRICE_FILTER = "PRICE_FILTER",
    PERCENT_PRICE = "PERCENT_PRICE",
    LOT_SIZE = "LOT_SIZE",
    MARKET_LOT_SIZE = "MARKET_LOT_SIZE",
    MIN_NOTIONAL = "MIN_NOTIONAL",
    MAX_NUM_ORDERS = "MAX_NUM_ORDERS",
    MAX_NUM_ALGO_ORDERS = "MAX_NUM_ALGO_ORDERS"
}

/**
 * Checks if the value is a SymbolFilter.
 *
 * @param {string} value - the value to check
 * @return {boolean} true if the value is a SymbolFilter, false otherwise
 */
export const isSymbolFilter = (value: string): value is SymbolFilter => SymbolFilter.hasOwnProperty(value);