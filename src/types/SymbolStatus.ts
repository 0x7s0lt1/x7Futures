export enum SymbolStatus {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
    LOCKED = "LOCKED",
    DISABLED = "DISABLED"
}

export const isSymbolStatus = (value: any): value is SymbolStatus => {
    return Object.values(SymbolStatus).includes(value);
}