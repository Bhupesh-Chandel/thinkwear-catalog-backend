"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KafkaBroker = void 0;
const kafkajs_1 = require("kafkajs");
const config_1 = require("../../config");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class KafkaBroker {
    constructor(clientId, brokers) {
        let kafkaConfig = {
            clientId,
            brokers,
        };
        if (config_1.Config.kafkassl) {
            kafkaConfig = Object.assign(Object.assign({}, kafkaConfig), { 
                // ssl: true,
                ssl: {
                    rejectUnauthorized: false,
                    ca: [
                        fs_1.default.readFileSync(path_1.default.join(__dirname, "ca.pem"), "utf-8"),
                    ],
                }, connectionTimeout: 45000, sasl: {
                    mechanism: "plain",
                    username: config_1.Config.kafkaUsername,
                    password: config_1.Config.kafkaPassword,
                } });
        }
        const kafka = new kafkajs_1.Kafka(kafkaConfig);
        const admin = kafka.admin();
        admin
            .connect()
            .then(() => __awaiter(this, void 0, void 0, function* () {
            const topics = yield admin.listTopics();
            if (!topics.includes(config_1.Config.kafkaOrderTopic)) {
                yield admin.createTopics({
                    // validateOnly: true,
                    waitForLeaders: true,
                    timeout: 5000,
                    topics: [
                        {
                            topic: config_1.Config.kafkaOrderTopic,
                            numPartitions: 6,
                        },
                    ],
                });
            }
            if (!topics.includes(config_1.Config.kafkaProductTopic)) {
                yield admin.createTopics({
                    // validateOnly: true,
                    waitForLeaders: true,
                    timeout: 5000,
                    topics: [
                        {
                            topic: config_1.Config.kafkaProductTopic,
                            numPartitions: 6,
                        },
                    ],
                });
            }
            if (!topics.includes(config_1.Config.kafkaTopingTopic)) {
                yield admin.createTopics({
                    // validateOnly: true,
                    waitForLeaders: true,
                    timeout: 5000,
                    topics: [
                        {
                            topic: config_1.Config.kafkaTopingTopic,
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
            yield admin.disconnect();
        }))
            .catch(() => { });
        this.producer = kafka.producer();
        this.consumer = kafka.consumer({ groupId: clientId });
    }
    /**
     * Connect the consumer
     */
    connectConsumer() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.consumer.connect();
        });
    }
    /**
     * Connect the producer
     */
    connectProducer() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.producer.connect();
        });
    }
    /**
     * Disconnect the consumer
     */
    disconnectConsumer() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.consumer.disconnect();
        });
    }
    /**
     * Disconnect the producer
     */
    disconnectProducer() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.producer) {
                yield this.producer.disconnect();
            }
        });
    }
    /**
     *
     * @param topic - the topic to send the message to
     * @param message - The message to send
     * @throws {Error} - When the producer is not connected
     */
    sendMessage(topic, message, key) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = {
                value: message,
            };
            if (key) {
                data.key = key;
            }
            yield this.producer.send({
                topic,
                messages: [data],
            });
        });
    }
    consumeMessage(topics, fromBeginning = false) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.consumer.subscribe({ topics, fromBeginning });
            yield this.consumer.run({
                eachMessage: ({ topic, partition, message, }) => __awaiter(this, void 0, void 0, function* () {
                    // Logic to handle incoming messages.
                    // eslint-disable-next-line no-console
                    console.log({
                        value: message === null || message === void 0 ? void 0 : message.value,
                        topic,
                        partition,
                    });
                }),
            });
        });
    }
}
exports.KafkaBroker = KafkaBroker;
