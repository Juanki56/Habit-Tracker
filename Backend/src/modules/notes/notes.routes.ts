import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware.js";
import * as notesController from "./notes.controller.js";

const router = Router();
router.use(requireAuth);

router.get("/", notesController.index);
router.get("/:id", notesController.show);
router.post("/", notesController.create);
router.patch("/:id", notesController.update);
router.delete("/:id", notesController.remove);
router.post("/:id/habits/:habitId", notesController.linkHabit);
router.delete("/:id/habits/:habitId", notesController.unlinkHabit);
router.post("/:id/resources/:resourceId", notesController.linkResource);
router.delete("/:id/resources/:resourceId", notesController.unlinkResource);

export default router;