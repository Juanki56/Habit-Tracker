import { Router } from "express";
import * as checkInsController from "./check-ins.controller.js";

// mergeParams: true → así puede leer :id, que viene del router padre (habits.routes.ts)
const router = Router({ mergeParams: true });

router.get("/", checkInsController.index);
router.post("/", checkInsController.upsert);
router.delete("/:date", checkInsController.remove);

export default router;