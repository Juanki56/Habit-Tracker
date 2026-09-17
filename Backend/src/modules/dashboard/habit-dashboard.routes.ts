import { Router } from "express";
import * as dashboardController from "./dashboard.controller.js";

const router = Router({ mergeParams: true });
router.get("/", dashboardController.forHabit);

export default router;