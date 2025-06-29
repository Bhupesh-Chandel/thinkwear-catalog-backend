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
exports.ProductService = void 0;
const pagination_1 = require("../config/pagination");
const product_model_1 = __importDefault(require("./product-model"));
class ProductService {
    createProduct(product) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield product_model_1.default.create(product));
        });
    }
    getById(productId) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield product_model_1.default.findOne({ _id: productId }));
        });
    }
    updateProduct(productId, product) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield product_model_1.default.findOneAndUpdate({ _id: productId }, {
                $set: product,
            }, {
                new: true,
            }));
        });
    }
    getProduct(productId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield product_model_1.default.findOne({ _id: productId }).lean();
        });
    }
    getProducts(q, filters, paginateQuery) {
        return __awaiter(this, void 0, void 0, function* () {
            const searchQueryRegexp = new RegExp(q, "i");
            const matchQuery = Object.assign(Object.assign({}, filters), { name: searchQueryRegexp });
            const aggregate = product_model_1.default.aggregate([
                {
                    $match: matchQuery,
                },
                {
                    $lookup: {
                        from: "categories",
                        localField: "categoryId",
                        foreignField: "_id",
                        as: "category",
                        pipeline: [
                            {
                                $project: {
                                    _id: 1,
                                    name: 1,
                                    attributes: 1,
                                    priceConfiguration: 1,
                                },
                            },
                        ],
                    },
                },
                {
                    $unwind: "$category",
                },
            ]);
            return product_model_1.default.aggregatePaginate(aggregate, Object.assign(Object.assign({}, paginateQuery), { customLabels: pagination_1.paginationLabels }));
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield product_model_1.default.deleteOne({ _id: id });
        });
    }
}
exports.ProductService = ProductService;
