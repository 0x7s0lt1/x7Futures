export enum STPMode{
    NONE = "NONE",
    EXPIRE_TAKER = "EXPIRE_TAKER",
    EXPIRE_BOTH = "EXPIRE_BOTH",
    EXPIRE_MAKER = "EXPIRE_MAKER"
}

/**
 * Checks if the value is of type STPMode.
 *
 * @param {any} value - the value to check
 * @return {boolean} true if the value is of type STPMode, false otherwise
 */
export const isSTPMode = (value: any): value is STPMode => {
    return Object.values(STPMode).includes(value);
}