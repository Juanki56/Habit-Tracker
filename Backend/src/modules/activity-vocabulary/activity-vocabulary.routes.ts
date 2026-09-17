import { Router } from "express";
import * as activityVocabularyController from "./activity-vocabulary.controller.js";

const router = Router({ mergeParams: true });

router.get("/", activityVocabularyController.index);
router.post("/", activityVocabularyController.attach);
router.delete("/:wordId", activityVocabularyController.detach);

export default router;