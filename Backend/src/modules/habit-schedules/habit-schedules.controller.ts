import { NextFunction, Request, Response } from "express";
import { getRequiredParam } from "../../utils/request.js";
import * as habitSchedulesService from "./habit-schedules.service.js";

export async function index(req: Request, res: Response, next: NextFunction) {
  try {
    const habitId = getRequiredParam(req, "id");
    res.json(await habitSchedulesService.listSchedules(req.supabase, habitId));
  } catch (err) { next(err); }
}

export async function current(req: Request, res: Response, next: NextFunction) {
  try {
    const habitId = getRequiredParam(req, "id");
    res.json(await habitSchedulesService.getCurrentSchedule(req.supabase, habitId));
  } catch (err) { next(err); }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const habitId = getRequiredParam(req, "id");
    res.status(201).json(await habitSchedulesService.createSchedule(req.supabase, habitId, req.body));
  } catch (err) { next(err); }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const scheduleId = getRequiredParam(req, "scheduleId");
    await habitSchedulesService.deleteSchedule(req.supabase, scheduleId);
    res.status(204).send();
  } catch (err) { next(err); }
}