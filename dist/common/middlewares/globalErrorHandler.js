"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalErrorHandler = void 0;
const uuid_1 = require("uuid");
const logger_1 = __importDefault(require("../../config/logger"));
const globalErrorHandler = (err, req, res, 
// eslint-disable-next-line @typescript-eslint/no-unused-vars
next) => {
    const errorId = (0, uuid_1.v4)();
    const statusCode = err.status || 500;
    const isProduction = process.env.NODE_ENV === "production";
    const message = isProduction
        ? `An unexpected error occurred.`
        : err.message;
    logger_1.default.error(err.message, {
        id: errorId,
        error: err.stack,
        path: req.path,
        method: req.method,
    });
    res.status(statusCode).json({
        errors: [
            {
                ref: errorId,
                type: err.name,
                msg: message,
                path: req.path,
                location: "server",
                stack: isProduction ? null : err.stack,
            },
        ],
    });
};
exports.globalErrorHandler = globalErrorHandler;
