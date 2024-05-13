export enum Exchange {
    BINANCE = "BINANCE",
    OKX = "OKX",
}

export const isExchange = (value: any): value is Exchange => {
    return Object.values(Exchange).includes(value);
}