"use strict";
var __awaiter =
    (this && this.__awaiter) ||
    function (thisArg, _arguments, P, generator) {
        function adopt(value) {
            return value instanceof P
                ? value
                : new P(function (resolve) {
                      resolve(value);
                  });
        }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) {
                try {
                    step(generator.next(value));
                } catch (e) {
                    reject(e);
                }
            }
            function rejected(value) {
                try {
                    step(generator["throw"](value));
                } catch (e) {
                    reject(e);
                }
            }
            function step(result) {
                result.done
                    ? resolve(result.value)
                    : adopt(result.value).then(fulfilled, rejected);
            }
            step(
                (generator = generator.apply(thisArg, _arguments || [])).next(),
            );
        });
    };
var __importDefault =
    (this && this.__importDefault) ||
    function (mod) {
        return mod && mod.__esModule ? mod : { default: mod };
    };
Object.defineProperty(exports, "__esModule", { value: true });
exports.KafkaProducerBroker = void 0;
const kafkajs_1 = require("kafkajs");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const _1 = require(".");
class KafkaProducerBroker {
    constructor(clientId, brokers) {
        let kafkaConfig = {
            clientId,
            brokers,
        };
        if (_1.Config.kafkassl) {
            kafkaConfig = Object.assign(Object.assign({}, kafkaConfig), {
                // ssl: true,
                ssl: {
                    rejectUnauthorized: false,
                    ca: [
                        fs_1.default.readFileSync(
                            path_1.default.join(__dirname, "ca.pem"),
                            "utf-8",
                        ),
                    ],
                },
                connectionTimeout: 45000,
                sasl: {
                    mechanism: "plain",
                    username: _1.Config.kafkaUsername,
                    password: _1.Config.kafkaPassword,
                },
            });
        }
        const kafka = new kafkajs_1.Kafka(kafkaConfig);
        this.producer = kafka.producer();
    }
    /**
     * Connect the producer
     */
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.producer.connect();
        });
    }
    /**
     * Disconnect the producer
     */
    disconnect() {
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
    sendMessage(topic, message) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.producer.send({
                topic,
                messages: [{ value: message }],
            });
        });
    }
}
exports.KafkaProducerBroker = KafkaProducerBroker;
