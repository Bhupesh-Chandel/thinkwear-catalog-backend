import toppingModel from "./topping-model";
import { Topping } from "./topping-types";

export class ToppingService {
    async create(topping: Topping) {
        return await toppingModel.create(topping);
    }

    async getByTenant(tenantId: string) {
        // todo: !Important, add pagination
        return await toppingModel.find({ tenantId });
    }
    async getAll() {
        // todo: !Important, add pagination
        return await toppingModel.find();
    }

    async delete(categoryId: string) {
        return await toppingModel.deleteOne({ _id: categoryId });
    }
}
