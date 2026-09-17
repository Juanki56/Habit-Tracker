import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware.js";
import * as activityTypesController from "./activity-types.controller.js";

const router = Router();
router.use(requireAuth);

router.get("/", activityTypesController.index);
router.post("/", activityTypesController.create);

export default router;