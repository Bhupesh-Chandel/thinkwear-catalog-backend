import express, { Request, Response } from "express";

import cors from "cors";

import cookieParser from "cookie-parser";
import { globalErrorHandler } from "./common/middlewares/globalErrorHandler";
import categoryRouter from "./category/category-router";
import productRouter from "./product/product-router";
import toppingRouter from "./topping/topping-router";
import { Config } from "./config";

const app = express();
const ALLOWED_DOMAINS = [
    "http://localhost:5173",
    "http://localhost:5175",
    "http://localhost:3000",
    "http://localhost:5174",
    "https://mernspace-own-client-ui.vercel.app",
    "https://ms-admin-social-dashboard.vercel.app",
    "http://mernspace-order-service.xdahiya.loseyourip.com/",
    "https://thinkwear-admin-frontend-production.up.railway.app",
    "https://thinkwear-client-production.up.railway.app",


    Config.adminUI,
    Config.clientUI,
];

app.use(
    cors({
        origin: ALLOWED_DOMAINS,
        credentials: true,
    }),
);

app.use(express.json());
app.use(cookieParser());

app.get("/", (req: Request, res: Response) => {
    res.json({ message: "Hello from catalog service!" });
});

app.use("/categories", categoryRouter);
app.use("/products", productRouter);
app.use("/toppings", toppingRouter);

app.use(globalErrorHandler);

export default app;
