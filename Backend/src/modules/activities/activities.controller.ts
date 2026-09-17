import { NextFunction, Request, Response } from "express";
import { getRequiredParam } from "../../utils/request.js";
import { compact } from "../../utils/objects.js";
import * as activitiesService from "./activities.service.js";

export async function index(req: Request, res: Response, next: NextFunction) {
  try {
    const habitId = getRequiredParam(req, "id");
    const filters = compact({
      from: req.query.from as string | undefined,
      to: req.query.to as string | undefined,
      activity_type_id: req.query.activity_type_id as string | undefined,
    });
    res.json(await activitiesService.listActivities(req.supabase, habitId, filters));
  } catch (err) { next(err); }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const habitId = getRequiredParam(req, "id");
    res.status(201).json(await activitiesService.createActivity(req.supabase, req.userId, habitId, req.body));
  } catch (err) { next(err); }
}

export async function show(req: Request, res: Response, next: NextFunction) {
  try {
    const activityId = getRequiredParam(req, "activityId");
    res.json(await activitiesService.getActivityById(req.supabase, activityId));
  } catch (err) { next(err); }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const activityId = getRequiredParam(req, "activityId");
    res.json(await activitiesService.updateActivity(req.supabase, activityId, req.body));
  } catch (err) { next(err); }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const activityId = getRequiredParam(req, "activityId");
    await activitiesService.deleteActivity(req.supabase, activityId);
    res.status(204).send();
  } catch (err) { next(err); }
}