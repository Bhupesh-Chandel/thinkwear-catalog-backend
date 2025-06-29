"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
exports.default = [
    (0, express_validator_1.body)("name")
        .exists()
        .withMessage("Category name is required")
        .isString()
        .withMessage("Category name should be a string"),
    (0, express_validator_1.body)("priceConfiguration")
        .exists()
        .withMessage("Price configuration is required"),
    (0, express_validator_1.body)("priceConfiguration.*.priceType")
        .exists()
        .withMessage("Price type is required")
        .custom((value) => {
        const validKeys = ["base", "aditional"];
        if (!validKeys.includes(value)) {
            throw new Error(`${value} is invalid attribute for priceType field. Possible values are: [${validKeys.join(", ")}]`);
        }
        return true;
    }),
    (0, express_validator_1.body)("attributes").exists().withMessage("Attributes field is required"),
];
