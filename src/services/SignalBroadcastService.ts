import { Sentry } from "../utils/utils";
import TradingViewSignalPayload from "../types/TradingView/TradingViewSignalPayload";
import dotenv from "dotenv";
import {SignalBroadcastStations} from "../utils/signalBroadcastStations";
import SignalBroadcastProvider from "../messages/provider/SignalBroadcats/SignalBroadcastProvider";
import StationType from "../types/StationType";

dotenv.config();

export class SignalBroadcastService {


    constructor() {

    }

    /**
     * A function that broadcasts a trading view signal to multiple targets.
     *
     * @param {TradingViewSignalPayload} signal - the signal to broadcast
     * @return {Promise<void>} a promise that resolves when the broadcast is complete
     */
    public static async processSignal(signal: TradingViewSignalPayload): Promise<void> {

        return new Promise<void>(async (resolve, reject) => {

            try{

                const provider = new SignalBroadcastProvider();

                SignalBroadcastStations.forEach((station: StationType) => {

                    provider.sendMessage(
                        JSON.stringify({station, signal })
                    );

                });

                resolve();

            }catch (e) {
                Sentry.captureException(e);
                console.log(e);
                reject(e);
            }

        })

    }

    /**
     * Sends a trading view signal to a specified station.
     *
     * @param {StationType} station - The station to send the signal to.
     * @param {TradingViewSignalPayload} signal - The signal to send.
     * @return {Promise<void>} A promise that resolves when the signal is sent successfully, or rejects with an error if there was a problem.
     */
    public static async send(station: StationType, signal: TradingViewSignalPayload): Promise<void> {

        return new Promise<void>(async (resolve, reject) => {

            try {

                await fetch(station.url, {
                    method: 'POST',
                    headers: station.headers ?? {},
                    body: JSON.stringify(signal)
                });

            }catch (e) {
                Sentry.captureException(e);
                console.log(e);
                reject(e);
            }

        });

    }

}