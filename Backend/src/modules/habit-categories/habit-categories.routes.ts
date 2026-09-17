import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware.js";
import * as habitCategoriesController from "./habit-categories.controller.js";

const router = Router();
router.use(requireAuth);

router.get("/", habitCategoriesController.index);
router.post("/", habitCategoriesController.create);
router.patch("/:id", habitCategoriesController.update);
router.delete("/:id", habitCategoriesController.remove);

export default router;