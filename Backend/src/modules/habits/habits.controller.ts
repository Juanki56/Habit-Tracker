import { NextFunction, Request, Response } from "express";
import * as habitsService from "./habits.service.js";
import { getRequiredParam } from "../../utils/request.js";

export async function index(req: Request, res: Response, next: NextFunction) {
  try {
    const onlyActive = req.query.all !== "true";
    res.json(await habitsService.listHabits(req.supabase, onlyActive));
  } catch (err) { next(err); }
}

export async function show(req: Request, res: Response, next: NextFunction) {
  try {
    const id = getRequiredParam(req, "id");
    res.json(await habitsService.getHabitById(req.supabase, id));
  } catch (err) { next(err); }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    res.status(201).json(await habitsService.createHabit(req.supabase, req.userId, req.body));
  } catch (err) { next(err); }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const id = getRequiredParam(req, "id");
    res.json(await habitsService.updateHabit(req.supabase, id, req.body));
  } catch (err) { next(err); }
}

export async function deactivate(req: Request, res: Response, next: NextFunction) {
  try {
    const id = getRequiredParam(req, "id");
    res.json(await habitsService.deactivateHabit(req.supabase, id));
  } catch (err) { next(err); }
}