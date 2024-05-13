import {SignalPayloadType} from "../SignalPayloadType";
import {OrderSide} from "../Binance/USDMFutures/OrderSide";
import {StateSignalType} from "../StateSignalType";
import {NoteType} from "./NoteType";

type TradingViewSignalPayload = {
    name? : string,
    symbol: string,
    type: SignalPayloadType,
    side: OrderSide,
    size?: number,
    state?: StateSignalType,
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
    return (obj.symbol !== undefined && obj.side !== undefined && obj.type !== undefined);
}

export default TradingViewSignalPayload;