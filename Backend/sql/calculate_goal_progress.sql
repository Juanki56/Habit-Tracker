-- calculate_goal_progress(target_goal uuid) -> numeric | null
--
-- Corre esto en el SQL Editor de Supabase. No lo pude ejecutar yo mismo: solo
-- tengo la anon key del proyecto (ver Backend/.env), no una conexión directa a
-- Postgres ni la service_role key, y una función nueva es un cambio de schema
-- que de todos modos preferí que vieras antes de aplicarse.
--
-- Diseño (basado en el CHECK habit_metrics_source_rules y los enums reales
-- confirmados en el proyecto, no en suposiciones):
--
--   Un goal puede tener 0..N métricas (goal_metrics -> habit_metrics). Cada
--   habit_metric ya sabe TODO lo que necesita para calcular su propio valor:
--     - source_type decide qué columna/origen mirar:
--         duration        -> activities.duration_seconds, convertido a MINUTOS
--                            (así el número coincide con lo que pones en el
--                            goal — nadie piensa su meta en segundos)
--         quantity        -> activities.quantity
--         field_number    -> activity_field_values.number_value (para field_definition_id)
--         activity_count  -> conteo de actividades
--         check_in_count  -> conteo de check-ins con status = 'completed'
--     - aggregation decide cómo combinar esos valores: sum/average/min/max/count
--       (para activity_count/check_in_count, aggregation no cambia nada:
--       siempre es un conteo, así que se ignora ahí a propósito)
--     - activity_type_id (si está seteado) limita a un tipo de actividad
--       específico dentro del hábito
--
--   El resultado final es la SUMA de todas las métricas del goal en su
--   ventana de fechas (goal.start_date .. coalesce(goal.end_date, hoy)).
--   Si el goal no tiene ninguna métrica asignada todavía, se devuelve NULL
--   (no 0) para que el frontend pueda distinguir "sin fuente de datos" de
--   "progreso real en cero".
--
--   La dirección del goal (increase/decrease/maintain) NO se usa aquí: esta
--   función solo calcula el valor real acumulado. Cómo interpretar ese valor
--   contra target_value/minimum_value/maximum_value según la dirección es una
--   decisión de presentación que vive en el frontend (frontend/src/utils/goalProgress.ts),
--   igual que el resto de la UI ya deriva porcentajes de datos reales sin que
--   el backend necesite guardar un "progress_percentage".
--
-- Seguridad: SECURITY INVOKER (el default) a propósito, no DEFINER — así las
-- consultas internas siguen respetando RLS con el usuario autenticado que
-- llama la función, igual que ya hace habit_current_streak.

create or replace function calculate_goal_progress(target_goal uuid)
returns numeric
language plpgsql
stable
set search_path = public
as $$
declare
  goal record;
  metric record;
  window_start date;
  window_end date;
  metric_value numeric;
  total numeric := 0;
  metric_count integer := 0;
begin
  select * into goal from goals where id = target_goal;
  if not found then
    raise exception 'Goal % no encontrado', target_goal;
  end if;

  window_start := goal.start_date;
  window_end := coalesce(goal.end_date, current_date);

  for metric in
    select hm.*
    from goal_metrics gm
    join habit_metrics hm on hm.id = gm.metric_id
    where gm.goal_id = target_goal
  loop
    metric_count := metric_count + 1;
    metric_value := null;

    if metric.source_type = 'duration' then
      select
        case metric.aggregation
          when 'sum' then sum(a.duration_seconds) / 60.0
          when 'average' then avg(a.duration_seconds) / 60.0
          when 'min' then min(a.duration_seconds) / 60.0
          when 'max' then max(a.duration_seconds) / 60.0
          when 'count' then count(a.duration_seconds)
        end
      into metric_value
      from activities a
      join habit_check_ins hc on hc.id = a.check_in_id
      where a.habit_id = metric.habit_id
        and (metric.activity_type_id is null or a.activity_type_id = metric.activity_type_id)
        and hc.local_date between window_start and window_end;

    elsif metric.source_type = 'quantity' then
      select
        case metric.aggregation
          when 'sum' then sum(a.quantity)
          when 'average' then avg(a.quantity)
          when 'min' then min(a.quantity)
          when 'max' then max(a.quantity)
          when 'count' then count(a.quantity)
        end
      into metric_value
      from activities a
      join habit_check_ins hc on hc.id = a.check_in_id
      where a.habit_id = metric.habit_id
        and (metric.activity_type_id is null or a.activity_type_id = metric.activity_type_id)
        and hc.local_date between window_start and window_end;

    elsif metric.source_type = 'field_number' then
      select
        case metric.aggregation
          when 'sum' then sum(afv.number_value)
          when 'average' then avg(afv.number_value)
          when 'min' then min(afv.number_value)
          when 'max' then max(afv.number_value)
          when 'count' then count(afv.number_value)
        end
      into metric_value
      from activity_field_values afv
      join activities a on a.id = afv.activity_id
      join habit_check_ins hc on hc.id = a.check_in_id
      where a.habit_id = metric.habit_id
        and afv.field_definition_id = metric.field_definition_id
        and (metric.activity_type_id is null or a.activity_type_id = metric.activity_type_id)
        and hc.local_date between window_start and window_end;

    elsif metric.source_type = 'activity_count' then
      select count(*)
      into metric_value
      from activities a
      join habit_check_ins hc on hc.id = a.check_in_id
      where a.habit_id = metric.habit_id
        and (metric.activity_type_id is null or a.activity_type_id = metric.activity_type_id)
        and hc.local_date between window_start and window_end;

    elsif metric.source_type = 'check_in_count' then
      select count(*)
      into metric_value
      from habit_check_ins hc
      where hc.habit_id = metric.habit_id
        and hc.status = 'completed'
        and hc.local_date between window_start and window_end;
    end if;

    total := total + coalesce(metric_value, 0);
  end loop;

  if metric_count = 0 then
    return null;
  end if;

  return total;
end;
$$;

grant execute on function calculate_goal_progress(uuid) to authenticated;
