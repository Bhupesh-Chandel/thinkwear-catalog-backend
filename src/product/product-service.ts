import { paginationLabels } from "../config/pagination";
import productModel from "./product-model";
import { Filter, PaginateQuery, Product } from "./product-types";
import categoryModel from "../category/category-model"; 

export class ProductService {
    async createProduct(product: Product) {
        return (await productModel.create(product)) as Product;
    }

    async getById(productId: string) {
        return (await productModel.findOne({ _id: productId })) as Product;
    }

    async updateProduct(productId: string, product: Product) {
        return (await productModel.findOneAndUpdate(
            { _id: productId },
            {
                $set: product,
            },
            {
                new: true,
            },
        )) as Product;
    }

    async getProduct(productId: string): Promise<Product | null> {
        return await productModel.findOne({ _id: productId }).lean();
    }

    // async getLatest(CategoryName : string) : Promise<any> {
    //     try{
    //      const category = await categoryModel.findOne({ name: CategoryName }).lean();
    //     const prod = await productModel.find({categoryId : category}).populate("categoryId").lean();
    //     return prod;
    //     }catch(err){
    //         console.error("error in getLatest");
    //         throw err;
    //     }
    // }

    async getProducts(
        q: string,
        filters: Filter,
        paginateQuery: PaginateQuery,
    ) {
        const searchQueryRegexp = new RegExp(q, "i");

        const matchQuery = {
            ...filters,
            name: searchQueryRegexp,
        };

        const aggregate = productModel.aggregate([
            {
                $match: matchQuery,
            },
            {
                $lookup: {
                    from: "categories",
                    localField: "categoryId",
                    foreignField: "_id",
                    as: "category",
                    pipeline: [
                        {
                            $project: {
                                _id: 1,
                                name: 1,
                                attributes: 1,
                                priceConfiguration: 1,
                            },
                        },
                    ],
                },
            },
            {
                $unwind: "$category",
            },
        ]);

        return productModel.aggregatePaginate(aggregate, {
            ...paginateQuery,
            customLabels: paginationLabels,
        });
    }

    async delete(id: string) {
        return await productModel.deleteOne({ _id: id });
    }
}
