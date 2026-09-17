import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware.js";
import * as vocabularyController from "./vocabulary.controller.js";

const router = Router();
router.use(requireAuth);

router.get("/", vocabularyController.index);
router.post("/", vocabularyController.create);
router.patch("/:id", vocabularyController.update);
router.delete("/:id", vocabularyController.remove);

export default router;