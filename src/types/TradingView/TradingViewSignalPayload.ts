import {OrderSide} from "../Binance/USDMFutures/OrderSide";
import {NoteType} from "./NoteType";

type TradingViewSignalPayload = {
    name? : string,
    symbol: string,
    side: OrderSide,
    size?: number,
    stop?: number,
    take?: number,
    note?: NoteType,
    debug?: any,
}

/**
 * Checks if the object is a valid TradingViewSignalPayload by verifying the presence of symbol and side properties.
 *
 * @param {any} obj - The object to be checked
 * @return {boolean} Returns true if the object is a valid TradingViewSignalPayload, false otherwise
 */
export const isTradingViewSignalPayload = (obj: any): obj is TradingViewSignalPayload => {
    return (obj.symbol !== undefined && obj.side !== undefined);
}

export default TradingViewSignalPayload;