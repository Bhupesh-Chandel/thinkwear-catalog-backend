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
const app_1 = __importDefault(require("./app"));
const logger_1 = __importDefault(require("./config/logger"));
const db_1 = require("./config/db");
const config_1 = require("./config");
const brokerFactory_1 = require("./common/factories/brokerFactory");
const startServer = () => __awaiter(void 0, void 0, void 0, function* () {
    const PORT = config_1.Config.port || 5502;
    let broker = null;
    try {
        yield (0, db_1.initDb)();
        logger_1.default.info("Database connected successfully");
        broker = (0, brokerFactory_1.createMessageBroker)();
        yield broker.connectProducer();
        yield broker.connectConsumer();
        logger_1.default.info("Message Broker connected successfully");
        app_1.default.listen(PORT, () => logger_1.default.info(`Listening on port ${PORT}`));
    }
    catch (err) {
        if (err instanceof Error) {
            if (broker) {
                yield broker.disconnectProducer();
                yield broker.disconnectConsumer();
            }
            logger_1.default.error(err.message);
            logger_1.default.on("finish", () => {
                process.exit(1);
            });
        }
    }
});
void startServer();
