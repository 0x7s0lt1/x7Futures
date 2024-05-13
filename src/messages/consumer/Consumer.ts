import amqp from "amqplib";
import dotenv from "dotenv";
import {Sentry} from "../../utils/utils";

dotenv.config();

abstract class Consumer {

    protected queueName: string;
    private connection: amqp.Connection;
    private channel: amqp.Channel;


    protected constructor() {

    }

    /**
     * Connects to the queues using the provided environment variables and returns a promise.
     *
     * @return {Promise<void>} A promise that resolves when the connection is established, or rejects with an error.
     */
    protected async connectToQueue(): Promise<void> {
        return new Promise<void>(async (resolve, reject) => {

            try{

                this.connection = await amqp.connect(process.env.RABBIT_MQ_DSN);
                this.channel = await this.connection.createChannel();
                await this.channel.assertQueue(this.queueName, { durable: false });

                resolve();

            }catch (error) {
                Sentry.captureException(error);
                console.log(error);
                reject(error);
            }

        });

    }

    /**
     * Asynchronously processes a message.
     *
     * @param {any} message - the message to be processed
     * @return {Promise<void>} a Promise that resolves when the processing is complete
     */
    protected async processMessage(message: any): Promise<void> {}

    /**
     * Asynchronously consumes messages from a queue and handles orders.
     *
     * @return {Promise<void>} a Promise that resolves when consumption is successful
     */
    public async consume(): Promise<void> {
        return new Promise<void>(async (resolve, reject) => {
            try{

                await this.connectToQueue();

                await this.channel.consume(
                    this.queueName,
                    this.processMessage,
                    { noAck: true }
                );

                resolve();

            }catch (error) {
                Sentry.captureException(error);
                console.log(error);
                reject(error);
            }
        })

    }

}

export default Consumer;
