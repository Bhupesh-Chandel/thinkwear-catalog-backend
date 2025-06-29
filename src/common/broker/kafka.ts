import {
    Consumer,
    EachMessagePayload,
    Kafka,
    KafkaConfig,
    Producer,
} from "kafkajs";
import { MessageBroker } from "../../types/broker";

import { Config } from "../../config";
import fs from "fs";
import path from "path";

export class KafkaBroker implements MessageBroker {
    private consumer: Consumer;
    private producer: Producer;

    constructor(clientId: string, brokers: string[]) {
        let kafkaConfig: KafkaConfig = {
            clientId,
            brokers,
        };

        if (Config.kafkassl) {
            kafkaConfig = {
                ...kafkaConfig,
                // ssl: true,
                ssl: {
                    rejectUnauthorized: false,
                    ca: [
                        fs.readFileSync(
                            path.join(__dirname, "ca.pem"),
                            "utf-8",
                        ),
                    ],
                },
                connectionTimeout: 45000,
                sasl: {
                    mechanism: "plain",
                    username: Config.kafkaUsername,
                    password: Config.kafkaPassword,
                },
            };
        }

        const kafka = new Kafka(kafkaConfig);

        const admin = kafka.admin();
        admin
            .connect()
            .then(async () => {
                const topics = await admin.listTopics();
                if (!topics.includes(Config.kafkaOrderTopic)) {
                    await admin.createTopics({
                        // validateOnly: true,
                        waitForLeaders: true,
                        timeout: 5000,
                        topics: [
                            {
                                topic: Config.kafkaOrderTopic,
                                numPartitions: 6,
                            },
                        ],
                    });
                }
                if (!topics.includes(Config.kafkaProductTopic)) {
                    await admin.createTopics({
                        // validateOnly: true,
                        waitForLeaders: true,
                        timeout: 5000,
                        topics: [
                            {
                                topic: Config.kafkaProductTopic,
                                numPartitions: 6,
                            },
                        ],
                    });
                }
                if (!topics.includes(Config.kafkaTopingTopic)) {
                    await admin.createTopics({
                        // validateOnly: true,
                        waitForLeaders: true,
                        timeout: 5000,
                        topics: [
                            {
                                topic: Config.kafkaTopingTopic,
                                numPartitions: 6,
                            },
                        ],
                    });
                }

                // const newtopics = await admin.listTopics();
                // console.log("topics is :: ", newtopics);

                // const metadata = await admin.fetchTopicMetadata({
                //     topics: newtopics,
                // });
                // console.log("metadata of topics is :: ", metadata);

                // remember to connect and disconnect when you are done
                await admin.disconnect();
            })
            .catch(() => {});

        this.producer = kafka.producer();
        this.consumer = kafka.consumer({ groupId: clientId });
    }

    /**
     * Connect the consumer
     */
    async connectConsumer() {
        await this.consumer.connect();
    }

    /**
     * Connect the producer
     */
    async connectProducer() {
        await this.producer.connect();
    }

    /**
     * Disconnect the consumer
     */
    async disconnectConsumer() {
        await this.consumer.disconnect();
    }

    /**
     * Disconnect the producer
     */
    async disconnectProducer() {
        if (this.producer) {
            await this.producer.disconnect();
        }
    }

    /**
     *
     * @param topic - the topic to send the message to
     * @param message - The message to send
     * @throws {Error} - When the producer is not connected
     */
    async sendMessage(topic: string, message: string, key?: string) {
        const data: { value: string; key?: string } = {
            value: message,
        };

        if (key) {
            data.key = key;
        }

        await this.producer.send({
            topic,
            messages: [data],
        });
    }

    async consumeMessage(topics: string[], fromBeginning: boolean = false) {
        await this.consumer.subscribe({ topics, fromBeginning });

        await this.consumer.run({
            eachMessage: async ({
                topic,
                partition,
                message,
            }: EachMessagePayload) => {
                // Logic to handle incoming messages.
                // eslint-disable-next-line no-console
                console.log({
                    value: message?.value,
                    topic,
                    partition,
                });
            },
        });
    }
}
