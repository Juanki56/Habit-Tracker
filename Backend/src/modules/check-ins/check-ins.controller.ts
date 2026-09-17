import { NextFunction, Request, Response } from "express";
import * as checkInsService from "./check-ins.service.js";
import { getRequiredParam } from "../../utils/request.js";
import { compact } from "../../utils/objects.js";

export async function index(req: Request, res: Response, next: NextFunction) {
  try {
    const id = getRequiredParam(req, "id");
    const range = compact({
      from: req.query.from as string | undefined,
      to: req.query.to as string | undefined,
    });
    res.json(await checkInsService.listCheckIns(req.supabase, id, range));
  } catch (err) { next(err); }
}

export async function upsert(req: Request, res: Response, next: NextFunction) {
  try {
    const id = getRequiredParam(req, "id");
    res.status(201).json(await checkInsService.upsertCheckIn(req.supabase, id, req.body));
  } catch (err) { next(err); }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const id = getRequiredParam(req, "id");
    const date = getRequiredParam(req, "date");
    await checkInsService.deleteCheckIn(req.supabase, id, date);
    res.status(204).send();
  } catch (err) { next(err); }
}