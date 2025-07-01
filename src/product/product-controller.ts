import { NextFunction, Response } from "express";
import { Request } from "express-jwt";
import { v4 as uuidv4 } from "uuid";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";
import { ProductService } from "./product-service";
import { Filter, Product, ProductEvents } from "./product-types";
import { FileStorage } from "../types/storage";
import { UploadedFile } from "express-fileupload";
import { AuthRequest } from "../types";
import { Roles } from "../common/constants";
import mongoose from "mongoose";
import { MessageBroker } from "../types/broker";
import { mapToObject } from "../utils";
import { Config } from "../config";
import { Logger } from "winston";

export class ProductController {
    constructor(
        private productService: ProductService,
        private storage: FileStorage,
        private broker: MessageBroker,
        private logger: Logger,
    ) { }

    create = async (req: Request, res: Response, next: NextFunction) => {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return next(createHttpError(400, result.array()[0].msg as string));
        }
        const image = req.files!.image as UploadedFile;
        const imageName = uuidv4();
        await this.storage.upload({
            filename: imageName,
            fileData: image.data.buffer,
        });
        const {
            name,
            description,
            priceConfiguration,
            attributes,
            tenantId,
            categoryId,
            isPublish,
        } = req.body;
        this.logger.silly(`Request to create product`, req.body);

        const product = {
            name,
            description,
            priceConfiguration: JSON.parse(priceConfiguration as string),
            attributes: JSON.parse(attributes as string),
            tenantId,
            categoryId,
            isPublish,
            image: imageName,
        };

        const newProduct = await this.productService.createProduct(
            product as unknown as Product,
        );
        // Send product to kafka.
        // todo: move topic name to the config
        await this.broker.sendMessage(
            Config.kafkaProductTopic,
            JSON.stringify({
                event_type: ProductEvents.PRODUCT_CREATE,
                data: {
                    id: newProduct._id,
                    // todo: fix the typescript error
                    priceConfiguration: mapToObject(
                        newProduct.priceConfiguration as unknown as Map<
                            string,
                            any
                        >,
                    ),
                },
            }),
        );
        this.logger.silly(`new product created`, { id: newProduct._id });
        res.json({ id: newProduct._id });
    };

    pull = async (req: Request, res: Response) => {
        const newProduct = await this.productService.getById(req.params.id);
        const xx = JSON.stringify({
            event_type: ProductEvents.PRODUCT_CREATE,
            data: {
                id: newProduct._id,
                // todo: fix the typescript error
                priceConfiguration: mapToObject(
                    newProduct.priceConfiguration as unknown as Map<
                        string,
                        any
                    >,
                ),
            },
        });
        res.json({ str: xx });
    };

    getProduct = async (req: Request, res: Response, next: NextFunction) => {
        const productData = await this.productService.getProduct(req.params.id);
        if (!productData) {
            return next(createHttpError(404, "Product not found"));
        }

        const imageUri = this.storage.getObjectUri(productData.image);
        res.json({ ...productData, image: imageUri });
    };
     
     //made this for something
    // latestProducts = async (req: Request, res: Response, next: NextFunction) => {
    //     try {
    //         const { categoryName } = req.body;

    //         if (!categoryName) {
    //             return next(createHttpError(400, "categoryName is required"));
    //         }

    //         const products = await this.productService.getLatest(categoryName);

    //         const finalProducts = products.map((product: Product) => ({
    //             ...product,
    //             image: this.storage.getObjectUri(product.image),
    //         }));

    //         res.json({ data: finalProducts });
    //     } catch (err) {
    //         next(createHttpError(500, "Internal server error"));
    //     }
    // };


    update = async (req: Request, res: Response, next: NextFunction) => {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return next(createHttpError(400, result.array()[0].msg as string));
        }

        const { productId } = req.params;
        const product = await this.productService.getProduct(productId);
        if (!product) {
            return next(createHttpError(404, "Product not found"));
        }

        if ((req as AuthRequest).auth.role !== Roles.ADMIN) {
            const tenant = (req as AuthRequest).auth.tenant;
            if (product.tenantId !== tenant) {
                return next(
                    createHttpError(
                        403,
                        "You are not allowed to access this product",
                    ),
                );
            }
        }

        let imageName: string | undefined;
        let oldImage: string | undefined;

        if (req.files?.image) {
            oldImage = product.image;

            const image = req.files.image as UploadedFile;
            imageName = uuidv4();

            await this.storage.upload({
                filename: imageName,
                fileData: image.data.buffer,
            });

            await this.storage.delete(oldImage);
        }

        const {
            name,
            description,
            priceConfiguration,
            attributes,
            tenantId,
            categoryId,
            isPublish,
        } = req.body;

        this.logger.silly(`request to update product`, req.body);
        const productToUpdate = {
            name,
            description,
            priceConfiguration: JSON.parse(priceConfiguration as string),
            attributes: JSON.parse(attributes as string),
            tenantId,
            categoryId,
            isPublish,
            image: imageName ? imageName : (oldImage as string),
        };

        const updatedProduct = await this.productService.updateProduct(
            productId,
            productToUpdate,
        );

        // Send product to kafka.
        // todo: move topic name to the config
        await this.broker.sendMessage(
            "product",
            JSON.stringify({
                event_type: ProductEvents.PRODUCT_UPDATE,
                data: {
                    id: updatedProduct._id,
                    priceConfiguration: mapToObject(
                        updatedProduct.priceConfiguration as unknown as Map<
                            string,
                            any
                        >,
                    ),
                },
            }),
        );
        this.logger.silly(`product updated `, { id: productId });
        res.json({ id: productId });
    };

    index = async (req: Request, res: Response) => {
        const { q, tenantId, categoryId, isPublish } = req.query;

        const filters: Filter = {};

        if (isPublish === "true") {
            filters.isPublish = true;
        }

        if (tenantId) filters.tenantId = tenantId as string;

        if (
            categoryId &&
            mongoose.Types.ObjectId.isValid(categoryId as string)
        ) {
            filters.categoryId = new mongoose.Types.ObjectId(
                categoryId as string,
            );
        }

        // todo: add logging
        const products = await this.productService.getProducts(
            q as string,
            filters,
            {
                page: req.query.page ? parseInt(req.query.page as string) : 1,
                limit: req.query.limit
                    ? parseInt(req.query.limit as string)
                    : 10,
            },
        );

        const finalProducts = (products.data as Product[]).map(
            (product: Product) => {
                return {
                    ...product,
                    image: this.storage.getObjectUri(product.image),
                };
            },
        );

        res.json({
            data: finalProducts,
            total: products.total,
            pageSize: products.pageSize,
            currentPage: products.currentPage,
        });
    };

    delete = async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        const category = await this.productService.delete(id);
        if (!category) {
            return next(createHttpError(404, "Category not found"));
        }
        res.json(category);
    };
}
