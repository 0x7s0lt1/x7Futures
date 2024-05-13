type Order = {

    id?: string,
    symbol: string,
    side: string,
    type?: string,
    status?: string,
    timeInForce?: string,
    quantity?: number,
    reductionOnly?: boolean,
    price?: number,
    stopPrice?: number,
    closePosition?: string,
    activationPrice?: number,
    callBackRate?: number,
    workingType?: string,
    priceProtect?: boolean,
    newOrderRespType?: string,
    priceMatch?: string,
    selfTradePreventionMode?: string,
    goodTillDate?: string,
    recWindow?: string,
    timestamp: number|string,
    signature?: string

}

export default Order;