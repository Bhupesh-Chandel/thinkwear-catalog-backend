import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";
import { Category } from "./category-types";
import { CategoryService } from "./category-service";
import { Logger } from "winston";
// import { delay } from "../utils";

export class CategoryController {
    constructor(
        private categoryService: CategoryService,
        private logger: Logger,
    ) {
        this.create = this.create.bind(this);
        this.update = this.update.bind(this);
        this.index = this.index.bind(this);
        this.getOne = this.getOne.bind(this);
        this.delete = this.delete.bind(this);
    }

    async create(req: Request, res: Response, next: NextFunction) {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return next(createHttpError(400, result.array()[0].msg as string));
        }
        const { name, priceConfiguration, attributes } = req.body as Category;
        this.logger.silly(`Request to create category`, req.body);
        const category = await this.categoryService.create({
            name,
            priceConfiguration,
            attributes,
        });
        this.logger.silly(`Created category`, { id: category._id });
        res.json({ id: category._id });
    }

    async update(req: Request, res: Response, next: NextFunction) {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return next(createHttpError(400, result.array()[0].msg as string));
        }
        const { id } = req.params;
        const categorys = await this.categoryService.getOne(id);
        if (!categorys) {
            return next(createHttpError(404, "category not found"));
        }
        const { name, priceConfiguration, attributes } = req.body as Category;
        this.logger.silly("Request to update category ", req.body);
        const category = await this.categoryService.update(id, {
            name,
            priceConfiguration,
            attributes,
        });
        this.logger.silly(`category updated`, { name: category.name });
        res.json({ id: category.name });
    }

    async index(req: Request, res: Response) {
        const { q } = req.query;
        const categories = await this.categoryService.getAll(q as string, {
            page: req.query.page ? parseInt(req.query.page as string) : 1,
            limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
        });
        this.logger.silly(`all category fetched`);
        res.json(categories);
    }

    async getOne(req: Request, res: Response, next: NextFunction) {
        const { categoryId } = req.params;
        const category = await this.categoryService.getOne(categoryId);
        if (!category) {
            return next(createHttpError(404, "Category not found"));
        }
        this.logger.silly(`Getting one category`, { id: category._id });
        res.json(category);
    }

    async delete(req: Request, res: Response, next: NextFunction) {
        const { categoryId } = req.params;
        const category = await this.categoryService.delete(categoryId);
        if (!category) {
            return next(createHttpError(404, "Category not found"));
        }
        this.logger.silly(`Deleting category`, { id: category.acknowledged });
        res.json(category);
    }
}
