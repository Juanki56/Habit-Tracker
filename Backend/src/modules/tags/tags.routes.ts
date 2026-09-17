import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware.js";
import * as tagsController from "./tags.controller.js";

const router = Router();
router.use(requireAuth);

router.get("/", tagsController.index);
router.post("/", tagsController.create);
router.delete("/:id", tagsController.remove);

// Camino inverso: dado un tag, qué tiene ese tag (para poder "encontrar cosas después").
router.get("/:id/habits", tagsController.habitsForTag);
router.get("/:id/activities", tagsController.activitiesForTag);
router.get("/:id/resources", tagsController.resourcesForTag);
router.get("/:id/notes", tagsController.notesForTag);

router.get("/for/habits/:habitId", tagsController.listForHabit);
router.post("/:id/habits/:habitId", tagsController.attachToHabit);
router.delete("/:id/habits/:habitId", tagsController.detachFromHabit);

router.get("/for/activities/:activityId", tagsController.listForActivity);
router.post("/:id/activities/:activityId", tagsController.attachToActivity);
router.delete("/:id/activities/:activityId", tagsController.detachFromActivity);

router.get("/for/resources/:resourceId", tagsController.listForResource);
router.post("/:id/resources/:resourceId", tagsController.attachToResource);
router.delete("/:id/resources/:resourceId", tagsController.detachFromResource);

router.get("/for/notes/:noteId", tagsController.listForNote);
router.post("/:id/notes/:noteId", tagsController.attachToNote);
router.delete("/:id/notes/:noteId", tagsController.detachFromNote);

export default router;
