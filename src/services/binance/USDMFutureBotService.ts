import dotenv from "dotenv";
import * as process from "process";
import mysql from "mysql2/promise";
import {OrderSide} from "../../types/Binance/USDMFutures/OrderSide";
import {OrderType} from "../../types/Binance/USDMFutures/OrderType";
import {OrderDuration} from "../../types/Binance/USDMFutures/OrderDuration";
import {Sentry} from "../../utils/utils";
import SignalBotType from "../../types/SignalBotType";
import ApiKeyType from "../../types/ApiKeyType";
import USDMFutureService from "./USDMFutureService";
import {PositionSide} from "../../types/Binance/USDMFutures/PositionSide";
import {NoteType} from "../../types/TradingView/NoteType";
import {DEF_REQ_WINDOW} from "../../utils/constants";

dotenv.config();

export default class USDMFutureBotService extends USDMFutureService {

    bot: SignalBotType;

    constructor(bot: SignalBotType) {

        super({
            id: bot.api_id,
            public_key: bot.public_key,
            private_key: bot.private_key,
            testnet: bot.testnet
        } as ApiKeyType);

        this.bot = bot;

    }

    public async handleBot (): Promise<any>
    {
        return new Promise<void>(async (resolve, reject) => {

            //TODO: remove ?
            try{

                this.connection = await mysql.createConnection(process.env.DATABASE_URL);

                await this.handleTradeSignal();

                resolve();

            }catch (e) {

                Sentry.captureException(e);
                console.log(e);
                reject(e);

            }finally {

                if(this.connection) {
                    this.connection.end();
                }

            }

        });

    }

    //TODO: cancel open security orders
    private async handleTradeSignal(): Promise<any>{

        return new Promise<void>(async (resolve, reject) => {
            try{

                const { hasOpenPosition, positionAmount, positionType } = await this.hasOpenPosition(this.bot.signal.symbol, true);

                if( this.bot.signal.side == OrderSide.BUY ){

                    if(hasOpenPosition && positionType === PositionSide.SHORT){

                        await this.marketBuy(this.bot.signal.symbol, Math.abs(positionAmount) );
                        await this.cancelAllOpenOrders(this.bot.signal.symbol);

                        if(this.bot.signal.note == NoteType.REVERSE){

                            const balance = await this.getBalance();
                            const amount = await this.calculateBaseAmount(this.bot.signal.symbol, Number(balance.balance) );

                            if(amount !== null){
                                await this.marketBuy(this.bot.signal.symbol, amount);
                                await this.setSecurityOptions();
                            }else{
                                console.log("Insufficient balance",{amount, balance});
                                Sentry.captureMessage("Insufficient balance" + JSON.stringify({amount, balance}));
                            }

                        }

                    }else{

                        const balance = await this.getBalance();
                        const amount = await this.calculateBaseAmount(this.bot.signal.symbol, Number(balance.balance) );

                        if(amount !== null){
                            await this.marketBuy(this.bot.signal.symbol, amount);
                            await this.setSecurityOptions();
                        }else{
                            console.log("Insufficient balance",{amount, balance});
                            Sentry.captureMessage("Insufficient balance" + JSON.stringify({amount, balance}));
                        }

                    }

                }else if( this.bot.signal.side == OrderSide.SELL ){

                    if(hasOpenPosition && positionType === PositionSide.LONG){

                        await this.marketSell(this.bot.signal.symbol, positionAmount);
                        await this.cancelAllOpenOrders(this.bot.signal.symbol);

                        if(this.bot.signal.note == NoteType.REVERSE){

                            const balance = await this.getBalance();
                            const amount = await this.calculateBaseAmount(this.bot.signal.symbol, Number(balance.balance) );

                            if(amount !== null){
                                await this.marketSell(this.bot.signal.symbol, amount);
                                await this.setSecurityOptions();
                            }else{
                                console.log("Insufficient balance",{amount, balance});
                                Sentry.captureMessage("Insufficient balance" + JSON.stringify({amount, balance}));
                            }

                        }

                    }else{

                        const balance = await this.getBalance();
                        const amount = await this.calculateBaseAmount(this.bot.signal.symbol, Number(balance.balance) );

                        if(amount !== null){
                            await this.marketSell(this.bot.signal.symbol, amount);
                            await this.setSecurityOptions();
                        }else{
                            console.log("Insufficient balance",{amount, balance});
                            Sentry.captureMessage("Insufficient balance" + JSON.stringify({amount, balance}));
                        }

                    }


                }

                resolve();

            }catch (e) {
                Sentry.captureException(e);
                console.log(e);
                reject(e);
            }

        });
    }

