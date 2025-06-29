"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
exports.default = [
    (0, express_validator_1.body)("name")
        .exists()
        .withMessage("Topping name is required")
        .isString()
        .withMessage("Topping name should be a string"),
    (0, express_validator_1.body)("price").exists().withMessage("Price is required"),
    // todo: uncomment this line
    (0, express_validator_1.body)("image").custom((value, { req }) => {
        if (!req.files)
            throw new Error("Topping image is required");
        return true;
    }),
    (0, express_validator_1.body)("tenantId").exists().withMessage("Tenant Id is required"),
];
