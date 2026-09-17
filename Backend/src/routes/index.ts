import { Router } from "express";
import habitsRouter from "../modules/habits/habits.routes.js";
import dashboardRouter from "../modules/dashboard/dashboard.routes.js";
import vocabularyRouter from "../modules/vocabulary/vocabulary.routes.js";
import notesRouter from "../modules/notes/notes.routes.js";
import activityTypesRouter from "../modules/activity-types/activity-types.routes.js";
import habitCategoriesRouter from "../modules/habit-categories/habit-categories.routes.js";
import resourcesRouter from "../modules/resources/resources.routes.js";
import tagsRouter from "../modules/tags/tags.routes.js";
import goalsRouter from "../modules/goals/goals.routes.js";


const router = Router();
router.use("/habits", habitsRouter);
router.use("/activity-types", activityTypesRouter);
router.use("/dashboard", dashboardRouter);
router.use("/vocabulary", vocabularyRouter);
router.use("/notes", notesRouter);
router.use("/habit-categories", habitCategoriesRouter);
router.use("/resources", resourcesRouter);
router.use("/tags", tagsRouter);
router.use("/goals", goalsRouter);
export default router;