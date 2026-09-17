import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware.js";
import * as habitsController from "./habits.controller.js";
import habitActivityTypesRouter from "../habit-activity-types/habit-activity-types.routes.js";
import activitiesRouter from "../activities/activities.routes.js";
import checkInsRouter from "../check-ins/check-ins.routes.js";
const router = Router();
router.use(requireAuth);
import habitDashboardRouter from "../dashboard/habit-dashboard.routes.js";
import habitSchedulesRouter from "../habit-schedules/habit-schedules.routes.js";
import habitMetricsRouter from "../habit-metrics/habit-metrics.routes.js";


router.get("/", habitsController.index);
router.get("/:id", habitsController.show);
router.post("/", habitsController.create);
router.patch("/:id", habitsController.update);
router.patch("/:id/desactivar", habitsController.deactivate);
router.use("/:id/check-ins", checkInsRouter);
router.use("/:id/activity-types", habitActivityTypesRouter);
router.use("/:id/activities", activitiesRouter);
router.use("/:id/dashboard", habitDashboardRouter);
router.use("/:id/schedules", habitSchedulesRouter);
router.use("/:id/metrics", habitMetricsRouter);
export default router;