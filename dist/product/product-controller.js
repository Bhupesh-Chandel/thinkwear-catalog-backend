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
exports.ProductController = void 0;
const uuid_1 = require("uuid");
const express_validator_1 = require("express-validator");
const http_errors_1 = __importDefault(require("http-errors"));
const product_types_1 = require("./product-types");
const constants_1 = require("../common/constants");
const mongoose_1 = __importDefault(require("mongoose"));
const utils_1 = require("../utils");
const config_1 = require("../config");
class ProductController {
    constructor(productService, storage, broker, logger) {
        this.productService = productService;
        this.storage = storage;
        this.broker = broker;
        this.logger = logger;
        this.create = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const result = (0, express_validator_1.validationResult)(req);
            if (!result.isEmpty()) {
                return next((0, http_errors_1.default)(400, result.array()[0].msg));
            }
            const image = req.files.image;
            const imageName = (0, uuid_1.v4)();
            yield this.storage.upload({
                filename: imageName,
                fileData: image.data.buffer,
            });
            const { name, description, priceConfiguration, attributes, tenantId, categoryId, isPublish, } = req.body;
            this.logger.silly(`Request to create product`, req.body);
            const product = {
                name,
                description,
                priceConfiguration: JSON.parse(priceConfiguration),
                attributes: JSON.parse(attributes),
                tenantId,
                categoryId,
                isPublish,
                image: imageName,
            };
            const newProduct = yield this.productService.createProduct(product);
            // Send product to kafka.
            // todo: move topic name to the config
            yield this.broker.sendMessage(config_1.Config.kafkaProductTopic, JSON.stringify({
                event_type: product_types_1.ProductEvents.PRODUCT_CREATE,
                data: {
                    id: newProduct._id,
                    // todo: fix the typescript error
                    priceConfiguration: (0, utils_1.mapToObject)(newProduct.priceConfiguration),
                },
            }));
            this.logger.silly(`new product created`, { id: newProduct._id });
            res.json({ id: newProduct._id });
        });
        this.pull = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const newProduct = yield this.productService.getById(req.params.id);
            const xx = JSON.stringify({
                event_type: product_types_1.ProductEvents.PRODUCT_CREATE,
                data: {
                    id: newProduct._id,
                    // todo: fix the typescript error
                    priceConfiguration: (0, utils_1.mapToObject)(newProduct.priceConfiguration),
                },
            });
            res.json({ str: xx });
        });
        this.getProduct = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const productData = yield this.productService.getProduct(req.params.id);
            if (!productData) {
                return next((0, http_errors_1.default)(404, "Product not found"));
            }
            const imageUri = this.storage.getObjectUri(productData.image);
            res.json(Object.assign(Object.assign({}, productData), { image: imageUri }));
        });
        this.update = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const result = (0, express_validator_1.validationResult)(req);
            if (!result.isEmpty()) {
                return next((0, http_errors_1.default)(400, result.array()[0].msg));
            }
            const { productId } = req.params;
            const product = yield this.productService.getProduct(productId);
            if (!product) {
                return next((0, http_errors_1.default)(404, "Product not found"));
            }
            if (req.auth.role !== constants_1.Roles.ADMIN) {
                const tenant = req.auth.tenant;
                if (product.tenantId !== tenant) {
                    return next((0, http_errors_1.default)(403, "You are not allowed to access this product"));
                }
            }
            let imageName;
            let oldImage;
            if ((_a = req.files) === null || _a === void 0 ? void 0 : _a.image) {
                oldImage = product.image;
                const image = req.files.image;
                imageName = (0, uuid_1.v4)();
                yield this.storage.upload({
                    filename: imageName,
                    fileData: image.data.buffer,
                });
                yield this.storage.delete(oldImage);
            }
            const { name, description, priceConfiguration, attributes, tenantId, categoryId, isPublish, } = req.body;
            this.logger.silly(`request to update product`, req.body);
            const productToUpdate = {
                name,
                description,
                priceConfiguration: JSON.parse(priceConfiguration),
                attributes: JSON.parse(attributes),
                tenantId,
                categoryId,
                isPublish,
                image: imageName ? imageName : oldImage,
            };
            const updatedProduct = yield this.productService.updateProduct(productId, productToUpdate);
            // Send product to kafka.
            // todo: move topic name to the config
            yield this.broker.sendMessage("product", JSON.stringify({
                event_type: product_types_1.ProductEvents.PRODUCT_UPDATE,
                data: {
                    id: updatedProduct._id,
                    priceConfiguration: (0, utils_1.mapToObject)(updatedProduct.priceConfiguration),
                },
            }));
            this.logger.silly(`product updated `, { id: productId });
            res.json({ id: productId });
        });
        this.index = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const { q, tenantId, categoryId, isPublish } = req.query;
            const filters = {};
            if (isPublish === "true") {
                filters.isPublish = true;
            }
            if (tenantId)
                filters.tenantId = tenantId;
            if (categoryId &&
                mongoose_1.default.Types.ObjectId.isValid(categoryId)) {
                filters.categoryId = new mongoose_1.default.Types.ObjectId(categoryId);
            }
            // todo: add logging
            const products = yield this.productService.getProducts(q, filters, {
                page: req.query.page ? parseInt(req.query.page) : 1,
                limit: req.query.limit
                    ? parseInt(req.query.limit)
                    : 10,
            });
            const finalProducts = products.data.map((product) => {
                return Object.assign(Object.assign({}, product), { image: this.storage.getObjectUri(product.image) });
            });
            res.json({
                data: finalProducts,
                total: products.total,
                pageSize: products.pageSize,
                currentPage: products.currentPage,
            });
        });
        this.delete = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const category = yield this.productService.delete(id);
            if (!category) {
                return next((0, http_errors_1.default)(404, "Category not found"));
            }
            res.json(category);
        });
    }
}
exports.ProductController = ProductController;
