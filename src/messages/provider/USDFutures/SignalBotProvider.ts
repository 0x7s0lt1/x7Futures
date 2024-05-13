import dotenv from "dotenv";
import Provider from "../Provider";

dotenv.config();

class SignalBotProvider extends Provider {
    /**
     * Constructor for SignalBotProvider class.
     */
    constructor() {
        super();
        this.queueName = process.env.QUEUE_USDM_FUTURES_BOT || "usdm_futures_bot";
    }
}

export default SignalBotProvider;
