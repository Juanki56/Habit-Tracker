import { Router } from "express";
import * as habitActivityTypesController from "./habit-activity-types.controller.js";

const router = Router({ mergeParams: true });

router.get("/", habitActivityTypesController.index);
router.post("/", habitActivityTypesController.attach);
router.delete("/:activityTypeId", habitActivityTypesController.detach);

export default router;