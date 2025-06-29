"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMessageBroker = void 0;
const config_1 = require("../../config");
const kafka_1 = require("../broker/kafka");
let broker = null;
const createMessageBroker = () => {
    // singleton
    if (!broker) {
        broker = new kafka_1.KafkaBroker("catalog-service", config_1.Config.kafkaBroker);
    }
    return broker;
};
exports.createMessageBroker = createMessageBroker;
