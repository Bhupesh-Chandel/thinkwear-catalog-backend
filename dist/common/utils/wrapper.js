"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncWrapper = void 0;
const http_errors_1 = __importDefault(require("http-errors"));
const asyncWrapper = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((err) => {
            if (err instanceof Error) {
                return next((0, http_errors_1.default)(500, err.message));
            }
            return next((0, http_errors_1.default)(500, "Internal server error"));
        });
    };
};
exports.asyncWrapper = asyncWrapper;
