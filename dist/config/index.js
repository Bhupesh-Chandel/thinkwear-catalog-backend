"use strict";
// import { config } from "dotenv";
// import path from "path";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Config = void 0;
const NODE_ENV = process.env.NODE_ENV || "dev";
const BACKEND_DOMAIN = "https://mernspace-prisma-auth.vercel.app";
exports.Config = {
    port: 5502,
    databaseUrl: "mongodb+srv://thinkwear:ThinkWear%40123@cluster0.xfntdq5.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
    clientUI: "https://ms-own-catalog-service.vercel.app",
    adminUI: "https://ms-admin-social-dashboard.vercel.app",
    jwksUri: NODE_ENV == "dev"
        ? "http://localhost:5501/.well-known/jwks.json"
        : `${BACKEND_DOMAIN}/public/.well-known/jwks.json`,
    s3Region: "ap-south-1",
    s3AccessKeyId: "AKIA6NXDEEJNGS4XHJPH",
    s3SecretAccessKey: "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",
    s3Bucket: "catalog-service-mernspace",
    kafkaBroker: ["130.61.29.195:9092"],
    kafkassl2: true,
    kafkassl: false,
    kafkasslpath: "/Users/ramandahiya/Developer/mernspace/MernspaceOwned/ms-own-catalog-service/ca.pem",
    kafkaUsername: "avnadmin",
    kafkaPassword: "AVNS_aVwmrdTx8WtUbjeF2RW",
    kafkaProductTopic: "product",
    kafkaOrderTopic: "order",
    kafkaTopingTopic: "topping",
};
