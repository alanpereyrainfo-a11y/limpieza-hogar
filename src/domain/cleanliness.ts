import { addDays, diffDays } from "./dates.ts";
import type { Task } from "./types.ts";

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * 100 recién hecha, ~40 el día que vence y más abajo si está vencida.
 * La deuda de suciedad acelera la caída.
 */
export function taskCleanliness(
  task: Pick<Task, "frequencyDays" | "lastDone" | "nextDue" | "dirtLevel">,
  today: string,
): number {
  const frequency = Math.max(1, task.frequencyDays);
  const anchor = task.lastDone ?? addDays(task.nextDue, -frequency);
  const elapsed = Math.max(0, diffDays(anchor, today));
  const accel = 1 + task.dirtLevel * 0.35;
  const ratio = (elapsed * accel) / frequency;
  if (ratio <= 1) {
    return Math.round(clamp(100 - ratio * 60, 0, 100));
  }
  const overdueRatio = (ratio - 1) * (1 + task.dirtLevel * 0.25);
  return Math.round(clamp(40 - overdueRatio * 50, 0, 100));
}

export function zoneCleanliness(tasks: Task[], today: string): number {
  if (tasks.length === 0) return 100;
  let weight = 0;
  let score = 0;
  for (const task of tasks) {
    const taskWeight = Math.max(1, task.durationMin);
    weight += taskWeight;
    score += taskCleanliness(task, today) * taskWeight;
  }
  return Math.round(score / weight);
}
