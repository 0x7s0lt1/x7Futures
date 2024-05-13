export enum ContractStatus {
    PENDING_TRADING= "PENDING_TRADING",
    TRADING = "TRADING",
    PRE_DELIVERING = "PRE_DELIVERING",
    DELIVERING = "DELIVERING",
    DELIVERED = "DELIVERED",
    PRE_SETTLE = "PRE_SETTLE",
    SETTLING = "SETTLING",
    CLOSE = "CLOSE",
}


/**
 * Checks if the input value is a ContractStatus.
 *
 * @param {any} value - The value to be checked.
 * @return {boolean} Whether the input value is a ContractStatus.
 */
export const isContractStatus = (value: any): value is ContractStatus => {
    return Object.values(ContractStatus).includes(value);
}