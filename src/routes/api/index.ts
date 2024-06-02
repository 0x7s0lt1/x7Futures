import {Request, Response, Router} from "express";
import dotenv from "dotenv";
import mysql from "mysql2/promise";
import * as process from "process";
// import {rateLimit} from "express-rate-limit";
import {Sentry} from "../../utils/utils";
import RequireX7SKey from "../../middlewares/RequireX7SKey";
import {ALL_API_KEYS_QUERY, API_KEY_QUERY, API_SYMBOL_QUERY, API_SYMBOLS_QUERY} from "../../utils/constants";
import USDMFutureService from "../../services/binance/USDMFutureService";
import ApiKeyType from "../../types/ApiKeyType";
import {Exchange} from "../../types/Exchange";

dotenv.config();

const router = Router();

router.use('/',RequireX7SKey);
// router.use('/', rateLimit({ windowMs: 3000,  max: 500,  message: "Rate limit exceeded!",  legacyHeaders: true}) );

router.put('/chat-id', async (req: Request, res: Response) => {

    try{

        const fromId = req.body.from_id;
        const chatId = req.body.chat_id;

        if(!fromId || !chatId){
            return res.status(400).send("Missing from_id or chat_id");
        }

        const connection = await mysql.createConnection(process.env.DATABASE_URL);

        const [result] = await connection.query(API_KEY_QUERY, [ Exchange.BINANCE, fromId ] );

        if(Array.isArray(result) && result.length === 0){

            await connection.end();
            return res.status(400).send(`No API key found for this from_id: ${fromId}`);
        }

        await connection.query("UPDATE apis SET telegram_chat_id = ? WHERE id = ?", [ chatId, result[0].id ]);

        await connection.end();

        res.status(200).send("OK");

    }catch (e) {
        Sentry.captureException(e);
        console.log(e);
        res.status(500).send(e);
    }

});

router.get('/apis', async (req: Request, res: Response) => {

    const connection = await mysql.createConnection(process.env.DATABASE_URL);

    try {

        const fromId = req.query.from_id;
        const [result] = await connection.query(ALL_API_KEYS_QUERY, [fromId]);

        await connection.end();
        
        res.status(200).send(result);

    } catch (e) {
        Sentry.captureException(e);
        console.log(e);
        res.status(500).send(e);
    }

})

router.get('/total-capital', async (req: Request, res: Response) => {

    const connection = await mysql.createConnection(process.env.DATABASE_URL);

    try{

        const fromId = req.query.from_id;

        if(!fromId){
            return res.status(400).send("Missing from_id");
        }

        const [api_result] = await connection.query(API_KEY_QUERY, [ Exchange.BINANCE, fromId ] );

        if(Array.isArray(api_result) && api_result.length === 0){

            await connection.end();
            return res.status(400).send(`No API key found for this from_id: ${fromId}`);
        }

        const [symbols] = await connection.query(API_SYMBOLS_QUERY, [ api_result[0].id ] );

        await connection.end();

        if(!Array.isArray(symbols)){
            return res.status(400).send({ total_capital: 0 , currency: "USDT"});
        }

        const total_capital = symbols.reduce((acc: number, symbol: any) => acc + Number(symbol.initial_capital), 0);

        return res.status(200).send({ total_capital, currency: "USDT"});

    }catch (e) {
        Sentry.captureException(e);
        console.log(e);
        res.status(500).send(e);
    }

})

router.get('/symbols', async (req: Request, res: Response) => {

    const connection = await mysql.createConnection(process.env.DATABASE_URL);

    try{

        const fromId = req.query.from_id;

        if(!fromId){
            return res.status(400).send("Missing from_id");
        }

        const [api_result] = await connection.query(API_KEY_QUERY, [ Exchange.BINANCE, fromId ] );

        if(Array.isArray(api_result) && api_result.length === 0){

            await connection.end();
            return res.status(400).send(`No API key found for this from_id: ${fromId}`);
        }

        const [symbols] = await connection.query(API_SYMBOLS_QUERY, [ api_result[0].id ] );

        await connection.end();

        return res.status(200).send(symbols);

    }catch (e) {
        Sentry.captureException(e);
        console.log(e);
        res.status(500).send(e);
    }

})

router.get('/symbol', async (req: Request, res: Response) => {

    const connection = await mysql.createConnection(process.env.DATABASE_URL);

    try{

        const fromId = req.query.from_id;
        const symbol = req.query.symbol;

        if(!fromId || !symbol){
            return res.status(403).send("Missing from_id or symbol");
        }

        const [api_result] = await connection.query(API_KEY_QUERY, [ Exchange.BINANCE, fromId ] );

        if(Array.isArray(api_result) && api_result.length === 0){

            await connection.end();
            return res.status(403).send(`No API key found for this from_id: ${fromId}`);
        }

        const [symbol_result] = await connection.query(API_SYMBOL_QUERY, [ symbol, api_result[0].id ] );

        await connection.end();

        if(Array.isArray(symbol_result) && symbol_result.length === 0){

            return res.status(400).send(`No symbol found for this symbol: ${symbol}`);
        }

        return res.status(200).send(symbol_result);

    }catch (e) {
        Sentry.captureException(e);
        console.log(e);
        res.status(500).send(e);
    }

})

router.put('/leverage', async (req: Request, res: Response) => {

    const connection = await mysql.createConnection(process.env.DATABASE_URL);

    try{

        const from_id = req.body.from_id;

        if (!from_id){
            return res.status(400).send("Missing from_id");
        }

        const [api_result] = await connection.query(API_KEY_QUERY, [ Exchange.BINANCE, from_id ] );

        if(Array.isArray(api_result) && api_result.length === 0){

            await connection.end();
            return res.status(400).send(`No API key found for this from_id: ${from_id}`);
        }

        const symbol = req.body.symbol;
        const leverage = req.body.leverage;

        if(!symbol || !leverage){
            await connection.end();
            return res.status(403).send("Missing symbol or leverage");
        }

        //TODO: handle missing symbol
        await connection.query("UPDATE symbols SET leverage = ? WHERE symbol = ? AND api_id = ?", [ leverage, symbol, api_result[0].id ] );


        await connection.end();
        res.status(200).send("OK");


    }catch (e) {

        if(connection){
            await connection.end();
        }

        Sentry.captureException(e);
        console.log(e);
        res.status(500).send(e);

    }

});

router.get('/open-positions', async (req: Request, res: Response) => {

    try{
        const fromId = req.query.from_id;

        if(!fromId){
            return res.status(400).send("Missing from_id");
        }

        const connection = await mysql.createConnection(process.env.DATABASE_URL);

        const [result] = await connection.query(API_KEY_QUERY, [ Exchange.BINANCE, fromId ] );

        await connection.end();

        if(Array.isArray(result) && result.length === 0){
            return res.status(400).send(`No API key found for this from_id: ${fromId}`);
        }

        const futuresService = new USDMFutureService({
            id: result[0].id,
            public_key: result[0].public_key,
            private_key: result[0].private_key,
            testnet: result[0].testnet
        } as ApiKeyType );

        let positions = await futuresService.getPositionInformation();

        positions = positions.filter(  (position: any) =>  position.positionAmt != 0).map((position: any) => {

            return {
                symbol: position.symbol,
                unRealizedProfit: position.unRealizedProfit
            }

        });

        res.status(200).send(positions);

    }catch (e) {
        Sentry.captureException(e);
        console.log(e);
        res.status(500).send(e);
    }

})


export default router;