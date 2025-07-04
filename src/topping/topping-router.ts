import express from "express";
import fileUpload from "express-fileupload";
import { asyncWrapper } from "../common/utils/wrapper";
import authenticate from "../common/middlewares/authenticate";
import { canAccess } from "../common/middlewares/canAccess";
import { Roles } from "../common/constants";
import { S3Storage } from "../common/services/S3Storage";
import createHttpError from "http-errors";
import createToppingValidator from "./create-topping-validator";
import { ToppingService } from "./topping-service";
import { ToppingController } from "./topping-controller";
import { createMessageBroker } from "../common/factories/brokerFactory";

const router = express.Router();

const toppingService = new ToppingService();
const broker = createMessageBroker();

const toppingController = new ToppingController(
    new S3Storage(),
    toppingService,
    broker,
);

router.post(
    "/",
    authenticate,
    canAccess([Roles.ADMIN, Roles.MANAGER]),
    fileUpload({
        limits: { fileSize: 500 * 1024 }, // 500kb
        abortOnLimit: true,
        limitHandler: (req, res, next) => {
            const error = createHttpError(400, "File size exceeds the limit");
            next(error);
        },
    }),
    createToppingValidator,
    asyncWrapper(toppingController.create),
);

router.get("/", asyncWrapper(toppingController.get));

router.delete(
    "/:id",
    authenticate,
    canAccess([Roles.ADMIN, Roles.MANAGER]),
    asyncWrapper(toppingController.delete),
);

export default router;
