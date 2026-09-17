import { NextFunction, Request, Response } from "express";
import { getRequiredParam } from "../../utils/request.js";
import * as goalsService from "./goals.service.js";

export async function index(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await goalsService.listGoals(req.supabase));
  } catch (err) { next(err); }
}

export async function show(req: Request, res: Response, next: NextFunction) {
  try {
    const id = getRequiredParam(req, "id");
    res.json(await goalsService.getGoalById(req.supabase, id));
  } catch (err) { next(err); }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const goal = await goalsService.createGoal(req.supabase, req.userId, req.body);
    res.status(201).json(goal);
  } catch (err) { next(err); }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const id = getRequiredParam(req, "id");
    res.json(await goalsService.updateGoal(req.supabase, id, req.body));
  } catch (err) { next(err); }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const id = getRequiredParam(req, "id");
    await goalsService.deleteGoal(req.supabase, id);
    res.status(204).send();
  } catch (err) { next(err); }
}

export async function attachHabit(req: Request, res: Response, next: NextFunction) {
  try {
    const id = getRequiredParam(req, "id");
    const habitId = getRequiredParam(req, "habitId");
    await goalsService.attachHabit(req.supabase, id, habitId);
    res.status(204).send();
  } catch (err) { next(err); }
}

export async function detachHabit(req: Request, res: Response, next: NextFunction) {
  try {
    const id = getRequiredParam(req, "id");
    const habitId = getRequiredParam(req, "habitId");
    await goalsService.detachHabit(req.supabase, id, habitId);
    res.status(204).send();
  } catch (err) { next(err); }
}

export async function attachMetric(req: Request, res: Response, next: NextFunction) {
  try {
    const id = getRequiredParam(req, "id");
    const metricId = getRequiredParam(req, "metricId");
    await goalsService.attachMetric(req.supabase, id, metricId);
    res.status(204).send();
  } catch (err) { next(err); }
}

export async function detachMetric(req: Request, res: Response, next: NextFunction) {
  try {
    const id = getRequiredParam(req, "id");
    const metricId = getRequiredParam(req, "metricId");
    await goalsService.detachMetric(req.supabase, id, metricId);
    res.status(204).send();
  } catch (err) { next(err); }
}
