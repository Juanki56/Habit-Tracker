import { NextFunction, Request, Response } from "express";
import { getRequiredParam } from "../../utils/request.js";
import { compact } from "../../utils/objects.js";
import * as resourcesService from "./resources.service.js";
import { ResourceType } from "./resources.types.js";

export async function index(req: Request, res: Response, next: NextFunction) {
  try {
    const filters = compact({
      resource_type: req.query.type as ResourceType | undefined,
      search: req.query.search as string | undefined,
    });
    res.json(await resourcesService.listResources(req.supabase, filters));
  } catch (err) { next(err); }
}

export async function show(req: Request, res: Response, next: NextFunction) {
  try {
    const id = getRequiredParam(req, "id");
    res.json(await resourcesService.getResourceById(req.supabase, id));
  } catch (err) { next(err); }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const resource = await resourcesService.createResource(req.supabase, req.userId, req.body);
    res.status(201).json(resource);
  } catch (err) { next(err); }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const id = getRequiredParam(req, "id");
    res.json(await resourcesService.updateResource(req.supabase, id, req.body));
  } catch (err) { next(err); }
}

export async function updateBook(req: Request, res: Response, next: NextFunction) {
  try {
    const id = getRequiredParam(req, "id");
    res.json(await resourcesService.updateBook(req.supabase, id, req.body));
  } catch (err) { next(err); }
}

export async function activities(req: Request, res: Response, next: NextFunction) {
  try {
    const id = getRequiredParam(req, "id");
    res.json(await resourcesService.listActivitiesForResource(req.supabase, id));
  } catch (err) { next(err); }
}

export async function notes(req: Request, res: Response, next: NextFunction) {
  try {
    const id = getRequiredParam(req, "id");
    res.json(await resourcesService.listNotesForResource(req.supabase, id));
  } catch (err) { next(err); }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const id = getRequiredParam(req, "id");
    await resourcesService.deleteResource(req.supabase, id);
    res.status(204).send();
  } catch (err) { next(err); }
}
