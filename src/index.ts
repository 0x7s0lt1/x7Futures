import express, {Express} from "express";
import dotenv from "dotenv";
import * as process from "process";
import cors from "cors";
import SignalBotConsumer from "./messages/consumer/USDFutures/SignalBotConsumer";
import SignalBroadcastConsumer from "./messages/consumer/SignalBroadcats/SignalBroadcastConsumer";
import SignalProcessingConsumer from "./messages/consumer/SignalProcessingConsumer";

import apiRoutes from "./routes/api";
import tradingViewRoutes from "./routes/tradingview";

import {Sentry} from "./utils/utils";
import {API_KEY_QUERY, TEST_MODE} from "./utils/constants";

// import initCronJobs from "./cronjobs";
// import USDMFuturesService from "./services/binance/USDMFutureService";
// import mysql from "mysql2/promise";
// import {API_SYMBOLS_QUERY, SIGNAL_BOT_BY_SYMBOL_QUERY} from "./utils/constants";
// import USDMFutureService from "./services/binance/USDMFutureService";
// import ApiKeyType from "ApiKeyType";

dotenv.config();


(async ()=>{

    await new SignalProcessingConsumer().consume();
    await new SignalBotConsumer().consume();
    await new SignalBroadcastConsumer().consume();

    //await initCronJobs();
    //
    // try{
    //
    //     let connection = await mysql.createConnection(process.env.DATABASE_URL);
    //
    //     const [result] = await connection.query(API_KEY_QUERY,[ "BINANCE", "1439381529" ] );
    //
    //     console.log(result);
    //
    //     const futuresService = new USDMFutureService({
    //         id: result[0].id,
    //         public_key: result[0].public_key,
    //         private_key: result[0].private_key,
    //         testnet: result[0].testnet
    //     } as ApiKeyType );
    //
    //     // let positions = await futuresService.getPositionInformation("BTCUSDT");
    //     //
    //     // console.log(positions);
    //
    //     const { hasOpenPosition, positionAmount, positionType } = await futuresService.hasOpenPosition("BTCUSDT", true);
    //     console.log(
    //        hasOpenPosition, positionAmount, positionType
    //     );
    //
    //     //console.log(lev[0].brackets[0].initialLeverage);
    //
    // }catch (e) {
    //     console.log(e);
    // }

})();

const server: Express = express();
const port = TEST_MODE ? 3001 : process.env.PORT || 3000;

server.use(cors());
server.use(Sentry.Handlers.requestHandler());
server.use(Sentry.Handlers.errorHandler());
server.use(express.json());
server.use(express.urlencoded({ extended: true }));
server.use(express.static( 'public' ));

server.use('/api',apiRoutes);
server.use('/tradingview', tradingViewRoutes);


server.listen( port, () => console.log(`📈 Listening on port: ${port}`) );
