import TradingViewSignalPayload from "./TradingView/TradingViewSignalPayload";

type SignalBotType = {
    api_id: number,
    quote_amount: number,
    leverage: number,
    initial_capital: number,
    exchange: string,
    public_key: string,
    private_key: string,
    testnet: boolean,
    extra?: string|null,
    buy_state: any,
    sell_state: any,
    signal: TradingViewSignalPayload,
}

export default SignalBotType;