export enum PositionMode {
    HEDGE = "HEDGE",
    ONE_WAY = "ONE_WAY"
}

export const isPositionMode = (value: any): value is PositionMode => {
    return Object.values(PositionMode).includes(value);
}