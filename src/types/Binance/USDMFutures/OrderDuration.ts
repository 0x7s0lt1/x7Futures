export enum OrderDuration {
    GTC = "GTC",
    GTD = "GTD",
}

export const isOrderDuration = (value: string): value is OrderDuration => OrderDuration.hasOwnProperty(value);