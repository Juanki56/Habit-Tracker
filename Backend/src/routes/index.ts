import { Router } from "express";
import habitsRouter from "../modules/habits/habits.routes.js";
import dashboardRouter from "../modules/dashboard/dashboard.routes.js";
import vocabularyRouter from "../modules/vocabulary/vocabulary.routes.js";
import notesRouter from "../modules/notes/notes.routes.js";
import activityTypesRouter from "../modules/activity-types/activity-types.routes.js";
import habitCategoriesRouter from "../modules/habit-categories/habit-categories.routes.js";


const router = Router();
router.use("/habits", habitsRouter);
router.use("/activity-types", activityTypesRouter);
router.use("/dashboard", dashboardRouter);
router.use("/vocabulary", vocabularyRouter);
router.use("/notes", notesRouter);
router.use("/habit-categories", habitCategoriesRouter);
export default router;