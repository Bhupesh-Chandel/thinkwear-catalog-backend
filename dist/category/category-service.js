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
exports.CategoryService = void 0;
const pagination_1 = require("../config/pagination");
const category_model_1 = __importDefault(require("./category-model"));
class CategoryService {
    create(category) {
        return __awaiter(this, void 0, void 0, function* () {
            const newCategory = new category_model_1.default(category);
            return yield newCategory.save();
        });
    }
    update(id, category) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield category_model_1.default.findOneAndUpdate({ _id: id }, {
                $set: category,
            }, {
                new: true,
            }));
        });
    }
    getAll(q, paginateQuery) {
        return __awaiter(this, void 0, void 0, function* () {
            const searchQueryRegexp = new RegExp(q, "i");
            const matchQuery = {
                name: searchQueryRegexp,
            };
            const aggregate = category_model_1.default.aggregate([
                {
                    $match: matchQuery,
                },
            ]);
            return category_model_1.default.aggregatePaginate(aggregate, Object.assign(Object.assign({}, paginateQuery), { customLabels: pagination_1.paginationLabels }));
            // return CategoryModel.find();
        });
    }
    getOne(categoryId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield category_model_1.default.findOne({ _id: categoryId });
        });
    }
    delete(categoryId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield category_model_1.default.deleteOne({ _id: categoryId });
        });
    }
}
exports.CategoryService = CategoryService;