    /**
     * Calculates the amount based on the given symbol, quote amount, target exchange rate, minimum, and maximum values.
     *
     * @param symbol
     * @param {number} quoteAmount - The amount in quote currency.
     * @return {Promise<number|null>} - The calculated amount or null if the quote amount is less than the minimum.
     */
    public async calculateBaseAmount(symbol: string, quoteAmount: number): Promise<any>
    {
        return new Promise( async (resolve, reject) => {

            try{

                if(quoteAmount <= 0){
                    reject(null);
                }

                if(this.bot.signal.size !== undefined && quoteAmount > this.bot.signal.size){

                    quoteAmount = this.bot.signal.size;

                }else if(quoteAmount > this.bot.quote_amount){

                    quoteAmount = this.bot.quote_amount;

                }

                const targetExchangeRate = await this.getPrice(symbol);
                const decimals = await this.getSymbolLotSizeDecimal(symbol);

                resolve(
                    (quoteAmount / targetExchangeRate).toFixed(decimals)
                );

            }catch (err){
                Sentry.captureException(err);
                console.log(err);
                reject(err);
            }


        });

    }

    /**
     * Handles the security options for the bot (stop loss and take profit).
     *
     * @return {Promise<any>} A promise that resolves when the security options are handled.
     */
    public async setSecurityOptions(): Promise<any>{

        return new Promise<void>(async (resolve, reject) => {

            try{

                if(this.bot.signal.stop !== undefined){
                    await this.setStopLoss(this.bot.signal.symbol,this.bot.signal.side,this.bot.signal.stop);
                }

            }catch (err){
                Sentry.captureException(err);
                console.log(err);
                reject(err);
            }finally {

                try{

                    if (this.bot.signal.take !== undefined) {
                        await this.setTakeProfit(this.bot.signal.symbol, this.bot.signal.side, this.bot.signal.take);
                    }

                    resolve();

                }catch (err){
                    Sentry.captureException(err);
                    console.log(err);
                    reject(err);
                }


            }


        });
    }


    /**
     * Executes a market buy order for a given symbol and amount.
     *
     * @param {string} symbol - The symbol of the asset to buy.
     * @param {number} amount - The amount of the asset to buy.
     * @return {Promise<any>} - A promise that resolves with the order details if successful, or rejects with an error if unsuccessful.
     */
    public async marketBuy( symbol: string, amount: number ): Promise<any> {

        return new Promise(async (resolve, reject) => {

            try{

                let order = await this.newOrder({
                    symbol: symbol,
                    side: OrderSide.BUY,
                    type: OrderType.MARKET,
                    quantity: amount,
                    recWindow: DEF_REQ_WINDOW,
                    timestamp: Date.now().toString(),
                });

                if(order.code !== undefined){

                    if(order.code === -4131){
                        order = await this.handlePercentPriceError(OrderSide.BUY, symbol, amount);
                    }else{
                        throw new Error(order.msg);
                    }

                }


                resolve(order);

            }catch (err){
                Sentry.captureException(err);
                console.log(err);
                reject(err);
            }

        });

    }

    /**
     * Executes a market sell order for the specified symbol and amount.
     *
     * @param {string} symbol - The symbol for which the market sell order is to be executed.
     * @param {number} amount - The amount of the symbol to be sold in the market order.
     * @return {Promise<any>} A promise that resolves with the order details upon successful execution, or rejects with an error.
     */
    public async marketSell( symbol: string, amount: number): Promise<any> {

        return new Promise(async (resolve, reject) => {

            try{

                let order = await this.newOrder({
                    symbol: symbol,
                    side: OrderSide.SELL,
                    type: OrderType.MARKET,
                    quantity: amount,
                    recWindow: DEF_REQ_WINDOW,
                    timestamp: Date.now().toString(),
                });

                if(order.code !== undefined){

                    if(order.code === -4131){
                        order = await this.handlePercentPriceError(OrderSide.SELL, symbol, amount);
                    }else{
                        throw new Error(order.msg);
                    }

                }

                resolve(order);

            }catch (err){
                Sentry.captureException(err);
                console.log(err);
                reject(err);
            }

        });
    }

    /**
     * Perform a limit buy order for a specified symbol with a given amount and price.
     *
     * @param {string} symbol - The symbol for the asset to buy.
     * @param {number} amount - The amount of the asset to buy.
     * @param {number} price - The price at which to buy the asset.
     * @return {Promise<any>} A promise that resolves with the order details if successful.
     */
    public async limitBuy( symbol: string, amount: number, price: number): Promise<any> {

        return new Promise( async (resolve, reject) => {
            try{
                const order = await this.newOrder({
                    symbol: symbol,
                    side: OrderSide.BUY,
                    type: OrderType.LIMIT,
                    quantity: amount,
                    price: price,
                    timeInForce: OrderDuration.GTD,
                    goodTillDate: ( Date.now() + 606000 ).toString(),
                    recWindow: DEF_REQ_WINDOW,
                    timestamp: Date.now().toString(),
                });

                if(order.code !== undefined){
                    throw new Error(order.msg);
                }

                resolve(order);
            }catch (err){
                Sentry.captureException(err);
                console.log(err);
                reject(err);
            }
        });
    }

