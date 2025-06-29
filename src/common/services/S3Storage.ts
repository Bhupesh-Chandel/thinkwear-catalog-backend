import createHttpError from "http-errors";
import {
    S3Client,
    PutObjectCommand,
    DeleteObjectCommand,
    PutObjectCommandInput,
} from "@aws-sdk/client-s3";

import { Config } from "../../config";
import { FileData, FileStorage } from "../../types/storage";

export class S3Storage implements FileStorage {
    private client: S3Client;

    constructor() {
        this.client = new S3Client({
            region: Config.s3Region,
            credentials: {
                accessKeyId: Config.s3AccessKeyId,
                secretAccessKey: Config.s3SecretAccessKey,
            },
        });
    }

    async upload(data: FileData): Promise<void> {
        const objectParams: PutObjectCommandInput = {
            Bucket: Config.s3Bucket,
            Key: data.filename,
            Body: data.fileData as any,
        };
        await this.client.send(new PutObjectCommand(objectParams));
        return;
    }

    async delete(filename: string): Promise<void> {
        const objectParams = {
            Bucket: Config.s3Bucket,
            Key: filename,
        };

        // todo: add proper filedata type
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return await this.client.send(new DeleteObjectCommand(objectParams));
    }
    getObjectUri(filename: string): string {
        // https://mernspace-project.s3.ap-south-1.amazonaws.com/5962624d-1b9e-4c96-b1d6-395ca9ef4933
        const bucket = Config.s3Bucket;
        const region = Config.s3Region;

        if (typeof bucket === "string" && typeof region === "string") {
            return `https://${bucket}.s3.${region}.amazonaws.com/${filename}`;
        }
        const error = createHttpError(500, "Invalid S3 configuration");
        throw error;
    }
}
