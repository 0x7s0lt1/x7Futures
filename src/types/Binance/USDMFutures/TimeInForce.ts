export enum TimeInForce{
    GTC = "GTC", // Good Till Cancel
    IOC = "IOC", // Immediate Or Cancel
    FOK = "FOK", // Fill Or Kill
    GTX = "GTX", // Good Till Crossing (Post Only)
    GTD = "GTD"  // Good Till Date
}

/**
 * Check if the given value is a TimeInForce type.
 *
 * @param {any} value - The value to check
 * @return {boolean} Whether the value is a TimeInForce type
 */
export const isTimeInForce = (value: any): value is TimeInForce => {
    return Object.values(TimeInForce).includes(value);
}