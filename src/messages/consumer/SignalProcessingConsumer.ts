import dotenv from "dotenv";
import mysql from "mysql2/promise";
import {Sentry} from "../../utils/utils";
import Consumer from "./Consumer";
import {SIGNAL_BOT_BY_SYMBOL_QUERY, TEST_MODE} from "../../utils/constants";
import {Exchange} from "../../types/Exchange";
import SignalBotProvider from "../provider/USDFutures/SignalBotProvider";

dotenv.config();

class SignalProcessingConsumer extends Consumer {

    constructor() {
        super();
        this.queueName = process.env.QUEUE_SIGNAL_PROCESSING || "signal_processing";
    }

    /**
     * Process a message by handling the provided signal.
     *
     * @return {Promise<void>} a Promise that resolves once the message is processed
     * @param message
     */
    protected async processMessage(message: any): Promise<void> {

        let _connection;
        
        try{

            const signal = JSON.parse(message.content.toString());

            _connection = await mysql.createConnection(process.env.DATABASE_URL);

            const [bots] = await _connection.query(SIGNAL_BOT_BY_SYMBOL_QUERY, [ Exchange.BINANCE, TEST_MODE ? 1 : 0, signal.symbol ] );

            _connection.end();

            for(const bot of bots){
                bot.signal = signal;
                await new SignalBotProvider().sendMessage(JSON.stringify(bot));
            }

        }catch (error) {

            Sentry.captureException(error);
            console.log(error);

        }finally {

            if(_connection) {
                _connection.end();
            }

        }

    }

}

export default SignalProcessingConsumer;
