export enum KlineInterval {
    OneMin = "1m",
    ThreeMin = "3m",
    FiveMin = "5m",
    FifteenMin = "15m",
    ThirtyMin = "30m",
    OneHour = "1h",
    TwoHour = "2h",
    FourHour = "4h",
    SixHour = "6h",
    EightHour = "8h",
    TwelveHour = "12h",
    OneDay = "1d",
    ThreeDay = "3d",
    OneWeek = "1w",
    OneMonth = "1M"
}

export const isKlineInterval = (value: any): value is KlineInterval => {
    return Object.values(KlineInterval).includes(value);
}