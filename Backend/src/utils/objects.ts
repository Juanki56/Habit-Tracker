// Quita las claves cuyo valor es undefined, para poder armar objetos "opcionales"
// a partir de fuentes como req.query (que sí trae undefined explícito)
// sin violar exactOptionalPropertyTypes.
export function compact<T extends Record<string, unknown>>(
  obj: T
): { [K in keyof T]?: Exclude<T[K], undefined> } {
  const result: Record<string, unknown> = {};
  for (const key of Object.keys(obj)) {
    const value = obj[key];
    if (value !== undefined) {
      result[key] = value;
    }
  }
  return result as { [K in keyof T]?: Exclude<T[K], undefined> };
}