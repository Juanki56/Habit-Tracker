import { NextFunction, Request, Response } from "express";
import { getRequiredParam } from "../../utils/request.js";
import * as activityTypesService from "./activity-types.service.js";

export async function index(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await activityTypesService.listActivityTypes(req.supabase));
  } catch (err) { next(err); }
}

export async function fields(req: Request, res: Response, next: NextFunction) {
  try {
    const id = getRequiredParam(req, "id");
    res.json(await activityTypesService.listFieldDefinitions(req.supabase, id));
  } catch (err) { next(err); }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const type = await activityTypesService.createActivityType(req.supabase, req.userId, req.body);
    res.status(201).json(type);
  } catch (err) { next(err); }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const id = getRequiredParam(req, "id");
    res.json(await activityTypesService.updateActivityType(req.supabase, id, req.body));
  } catch (err) { next(err); }
}