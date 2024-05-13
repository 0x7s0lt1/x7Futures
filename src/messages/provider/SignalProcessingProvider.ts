import dotenv from "dotenv";
import Provider from "./Provider";

dotenv.config();

class SignalProcessingProvider extends Provider {
    /**
     * Constructor for SignalProvider class.
     */
    constructor() {
        super();
        this.queueName = process.env.QUEUE_SIGNAL_PROCESSING || "signal_processing";
    }
}

export default SignalProcessingProvider;
