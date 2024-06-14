type SignalBotFormType = {
    id?: number,
    api_id: number,
    symbol: string,
    quote_amount: number,
    leverage: number,
    initial_capital: number
}

export const isSignalBotFormType = (x: any): x is SignalBotFormType => {
    return (
        typeof x.api_id === "number" &&
        typeof x.symbol === "string" &&
        typeof x.quote_amount === "number" &&
        typeof x.leverage === "number" &&
        typeof x.initial_capital === "number"
    );
}

export default SignalBotFormType;