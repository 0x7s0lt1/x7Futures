import amqp from "amqplib";
import dotenv from "dotenv";
import {Sentry} from "../../utils/utils";

dotenv.config();

abstract class Provider {

    protected queueName: string;
    private connection: amqp.Connection;
    private channel: amqp.Channel;

    protected constructor() {

    }

    /**
     * Connects to the queue and returns a promise that resolves when the connection is established.
     *
     * @return {Promise<void>} A promise that resolves when the connection is established.
     */
    private async connectToQueue(): Promise<void> {
        return new Promise<void>(async (resolve, reject) => {
            try{

                this.connection = await amqp.connect(process.env.RABBIT_MQ_DSN);
                this.channel = await this.connection.createChannel();
                await this.channel.assertQueue(this.queueName,{durable: false});

                resolve();

            }catch (error) {
                Sentry.captureException(error);
                console.log(error);
                reject(error);
            }
        })
    }

    /**
     * Asynchronously sends a message to the specified channel queue.
     *
     * @param {string} message - the message to be sent
     * @return {Promise<void>} a Promise that resolves when the message is successfully sent, or rejects with an error
     */
    public async sendMessage(message: string): Promise<void> {
        return new Promise<void>(async (resolve, reject) => {
            try{

                await this.connectToQueue();
                await this.channel.sendToQueue(this.queueName, Buffer.from(message));

                resolve();
            }catch (error) {
                Sentry.captureException(error);
                console.log(error);
                reject(error);
            }
        })
    }

    /**
     * Closes the connection and the channel.
     */
    public async closeConnection(): Promise<void> {
        try{
            await this.connection.close();
        }catch (error) {
            Sentry.captureException(error);
            console.log(error);
        }
    }
}

export default Provider;
