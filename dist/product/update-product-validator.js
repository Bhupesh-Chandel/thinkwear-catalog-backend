"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
exports.default = [
    (0, express_validator_1.body)("name")
        .exists()
        .withMessage("Product name is required")
        .isString()
        .withMessage("Product name should be a string"),
    (0, express_validator_1.body)("description").exists().withMessage("Description is required"),
    (0, express_validator_1.body)("priceConfiguration")
        .exists()
        .withMessage("Price configuration is required"),
    (0, express_validator_1.body)("attributes").exists().withMessage("Attributes field is required"),
    (0, express_validator_1.body)("tenantId").exists().withMessage("Tenant id field is required"),
    (0, express_validator_1.body)("categoryId").exists().withMessage("Category id field is required"),
];
