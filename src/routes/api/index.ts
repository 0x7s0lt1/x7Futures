import {Request, Response, Router} from "express";
import dotenv from "dotenv";
import mysql from "mysql2/promise";
import * as process from "process";
// import {rateLimit} from "express-rate-limit";
import {Sentry} from "../../utils/utils";
import RequireX7SKey from "../../middlewares/RequireX7SKey";
import {API_KEY_QUERY} from "../../utils/constants";
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