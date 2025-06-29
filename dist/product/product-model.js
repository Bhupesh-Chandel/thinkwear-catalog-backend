"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const mongoose_aggregate_paginate_v2_1 = __importDefault(require("mongoose-aggregate-paginate-v2"));
const attributeValueSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
    },
    value: {
        type: mongoose_1.default.Schema.Types.Mixed,
    },
});
const priceConfigurationSchema = new mongoose_1.default.Schema({
    priceType: {
        type: String,
        enum: ["base", "aditional"],
    },
    availableOptions: {
        type: Map,
        of: Number,
    },
});
const productSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    priceConfiguration: {
        type: Map,
        of: priceConfigurationSchema,
    },
    attributes: [attributeValueSchema],
    tenantId: {
        type: String,
        required: true,
    },
    categoryId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Category",
    },
    isPublish: {
        type: Boolean,
        required: false,
        default: false,
    },
}, { timestamps: true });
productSchema.plugin(mongoose_aggregate_paginate_v2_1.default);
exports.default = mongoose_1.default.model("Product", productSchema);
