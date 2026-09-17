import { NextFunction, Request, Response } from "express";
import { getRequiredParam } from "../../utils/request.js";
import * as habitActivityTypesService from "./habit-activity-types.service.js";

export async function index(req: Request, res: Response, next: NextFunction) {
  try {
    const habitId = getRequiredParam(req, "id");
    res.json(await habitActivityTypesService.listForHabit(req.supabase, habitId));
  } catch (err) { next(err); }
}

export async function attach(req: Request, res: Response, next: NextFunction) {
  try {
    const habitId = getRequiredParam(req, "id");
    const assignment = await habitActivityTypesService.attach(
      req.supabase,
      habitId,
      req.body.activity_type_id
    );
    res.status(201).json(assignment);
  } catch (err) { next(err); }
}

export async function detach(req: Request, res: Response, next: NextFunction) {
  try {
    const habitId = getRequiredParam(req, "id");
    const activityTypeId = getRequiredParam(req, "activityTypeId");
    await habitActivityTypesService.detach(req.supabase, habitId, activityTypeId);
    res.status(204).send();
  } catch (err) { next(err); }
}