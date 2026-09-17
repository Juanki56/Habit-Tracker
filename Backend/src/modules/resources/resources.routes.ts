import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware.js";
import * as resourcesController from "./resources.controller.js";

const router = Router();
router.use(requireAuth);

router.get("/", resourcesController.index);
router.post("/", resourcesController.create);
router.get("/:id", resourcesController.show);
router.patch("/:id", resourcesController.update);
router.patch("/:id/book", resourcesController.updateBook);
router.get("/:id/activities", resourcesController.activities);
router.get("/:id/notes", resourcesController.notes);
router.delete("/:id", resourcesController.remove);

export default router;
