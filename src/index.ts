import express, {Express} from "express";
import dotenv from "dotenv";
import * as process from "process";
import SignalBotConsumer from "./messages/consumer/USDFutures/SignalBotConsumer";
import SignalBroadcastConsumer from "./messages/consumer/SignalBroadcats/SignalBroadcastConsumer";
import SignalProcessingConsumer from "./messages/consumer/SignalProcessingConsumer";

import apiRoutes from "./routes/api";
import tradingViewRoutes from "./routes/tradingview";

import {Sentry} from "./utils/utils";

// import initCronJobs from "./cronjobs";
// import USDMFuturesService from "./services/binance/USDMFutureService";
// import mysql from "mysql2/promise";
// import {SIGNAL_BOT_BY_SYMBOL_QUERY} from "./utils/constants";

dotenv.config();


(async ()=>{

    //await initCronJobs();

    await new SignalProcessingConsumer().consume();
    await new SignalBotConsumer().consume();
    await new SignalBroadcastConsumer().consume();

    // try{
    //
    //     let connection = await mysql.createConnection(process.env.DATABASE_URL);
    //
    //     const [result] = await connection.query(SIGNAL_BOT_BY_SYMBOL_QUERY,[ "BINANCE", 1, "FETUSDT" ] );
    //
    //     console.log(result);
    //
    // }catch (e) {
    //     console.log(e);
    // }

})();

const server: Express = express();
const port = process.env.PORT || 3000;

server.use(Sentry.Handlers.requestHandler());
server.use(Sentry.Handlers.errorHandler());
server.use(express.json());
server.use(express.urlencoded({ extended: true }));
server.use(express.static( 'public' ));

server.use('/api',apiRoutes);
server.use('/tradingview', tradingViewRoutes);


server.listen( port, () => console.log(`📈 Listening on port: ${port}`) );
