import dotenv from "dotenv";
import * as crypto from "crypto";
import * as process from "process";
import mysql from "mysql2/promise";
import Order from "../../types/Binance/USDMFutures/Order";
import {OrderSide} from "../../types/Binance/USDMFutures/OrderSide";
import {SymbolFilter} from "../../types/Binance/USDMFutures/SymbolFilter";
import {KlineInterval} from "Binance/KlineInterval";
import {Sentry} from "../../utils/utils";
import ApiKeyType from "../../types/ApiKeyType";

dotenv.config();

export default class USDMFutureService {

    baseUrl: string;
    apiKey: ApiKeyType;
    authHeaders: HeadersInit;
    connection: any;

    public constructor( apiKey : ApiKeyType ) {

        this.apiKey = apiKey;
        this.baseUrl = this.apiKey.testnet ? "https://testnet.binancefuture.com" : "https://fapi.binance.com";

        this.authHeaders = {
            'Content-Type': 'application/x-www-form-urlencoded',
            "X-MBX-APIKEY" : this.apiKey.public_key
        };

    }

    /**
     * A function to make a query using the specified method, path, payload, and signature requirement.
     *
     * @param {string} method - the HTTP method to use for the query
     * @param {string} path - the path for the query
     * @param {any} payload - the payload for the query (default is an empty object)
     * @param {boolean} requireSignature - whether a signature is required for the query (default is true)
     * @return {Promise<any>} a Promise that resolves with the query result
     */
    public query(method: string, path: string, payload: any = {}, requireSignature: boolean = true): Promise<any>
    {
        return new Promise((resolve, reject) => {

            if(!payload.timestamp){
                payload.timestamp = Date.now().toString();
            }

            if(!payload.recWindow){
                payload.recWindow = "5000";
            }

            if(method === "GET") {

                const query_string = this.generateQueryString(payload);
                const signature = this.generateSignature(query_string);
                const url = this.baseUrl + path + "?" + query_string + (requireSignature ? "&signature=" + signature : "");

                fetch(url, {
                    headers: this.authHeaders
                })
                    .then(res => res.json())
                    .then(json => resolve(json))
                    .catch(err => reject(err));
            }
            else if(method === "POST") {

                const url = this.baseUrl + path;

                const query_string = this.generateQueryString(payload);
                payload.signature = this.generateSignature(query_string);

                fetch(url, {
                    method: "POST",
                    body: new URLSearchParams(payload),
                    headers: this.authHeaders
                })
                    .then(res => res.json())
                    .then(json => resolve(json))
                    .catch(err => reject(err));
            }

        })
    }

    /**
     * Generates a signature for the given query.
     *
     * @param {string} query - The query string to generate the signature for.
     * @return {string} The generated signature.
     */
    private generateSignature(query: string): string
    {

        return encodeURIComponent(this.apiKey.testnet ?
            crypto
                .createHmac('sha256', this.apiKey.private_key)
                .update(query)
                .digest('hex') :
            crypto
                .createSign('RSA-SHA256')
                .update(query)
                .sign(this.apiKey.private_key, 'base64')
            );

    }

    /**
     * Generate a query string from a key-value object.
     *
     * @param {Record<string, string>} query - The key-value object to convert to a query string
     * @return {string} The query string generated from the key-value object
     */
    private generateQueryString(query:  Record<string, string> ): string
    {
        return new URLSearchParams(query).toString();
    }

    /**
     * Perform a ping request.
     *
     * @return {Promise<any>} The result of the ping request.
     */
    public async ping(): Promise<any> {

        return new Promise((resolve, reject) => {

            this.query("GET", "/fapi/v1/ping", {}, true)
            .then(res => resolve(res))
            .catch(err => reject(err));
        });

    }

    /**
     * Retrieves exchange information from the Binance API.
     *
     * @return {Promise<any>} A promise that resolves with the exchange information or rejects with an error.
     */
    public async getExchangeInfo(): Promise<any> {

        return new Promise((resolve, reject) => {

            this.query("GET", "/fapi/v1/exchangeInfo", {}, true)
            .then(res => resolve(res))
            .catch(err => reject(err));
        });

    }

    /**
     * Retrieves the leverage bracket for a given symbol from the Binance API.
     *
     * @param {string} symbol - The symbol for which to retrieve the leverage bracket.
     * @return {Promise<any>} A promise that resolves with the leverage bracket information or rejects with an error.
     */
    public async leverageBracket ( symbol: string ): Promise<any> {

        return new Promise((resolve, reject) => {

            this.query("GET", "/fapi/v1/leverageBracket", {symbol}, true)
            .then(res => resolve(res))
            .catch(err => reject(err));

        });

    }

