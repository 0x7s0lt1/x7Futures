import dotenv from "dotenv";
import Provider from "../Provider";

dotenv.config();

class SignalBroadcastProvider extends Provider {
    /**
     * Constructs for SignalBroadcastProvider class.
     */
    constructor() {
        super();
        this.queueName = process.env.QUEUE_SIGNAL_BROADCAST || "signal_broadcast";
    }
}

export default SignalBroadcastProvider;
