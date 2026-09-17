import { NextFunction, Request, Response } from "express";
import { getRequiredParam } from "../../utils/request.js";
import * as habitCategoriesService from "./habit-categories.service.js";

export async function index(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await habitCategoriesService.listCategories(req.supabase));
  } catch (err) { next(err); }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const category = await habitCategoriesService.createCategory(req.supabase, req.userId, req.body);
    res.status(201).json(category);
  } catch (err) { next(err); }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const id = getRequiredParam(req, "id");
    await habitCategoriesService.deleteCategory(req.supabase, id);
    res.status(204).send();
  } catch (err) { next(err); }
}