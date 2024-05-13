export enum StateSignalType {
    BULLISH = "BULLISH",
    BEARISH = "BEARISH",
    LOCK_SELL = "LOCK_SELL",
    LOCK_BUY = "LOCK_BUY",
    UNLOCK_SELL = "UNLOCK_SELL",
    UNLOCK_BUY = "UNLOCK_BUY",
    NEUTRAL = "NEUTRAL"
}

/**
 * Checks if the input object is of type StateSignalType.
 *
 * @param {any} obj - the object to check
 * @return {boolean} true if the object is of type StateSignalType, false otherwise
 */
export const isStateSignalType = (obj: any): obj is StateSignalType => {
    return Object.values(StateSignalType).includes(obj);
}