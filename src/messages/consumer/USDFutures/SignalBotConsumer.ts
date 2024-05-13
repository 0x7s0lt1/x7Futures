import dotenv from "dotenv";
import USDMFutureBotService from "../../../services/binance/USDMFutureBotService";
import {Sentry} from "../../../utils/utils";
import Consumer from "../Consumer";

dotenv.config();

class SignalBotConsumer extends Consumer {

    constructor() {
        super();
        this.queueName = process.env.QUEUE_USDM_FUTURES_BOT || "usdm_futures_bot";
    }

    /**
     * Process a message by handling the provided signal.
     *
     * @return {Promise<void>} a Promise that resolves once the message is processed
     * @param message
     */
    protected async processMessage(message: any): Promise<void> {

        try{

            const bot = JSON.parse(message.content.toString());

            await new USDMFutureBotService(bot).handleBot();

        }catch (error) {
            Sentry.captureException(error);
            console.log(error);
        }

    }

}

export default SignalBotConsumer;
