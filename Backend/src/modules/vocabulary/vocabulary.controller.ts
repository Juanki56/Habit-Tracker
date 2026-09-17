import { NextFunction, Request, Response } from "express";
import { getRequiredParam } from "../../utils/request.js";
import * as vocabularyService from "./vocabulary.service.js";

export async function index(req: Request, res: Response, next: NextFunction) {
  try {
    const status = req.query.status as string | undefined;
    res.json(await vocabularyService.listWords(req.supabase, status));
  } catch (err) { next(err); }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    res.status(201).json(await vocabularyService.findOrCreateWord(req.supabase, req.userId, req.body));
  } catch (err) { next(err); }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const id = getRequiredParam(req, "id");
    res.json(await vocabularyService.updateWord(req.supabase, id, req.body));
  } catch (err) { next(err); }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const id = getRequiredParam(req, "id");
    await vocabularyService.deleteWord(req.supabase, id);
    res.status(204).send();
  } catch (err) { next(err); }
}