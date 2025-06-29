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
exports.ToppingController = void 0;
const uuid_1 = require("uuid");
const topping_types_1 = require("./topping-types");
const http_errors_1 = __importDefault(require("http-errors"));
class ToppingController {
    constructor(storage, toppingService, broker) {
        this.storage = storage;
        this.toppingService = toppingService;
        this.broker = broker;
        this.create = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const image = req.files.image;
                const fileUuid = (0, uuid_1.v4)();
                // todo: add error handling
                yield this.storage.upload({
                    filename: fileUuid,
                    fileData: image.data.buffer,
                });
                // todo: add error handling
                const savedTopping = yield this.toppingService.create(Object.assign(Object.assign({}, req.body), { image: fileUuid, tenantId: req.body.tenantId }));
                // todo: add logging
                // Send topping to kafka.
                // todo: move topic name to the config
                yield this.broker.sendMessage("topping", JSON.stringify({
                    event_type: topping_types_1.ToppingEvents.TOPPING_CREATE,
                    data: {
                        id: savedTopping._id,
                        price: savedTopping.price,
                        tenantId: savedTopping.tenantId,
                    },
                }));
                res.json({ id: savedTopping._id });
            }
            catch (err) {
                return next(err);
            }
        });
        this.get = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                let toppings;
                if (req.query.tenantId) {
                    toppings = yield this.toppingService.getByTenant(req.query.tenantId);
                }
                else {
                    toppings = yield this.toppingService.getAll();
                }
                // todo: add error handling
                const readyToppings = toppings.map((topping) => {
                    return {
                        _id: topping._id,
                        name: topping.name,
                        price: topping.price,
                        tenantId: topping.tenantId,
                        image: this.storage.getObjectUri(topping.image),
                    };
                });
                res.json(readyToppings);
            }
            catch (err) {
                return next(err);
            }
        });
        this.delete = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const category = yield this.toppingService.delete(id);
            if (!category) {
                return next((0, http_errors_1.default)(404, "Category not found"));
            }
            res.json(category);
        });
    }
}
exports.ToppingController = ToppingController;
