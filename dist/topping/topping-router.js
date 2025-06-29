"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_fileupload_1 = __importDefault(require("express-fileupload"));
const wrapper_1 = require("../common/utils/wrapper");
const authenticate_1 = __importDefault(require("../common/middlewares/authenticate"));
const canAccess_1 = require("../common/middlewares/canAccess");
const constants_1 = require("../common/constants");
const S3Storage_1 = require("../common/services/S3Storage");
const http_errors_1 = __importDefault(require("http-errors"));
const create_topping_validator_1 = __importDefault(require("./create-topping-validator"));
const topping_service_1 = require("./topping-service");
const topping_controller_1 = require("./topping-controller");
const brokerFactory_1 = require("../common/factories/brokerFactory");
const router = express_1.default.Router();
const toppingService = new topping_service_1.ToppingService();
const broker = (0, brokerFactory_1.createMessageBroker)();
const toppingController = new topping_controller_1.ToppingController(new S3Storage_1.S3Storage(), toppingService, broker);
router.post("/", authenticate_1.default, (0, canAccess_1.canAccess)([constants_1.Roles.ADMIN, constants_1.Roles.MANAGER]), (0, express_fileupload_1.default)({
    limits: { fileSize: 500 * 1024 },
    abortOnLimit: true,
    limitHandler: (req, res, next) => {
        const error = (0, http_errors_1.default)(400, "File size exceeds the limit");
        next(error);
    },
}), create_topping_validator_1.default, (0, wrapper_1.asyncWrapper)(toppingController.create));
router.get("/", (0, wrapper_1.asyncWrapper)(toppingController.get));
router.delete("/:id", authenticate_1.default, (0, canAccess_1.canAccess)([constants_1.Roles.ADMIN, constants_1.Roles.MANAGER]), (0, wrapper_1.asyncWrapper)(toppingController.delete));
exports.default = router;
