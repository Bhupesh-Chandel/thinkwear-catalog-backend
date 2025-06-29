import { NextFunction, Response, Request } from "express";
import { UploadedFile } from "express-fileupload";
import { v4 as uuidv4 } from "uuid";
import { FileStorage } from "../types/storage";
import { ToppingService } from "./topping-service";
import { CreataeRequestBody, Topping, ToppingEvents } from "./topping-types";
import { MessageBroker } from "../types/broker";
import createHttpError from "http-errors";

export class ToppingController {
    constructor(
        private storage: FileStorage,
        private toppingService: ToppingService,
        private broker: MessageBroker,
    ) {}

    create = async (
        req: Request<object, object, CreataeRequestBody>,
        res: Response,
        next: NextFunction,
    ) => {
        try {
            const image = req.files!.image as UploadedFile;
            const fileUuid = uuidv4();

            // todo: add error handling
            await this.storage.upload({
                filename: fileUuid,
                fileData: image.data.buffer,
            });

            // todo: add error handling
            const savedTopping = await this.toppingService.create({
                ...req.body,
                image: fileUuid,
                tenantId: req.body.tenantId,
            } as Topping);
            // todo: add logging

            // Send topping to kafka.
            // todo: move topic name to the config
            await this.broker.sendMessage(
                "topping",
                JSON.stringify({
                    event_type: ToppingEvents.TOPPING_CREATE,
                    data: {
                        id: savedTopping._id,
                        price: savedTopping.price,
                        tenantId: savedTopping.tenantId,
                    },
                }),
            );

            res.json({ id: savedTopping._id });
        } catch (err) {
            return next(err);
        }
    };

    get = async (req: Request, res: Response, next: NextFunction) => {
        try {
            let toppings;
            if (req.query.tenantId) {
                toppings = await this.toppingService.getByTenant(
                    req.query.tenantId as string,
                );
            } else {
                toppings = await this.toppingService.getAll();
            }

            // todo: add error handling
            const readyToppings = toppings.map((topping) => {
                return {
                    _id: topping._id,
                    name: topping.name,
                    price: topping.price,
                    tenantId: topping.tenantId,
                    image: this.storage.getObjectUri(topping.image),
                };
            });
            res.json(readyToppings);
        } catch (err) {
            return next(err);
        }
    };

    delete = async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        const category = await this.toppingService.delete(id);
        if (!category) {
            return next(createHttpError(404, "Category not found"));
        }

        res.json(category);
    };
}
