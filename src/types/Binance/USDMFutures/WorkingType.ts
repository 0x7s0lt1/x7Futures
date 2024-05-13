export enum WorkingType{
    MARK_PRICE = "MARK_PRICE",
    CONTRACT_PRICE = "CONTRACT_PRICE"
}

/**
 * Checks if the given value is of type WorkingType.
 *
 * @param {any} value - the value to check
 * @return {boolean} true if the value is of type WorkingType, false otherwise
 */
export const isWorkingType = (value: any): value is WorkingType => {
    return Object.values(WorkingType).includes(value);
}