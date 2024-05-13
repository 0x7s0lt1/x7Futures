import dotenv from "dotenv";
import {SignalBroadcastService} from "../../../services/SignalBroadcastService";
import {Sentry} from "../../../utils/utils";
import Consumer from "../Consumer";

dotenv.config();

class SignalBroadcastConsumer extends Consumer {

    constructor() {
        super();
        this.queueName = process.env.QUEUE_SIGNAL_BROADCAST || "signal_broadcast";
    }

    /**
     * Process a message by handling the provided signal.
     *
     * @return {Promise<void>} a Promise that resolves once the message is processed
     * @param message
     */
    protected async processMessage(message: any): Promise<void> {

        try{

            const payload = JSON.parse(message.content.toString());

            await SignalBroadcastService.send(payload.station, payload.signal);

        }catch (error) {
            Sentry.captureException(error);
            console.log(error);
        }

    }

}

export default SignalBroadcastConsumer;