    /**
     * Sets the leverage for a given symbol.
     *
     * @param {string} symbol - The symbol for which to set the leverage.
     * @param {number} leverage - The leverage value to set. Must be between 1 and 125.
     * @return {Promise<any>} A promise that resolves with the result of the leverage setting operation.
     */
    public async setLeverage( symbol: string , leverage: number = 25): Promise<any> {

        return new Promise((resolve, reject) => {

            if(leverage < 1 || leverage > 125){
                reject("Leverage must be between 1 and 125");
                return;
            }

            this.query("POST", "/fapi/v1/leverage", {symbol, leverage}, true)
            .then(res => resolve(res))
            .catch(err => reject(err));

        });
    }

    /**
     * A function to retrieve the order book for a given symbol.
     *
     * @param {string} symbol - the symbol for which the order book is requested
     * @param {number} limit - (optional) the maximum number of items to return
     * @return {Promise<any>} a Promise containing the order book data
     */
    public async getOrderBook( symbol: string , limit?: number): Promise<any> {

        return new Promise((resolve, reject) => {

            let payload: any = {
                symbol: symbol
            };

            if(limit){
                payload.limit = limit;
            }

            this.query("GET", "/fapi/v1/depth", payload, true)
            .then(res => resolve(res))
            .catch(err => reject(err));

        });
    }

    /**
     * Retrieves recent trades for a given symbol with an optional limit.
     *
     * @param {string} symbol - The symbol for which to retrieve trades.
     * @param {number} [limit] - An optional limit on the number of trades to retrieve.
     * @return {Promise<any>} A Promise that resolves with the recent trades data.
     */
    public async getRecentTrades( symbol: string , limit?: number): Promise<any> {

        return new Promise((resolve, reject) => {

            let payload: any = {
                symbol: symbol
            };

            if(limit){
                payload.limit = limit;
            }

            this.query("GET", "/fapi/v1/trades", payload, true)
            .then(res => resolve(res))
            .catch(err => reject(err));

        });

    }

    /**
     * Retrieves historical trades for a given symbol.
     *
     * @param {string} symbol - The symbol for which to retrieve historical trades.
     * @param {string} [fromId] - The ID of the trade to start retrieving from.
     * @param {number} [limit] - The maximum number of trades to retrieve.
     * @return {Promise<any>} - A promise that resolves with the historical trades data or rejects with an error.
     */
    public async getHistoricalTrades( symbol: string , fromId?: string, limit?: number): Promise<any> {

        return new Promise((resolve, reject) => {

            let payload: any = {
                symbol: symbol
            };

            if(limit){
                payload.limit = limit;
            }

            if(fromId){
                payload.fromId = fromId;
            }

            this.query("GET", "/fapi/v1/historicalTrades", payload, true)
            .then(res => resolve(res))
            .catch(err => reject(err));
        });
    }

    /**
     * A function to get aggregated trades.
     *
     * @param {string} symbol - the trading symbol
     * @param {string} fromId - optional parameter for trade ID to fetch from
     * @param {string} startTime - optional parameter for start time
     * @param {string} endTime - optional parameter for end time
     * @param {number} limit - optional parameter for limit of results
     * @return {Promise<any>} a Promise resolving to the aggregated trades
     */
    public async getAggTrades( symbol: string , fromId?: string, startTime?: string, endTime?: string, limit?: number): Promise<any> {

        return new Promise((resolve, reject) => {


            let payload: any = {
                symbol: symbol
            };

            if (startTime) {
                payload.startTime = startTime;
            }

            if(endTime){
                payload.endTime = endTime;
            }

            if (endTime) {
                payload.endTime = endTime;
            }

            if(limit){
                payload.limit = limit;
            }

            if(fromId){
                payload.fromId = fromId;
            }

            this.query("GET", "/fapi/v1/aggTrades", payload, true)
            .then(res => resolve(res))
            .catch(err => reject(err));

        });
    }

    /**
     * Retrieves klines data for a given symbol and interval.
     *
     * @param {string} symbol - The symbol to retrieve klines data for.
     * @param {KlineInterval} interval - The interval of the klines data.
     * @param {string} [startTime] - The start time of the klines data.
     * @param {string} [endTime] - The end time of the klines data.
     * @param {number} [limit] - The maximum number of klines to retrieve.
     * @return {Promise<any>} - A promise that resolves with the retrieved klines data.
     */
    public async getKlines( symbol: string , interval: KlineInterval, startTime?: string, endTime?: string, limit?: number): Promise<any> {

        return new Promise((resolve, reject) => {

            let payload: any = {
                symbol: symbol,
                interval: interval
            };

            if(startTime){
                payload.startTime = startTime;
            }

            if(endTime){
                payload.endTime = endTime;
            }

            if(limit){
                payload.limit = limit;
            }

            this.query("GET", "/fapi/v1/klines", payload, true)
            .then(res => resolve(res))
            .catch(err => reject(err));
        });
    }

