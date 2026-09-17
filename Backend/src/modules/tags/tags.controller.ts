import { NextFunction, Request, Response } from "express";
import { getRequiredParam } from "../../utils/request.js";
import * as tagsService from "./tags.service.js";
import { TaggableKind } from "./tags.types.js";

export async function index(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await tagsService.listTags(req.supabase));
  } catch (err) { next(err); }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const tag = await tagsService.findOrCreateTag(req.supabase, req.userId, req.body);
    res.status(201).json(tag);
  } catch (err) { next(err); }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const id = getRequiredParam(req, "id");
    await tagsService.deleteTag(req.supabase, id);
    res.status(204).send();
  } catch (err) { next(err); }
}

function attachHandler(kind: TaggableKind, entityParam: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tagId = getRequiredParam(req, "id");
      const entityId = getRequiredParam(req, entityParam);
      await tagsService.attachTag(req.supabase, kind, entityId, tagId);
      res.status(204).send();
    } catch (err) { next(err); }
  };
}

function detachHandler(kind: TaggableKind, entityParam: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tagId = getRequiredParam(req, "id");
      const entityId = getRequiredParam(req, entityParam);
      await tagsService.detachTag(req.supabase, kind, entityId, tagId);
      res.status(204).send();
    } catch (err) { next(err); }
  };
}

function listForHandler(kind: TaggableKind, entityParam: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const entityId = getRequiredParam(req, entityParam);
      res.json(await tagsService.listTagsForEntity(req.supabase, kind, entityId));
    } catch (err) { next(err); }
  };
}

function entitiesForTagHandler(kind: TaggableKind) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tagId = getRequiredParam(req, "id");
      res.json(await tagsService.listEntitiesForTag(req.supabase, kind, tagId));
    } catch (err) { next(err); }
  };
}

export const habitsForTag = entitiesForTagHandler("habits");
export const activitiesForTag = entitiesForTagHandler("activities");
export const resourcesForTag = entitiesForTagHandler("resources");
export const notesForTag = entitiesForTagHandler("notes");

export const attachToHabit = attachHandler("habits", "habitId");
export const detachFromHabit = detachHandler("habits", "habitId");
export const listForHabit = listForHandler("habits", "habitId");

export const attachToActivity = attachHandler("activities", "activityId");
export const detachFromActivity = detachHandler("activities", "activityId");
export const listForActivity = listForHandler("activities", "activityId");

export const attachToResource = attachHandler("resources", "resourceId");
export const detachFromResource = detachHandler("resources", "resourceId");
export const listForResource = listForHandler("resources", "resourceId");

export const attachToNote = attachHandler("notes", "noteId");
export const detachFromNote = detachHandler("notes", "noteId");
export const listForNote = listForHandler("notes", "noteId");
