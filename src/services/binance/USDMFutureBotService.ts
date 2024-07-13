import dotenv from "dotenv";
import * as process from "process";
import mysql from "mysql2/promise";
import {OrderSide} from "../../types/Binance/USDMFutures/OrderSide";
import {OrderType} from "../../types/Binance/USDMFutures/OrderType";
import {OrderDuration} from "../../types/Binance/USDMFutures/OrderDuration";
import {SignalPayloadType} from "../../types/SignalPayloadType";
import {Sentry} from "../../utils/utils";
import symbolRuleMatches from "../../utils/symbolRules";
import SignalBotType from "../../types/SignalBotType";
import ApiKeyType from "../../types/ApiKeyType";
import USDMFutureService from "./USDMFutureService";
import {PositionSide} from "../../types/Binance/USDMFutures/PositionSide";
import {NoteType} from "../../types/TradingView/NoteType";

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

            try{

                this.connection = await mysql.createConnection(process.env.DATABASE_URL);

                if(this.bot.signal.type === SignalPayloadType.TRADE){

                    await this.handleTradeSignal();

                }else if(this.bot.signal.type === SignalPayloadType.STATE){

                    //TODO: remove?
                    await this.handleStateSignal();

                }

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

    private async handleTradeSignal(): Promise<any>{

        return new Promise<void>(async (resolve, reject) => {
            try{

                if( !await symbolRuleMatches(this.bot) ){
                    return resolve();
                }

                const { hasOpenPosition, positionAmount, positionType } = await this.hasOpenPosition(this.bot.signal.symbol, true);

                if( this.bot.signal.side == OrderSide.BUY ){

                    if(hasOpenPosition && positionType === PositionSide.SHORT){

                        await this.marketBuy(this.bot.signal.symbol, Math.abs(positionAmount) );

                        if(this.bot.signal.note == NoteType.REVERSE){

                            const balance = await this.getBalance();
                            const amount = await this.calculateBaseAmount(this.bot.signal.symbol, Number(balance.balance) );

                            if(amount !== null){
                                await this.marketBuy(this.bot.signal.symbol, amount);
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
                        }else{
                            console.log("Insufficient balance",{amount, balance});
                            Sentry.captureMessage("Insufficient balance" + JSON.stringify({amount, balance}));
                        }

                    }

                }else if( this.bot.signal.side == OrderSide.SELL ){

                    if(hasOpenPosition && positionType === PositionSide.LONG){

                        await this.marketSell(this.bot.signal.symbol, positionAmount);

                        if(this.bot.signal.note == NoteType.REVERSE){

                            const balance = await this.getBalance();
                            const amount = await this.calculateBaseAmount(this.bot.signal.symbol, Number(balance.balance) );

                            if(amount !== null){
                                await this.marketSell(this.bot.signal.symbol, amount);
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
     * Handles the state signal and updates the database accordingly.
     *
     * @return {Promise<any>} a Promise that resolves when the state signal is handled
     */
    private async handleStateSignal(): Promise<any>{
        return new Promise<void>(async (resolve, reject) => {

            try{

                const field = this.bot.signal.side === OrderSide.BUY ? "buy_state" : "sell_state";
                const [result] = await this.connection.query(`SELECT * FROM symbol_states WHERE symbol = ?`,[this.bot.signal.symbol]);

                if(!result.length){
                    await this.connection.query(`INSERT INTO symbol_states ( symbol, ${field} ) VALUES ( ?, ? )`,[this.bot.signal.symbol, this.bot.signal.state]);
                }else{
                    await this.connection.query(`UPDATE symbol_states SET ${field} = ? WHERE symbol = ?`,[this.bot.signal.state, this.bot.signal.symbol]);
                }

                resolve();

            }catch (e) {
                Sentry.captureException(e);
                console.log(e);
                reject(e);
            }

        })
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
     * Executes a market buy order for a given symbol and amount.
     *
     * @param {string} symbol - The symbol of the asset to buy.
     * @param {number} amount - The amount of the asset to buy.
     * @return {Promise<any>} - A promise that resolves with the order details if successful, or rejects with an error if unsuccessful.
     */
    public async marketBuy( symbol: string, amount: number): Promise<any> {

        return new Promise(async (resolve, reject) => {

            try{

                let order = await this.newOrder({
                    symbol: symbol,
                    side: OrderSide.BUY,
                    type: OrderType.MARKET,
                    quantity: amount,
                    recWindow: "5000",
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
                    recWindow: "5000",
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
                    recWindow: "5000",
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
                    recWindow: "5000",
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