    /**
     * Retrieves the mark price for a specific symbol or all symbols.
     *
     * @param {string} symbol - Optional. The symbol for which to retrieve the mark price.
     * @return {Promise<any>} A promise that resolves with the mark price data.
     */
    public async getMarkPrice( symbol?: string ): Promise<any> {

        return new Promise((resolve, reject) => {

            let payload: any = {};

            if (symbol) {
                payload.symbol = symbol;
            }

            this.query("GET", "/fapi/v1/premiumIndex", payload, true)
            .then(res => resolve(res))
            .catch(err => reject(err));
        });
    }

    /**
     * Retrieves the price of a given symbol from the API.
     *
     * @return {Promise<any>} - A promise that resolves with the price of the symbol.
     */
    public async getPrice(symbol: string): Promise<any> {

        return new Promise((resolve, reject) => {

            let payload: any = {
                symbol: symbol
            };

            this.query("GET", "/fapi/v2/ticker/price", payload, true)
            .then(res => resolve(res.price))
            .catch(err => reject(err));

        });
    }

    /**
     * Retrieves the balance of a specific ticker or all balances.
     *
     * @param {string} ticker - (Optional) The ticker symbol of the asset to retrieve balance for.
     * @return {Promise<any>} A promise that resolves with the balance of the specified ticker or all balances.
     */
    public async getBalance(ticker: string = "USDT" ): Promise<any> {

        return new Promise((resolve, reject) => {

            this.query("GET", "/fapi/v2/balance", {}, true)
            .then(res => {
                if(Array.isArray(res)){

                    resolve(
                        res.filter((balance: any) => balance.asset === ticker)[0]
                    );

                    resolve(res);
                }else{
                    Sentry.captureMessage(res);
                    console.log(res);
                    reject(res);
                }
            })
            .catch(err => reject(err));

        });
    }

    /**
     * Retrieves position information for a given symbol or all symbols.
     *
     * @param {string} [symbol] - The symbol for which to retrieve position information. If not provided, information for all symbols will be retrieved.
     * @return {Promise<any>} A promise that resolves with the position information for the specified symbol or all symbols.
     */
    public async getPositionInformation( symbol?: string ): Promise<any> {

        return new Promise((resolve, reject) => {

            let payload: any = {};

            if(symbol){
                payload.symbol = symbol;
            }

            this.query("GET", "/fapi/v2/positionRisk", payload, true)
            .then(res => resolve(res))
            .catch(err => {
                Sentry.captureException(err);
                reject(err);
            });
        });
    }

    /**
     * Checks if there is an open position for the given symbol.
     *
     * @param {string} symbol - The symbol to check for an open position.
     * @return {Promise<boolean>} A promise that resolves to true if there is an open position, false otherwise.
     */
    public async hasOpenPosition( symbol: string ): Promise<boolean> {

        return new Promise(async (resolve, reject) => {
            try{

                const positionAmt = await this.getPositionAmount(symbol);

                resolve(positionAmt > 0);

            }catch (err){
                Sentry.captureException(err);
                reject(err);
            }
        });
    }

    /**
     * Retrieves open orders based on the symbol provided.
     *
     * @param {string} symbol - The symbol to filter open orders by
     * @return {Promise<any>} A promise that resolves with the open orders data
     */
    public async getOpenOrders( symbol: string = null ): Promise<any> {

        let payload: any = {};

        if(symbol){
            payload.symbol = symbol;
        }

        return new Promise((resolve, reject) => {

            this.query("GET", "/fapi/v1/openOrders", payload, true)
                .then(res => resolve(res))
                .catch(err => reject(err));

        })

    }

    /**
     * A function that orders a given payload.
     *
     * @param {Order} payload - the payload to be ordered
     * @return {Promise<any>} a promise that resolves with the result of the order
     */
    public async newOrder( payload: Order ): Promise<any> {

        return new Promise((resolve, reject) => {

            this.query("POST", "/fapi/v1/order", payload, true)
            .then(res => resolve(res))
            .catch(err => reject(err));

        })

    }

