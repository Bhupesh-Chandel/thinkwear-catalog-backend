import { Config } from "../../config";
import { MessageBroker } from "../../types/broker";
import { KafkaBroker } from "../broker/kafka";

let broker: MessageBroker | null = null;

export const createMessageBroker = (): MessageBroker => {
    // singleton
    if (!broker) {
        broker = new KafkaBroker("catalog-service", Config.kafkaBroker);
    }
    return broker;
};
