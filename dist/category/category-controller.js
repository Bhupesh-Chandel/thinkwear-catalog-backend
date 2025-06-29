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
exports.CategoryController = void 0;
const express_validator_1 = require("express-validator");
const http_errors_1 = __importDefault(require("http-errors"));
// import { delay } from "../utils";
class CategoryController {
    constructor(categoryService, logger) {
        this.categoryService = categoryService;
        this.logger = logger;
        this.create = this.create.bind(this);
        this.update = this.update.bind(this);
        this.index = this.index.bind(this);
        this.getOne = this.getOne.bind(this);
        this.delete = this.delete.bind(this);
    }
    create(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = (0, express_validator_1.validationResult)(req);
            if (!result.isEmpty()) {
                return next((0, http_errors_1.default)(400, result.array()[0].msg));
            }
            const { name, priceConfiguration, attributes } = req.body;
            this.logger.silly(`Request to create category`, req.body);
            const category = yield this.categoryService.create({
                name,
                priceConfiguration,
                attributes,
            });
            this.logger.silly(`Created category`, { id: category._id });
            res.json({ id: category._id });
        });
    }
    update(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = (0, express_validator_1.validationResult)(req);
            if (!result.isEmpty()) {
                return next((0, http_errors_1.default)(400, result.array()[0].msg));
            }
            const { id } = req.params;
            const categorys = yield this.categoryService.getOne(id);
            if (!categorys) {
                return next((0, http_errors_1.default)(404, "category not found"));
            }
            const { name, priceConfiguration, attributes } = req.body;
            this.logger.silly("Request to update category ", req.body);
            const category = yield this.categoryService.update(id, {
                name,
                priceConfiguration,
                attributes,
            });
            this.logger.silly(`category updated`, { name: category.name });
            res.json({ id: category.name });
        });
    }
    index(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { q } = req.query;
            const categories = yield this.categoryService.getAll(q, {
                page: req.query.page ? parseInt(req.query.page) : 1,
                limit: req.query.limit ? parseInt(req.query.limit) : 10,
            });
            this.logger.silly(`all category fetched`);
            res.json(categories);
        });
    }
    getOne(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { categoryId } = req.params;
            const category = yield this.categoryService.getOne(categoryId);
            if (!category) {
                return next((0, http_errors_1.default)(404, "Category not found"));
            }
            this.logger.silly(`Getting one category`, { id: category._id });
            res.json(category);
        });
    }
    delete(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { categoryId } = req.params;
            const category = yield this.categoryService.delete(categoryId);
            if (!category) {
                return next((0, http_errors_1.default)(404, "Category not found"));
            }
            this.logger.silly(`Deleting category`, { id: category.acknowledged });
            res.json(category);
        });
    }
}
exports.CategoryController = CategoryController;
