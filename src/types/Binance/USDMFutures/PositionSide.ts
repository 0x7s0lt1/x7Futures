export enum PositionSide{
    BOTH = "BOTH",
    LONG = "LONG",
    SHORT = "SHORT"
}

/**
 * Checks if the given value is of type PositionSide.
 *
 * @param {any} value - The value to be checked.
 * @return {boolean} Whether the value is of type PositionSide.
 */
export const isPositionSide = (value: any): value is PositionSide => {
    return Object.values(PositionSide).includes(value);
}