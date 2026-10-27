import { addDays } from "./dates.ts";

/**
 * Posponer, en escalera:
 * - Sin posposiciones previas: 1, 2 o 3 días.
 * - A partir de la 2ª seguida (ya hay 1): solo 1 día, y al confirmarla queda urgente.
 * - La 3ª seguida todavía puede ser de 1 día; después queda bloqueada.
 */
export function postponeOptions(postponeCount: number): number[] {
  if (postponeCount >= 3) return [];
  if (postponeCount >= 1) return [1];
  return [1, 2, 3];
}

export function isPostponeBlocked(postponeCount: number): boolean {
  return postponeCount >= 3;
}

/** Urgente una vez registrada la 2ª posposición seguida. */
export function isUrgent(postponeCount: number): boolean {
  return postponeCount >= 2;
}

export function postponePenalty(days: number): number {
  return 4 * days;
}

export type PostponePreview = {
  ok: true;
  nextDue: string;
  postponeCount: number;
  dirtLevel: number;
  pointsDelta: number;
  breaksStreak: boolean;
  urgent: boolean;
  blocked: boolean;
};

export type PostponeRejection = {
  ok: false;
  reason: "bloqueada" | "dias";
};

export function applyPostpone(
  task: { nextDue: string; postponeCount: number; dirtLevel: number },
  days: number,
  today: string,
): PostponePreview | PostponeRejection {
  const options = postponeOptions(task.postponeCount);
  if (options.length === 0) return { ok: false, reason: "bloqueada" };
  if (!options.includes(days)) return { ok: false, reason: "dias" };

  const base = task.nextDue > today ? task.nextDue : today;
  const postponeCount = task.postponeCount + 1;
  return {
    ok: true,
    nextDue: addDays(base, days),
    postponeCount,
    dirtLevel: task.dirtLevel + 1,
    pointsDelta: -postponePenalty(days),
    breaksStreak: task.nextDue <= today,
    urgent: isUrgent(postponeCount),
    blocked: isPostponeBlocked(postponeCount),
  };
}
