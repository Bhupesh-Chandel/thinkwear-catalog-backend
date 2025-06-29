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
const product_controller_1 = require("./product-controller");
const create_product_validator_1 = __importDefault(require("./create-product-validator"));
const product_service_1 = require("./product-service");
const S3Storage_1 = require("../common/services/S3Storage");
const http_errors_1 = __importDefault(require("http-errors"));
const update_product_validator_1 = __importDefault(require("./update-product-validator"));
const logger_1 = __importDefault(require("../config/logger"));
const brokerFactory_1 = require("../common/factories/brokerFactory");
const router = express_1.default.Router();
const productService = new product_service_1.ProductService();
const s3Storage = new S3Storage_1.S3Storage();
const broker = (0, brokerFactory_1.createMessageBroker)();
const productController = new product_controller_1.ProductController(productService, s3Storage, broker, logger_1.default);
router.post("/", authenticate_1.default, (0, canAccess_1.canAccess)([constants_1.Roles.ADMIN, constants_1.Roles.MANAGER]), (0, express_fileupload_1.default)({
    limits: { fileSize: 500 * 1024 },
    abortOnLimit: true,
    limitHandler: (req, res, next) => {
        const error = (0, http_errors_1.default)(400, "File size exceeds the limit");
        next(error);
    },
}), create_product_validator_1.default, (0, wrapper_1.asyncWrapper)(productController.create));
router.put("/:productId", authenticate_1.default, (0, canAccess_1.canAccess)([constants_1.Roles.ADMIN, constants_1.Roles.MANAGER]), (0, express_fileupload_1.default)({
    limits: { fileSize: 500 * 1024 },
    abortOnLimit: true,
    limitHandler: (req, res, next) => {
        const error = (0, http_errors_1.default)(400, "File size exceeds the limit");
        next(error);
    },
}), update_product_validator_1.default, (0, wrapper_1.asyncWrapper)(productController.update));
router.get("/", (0, wrapper_1.asyncWrapper)(productController.index));
router.get("/:id", (0, wrapper_1.asyncWrapper)(productController.getProduct));
router.get("/pull/:id", (0, wrapper_1.asyncWrapper)(productController.pull));
router.delete("/:id", authenticate_1.default, (0, canAccess_1.canAccess)([constants_1.Roles.ADMIN, constants_1.Roles.MANAGER]), (0, wrapper_1.asyncWrapper)(productController.delete));
exports.default = router;
