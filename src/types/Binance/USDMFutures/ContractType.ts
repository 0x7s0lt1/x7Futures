
export enum ContractType {
    PERPETUAL = 'PERPETUAL',
    CURRENT_MONTH = 'CURRENT_MONTH',
    NEXT_MONTH = 'NEXT_MONTH',
    CURRENT_QUARTER = 'CURRENT_QUARTER',
    NEXT_QUARTER = 'NEXT_QUARTER',
    PERPETUAL_DELIVERING = 'PERPETUAL_DELIVERING',
}

/**
 * Checks if the given value is a valid contract type.
 *
 * @param {any} value - The value to check.
 * @return {boolean} - Returns true if the value is a valid contract type, otherwise returns false.
 */
export const isContractType = (value: any): value is ContractType => {
    return Object.values(ContractType).includes(value);
}
