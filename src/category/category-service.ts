import { paginationLabels } from "../config/pagination";
import { PaginateQuery } from "../product/product-types";
import CategoryModel from "./category-model";
import { Category } from "./category-types";

export class CategoryService {
    async create(category: Category) {
        const newCategory = new CategoryModel(category);
        return await newCategory.save();
    }

    async update(id: string, category: Category) {
        return (await CategoryModel.findOneAndUpdate(
            { _id: id },
            {
                $set: category,
            },
            {
                new: true,
            },
        )) as Category;
    }

    async getAll(q: string, paginateQuery: PaginateQuery) {
        const searchQueryRegexp = new RegExp(q, "i");

        const matchQuery = {
            name: searchQueryRegexp,
        };

        const aggregate = CategoryModel.aggregate([
            {
                $match: matchQuery,
            },
        ]);

        return CategoryModel.aggregatePaginate(aggregate, {
            ...paginateQuery,
            customLabels: paginationLabels,
        });

        // return CategoryModel.find();
    }

    async getOne(categoryId: string) {
        return await CategoryModel.findOne({ _id: categoryId });
    }

    async delete(categoryId: string) {
        return await CategoryModel.deleteOne({ _id: categoryId });
    }
}
