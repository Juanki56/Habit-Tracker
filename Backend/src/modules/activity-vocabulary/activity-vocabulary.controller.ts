import { NextFunction, Request, Response } from "express";
import { getRequiredParam } from "../../utils/request.js";
import * as activityVocabularyService from "./activity-vocabulary.service.js";

export async function index(req: Request, res: Response, next: NextFunction) {
  try {
    const activityId = getRequiredParam(req, "activityId");
    res.json(await activityVocabularyService.listForActivity(req.supabase, activityId));
  } catch (err) { next(err); }
}

export async function attach(req: Request, res: Response, next: NextFunction) {
  try {
    const activityId = getRequiredParam(req, "activityId");
    res.status(201).json(await activityVocabularyService.attachWord(req.supabase, req.userId, activityId, req.body));
  } catch (err) { next(err); }
}

export async function detach(req: Request, res: Response, next: NextFunction) {
  try {
    const activityId = getRequiredParam(req, "activityId");
    const wordId = getRequiredParam(req, "wordId");
    await activityVocabularyService.detachWord(req.supabase, activityId, wordId);
    res.status(204).send();
  } catch (err) { next(err); }
}