    /**
     * Cancels an order by its ID.
     *
     * @param {string} orderId - The ID of the order to cancel.
     * @return {Promise<any>} A promise that resolves with the result of the cancellation request.
     */
    public async cancelOrder( orderId: string ): Promise<any> {

        return new Promise((resolve, reject) => {
            this.query("DELETE", "/fapi/v1/order", {orderId: orderId}, true)
            .then(res => resolve(res))
            .catch(err => reject(err));
        });
    }

    /**
     * Retrieves the current position mode from the Binance Futures API.
     *
     * @return {Promise<any>} A Promise that resolves with the current position mode if the request is successful, or rejects with an error if the request fails.
     */
    public async getCurrentPositionMode(): Promise<any> {

        return new Promise((resolve, reject) => {

            this.query("GET", "/fapi/v1/positionSide/dual", {}, true)
            .then(res => resolve(res))
            .catch(err => reject(err));

        });

    }

    /**
     * Retrieves information about a symbol from the exchange.
     *
     * @param {string} symbol - The symbol to retrieve information for.
     * @return {Promise<any>} - A promise that resolves with the symbol information or rejects with an error message.
     */
    public async getSymbolInfo( symbol: string ): Promise<any> {

        return new Promise(async (resolve, reject) => {

            const exInfo = await this.getExchangeInfo();

            try{
                resolve(
                    exInfo.symbols.filter((info: any) => info.symbol === symbol)[0]
                );
            }catch (err){
                Sentry.captureException(err);
                reject(err);
            }

        });
    }

    /**
     * Retrieves the specified price filter for a given symbol.
     *
     * @param {string} symbol - The symbol for which to retrieve the price filter.
     * @param {string} filterType - The type of price filter to retrieve.
     * @return {Promise<any>} A promise that resolves with the specified price filter.
     */
    public async getSymbolFilter( symbol: string, filterType: SymbolFilter ): Promise<any> {

        return new Promise(async (resolve, reject) => {

            try{

                const pairInfo = await this.getSymbolInfo(symbol);

                const filter = pairInfo.filters.filter((filter: any) => filter.filterType === filterType)[0];

                resolve(filter);

            }catch (err){
                Sentry.captureException(err);
                console.log(err);
                reject(err);
            }
        });

    }

    /**
     * Retrieves the lot size for a given symbol.
     *
     * @param {string} symbol - The symbol for which to retrieve the lot size.
     * @return {Promise<any>} The lot size for the given symbol.
     */
    public async getSymbolLotSizeDecimal( symbol: string ): Promise<any> {

        return new Promise(async (resolve, reject) => {

            try{
                const pairInfo = await this.getSymbolInfo(symbol);

                const lostSizeFilter = await this.getSymbolFilter(symbol, SymbolFilter.LOT_SIZE);

                if(lostSizeFilter.stepSize.includes(".")){
                    resolve(lostSizeFilter.stepSize.split(".")[1].length);
                }else{
                    resolve(0);
                }

            }catch (err){
                Sentry.captureException(err);
                console.log(err);
                reject(err);
            }

        });
    }

    /**
     * Retrieves the position amount for a given symbol.
     *
     * @param {string} symbol - The symbol for which to retrieve the position amount.
     * @return {Promise<any>} A Promise that resolves to the position amount.
     */
    public async getPositionAmount(symbol: string): Promise<any> {

        return new Promise(async (resolve, reject) => {

            try{

                let _try = 0;
                let position = await this.getPositionInformation(symbol);

                while (position.length === 0 && _try < 5) {
                    _try++;
                    position = await this.getPositionInformation(symbol);
                }

                if(position[0] !== undefined){

                    resolve(
                        Number(position[0].positionAmt)
                    );

                }else{
                   throw new Error(`Position not found for ${symbol}. Position: ${JSON.stringify(position)}`);
                }

            }catch (err){
                Sentry.captureException(err);
                console.log(err);
                reject(err);
            }
        });
    }


    public async calculateBestLimitPrice(side: OrderSide, symbol: string): Promise<any> {

        return new Promise(async (resolve, reject) => {

            try{
                // const percentPriceFilter = await this.getSymbolFilter(symbol, SymbolFilter.PERCENT_PRICE);
                // const markPrice = await this.getMarkPrice(symbol);

                // console.log(
                //     side === OrderSide.SELL ? markPrice.markPrice * percentPriceFilter.multiplierDown : markPrice.markPrice * percentPriceFilter.multiplierUp
                // )

                const price = await this.getPrice(symbol);

                resolve(price);

            }catch (err){
                Sentry.captureException(err);
                console.log(err);
                reject(err);
            }

        });
    }

}