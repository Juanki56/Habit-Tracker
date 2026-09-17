import { NextFunction, Request, Response } from "express";
import { getRequiredParam } from "../../utils/request.js";
import * as dashboardService from "./dashboard.service.js";

export async function overview(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await dashboardService.getOverview(req.supabase));
  } catch (err) { next(err); }
}

export async function forHabit(req: Request, res: Response, next: NextFunction) {
  try {
    const habitId = getRequiredParam(req, "id");
    const days = Number(req.query.days) || 14;
    res.json(await dashboardService.getHabitDashboard(req.supabase, habitId, days));
  } catch (err) { next(err); }
}