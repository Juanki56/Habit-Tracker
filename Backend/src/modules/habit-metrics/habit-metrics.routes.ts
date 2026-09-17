import { Router } from "express";
import * as habitMetricsController from "./habit-metrics.controller.js";

const router = Router({ mergeParams: true });

router.get("/", habitMetricsController.index);
router.post("/", habitMetricsController.create);
router.get("/:metricId/value", habitMetricsController.value);
router.delete("/:metricId", habitMetricsController.remove);

export default router;
