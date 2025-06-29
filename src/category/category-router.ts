import express from "express";
import { CategoryController } from "./category-controller";
import categoryValidator from "./category-validator";
import { CategoryService } from "./category-service";
import logger from "../config/logger";
import { asyncWrapper } from "../common/utils/wrapper";
import authenticate from "../common/middlewares/authenticate";
import { canAccess } from "../common/middlewares/canAccess";
import { Roles } from "../common/constants";

const router = express.Router();

const categoryService = new CategoryService();
const categoryController = new CategoryController(categoryService, logger);

router.post(
    "/",
    authenticate,
    canAccess([Roles.ADMIN]),
    categoryValidator,
    asyncWrapper(categoryController.create),
);

router.put(
    "/:id",
    authenticate,
    canAccess([Roles.ADMIN, Roles.MANAGER]),
    categoryValidator,
    asyncWrapper(categoryController.update),
);

router.get("/", asyncWrapper(categoryController.index));
router.get("/:categoryId", asyncWrapper(categoryController.getOne));
router.delete(
    "/:categoryId",
    authenticate,
    canAccess([Roles.ADMIN]),
    asyncWrapper(categoryController.delete),
);

export default router;
