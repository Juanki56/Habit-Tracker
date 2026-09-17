import { Router } from "express";
import * as activitiesController from "./activities.controller.js";
import activityVocabularyRouter from "../activity-vocabulary/activity-vocabulary.routes.js";


const router = Router({ mergeParams: true });

router.get("/", activitiesController.index);
router.post("/", activitiesController.create);
router.get("/:activityId", activitiesController.show);
router.patch("/:activityId", activitiesController.update);
router.delete("/:activityId", activitiesController.remove);
router.use("/:activityId/vocabulary", activityVocabularyRouter);

export default router;