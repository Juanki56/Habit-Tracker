import { NextFunction, Request, Response } from "express";
import { getRequiredParam } from "../../utils/request.js";
import * as habitMetricsService from "./habit-metrics.service.js";

export async function index(req: Request, res: Response, next: NextFunction) {
  try {
    const habitId = getRequiredParam(req, "id");
    res.json(await habitMetricsService.listForHabit(req.supabase, habitId));
  } catch (err) { next(err); }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const habitId = getRequiredParam(req, "id");
    const metric = await habitMetricsService.createHabitMetric(req.supabase, habitId, req.body);
    res.status(201).json(metric);
  } catch (err) { next(err); }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const metricId = getRequiredParam(req, "metricId");
    await habitMetricsService.deleteHabitMetric(req.supabase, metricId);
    res.status(204).send();
  } catch (err) { next(err); }
}

function daysAgoISO(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
}

// Por defecto, últimos 30 días — un número siempre visible y relevante sin
// tener que elegir un rango primero. El caller puede pedir otro con ?from&to.
export async function value(req: Request, res: Response, next: NextFunction) {
  try {
    const metricId = getRequiredParam(req, "metricId");
    const from = (req.query.from as string | undefined) ?? daysAgoISO(29);
    const to = (req.query.to as string | undefined) ?? daysAgoISO(0);
    const result = await habitMetricsService.calculateMetricValue(req.supabase, metricId, from, to);
    res.json({ value: result, from, to });
  } catch (err) { next(err); }
}
