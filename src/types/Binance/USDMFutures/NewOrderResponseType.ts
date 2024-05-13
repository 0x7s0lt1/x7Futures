export enum NewOrderResponseType{
    ACK = "ACK",
    RESULT = "RESULT"
}

/**
 * Checks if the given value is of type NewOrderResponseType.
 *
 * @param {any} value - the value to be checked
 * @return {boolean} true if the value is of type NewOrderResponseType, false otherwise
 */
export const isNewOrderResponseType = (value: any): value is NewOrderResponseType => {
    return Object.values(NewOrderResponseType).includes(value);
}