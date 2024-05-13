export enum PriceMatch{
    NONE = "NONE",                  // (No price match)
    OPPONENT = "OPPONENT",          // (counterparty best price)
    OPPONENT_5 = "OPPONENT_5",      // (the 5th best price from the counterparty)
    OPPONENT_10 = "OPPONENT_10",    // (the 10th best price from the counterparty)
    OPPONENT_20 = "OPPONENT_20",    // (the 20th best price from the counterparty)
    QUEUE = "QUEUE",                // (the best price on the same side of the order book)
    QUEUE_5 = "QUEUE_5",            // (the 5th best price on the same side of the order book)
    QUEUE_10 = "QUEUE_10",          // (the 10th best price on the same side of the order book)
    QUEUE_20 = "QUEUE_20"           // (the 20th best price on the same side of the order book)
}

/**
 * Checks if the input value is a PriceMatch type.
 *
 * @param {any} value - the value to be checked
 * @return {boolean} true if the value is a PriceMatch, false otherwise
 */
export const isPriceMatch = (value: any): value is PriceMatch => {
    return Object.values(PriceMatch).includes(value);
}