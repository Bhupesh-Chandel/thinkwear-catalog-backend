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
exports.S3Storage = void 0;
const http_errors_1 = __importDefault(require("http-errors"));
const client_s3_1 = require("@aws-sdk/client-s3");
const config_1 = require("../../config");
class S3Storage {
    constructor() {
        this.client = new client_s3_1.S3Client({
            region: config_1.Config.s3Region,
            credentials: {
                accessKeyId: config_1.Config.s3AccessKeyId,
                secretAccessKey: config_1.Config.s3SecretAccessKey,
            },
        });
    }
    upload(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const objectParams = {
                Bucket: config_1.Config.s3Bucket,
                Key: data.filename,
                Body: data.fileData,
            };
            yield this.client.send(new client_s3_1.PutObjectCommand(objectParams));
            return;
        });
    }
    delete(filename) {
        return __awaiter(this, void 0, void 0, function* () {
            const objectParams = {
                Bucket: config_1.Config.s3Bucket,
                Key: filename,
            };
            // todo: add proper filedata type
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            return yield this.client.send(new client_s3_1.DeleteObjectCommand(objectParams));
        });
    }
    getObjectUri(filename) {
        // https://mernspace-project.s3.ap-south-1.amazonaws.com/5962624d-1b9e-4c96-b1d6-395ca9ef4933
        const bucket = config_1.Config.s3Bucket;
        const region = config_1.Config.s3Region;
        if (typeof bucket === "string" && typeof region === "string") {
            return `https://${bucket}.s3.${region}.amazonaws.com/${filename}`;
        }
        const error = (0, http_errors_1.default)(500, "Invalid S3 configuration");
        throw error;
    }
}
exports.S3Storage = S3Storage;
