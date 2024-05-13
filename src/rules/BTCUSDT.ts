import SymbolRule from "SymbolRule";
import {Sentry} from "../utils/utils";
import {StateSignalType} from "../types/StateSignalType";

export default class BTCUSDT implements SymbolRule {

    public static buy = async (state: string|null): Promise<any> => {
        return new Promise(async (resolve, reject) => {
            try{

                if(state === StateSignalType.LOCK_BUY){
                    return resolve(false);
                }

                resolve(true);

            }catch (e) {
                Sentry.captureException(e);
                console.log(e);
                reject(false);
            }

        });
    }

    public static sell = async (state: string|null): Promise<any> => {
        return new Promise(async (resolve, reject) => {
            try{

                if(state === StateSignalType.LOCK_SELL){
                    return resolve(false);
                }

                resolve(true);

            }catch (e) {
                Sentry.captureException(e);
                console.log(e);
                reject(false);
            }

        });
    }

}