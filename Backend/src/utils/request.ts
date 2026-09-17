import { Request } from "express";

export class HttpError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

// Extrae un :param de la URL y garantiza que sea un string real
// (Express 5 permite arrays en params de tipo wildcard).
export function getRequiredParam(req: Request, name: string): string {
  const value = req.params[name];
  if (typeof value !== "string") {
    throw new HttpError(`Falta el parámetro '${name}' en la URL`, 400);
  }
  return value;
}