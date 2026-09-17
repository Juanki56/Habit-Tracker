import { NextFunction, Request, Response } from "express";
import { getSupabaseForUser, supabaseAnon } from "../config/supabase.js";

declare global {
  namespace Express {
    interface Request {
      userId: string;
      supabase: ReturnType<typeof getSupabaseForUser>;
    }
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Falta el token de autenticación" });
  }

  const token = header.slice("Bearer ".length);
  const { data, error } = await supabaseAnon.auth.getUser(token);

  if (error || !data.user) {
    return res.status(401).json({ error: "Token inválido o expirado" });
  }

  req.userId = data.user.id;
  req.supabase = getSupabaseForUser(token);
  next();
}