import { NextFunction, Request, Response } from "express";
import { getRequiredParam } from "../../utils/request.js";
import * as notesService from "./notes.service.js";

export async function index(req: Request, res: Response, next: NextFunction) {
  try {
    const habitId = req.query.habit_id as string | undefined;
    res.json(await notesService.listNotes(req.supabase, habitId));
  } catch (err) { next(err); }
}

export async function show(req: Request, res: Response, next: NextFunction) {
  try {
    const id = getRequiredParam(req, "id");
    res.json(await notesService.getNoteById(req.supabase, id));
  } catch (err) { next(err); }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    res.status(201).json(await notesService.createNote(req.supabase, req.userId, req.body));
  } catch (err) { next(err); }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const id = getRequiredParam(req, "id");
    res.json(await notesService.updateNote(req.supabase, id, req.body));
  } catch (err) { next(err); }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const id = getRequiredParam(req, "id");
    await notesService.deleteNote(req.supabase, id);
    res.status(204).send();
  } catch (err) { next(err); }
}

export async function linkHabit(req: Request, res: Response, next: NextFunction) {
  try {
    const id = getRequiredParam(req, "id");
    const habitId = getRequiredParam(req, "habitId");
    await notesService.linkToHabit(req.supabase, id, habitId);
    res.status(204).send();
  } catch (err) { next(err); }
}

export async function unlinkHabit(req: Request, res: Response, next: NextFunction) {
  try {
    const id = getRequiredParam(req, "id");
    const habitId = getRequiredParam(req, "habitId");
    await notesService.unlinkFromHabit(req.supabase, id, habitId);
    res.status(204).send();
  } catch (err) { next(err); }
}

export async function linkResource(req: Request, res: Response, next: NextFunction) {
  try {
    const id = getRequiredParam(req, "id");
    const resourceId = getRequiredParam(req, "resourceId");
    await notesService.linkToResource(req.supabase, id, resourceId);
    res.status(204).send();
  } catch (err) { next(err); }
}

export async function unlinkResource(req: Request, res: Response, next: NextFunction) {
  try {
    const id = getRequiredParam(req, "id");
    const resourceId = getRequiredParam(req, "resourceId");
    await notesService.unlinkFromResource(req.supabase, id, resourceId);
    res.status(204).send();
  } catch (err) { next(err); }
}