    /**
     * Sends a limit sell order to the exchange.
     *
     * @param {string} symbol - The symbol of the asset being traded.
     * @param {number} amount - The amount of the asset to sell.
     * @param {number} price - The price at which to sell the asset.
     * @return {Promise<any>} A promise that resolves with the order details if successful, or rejects with an error if not.
     */
    public async limitSell( symbol: string, amount: number, price: number): Promise<any> {

        return new Promise( async (resolve, reject) => {
            try{
                const order = await this.newOrder({
                    symbol: symbol,
                    side: OrderSide.SELL,
                    type: OrderType.LIMIT,
                    quantity: amount,
                    price: price,
                    timeInForce: OrderDuration.GTD,
                    goodTillDate: ( Date.now() + 606000 ).toString(),
                    recWindow: DEF_REQ_WINDOW,
                    timestamp: Date.now().toString(),
                });

                if(order.code !== undefined){
                    throw new Error(order.msg);
                }

                resolve(order);

            }catch (err){
                Sentry.captureException(err);
                console.log(err);
                reject(err);
            }
        });
    }

    /**
     * Sets a stop loss order for a given symbol, side, and price.
     *
     * @param {string} symbol - The symbol for the asset to set the stop loss for.
     * @param {OrderSide} side - The side of the order (BUY or SELL).
     * @param {number} price - The price at which to set the stop loss.
     * @return {Promise<any>} A promise that resolves when the stop loss order is set successfully, or rejects with an error if unsuccessful.
     */
    public async setStopLoss( symbol: string, side: OrderSide, price: number): Promise<any> {

        return new Promise<void>( async (resolve, reject) => {

            try {

                const order = await this.newOrder({
                    symbol: symbol,
                    side: side === OrderSide.BUY ? OrderSide.SELL : OrderSide.BUY,
                    type: OrderType.STOP_MARKET,
                    stopPrice: price,
                    closePosition: "true",
                    recWindow: DEF_REQ_WINDOW,
                    timestamp: Date.now().toString(),
                });

                if(order.code !== undefined){
                    throw new Error(order.msg);
                }

                resolve();

            }catch (err){
                Sentry.captureException(err);
                console.log("STOP LOSS ERROR: ");
                console.log(err);
                reject(err);
            }

        });
    }

    /**
     * Sets a stop loss order for a given symbol, side, and price.
     *
     * @param {string} symbol - The symbol for the asset to set the stop loss for.
     * @param {OrderSide} side - The side of the order (BUY or SELL).
     * @param {number} price - The price at which to set the stop loss.
     * @return {Promise<any>} A promise that resolves when the stop loss order is set successfully, or rejects with an error if unsuccessful.
     */
    public async setTakeProfit( symbol: string, side: OrderSide, price: number): Promise<any> {

        return new Promise<void>( async (resolve, reject) => {

            try {

                const order = await this.newOrder({
                    symbol: symbol,
                    side: side === OrderSide.BUY ? OrderSide.SELL : OrderSide.BUY,
                    type: OrderType.TAKE_PROFIT_MARKET,
                    stopPrice: price,
                    closePosition: "true",
                    recWindow: DEF_REQ_WINDOW,
                    timestamp: Date.now().toString(),
                });

                if(order.code !== undefined){
                    throw new Error(order.msg);
                }

                resolve();

            }catch (err){
                Sentry.captureException(err);
                console.log("TAKE PROFIT ERROR: ");
                console.log(err);
                reject(err);
            }

        });
    }

    /**
     * Handles a price error by calculating the best limit price and placing a limit order.
     *
     * @param {OrderSide} side - The side of the order (BUY or SELL).
     * @param {string} symbol - The symbol of the cryptocurrency.
     * @param {number} amount - The amount of the cryptocurrency to buy or sell.
     * @return {Promise<any>} A promise that resolves to the order details or rejects with an error.
     */
    public async handlePercentPriceError(side: OrderSide, symbol: string, amount: number): Promise<any> {

        return new Promise( async (resolve, reject) => {

            try{

                //const bestPrice = await this.calculateBestLimitPrice(side, symbol);

                const bestPrice = await this.getPrice(symbol);

                const order = side === OrderSide.BUY ?
                    await this.limitBuy(symbol, amount, bestPrice) :
                    await this.limitSell(symbol, amount, bestPrice);

                if(order.code !== undefined){
                    throw new Error(order.msg);
                }

                resolve(order);

            }catch (err){
                Sentry.captureException(err);
                console.log(err);
                reject(err);
            }

        });
    }




}