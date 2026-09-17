import type { Goal } from "../types/goal";

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

// El backend (calculate_goal_progress) solo entrega el valor real acumulado.
// Cómo convertir eso en un % visual según la dirección es una decisión de
// presentación, documentada aquí porque el modelo de datos no impone una única
// fórmula correcta:
//
// - increase: el modelo clásico "cuánto llevas de la meta". 30h de meta,
//   18.5h logradas -> 61.7%.
// - decrease: la meta es un TECHO que no quieres cruzar (ej. "máximo 60 min").
//   Mostrar current/max literal (75%) se leería como "75% de fracaso", que es
//   justo lo que el producto NO quiere transmitir. En cambio: 100% mientras
//   te mantengas en o por debajo del techo (estás cumpliendo el objetivo por
//   completo), y solo baja si te pasas.
// - maintain: un rango [minimum_value, maximum_value]. 100% mientras el valor
//   esté dentro del rango; se degrada según qué tan lejos estés del borde más
//   cercano si te sales.
export function computeGoalProgress(goal: Goal, currentValue: number | null): {
  percentage: number | null;
  hasData: boolean;
} {
  if (currentValue == null) return { percentage: null, hasData: false };

  if (goal.direction === "increase") {
    const target = goal.target_value;
    if (!target || target <= 0) return { percentage: null, hasData: true };
    return { percentage: clamp((currentValue / target) * 100, 0, 100), hasData: true };
  }

  if (goal.direction === "decrease") {
    const threshold = goal.maximum_value ?? goal.target_value;
    if (!threshold || threshold <= 0) return { percentage: null, hasData: true };
    if (currentValue <= threshold) return { percentage: 100, hasData: true };
    const overBy = currentValue - threshold;
    return { percentage: clamp(100 - (overBy / threshold) * 100, 0, 100), hasData: true };
  }

  // maintain
  const min = goal.minimum_value;
  const max = goal.maximum_value;
  if (min == null || max == null) return { percentage: null, hasData: true };
  if (currentValue >= min && currentValue <= max) return { percentage: 100, hasData: true };

  const range = max - min || 1;
  const distance = currentValue < min ? min - currentValue : currentValue - max;
  return { percentage: clamp(100 - (distance / range) * 100, 0, 100), hasData: true };
}
