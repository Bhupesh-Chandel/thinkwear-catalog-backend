import app from "./app";
import logger from "./config/logger";
import { initDb } from "./config/db";
import { Config } from "./config";
import { createMessageBroker } from "./common/factories/brokerFactory";
import { MessageBroker } from "./types/broker";

const startServer = async () => {
    const PORT: number = Config.port || 5502;
    let broker: MessageBroker | null = null;

    try {
        await initDb();
        logger.info("Database connected successfully");
        broker = createMessageBroker();
        await broker.connectProducer();
        await broker.connectConsumer();
        logger.info("Message Broker connected successfully");

        app.listen(PORT, () => logger.info(`Listening on port ${PORT}`));
    } catch (err: unknown) {
        if (err instanceof Error) {
            if (broker) {
                await broker.disconnectProducer();
                await broker.disconnectConsumer();
            }
            logger.error(err.message);
            logger.on("finish", () => {
                process.exit(1);
            });
        }
    }
};

void startServer();
