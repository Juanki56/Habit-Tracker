import { Router } from "express";
import * as habitSchedulesController from "./habit-schedules.controller.js";

const router = Router({ mergeParams: true });

router.get("/", habitSchedulesController.index);
router.get("/current", habitSchedulesController.current);
router.post("/", habitSchedulesController.create);
router.delete("/:scheduleId", habitSchedulesController.remove);

export default router;