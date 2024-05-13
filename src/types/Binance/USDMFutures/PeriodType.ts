export type PeriodType = "1m" | "3m" | "5m" | "15m" | "30m" | "1h" | "2h" | "4h" | "6h" | "8h" | "12h" | "1d" | "3d" | "1w" | "1M";

/**
 * Checks if the given value is a valid period type.
 *
 * @param {any} value - The value to check.
 * @return {boolean} True if the value is a valid period type, false otherwise.
 */
export const isPeriodType = (value: any): value is PeriodType => {
    return ["1m" , "3m" , "5m" , "15m" , "30m" , "1h" , "2h" , "4h" , "6h" , "8h" , "12h" , "1d" , "3d" , "1w" , "1M"].includes(value);
}
