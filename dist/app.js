"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const globalErrorHandler_1 = require("./common/middlewares/globalErrorHandler");
const category_router_1 = __importDefault(require("./category/category-router"));
const product_router_1 = __importDefault(require("./product/product-router"));
const topping_router_1 = __importDefault(require("./topping/topping-router"));
const config_1 = require("./config");
const app = (0, express_1.default)();
const ALLOWED_DOMAINS = [
    "http://localhost:5173",
    "http://localhost:5175",
    "http://localhost:3000",
    "http://localhost:5174",
    "https://mernspace-own-client-ui.vercel.app",
    "https://ms-admin-social-dashboard.vercel.app",
    "http://mernspace-order-service.xdahiya.loseyourip.com/",
    "https://thinkwear-admin-frontend-production.up.railway.app",
    config_1.Config.adminUI,
    config_1.Config.clientUI,
];
app.use((0, cors_1.default)({
    origin: ALLOWED_DOMAINS,
    credentials: true,
}));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.get("/", (req, res) => {
    res.json({ message: "Hello from catalog service!" });
});
app.use("/categories", category_router_1.default);
app.use("/products", product_router_1.default);
app.use("/toppings", topping_router_1.default);
app.use(globalErrorHandler_1.globalErrorHandler);
exports.default = app;
