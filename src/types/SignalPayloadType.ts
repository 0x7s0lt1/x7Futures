export enum SignalPayloadType {
    TRADE = "TRADE",
    STATE = "STATE",
}

/**
 * A function that checks if the input object is of type SignalPayloadType.
 *
 * @param {any} obj - The object to check the type for.
 * @return {boolean} Returns true if the object is of type SignalPayloadType, otherwise false.
 */
export const isSignalPayloadType = (obj: any): obj is SignalPayloadType => {
    return Object.values(SignalPayloadType).includes(obj);
}