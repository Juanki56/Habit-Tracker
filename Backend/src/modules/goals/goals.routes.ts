import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware.js";
import * as goalsController from "./goals.controller.js";

const router = Router();
router.use(requireAuth);

router.get("/", goalsController.index);
router.post("/", goalsController.create);
router.get("/:id", goalsController.show);
router.patch("/:id", goalsController.update);
router.delete("/:id", goalsController.remove);

router.post("/:id/habits/:habitId", goalsController.attachHabit);
router.delete("/:id/habits/:habitId", goalsController.detachHabit);

router.post("/:id/metrics/:metricId", goalsController.attachMetric);
router.delete("/:id/metrics/:metricId", goalsController.detachMetric);

export default router;
